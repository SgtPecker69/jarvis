// Format detection and parsing for the files dropped into the inbox.
//
// Each parser declares how to recognise its format from the CSV headers, and
// returns { metrics, events } to be written. A file that matches nothing is
// recorded as unrecognised rather than silently ignored — a drop that does
// nothing and says nothing is the failure mode this whole system is against.
//
// NOTE: these column names come from the documented export formats, not from
// Mark's own files. The first real export of each should be checked against
// them — `npm run ingest:check <file>` prints what a parser makes of a file
// without writing anything.

import { parseCsv, pick } from "./csv.js";

const num = (v) => {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(/[$,()]/g, "").trim());
  return Number.isNaN(n) ? null : (/^\(.*\)$/.test(String(v).trim()) ? -n : n);
};

const iso = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// ── Rocket Money — transactions, already categorised, covers Chase ────────────
const rocketMoney = {
  source: "rocket_money",
  matches: (h) => h.includes("Amount") && (h.includes("Merchant") || h.includes("Name")) &&
                  (h.includes("Category") || h.includes("Original Date")),
  parse(records) {
    const events = [];
    for (const [i, r] of records.entries()) {
      const amount = num(pick(r, "Amount"));
      const date   = iso(pick(r, "Date", "Original Date", "Transaction Date"));
      const title  = pick(r, "Merchant", "Name", "Description") ?? "Transaction";
      if (amount == null || !date) continue;

      events.push({
        source: "rocket_money", kind: "transaction", title,
        start_ts: date, amount,
        category: pick(r, "Category") ?? null,
        external_id: `rm:${date.slice(0, 10)}:${title}:${amount}:${i}`,
        payload: { account: pick(r, "Account Name", "Account") ?? null },
      });
    }
    return { metrics: [], events };
  },
};

// ── MyFitnessPal — nutrition, one row per day ─────────────────────────────────
const myFitnessPal = {
  source: "myfitnesspal",
  matches: (h) => h.some(x => /^calories$/i.test(x)) && h.some(x => /protein/i.test(x)),
  parse(records) {
    const fields = [
      ["macro_cal",     "kcal", ["Calories"]],
      ["macro_protein", "g",    ["Protein (g)", "Protein"]],
      ["macro_carbs",   "g",    ["Carbohydrates (g)", "Carbs (g)", "Carbohydrates"]],
      ["macro_fat",     "g",    ["Fat (g)", "Fat"]],
    ];
    const metrics = [];
    for (const r of records) {
      const ts = iso(pick(r, "Date"));
      if (!ts) continue;
      for (const [metric, unit, names] of fields) {
        const value = num(pick(r, ...names));
        if (value != null) metrics.push({ source: "myfitnesspal", metric, value, unit, ts });
      }
    }
    return { metrics, events: [] };
  },
};

// ── ConEd Green Button — electricity usage intervals ──────────────────────────
const conEd = {
  source: "coned",
  matches: (h) => h.some(x => /usage/i.test(x)) &&
                  h.some(x => /start.*(date|time)/i.test(x) || /^date$/i.test(x)),
  parse(records) {
    const metrics = [];
    for (const r of records) {
      const ts    = iso(pick(r, "Start Date", "Start Time", "Date", "Start"));
      const value = num(pick(r, "Usage", "Usage (kWh)", "Consumption"));
      if (ts && value != null) {
        metrics.push({ source: "coned", metric: "electricity_kwh", value, unit: "kWh", ts });
      }
    }
    return { metrics, events: [] };
  },
};

export const PARSERS = [rocketMoney, myFitnessPal, conEd];

/** Returns { parser, metrics, events } or { parser: null } if nothing matched. */
export function parseFile(text) {
  const { headers, records } = parseCsv(text);
  if (!records.length) return { parser: null, reason: "no rows", metrics: [], events: [] };

  const parser = PARSERS.find(p => p.matches(headers));
  if (!parser) {
    return { parser: null, reason: `unrecognised columns: ${headers.slice(0, 8).join(", ")}`,
             metrics: [], events: [] };
  }

  return { parser, ...parser.parse(records) };
}
