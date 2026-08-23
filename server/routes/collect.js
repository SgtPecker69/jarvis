// Collector status and a manual trigger, so you never have to guess whether a
// collector is working or just quiet.

import { Router } from "express";
import { runAll, collectorStatus } from "../collectors/index.js";

export const collect = Router();

collect.get("/", (_req, res) => {
  res.json({ collectors: collectorStatus() });
});

collect.post("/", async (req, res) => {
  const days = Number(req.query.days) || 14;
  try {
    res.json({ days, results: await runAll({ days }) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
