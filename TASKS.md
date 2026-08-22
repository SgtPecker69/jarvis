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

**Still to do in code — cleanup, no longer urgent:**

- [ ] **Remove the auto-push.** `_scheduleAutoPush()` at `src/App.jsx:129` fires from
      `useLocalStorage` (`src/App.jsx:149`) on every write to a `SYNC_KEYS` entry, POSTing the whole
      config to `/api/config` after a 2s debounce — wrapped in `catch {}`, so it fails silently and
      reports nothing. Until this is gone, entering a key in the deployed app republishes it.
- [ ] Remove `jarvis_api_key`, `jarvis_groq_key`, `jarvis_eleven_key` from `SYNC_KEYS` in **both**
      `src/App.jsx` and `api/config.js` — the lists are duplicated and already drifted.
- [ ] Retire `api/config.js` entirely once local-first lands. Secrets move to a local `.env` read
      only by the server; add `.env.example` with names and no values.

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

## Next — Task 3: migrate localStorage into SQLite

- [ ] Export all ~30 `jarvis_*` keys from the browser before touching anything.
- [ ] Write the migration for the ones with history worth keeping: `jarvis_macro_history`,
      `jarvis_measurements`, `jarvis_sleep`, `jarvis_workouts`, `jarvis_memories`.
- [ ] Verify row counts against the export before deleting anything.

## Next — Task 4: expand server.js into the real local API

The mixed-content problem in the PRD dissolves here — LAN calls move server-side.

- [ ] Split `server.js` into modular routes: metrics, device control, integration proxying.
- [ ] Move the Hue calls out of the browser and into the server.
- [ ] Keep the existing iMessage plan-scan route working through the refactor.

## Next — Task 5: collectors

Idempotent, backfill on wake. A closed lid means late data, not lost data.

- [ ] Oura (already has a working integration to port)
- [ ] Whoop — new. OAuth developer platform, gives recovery, strain, sleep, workouts.
- [ ] Google Calendar
- [ ] Hue / LAN device state

## Next — Task 6: the watched-folder ingester

The Mac-as-API centerpiece. Anything dropped in a folder gets parsed into SQLite.

- [ ] Rocket Money transaction CSV — covers Chase and subscription creep in one file
- [ ] MyFitnessPal nutrition export (Premium confirmed, so the full export is available)
- [ ] ConEd Green Button — confirm Download-My-Data vs Connect-My-Data first
- [ ] Apple Health export — consider Health Auto Export writing to the folder on a schedule so it
      stops being a manual chore

## Next — Task 7: launchd agent

- [ ] Server starts at login; collectors run on intervals.

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
