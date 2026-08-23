// Things that happened at a time, with detail: workouts now, calendar entries
// and transactions later. `payload` carries whatever the source cares about.

import { Router } from "express";
import { db } from "../../db/index.js";

export const events = Router();

events.get("/", (req, res) => {
  const { kind, limit = 500 } = req.query;
  if (!kind) return res.status(400).json({ error: "kind is required" });

  try {
    const rows = db.prepare(
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

events.post("/", (req, res) => {
  const { source = "manual", kind, title, start_ts, external_id, payload = null } = req.body ?? {};
  if (!kind || !title) return res.status(400).json({ error: "kind and title are required" });

  try {
    db.prepare(`
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

events.delete("/:id", (req, res) => {
  try {
    const { changes } = db.prepare(`DELETE FROM events WHERE id = ?`).run(req.params.id);
    if (!changes) return res.status(404).json({ error: "no such event" });
    res.json({ ok: true, deleted: changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
