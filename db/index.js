// JARVIS database — single connection, opened once, shared everywhere.
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "jarvis.db");

export const db = new Database(DB_PATH);

/** Create any missing tables. Safe to run every startup. */
export function migrate() {
  db.exec(readFileSync(join(__dirname, "schema.sql"), "utf8"));
}

/** Write one measurement. Re-writing the same one is a no-op, not a duplicate. */
export function putMetric({ source, metric, value, unit = null, ts }) {
  return db.prepare(`
    INSERT INTO metrics (source, metric, value, unit, ts)
    VALUES (@source, @metric, @value, @unit, @ts)
    ON CONFLICT (source, metric, ts) DO UPDATE SET value = excluded.value
  `).run({ source, metric, value, unit, ts });
}

/** Latest value of a metric. Pass a source when you care which device answers. */
export function latestMetric(metric, source = null) {
  const sql = source
    ? `SELECT * FROM metrics WHERE metric = ? AND source = ? ORDER BY ts DESC LIMIT 1`
    : `SELECT * FROM metrics WHERE metric = ? ORDER BY ts DESC LIMIT 1`;
  return source ? db.prepare(sql).get(metric, source) : db.prepare(sql).get(metric);
}

/** Every source's latest reading for one metric — the "they disagree" view. */
export function latestBySource(metric) {
  return db.prepare(`
    SELECT source, value, unit, ts FROM metrics
    WHERE metric = ? AND ts = (
      SELECT MAX(ts) FROM metrics m2 WHERE m2.metric = metrics.metric AND m2.source = metrics.source
    )
    ORDER BY source
  `).all(metric);
}
