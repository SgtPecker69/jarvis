# Tasks

Dependency order, from the Rebuild Context Brief. Foundation first — the UI problem is downstream
of the architecture, so fixing the UI first would mean rebuilding it twice.

Tick items as they're done. Add tasks as they surface. Move finished work to Done with a date.

---

## Now — Task 0: commit everything (do this before touching anything else)

Nothing has been committed since 2026-05-22.

- [x] 2026-08-22 — `.gitignore` written (`node_modules/`, `dist/`, `.env*`, `data/`, `*.db*`,
      logs, `.claude/settings.local.json`, `.DS_Store`). Still untracked.
- [x] 2026-08-22 — Committed as `38a84f6` and pushed to origin/main. 14 files, 3,943 lines.
      `server.js`, `public/manifest.json` and `.gitignore` tracked for the first time.

## Task 1: the key leak — CLOSED 2026-08-22

`https://jarvis-self-five.vercel.app/api/config` served unauthenticated JSON containing the
Anthropic key, ElevenLabs key, Spotify and Google client IDs, and `jarvis_memories` (a personal
profile with location and habits) from 2026-05-22 until today. Closed and verified.

- [x] 2026-08-22 — Vercel URL found: `jarvis-self-five.vercel.app`. Exposure confirmed live.
- [x] 2026-08-22 — All keys rotated.
- [x] 2026-08-22 — `GITHUB_PAT` and `GITHUB_GIST_ID` deleted from Vercel; site redeployed.
      `/api/config` now returns `not-configured` — verified in the browser. Leak closed.
- [x] 2026-08-22 — Gist confirmed **secret**, not public. The Vercel deploy was the only exposure
      path. The Gist still holds the old dead keys; deleting it needs a GitHub login.

**Code cleanup — DONE 2026-08-22 (evening):**

- [x] Auto-push removed. `_scheduleAutoPush()` and the whole `SYNC_KEYS` list are gone from
      `src/App.jsx`, so no write can republish a key.
- [x] `useCloudSync` and the Gist card in Integrations removed with it.
- [x] `api/config.js` deleted. `.env.example` added with names and no values.
- [x] `server.js` reads `ANTHROPIC_API_KEY` from `.env` first, falling back to the old
      `X-API-Key` header so nothing breaks before the key is moved.

## Task 2: the SQLite data layer — DONE 2026-08-22

`data/jarvis.db` exists. Created with `npm run db:init`.

- [x] `metrics` — source, metric, value, unit, ts. `UNIQUE(source, metric, ts)` makes collectors
      idempotent: re-running overwrites instead of duplicating.
- [x] `events` — calendar, workouts, transactions, plans. `UNIQUE(source, external_id)`.
- [x] `targets` — the intent model. Without it, adherence can't be scored.
- [x] `devices`, `imports` — `imports.file_hash` is UNIQUE, so re-dropping a file is a no-op.
- [x] `db/index.js` — shared connection plus `putMetric`, `latestMetric`, `latestBySource`.
- [ ] Retention: raw rows forever, or roll up past a certain age? Deferred until there's enough
      data for it to matter.

**Note for future sessions:** the Cowork device shell is a Linux VM, so `better-sqlite3` (a macOS
native binary here) won't load there, and SQLite can't open files on the `$HOME/mnt` share at all.
Anything touching the database has to run in Mark's own Terminal.

## Task 3: migrate localStorage into SQLite — DONE 2026-08-22

There was almost nothing to migrate. The hunt mattered more than the migration.

- [x] Exported from both origins. **Both held exactly one key** (`jarvis_macro_date`). The
      deployed app hydrated localStorage *from* the Gist on load (`src/App.jsx:174`), so closing
      the leak in task 1 left both browsers empty.
- [x] Gist recovered — `gist.github.com/SgtPecker69/a56a118c380a0c8d721c5672246b12ba`, 9 keys.
      It held settings, keys and the memory file. **None of the four history keys were in it**,
      despite all four being in `SYNC_KEYS` — so they were never written. No workouts, weights,
      sleep or macros were ever logged.
- [x] `jarvis_memories` was the literal string `"undefined"` — corrupted at some point, contents
      unrecoverable.
- [x] Saved the one survivor: `data/jarvis-rescue.json` — the memory profile, 2,192 chars.
- [x] `memories` table added (kind `profile` | `note`), since text facts fit neither `metrics`
      nor `events`.
- [x] `db/migrate-localstorage.js` written — reads any export in `data/`, upserts, prints
      in-export vs in-db counts. `npm run db:migrate`. Idempotent, deletes nothing.
- [x] Verified: profile row is 2,192 chars, byte-identical to the Gist.
- [x] **`data/jarvis.db` did not exist.** Task 2 was marked done but the file was never built —
      that session ran in the Linux VM that can't write it. `npm run db:init` fixed it.

