// Hue bridge control, moved off the browser.
//
// This is the whole reason for local-first. The bridge speaks plain HTTP on the
// LAN, and a browser on an HTTPS page is not allowed to talk to it — that's the
// mixed-content wall the old architecture hit. The server has no such problem.
//
// No credentials are stored here: the browser passes the bridge IP and username
// per request. They're LAN-scoped and useless off the network.

import { Router } from "express";

export const hue = Router();

const TIMEOUT_MS = 4000;   // a wrong IP should fail fast, not hang the UI

async function bridge(ip, username, path, { method = "GET", body } = {}) {
  const res = await fetch(`http://${ip}/api/${username}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body:    body ? JSON.stringify(body) : undefined,
    signal:  AbortSignal.timeout(TIMEOUT_MS),
  });
  return res.json();
}

// The bridge answers 200 with an error array rather than an HTTP error code.
const bridgeError = (data) => Array.isArray(data) && data[0]?.error?.description;

function explain(err, ip) {
  if (err.name === "TimeoutError") return `No answer from the bridge at ${ip} within 4s`;
  return err.message;
}

hue.post("/lights", async (req, res) => {
  const { ip, username } = req.body ?? {};
  if (!ip || !username) return res.status(400).json({ error: "ip and username are required" });

  try {
    const data = await bridge(ip, username, "/lights");
    const problem = bridgeError(data);
    if (problem) return res.status(502).json({ error: `Bridge rejected the request: ${problem}` });

    res.json({
      lights: Object.entries(data).map(([id, l]) => ({
        id, name: l.name, on: l.state?.on ?? false, bri: l.state?.bri ?? 0,
      })),
    });
  } catch (err) {
    res.status(502).json({ error: explain(err, ip) });
  }
});

// Applies one state to many lights — that's what a scene is.
hue.put("/state", async (req, res) => {
  const { ip, username, lightIds, state } = req.body ?? {};
  if (!ip || !username)         return res.status(400).json({ error: "ip and username are required" });
  if (!Array.isArray(lightIds)) return res.status(400).json({ error: "lightIds must be an array" });
  if (!state)                   return res.status(400).json({ error: "state is required" });

  try {
    const results = await Promise.all(lightIds.map(async id => {
      const data = await bridge(ip, username, `/lights/${id}/state`, { method: "PUT", body: state });
      return { id, error: bridgeError(data) ?? null };
    }));

    const failed = results.filter(r => r.error);
    if (failed.length === results.length && results.length > 0) {
      return res.status(502).json({ error: `Every light rejected the change: ${failed[0].error}` });
    }
    // Partial failure is reported, not swallowed — one dead bulb shouldn't look like success.
    res.json({ ok: true, applied: results.length - failed.length, failed });
  } catch (err) {
    res.status(502).json({ error: explain(err, ip) });
  }
});
