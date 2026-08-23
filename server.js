// JARVIS — the local API.
//
// This runs on Mark's Mac and nowhere else, on purpose. It reads the iMessage
// database, owns the SQLite file, and reaches LAN devices the browser can't.
// Routes live in server/routes/; this file only wires them together.

import express from "express";
import { migrate } from "./db/index.js";
import { metrics } from "./server/routes/metrics.js";
import { events }  from "./server/routes/events.js";
import { plans }   from "./server/routes/plans.js";
import { hue }     from "./server/routes/hue.js";
import { imports } from "./server/routes/imports.js";
import { startWatching } from "./server/ingest/watcher.js";

// Secrets live in .env, read here and nowhere else. Missing file is fine —
// routes that need a key say so themselves.
try { process.loadEnvFile(new URL(".env", import.meta.url)); } catch {}

const app = express();
app.use(express.json());

// CORS for the local Vite dev server.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  next();
});

app.use("/api/metrics", metrics);
app.use("/api/events",  events);
app.use("/api/plans",   plans);
app.use("/api/hue",     hue);
app.use("/api/imports", imports);

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  migrate();   // create any missing tables at boot, so a fresh clone just works
  console.log(`Jarvis server running on http://localhost:${PORT}`);
  startWatching();   // scans the inbox first, so a file dropped while off still lands
});
