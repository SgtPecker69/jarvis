// The watched folder. Drop an export in, it lands in SQLite.
//
// Two properties matter here, both from the PRD:
//   - Idempotent. `imports.file_hash` is UNIQUE, so re-dropping a file is a no-op
//     rather than doubling your data.
//   - Backfills on wake. Everything in the folder is scanned at startup, so a
//     file dropped while the laptop was shut means late data, not lost data.

import { createHash } from "crypto";
import { readFileSync, readdirSync, existsSync, mkdirSync, statSync } from "fs";
import { watch } from "fs";
import { homedir } from "os";
import { join } from "path";
import { db, putMetric } from "../../db/index.js";
import { parseFile } from "./parsers.js";

export const INBOX = process.env.JARVIS_INBOX || join(homedir(), "Jarvis Inbox");

const alreadyImported = db.prepare(`SELECT 1 FROM imports WHERE file_hash = ?`);

const recordImport = db.prepare(`
  INSERT INTO imports (source, filename, file_hash, rows_added, status, error)
  VALUES (@source, @filename, @file_hash, @rows_added, @status, @error)
  ON CONFLICT (file_hash) DO NOTHING
`);

const putEvent = db.prepare(`
  INSERT INTO events (source, kind, title, start_ts, amount, category, external_id, payload)
  VALUES (@source, @kind, @title, @start_ts, @amount, @category, @external_id, @payload)
  ON CONFLICT (source, external_id) DO UPDATE SET
    title = excluded.title, start_ts = excluded.start_ts, amount = excluded.amount,
    category = excluded.category, payload = excluded.payload
`);

/** Parse one file and write it. Returns a short result for logging. */
export function ingestFile(path, { dryRun = false } = {}) {
  const filename = path.split("/").pop();
  const buf      = readFileSync(path);
  const hash     = createHash("sha256").update(buf).digest("hex");

  if (!dryRun && alreadyImported.get(hash)) {
    return { filename, status: "skipped", reason: "already imported", rows: 0 };
  }

  const { parser, reason, metrics, events } = parseFile(buf.toString("utf8"));

  if (!parser) {
    if (!dryRun) {
      recordImport.run({ source: "unknown", filename, file_hash: hash,
                         rows_added: 0, status: "unrecognised", error: reason });
    }
    return { filename, status: "unrecognised", reason, rows: 0 };
  }

  if (dryRun) {
    return { filename, status: "would import", source: parser.source,
             rows: metrics.length + events.length,
             sample: metrics[0] ?? events[0] ?? null };
  }

  const write = db.transaction(() => {
    for (const m of metrics) putMetric(m);
    for (const e of events)  putEvent.run({ ...e, payload: e.payload ? JSON.stringify(e.payload) : null });
  });

  try {
    write();
    const rows = metrics.length + events.length;
    recordImport.run({ source: parser.source, filename, file_hash: hash,
                       rows_added: rows, status: "ok", error: null });
    return { filename, status: "ok", source: parser.source, rows };
  } catch (err) {
    recordImport.run({ source: parser.source, filename, file_hash: hash,
                       rows_added: 0, status: "error", error: err.message });
    return { filename, status: "error", reason: err.message, rows: 0 };
  }
}

const isCandidate = (name) => /\.csv$/i.test(name) && !name.startsWith(".");

/** Scan everything already sitting in the folder. This is the backfill. */
export function scanInbox(opts = {}) {
  if (!existsSync(INBOX)) return [];
  return readdirSync(INBOX)
    .filter(isCandidate)
    .map(name => ingestFile(join(INBOX, name), opts));
}

export function startWatching(log = console.log) {
  if (!existsSync(INBOX)) mkdirSync(INBOX, { recursive: true });

  for (const r of scanInbox()) {
    if (r.status !== "skipped") log(`  inbox: ${r.filename} — ${r.status}${r.rows ? ` (${r.rows} rows)` : ""}${r.reason ? ` — ${r.reason}` : ""}`);
  }

  // A file being copied in fires several events and may be half-written when the
  // first arrives, so settle briefly before reading it.
  const pending = new Map();
  watch(INBOX, (_type, name) => {
    if (!name || !isCandidate(name)) return;
    clearTimeout(pending.get(name));
    pending.set(name, setTimeout(() => {
      pending.delete(name);
      const path = join(INBOX, name);
      if (!existsSync(path) || !statSync(path).size) return;
      const r = ingestFile(path);
      if (r.status !== "skipped") {
        log(`  inbox: ${r.filename} — ${r.status}${r.rows ? ` (${r.rows} rows)` : ""}${r.reason ? ` — ${r.reason}` : ""}`);
      }
    }, 1500));
  });

  log(`Watching ${INBOX}`);
}
