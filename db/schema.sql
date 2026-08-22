-- JARVIS local database schema
-- Source of truth. Replaces localStorage.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── metrics ───────────────────────────────────────────────────────────────────
-- Every number that changes over time. Sleep score, resting HR, weight, spend.
-- `source` is mandatory: Oura, Whoop and Apple Watch all report the same metrics
-- and disagree. We store all three and let each view pick.
CREATE TABLE IF NOT EXISTS metrics (
  id         INTEGER PRIMARY KEY,
  source     TEXT    NOT NULL,          -- 'oura' | 'whoop' | 'apple_health' | 'manual' | ...
  metric     TEXT    NOT NULL,          -- 'sleep_score' | 'resting_hr' | 'weight_lb' | ...
  value      REAL    NOT NULL,
  unit       TEXT,                      -- 'lb' | 'bpm' | 'ms' | null
  ts         TEXT    NOT NULL,          -- ISO8601 UTC — when the measurement applies
  recorded_at TEXT   NOT NULL DEFAULT (datetime('now')),
  UNIQUE (source, metric, ts)           -- makes collectors idempotent: re-running is a no-op
);
CREATE INDEX IF NOT EXISTS idx_metrics_lookup ON metrics (metric, ts DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_source ON metrics (source, metric, ts DESC);

-- ── events ────────────────────────────────────────────────────────────────────
-- Things that happen at a time, with detail. Calendar entries, workouts,
-- transactions, plans found in iMessage.
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY,
  source      TEXT    NOT NULL,         -- 'gcal' | 'rocket_money' | 'imessage' | 'manual'
  kind        TEXT    NOT NULL,         -- 'calendar' | 'workout' | 'transaction' | 'plan'
  title       TEXT    NOT NULL,
  start_ts    TEXT    NOT NULL,
  end_ts      TEXT,
  amount      REAL,                     -- for transactions
  category    TEXT,
  external_id TEXT,                     -- the source's own id, for idempotency
  payload     TEXT,                     -- JSON blob for anything source-specific
  recorded_at TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_events_time ON events (kind, start_ts DESC);

-- ── targets ───────────────────────────────────────────────────────────────────
-- What you SAID you'd do. Nothing else in this schema records intent, and
-- "did I do what I said I'd do" can't be answered without it.
CREATE TABLE IF NOT EXISTS targets (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,         -- 'Train 4x/week' | 'Protein 180g' | 'Weight 168'
  metric      TEXT,                     -- which metric it scores against, if any
  source      TEXT,                     -- which source is authoritative for scoring
  comparator  TEXT    NOT NULL,         -- '>=' | '<=' | '==' | 'count>='
  target_value REAL   NOT NULL,
  period      TEXT    NOT NULL,         -- 'day' | 'week' | 'month'
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  retired_at  TEXT
);

-- ── devices ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  kind        TEXT    NOT NULL,         -- 'light' | 'bridge' | 'wearable' | 'sensor'
  room        TEXT,
  external_id TEXT,
  last_seen   TEXT,
  UNIQUE (kind, external_id)
);

-- ── imports ───────────────────────────────────────────────────────────────────
-- Every file the watched-folder ingester has eaten. Hash means dropping the
-- same export twice does nothing instead of doubling your data.
CREATE TABLE IF NOT EXISTS imports (
  id          INTEGER PRIMARY KEY,
  source      TEXT    NOT NULL,         -- 'rocket_money' | 'myfitnesspal' | 'coned' | 'apple_health'
  filename    TEXT    NOT NULL,
  file_hash   TEXT    NOT NULL UNIQUE,
  rows_added  INTEGER NOT NULL DEFAULT 0,
  imported_at TEXT    NOT NULL DEFAULT (datetime('now')),
  status      TEXT    NOT NULL DEFAULT 'ok',
  error       TEXT
);