**Conclusion: there is no history. Everything starts from today.** Which is why the rest of this
task became the app work below.

## Task 3b: first view on live data — DONE 2026-08-22

The Body tab is the first thing in the app that reads and writes SQLite instead of localStorage.

- [x] `GET`/`POST /api/metrics` in `server.js`. Rejects a non-numeric value with a real message.
- [x] `useMeasurements()` in `src/App.jsx` — same `{weight, waist}` shape the views already used,
      so nothing downstream changed. Names its own failure when the server is down.
- [x] Body tab rewired. `jarvis_measurements` is no longer read or written.
- [x] `PORT` now overridable, so a test server can run beside the dev one.
- [x] Verified end to end in the browser: log → `POST` 200 → row in SQLite → re-read on mount.

## Task 3c: the rest of the manual logging — DONE 2026-08-22

Every view that records something by hand now writes to SQLite. `useMetrics` is the shared path;
each view hook just declares its metrics.

- [x] `useMetrics(specs)` — one read/write path, one place that knows the API. `useMeasurements`
      rebuilt on it.
- [x] **Sleep** → `sleep_hours` plus `bedtime_min`. Bedtime is stored as minutes past midnight
      because a number is chartable and "23:30" isn't; both rows share one timestamp so they fold
      back into one night on read. Verified: 7.5h + 23:30 → 1410, renders back correctly.
- [x] **Training** → `events` with `kind='workout'`, sets in `payload`. Needed
      `GET`/`POST`/`DELETE /api/events`. Verified: log → PR badge and volume compute from the
      database → Clear Today deletes the row.
- [x] **Macro history** → `macro_cal` / `macro_protein` / `macro_carbs` / `macro_fat`, written at
      the day boundary. The `UNIQUE(source, metric, ts)` constraint means re-snapshotting a day
      corrects it instead of duplicating. A failed snapshot now notifies instead of vanishing.

`jarvis_measurements`, `jarvis_sleep`, `jarvis_workouts` and `jarvis_macro_history` are gone from
localStorage. What's left there is settings, tokens and UI state.

**Still on localStorage, deliberately:** today's running macro total (`jarvis_macros`) resets daily
and is scratch. Worth moving when the Macros tab gets rebuilt — the day's row could be upserted on
every change instead of snapshotted at midnight.

## Cleanup carried forward

- Gist: **no action needed.** It's secret, every key in it is dead, and `/api/config` can no longer
  write to it (`GITHUB_PAT` deleted from Vercel in task 1). Inert. Delete it only if you want to.
- [ ] Move the Anthropic / Groq / ElevenLabs keys out of the browser and into `.env`. The server
      already prefers `.env`; the browser fields still work, so this is a migration, not a fix.

## Task 4: server.js as the real local API — DONE 2026-08-22

The mixed-content problem in the PRD is now actually dissolved, not just described.

- [x] Split into modules. `server.js` is 38 lines of wiring; routes live in `server/routes/`
      (`metrics`, `events`, `plans`, `hue`) and the iMessage reader in `server/imessage.js`.
      The Apple-epoch offset is a named constant now — getting it wrong shifts every message by
      31 years, silently.
- [x] **Hue moved server-side.** `POST /api/hue/lights` and `PUT /api/hue/state` proxy to the
      bridge. The browser no longer touches the LAN. 4s timeout so a wrong IP fails fast, bridge
      error descriptions passed through, and partial failure is reported rather than swallowed —
      one dead bulb no longer looks like success.
- [x] Plan-scan route still works through the refactor — `/api/plans/health` verified.

**Untested against real hardware:** no bridge is connected, so only the failure paths were
exercised (bad IP → "No answer from the bridge at … within 4s", surfaced in the UI). The success
path needs Mark's bridge IP and API key.

## Task 5: collectors — framework done, Oura ported, needs tokens

`server/collectors/`. Runs hourly, asks for the last 14 days every time, so a closed lid means
late data. Idempotency is free from `UNIQUE(source, metric, ts)` — re-collecting a day corrects it.
A collector without its credentials is skipped and says why; it never looks like it worked.
`GET /api/collect` shows status, `POST /api/collect` runs one now.

- [x] Runner, status tracking, hourly schedule, manual trigger.
- [x] **Oura ported off the browser.** Writes `readiness_score`, `sleep_score`, `sleep_hours`,
      `rem_hours`, `deep_hours`, `resting_hr`, `hrv`, `steps`, `active_kcal` — all tagged
      `source='oura'`, timestamped noon UTC on the day they describe so they line up with manual
      entries. Naps are filtered out; only `long_sleep` counts.
      **Verified against the real API**: a bad token returns "Oura rejected the token — check
      OURA_TOKEN in .env". Needs Mark's real token to collect anything.
- [ ] **Needs Mark:** put the Oura Personal Access Token in `.env` as `OURA_TOKEN`
      (cloud.ouraring.com/personal-access-tokens).
