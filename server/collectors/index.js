// The collector runner.
//
// Two rules from the PRD, both about the laptop being closed half the time:
//   - Idempotent. Every collector returns rows; UNIQUE(source, metric, ts) means
//     writing the same day twice corrects it instead of duplicating it.
//   - Backfills on wake. Each run asks for the last two weeks, not just today,
//     so a shut lid means late data rather than lost data.
//
// A collector without its credentials is skipped and says why. It never looks
// like it worked.

import { putMetric } from "../../db/index.js";
import { oura } from "./oura.js";

export const COLLECTORS = [oura];

const lastRun = new Map();   // name → { at, status, rows, error }

export async function runCollector(collector, opts = {}) {
  if (!collector.enabled()) {
    const result = { name: collector.name, status: "skipped", reason: collector.reason, rows: 0 };
    lastRun.set(collector.name, { ...result, at: new Date().toISOString() });
    return result;
  }

  try {
    const rows = await collector.collect(opts);
    for (const row of rows) putMetric(row);

    const result = { name: collector.name, status: "ok", rows: rows.length };
    lastRun.set(collector.name, { ...result, at: new Date().toISOString() });
    return result;
  } catch (err) {
    const result = { name: collector.name, status: "error", reason: err.message, rows: 0 };
    lastRun.set(collector.name, { ...result, at: new Date().toISOString() });
    return result;
  }
}

export const runAll = (opts) => Promise.all(COLLECTORS.map(c => runCollector(c, opts)));

export const collectorStatus = () =>
  COLLECTORS.map(c => ({
    name:    c.name,
    enabled: c.enabled(),
    reason:  c.enabled() ? null : c.reason,
    last:    lastRun.get(c.name) ?? null,
  }));

const HOURLY = 60 * 60 * 1000;

export function startCollecting(log = console.log) {
  const cycle = async () => {
    for (const r of await runAll()) {
      // Skips are quiet after the first pass — an unconfigured collector
      // shouldn't fill the log every hour.
      if (r.status !== "skipped") {
        log(`  collector ${r.name}: ${r.status}${r.rows ? ` (${r.rows} rows)` : ""}${r.reason ? ` — ${r.reason}` : ""}`);
      }
    }
  };

  const enabled = COLLECTORS.filter(c => c.enabled()).map(c => c.name);
  const waiting = COLLECTORS.filter(c => !c.enabled()).map(c => `${c.name} (${c.reason})`);

  if (enabled.length) log(`Collectors: ${enabled.join(", ")} — every hour, backfilling 14 days`);
  if (waiting.length) log(`Collectors waiting on config: ${waiting.join(", ")}`);

  cycle();
  setInterval(cycle, HOURLY);
}
