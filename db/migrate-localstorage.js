// Move localStorage into SQLite. Task 3.
//
// Reads every export file in data/ — the browser snippet's `jarvis-export-*.json`
// and the gist rescue file — and writes the history worth keeping into the database.
//
// Safe to run twice: every write is an upsert keyed on something stable, so a
// second run overwrites the same rows instead of duplicating them.
//
//   npm run db:migrate
//
// Deletes nothing. The export files stay put as the backup.

import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { db, migrate, putMetric } from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

// Before anything else — the statements below are prepared at load time and need
// the tables to exist. Safe on an already-built database.
migrate();

// ─── date handling ────────────────────────────────────────────────────────────
// The old app wrote dates with toLocaleDateString() — "8/22/2026". Not sortable,
// not unambiguous. Convert to ISO, and refuse to guess when it doesn't parse.

function toISO(value, context) {
  if (!value) throw new Error(`empty date (${context})`);
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toISOString();

  const md = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (md) {
    const [, m, d, y] = md;
    // Noon UTC, so a timezone shift can never move it to the previous day.
    return new Date(Date.UTC(+y, +m - 1, +d, 12)).toISOString();
  }

  const parsed = new Date(value);
  if (!isNaN(parsed)) return parsed.toISOString();
  throw new Error(`cannot parse date ${JSON.stringify(value)} (${context})`);
}

// ─── load the exports ─────────────────────────────────────────────────────────

function loadExports() {
  const files = readdirSync(DATA_DIR).filter(
    f => f.startsWith("jarvis-export") || f.startsWith("jarvis-rescue")
  );
  if (!files.length) {
    console.error(`No export files in ${DATA_DIR}.`);
    console.error("Expected jarvis-export-*.json (browser snippet) or jarvis-rescue.json (gist).");
    process.exit(1);
  }

  const merged = {};
  for (const file of files) {
    const json = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
    // Browser exports nest everything under `keys`; the rescue file is flat.
    const keys = json.keys ?? json;
    let taken = 0;
    for (const [k, v] of Object.entries(keys)) {
      if (!k.startsWith("jarvis_")) continue;
      if (v?.redacted) continue;                       // API keys — never migrated
      if (v === "undefined" || v == null) continue;    // the memories corruption
      // Later files win only if they actually carry more.
      const bigger = Array.isArray(v) && Array.isArray(merged[k]) ? v.length > merged[k].length : true;
      if (!(k in merged) || bigger) { merged[k] = v; taken++; }
    }
    console.log(`  read ${file} — ${taken} usable keys`);
  }
  return merged;
}

// ─── writers ──────────────────────────────────────────────────────────────────

const putEvent = db.prepare(`
  INSERT INTO events (source, kind, title, start_ts, external_id, payload)
  VALUES (@source, @kind, @title, @start_ts, @external_id, @payload)
  ON CONFLICT (source, external_id) DO UPDATE SET
    title = excluded.title, start_ts = excluded.start_ts, payload = excluded.payload
`);

const putMemory = db.prepare(`
  INSERT INTO memories (kind, content, source, external_id, updated_at)
  VALUES (@kind, @content, @source, @external_id, @updated_at)
  ON CONFLICT (kind, external_id) DO UPDATE SET
    content = excluded.content, updated_at = excluded.updated_at
`);

// Each migrator returns how many source records it consumed, and writes as it goes.
// Anything that fails to convert is collected rather than thrown — one bad date
// shouldn't cost you the other 29 rows.

const problems = [];

function migrateMeasurements(data) {
  const m = data.jarvis_measurements;
  if (!m) return 0;
  const units = { weight: ["weight_lb", "lb"], waist: ["waist_cm", "cm"] };
  let seen = 0;

  for (const [field, [metric, unit]] of Object.entries(units)) {
    for (const row of m[field] ?? []) {
      seen++;
      try {
        putMetric({ source: "manual", metric, value: Number(row.val), unit, ts: toISO(row.date, metric) });
      } catch (e) { problems.push(`${metric}: ${e.message}`); }
    }
  }
  return seen;
}