- [ ] Whoop — needs Mark to create an app at developer.whoop.com for a client ID and secret.
      `.env.example` already has the slots.
- [ ] Google Calendar — needs an OAuth decision. Local-first removes the reason for the implicit
      flow, so the proper authorization-code flow is now possible; see `DECISIONS.md`.
- [ ] Hue device state — the route exists (`/api/hue/lights`); it just needs polling on a timer
      and writing to `devices`.

## Task 6: the watched-folder ingester — BUILT 2026-08-22, parsers unconfirmed

Drop a CSV in `~/Jarvis Inbox` and it lands in SQLite. Override the location with `JARVIS_INBOX`.

- [x] `server/ingest/` — a real CSV parser (exports quote fields containing commas, so splitting
      on `,` loses rows), format detection by header, and the writer.
- [x] Idempotent: `imports.file_hash` is UNIQUE, so re-dropping a file is a no-op. Verified by
      scanning the same folder twice — second pass wrote nothing.
- [x] Backfills on wake: the whole folder is scanned at startup, so a file dropped while the
      laptop was shut is late data, not lost data.
- [x] Live watcher with a 1.5s settle, because a file being copied in fires several events and may
      be half-written when the first arrives. Verified with a live drop.
- [x] Unrecognised files are **recorded**, not ignored — `imports.status = 'unrecognised'` with the
      column names it saw. A drop that does nothing and says nothing is the failure mode.
- [x] `GET /api/imports` — history, including failures. `POST /api/imports/scan` forces a re-scan.
- [x] `npm run ingest:check <file>` — dry run, prints what a parser makes of a file, writes nothing.

**Parsers are written from documented formats, not from Mark's actual exports.** Rocket Money,
MyFitnessPal and ConEd Green Button are all implemented and tested against synthetic files with
those column names. Run `ingest:check` on the first real export of each and fix the column names
if they differ — that's a 2-minute change in `server/ingest/parsers.js`.

- [ ] Confirm Rocket Money's real column names against an export.
- [ ] Confirm MyFitnessPal's real column names against an export.
- [ ] ConEd Green Button — still need to confirm Download-My-Data vs Connect-My-Data, and whether
      it arrives as CSV or XML. The parser assumes CSV.
- [ ] Apple Health export — not started. It's XML, not CSV, so it needs its own path. Health Auto
      Export writing CSV to the inbox on a schedule would avoid that entirely.

## Task 7: launchd agent — written, not installed

- [x] `launchd/com.markadler.jarvis.plist` plus install/uninstall scripts. `RunAtLoad`, restart on
      crash, 10s throttle so a crash loop doesn't spin, logs to `~/Library/Logs/jarvis.log`.
      The node path is substituted at install time because Homebrew/nvm/system differ.
      Generated plist validated with `plutil -lint`.
- [x] Collectors already run on an interval inside the server process, so the agent only needs to
      keep the server up.
- [ ] **Needs Mark:** `npm run launchd:install`. Not run automatically — it changes your system.
      Undo any time with `npm run launchd:uninstall`.
- [ ] The server needs Full Disk Access to read the iMessage database once it runs under launchd.
      System Settings → Privacy & Security → Full Disk Access → add the node binary.

## Later

- **Task 8 — design system.** The "top in class" pass. Refined dark palette, real typographic
  scale, purposeful motion, restraint with glow/glass. Tokens defined once, inherited everywhere.
  Keep the JARVIS ambition; drop the TEMU execution.
- **Task 9 — break up `App.jsx`.** Hooks, components, one file per view. Deliberately after the
  design system, so it's split along the lines the new UI actually needs.
- **Task 10 — rebuild core views on live data.** Briefing, Analytics, Environment, Sleep, Body.
  Body pairs weight trend with strength maintenance in one view — target 165-170 from 180-185,
  and lifts holding is what proves it's fat and not muscle coming off.
- **Task 11 — cross-source insight views.** Sleep vs. meeting density. Training load vs. calendar
  pressure. Spend drift and subscription creep. Adherence scoring against the targets table. The
  payoff no single vendor app can produce, because each needs two sources at once.
- **Task 12 — verify end to end, write a run book.**

### Backlog

- Tailscale, to restore phone access over a private network.
- Decide per view whether it shows one wearable or all three. "What's my resting HR" no longer has
  a single answer.
- Home Assistant as aggregator, if devices without APIs turn up.
- Tests for the silent-failure functions: Apple-epoch conversion in `server.js`, macro math,
  collector idempotency.
- Spotify extended streaming history as a mood/energy source — Spotify is already wired.

## Done

- [x] 2026-08-22 — Kickoff reconciled against the Rebuild Context Brief; PRD, tasks, working
      context and decision log rewritten on it.
- [x] 2026-08-22 — `.gitignore` added (repo hygiene; 184MB of `node_modules` and `dist/` no longer
      untracked noise).
