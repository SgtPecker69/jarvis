// One-time setup: create data/jarvis.db and its tables.
import { db, migrate } from "./index.js";

migrate();

const tables = db.prepare(
  `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
).all().map(r => r.name);

console.log("Database ready at data/jarvis.db");
console.log("Tables:", tables.join(", "));
