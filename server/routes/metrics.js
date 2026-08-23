// Every number that changes over time. Source-tagged, because three wearables
// will report different values for the same night and we keep all of them.

import { Router } from "express";
import { db, putMetric } from "../../db/index.js";

export const metrics = Router();

metrics.get("/", (req, res) => {
  const { metric, source, limit = 200 } = req.query;
  if (!metric) return res.status(400).json({ error: "metric is required" });

  try {
    const rows = source
      ? db.prepare(
          `SELECT source, metric, value, unit, ts FROM metrics
           WHERE metric = ? AND source = ? ORDER BY ts DESC LIMIT ?`
        ).all(metric, source, Number(limit))
      : db.prepare(
          `SELECT source, metric, value, unit, ts FROM metrics
           WHERE metric = ? ORDER BY ts DESC LIMIT ?`
        ).all(metric, Number(limit));

    res.json({ metric, rows: rows.reverse() });   // oldest first, the way charts want it
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

metrics.post("/", (req, res) => {
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
