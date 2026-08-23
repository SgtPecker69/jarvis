import express from "express";
import Database from "better-sqlite3";
import Anthropic from "@anthropic-ai/sdk";
import { homedir } from "os";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
// The Jarvis database — distinct from the read-only iMessage one opened below.
import { db as jarvisDb, migrate, putMetric } from "./db/index.js";

// Secrets live in .env, read here and nowhere else. Missing file is fine —
// routes that need a key say so themselves.
try { process.loadEnvFile(new URL(".env", import.meta.url)); } catch {}

const app = express();
app.use(express.json());

// CORS for local Vite dev server
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  next();
});

const DB_PATH = join(homedir(), "Library/Messages/chat.db");

function getRecentMessages(days = 90) {
  if (!existsSync(DB_PATH)) throw new Error("iMessage database not found");

  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });

  // cutoff in nanoseconds since Apple epoch (2001-01-01)
  const appleEpochOffset = 978307200; // seconds between Unix epoch and Apple epoch
  const cutoffSecs = Date.now() / 1000 - days * 86400 - appleEpochOffset;
  const cutoffNano = cutoffSecs * 1e9;

  const rows = db.prepare(`
    SELECT
      m.text,
      m.is_from_me,
      m.date,
      COALESCE(h.id, '') AS contact,
      COALESCE(chat.display_name, '') AS group_name
    FROM message m
    LEFT JOIN chat_message_join cmj ON cmj.message_id = m.ROWID
    LEFT JOIN chat ON chat.ROWID = cmj.chat_id
    LEFT JOIN handle h ON h.ROWID = m.handle_id
    WHERE m.date > ?
      AND m.text IS NOT NULL
      AND LENGTH(TRIM(m.text)) > 0
    ORDER BY m.date ASC
  `).all(cutoffNano);

  db.close();

  // Group by conversation
  const convos = {};
  for (const row of rows) {
    const key = row.group_name || row.contact || "Unknown";
    if (!convos[key]) convos[key] = [];
    const dateMs = (row.date / 1e6 + appleEpochOffset * 1000);
    convos[key].push({
      from: row.is_from_me ? "Me" : (row.contact || "Them"),
      text: row.text,
      date: new Date(dateMs).toISOString(),
    });
  }

  return convos;
}

function formatConvosForClaude(convos) {
  const lines = [];
  for (const [name, msgs] of Object.entries(convos)) {
    if (msgs.length === 0) continue;
    lines.push(`\n=== Conversation: ${name} ===`);
    for (const m of msgs) {
      lines.push(`[${m.date.slice(0, 10)}] ${m.from}: ${m.text}`);
    }
  }
  return lines.join("\n");
}

