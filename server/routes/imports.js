// What the watched folder has eaten. Every drop is recorded, including the ones
// that failed — a file that does nothing and says nothing is the failure mode
// this whole system exists to avoid.

import { Router } from "express";
import { db } from "../../db/index.js";
import { INBOX, scanInbox } from "../ingest/watcher.js";

export const imports = Router();

imports.get("/", (_req, res) => {
  try {
    const rows = db.prepare(
      `SELECT id, source, filename, rows_added, status, error, imported_at
       FROM imports ORDER BY imported_at DESC LIMIT 100`
    ).all();
    res.json({ inbox: INBOX, rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual re-scan, for when you'd rather not wait for the watcher.
imports.post("/scan", (_req, res) => {
  try {
    res.json({ inbox: INBOX, results: scanInbox() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