function migrateSleep(data) {
  const rows = data.jarvis_sleep;
  if (!Array.isArray(rows)) return 0;

  for (const row of rows) {
    try {
      putMetric({ source: "manual", metric: "sleep_hours", value: Number(row.hours),
                  unit: "h", ts: toISO(row.date, "sleep_hours") });
    } catch (e) { problems.push(`sleep_hours: ${e.message}`); }
  }
  return rows.length;
}

function migrateMacros(data) {
  const rows = data.jarvis_macro_history;
  if (!Array.isArray(rows)) return 0;
  const fields = { cal: "kcal", protein: "g", carbs: "g", fat: "g" };

  for (const row of rows) {
    for (const [field, unit] of Object.entries(fields)) {
      if (row[field] == null) continue;
      try {
        putMetric({ source: "manual", metric: `macro_${field}`, value: Number(row[field]),
                    unit, ts: toISO(row.date, `macro_${field}`) });
      } catch (e) { problems.push(`macro_${field}: ${e.message}`); }
    }
  }
  return rows.length;
}

function migrateWorkouts(data) {
  const rows = data.jarvis_workouts;
  if (!Array.isArray(rows)) return 0;

  for (const row of rows) {
    try {
      putEvent.run({
        source: "manual", kind: "workout",
        title: row.exercise ?? "Workout",
        start_ts: toISO(row.ts ?? row.date, "workout"),
        external_id: String(row.id ?? `${row.date}:${row.exercise}`),
        payload: JSON.stringify({ sets: row.sets ?? [] }),
      });
    } catch (e) { problems.push(`workout: ${e.message}`); }
  }
  return rows.length;
}

function migrateMemories(data) {
  let seen = 0;

  for (const note of data.jarvis_memories ?? []) {
    seen++;
    try {
      putMemory.run({ kind: "note", content: note.fact, source: "jarvis",
                      external_id: String(note.id), updated_at: toISO(note.timestamp, "memory note") });
    } catch (e) { problems.push(`memory note: ${e.message}`); }
  }

  if (data.jarvis_memory_file) {
    seen++;
    putMemory.run({
      kind: "profile", content: data.jarvis_memory_file, source: "jarvis",
      external_id: "current",
      updated_at: data.jarvis_memory_updated
        ? toISO(data.jarvis_memory_updated, "memory profile")
        : new Date().toISOString(),
    });
  }
  return seen;
}

// ─── run ──────────────────────────────────────────────────────────────────────

console.log("\nReading exports…");
const data = loadExports();

const steps = [
  ["jarvis_measurements",  migrateMeasurements, "metrics",  "metric IN ('weight_lb','waist_cm')"],
  ["jarvis_sleep",         migrateSleep,        "metrics",  "metric = 'sleep_hours'"],
  ["jarvis_macro_history", migrateMacros,       "metrics",  "metric LIKE 'macro_%'"],
  ["jarvis_workouts",      migrateWorkouts,     "events",   "kind = 'workout'"],
  ["jarvis_memories",      migrateMemories,     "memories", "1 = 1"],
];

console.log("\nMigrating…\n");
console.log("  key                   in export   rows in db");
console.log("  ─────────────────────────────────────────────");

const runAll = db.transaction(() => steps.map(([key, fn]) => fn(data)));
const consumed = runAll();

let total = 0;
steps.forEach(([key, , table, where], i) => {
  const rows = db.prepare(`SELECT COUNT(*) n FROM ${table} WHERE ${where}`).get().n;
  total += rows;
  const source = consumed[i] === 0 ? "—" : String(consumed[i]);
  console.log(`  ${key.padEnd(22)}${source.padStart(9)}${String(rows).padStart(13)}`);
});

console.log(`\n  ${total} rows in the database.`);

if (problems.length) {
  console.log(`\n  ${problems.length} record(s) could not be converted:`);
  for (const p of problems.slice(0, 20)) console.log(`    - ${p}`);
  console.log("\n  Nothing was deleted. Fix the export or the parser and re-run.");
} else {
  console.log("  No conversion errors.\n");
}