app.post("/api/plans/scan", async (req, res) => {
  // .env first — the point of local-first is that the browser never holds a key.
  // The header is the old path, kept working until the key moves to .env.
  const apiKey = process.env.ANTHROPIC_API_KEY || req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(400).json({ error: "No Anthropic key. Set ANTHROPIC_API_KEY in .env" });
  }

  const days = parseInt(req.query.days) || 90;

  let convos;
  try {
    convos = getRecentMessages(days);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const convoText = formatConvosForClaude(convos);
  if (!convoText.trim()) {
    return res.json({ plans: [], scannedAt: new Date().toISOString(), days });
  }

  const client = new Anthropic({ apiKey });

  const today = new Date().toISOString().slice(0, 10);

  const prompt = `Today is ${today}. You are analyzing iMessage conversations to find social plans, events, or commitments.

For each plan you find, extract:
- title: short description (e.g. "Dinner with Jake", "Brunch at Farmhouse")
- contact: who it's with (name or number)
- date: the date/time if mentioned (ISO format or human-readable). If past, include it. If unknown, null.
- status: one of "accepted", "tentative", "declined", "pending", "past"
  - accepted = clearly confirmed by both parties
  - tentative = maybe, might, trying to figure out, no firm answer yet
  - declined = cancelled or said no
  - pending = asked but no reply yet
  - past = date has already passed
- details: any relevant details (location, activity, etc.)
- conversation: which conversation it came from

Return a JSON object: { "plans": [ ...array of plan objects... ] }

Only return plans that are actual social commitments or events being discussed. Ignore casual references to past events unless they indicate upcoming plans. Include ALL plans regardless of how far in the future or past.

MESSAGES:
${convoText.slice(0, 80000)}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.json({ plans: [], scannedAt: new Date().toISOString(), days });

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ plans: parsed.plans || [], scannedAt: new Date().toISOString(), days });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/plans/health", (req, res) => {
  const dbOk = existsSync(DB_PATH);
  res.json({ ok: true, dbFound: dbOk });
});

// ─── metrics ──────────────────────────────────────────────────────────────────
// The database is now the source of truth for anything logged by hand. The
// browser posts here instead of writing localStorage, so clearing the cache
// costs nothing.

app.get("/api/metrics", (req, res) => {
  const { metric, source, limit = 200 } = req.query;
  if (!metric) return res.status(400).json({ error: "metric is required" });

  try {
    const rows = source
      ? jarvisDb.prepare(
          `SELECT source, metric, value, unit, ts FROM metrics
           WHERE metric = ? AND source = ? ORDER BY ts DESC LIMIT ?`
        ).all(metric, source, Number(limit))
      : jarvisDb.prepare(
          `SELECT source, metric, value, unit, ts FROM metrics
           WHERE metric = ? ORDER BY ts DESC LIMIT ?`
        ).all(metric, Number(limit));

    res.json({ metric, rows: rows.reverse() });   // oldest first, the way charts want it
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/metrics", (req, res) => {
  const { source = "manual", metric, value, unit = null, ts } = req.body ?? {};
  if (!metric) return res.status(400).json({ error: "metric is required" });
  if (typeof value !== "number" || Number.isNaN(value)) {
    return res.status(400).json({ error: "value must be a number" });
  }

  try {
    putMetric({ source, metric, value, unit, ts: ts ?? new Date().toISOString() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── events ───────────────────────────────────────────────────────────────────
// Things that happened at a time, with detail: workouts now, calendar and
// transactions later. `payload` carries whatever the source cares about.

app.get("/api/events", (req, res) => {
  const { kind, limit = 500 } = req.query;
  if (!kind) return res.status(400).json({ error: "kind is required" });

  try {
    const rows = jarvisDb.prepare(
      `SELECT id, source, kind, title, start_ts, external_id, payload FROM events
       WHERE kind = ? ORDER BY start_ts DESC LIMIT ?`
    ).all(kind, Number(limit));

    res.json({
      kind,
      rows: rows.reverse().map(r => ({ ...r, payload: r.payload ? JSON.parse(r.payload) : null })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/events", (req, res) => {
  const { source = "manual", kind, title, start_ts, external_id, payload = null } = req.body ?? {};
  if (!kind || !title) return res.status(400).json({ error: "kind and title are required" });

  try {
    jarvisDb.prepare(`
      INSERT INTO events (source, kind, title, start_ts, external_id, payload)
      VALUES (@source, @kind, @title, @start_ts, @external_id, @payload)
      ON CONFLICT (source, external_id) DO UPDATE SET
        title = excluded.title, start_ts = excluded.start_ts, payload = excluded.payload
    `).run({
      source, kind, title,
      start_ts:    start_ts ?? new Date().toISOString(),
      external_id: external_id ?? `${kind}:${Date.now()}`,
      payload:     payload ? JSON.stringify(payload) : null,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/events/:id", (req, res) => {
  try {
    const { changes } = jarvisDb.prepare(`DELETE FROM events WHERE id = ?`).run(req.params.id);
    if (!changes) return res.status(404).json({ error: "no such event" });
    res.json({ ok: true, deleted: changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  migrate();   // create any missing tables at boot, so a fresh clone just works
  console.log(`Jarvis plans server running on http://localhost:${PORT}`);
});
