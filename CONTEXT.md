# JARVIS — Rebuild Context Brief

> Handoff document. Written 2026-08-22 from a discovery session.
> Purpose: give any new session full context on this project without re-deriving it.
> Owner: Mark Adler. Repo: `~/jarvis`.

---

## 1. What this project is

A personal life-dashboard and assistant app. The stated ambition is a Tony Stark–style
JARVIS: something that knows the state of your health, home, calendar, and money, and
can act on it. It currently falls short of that ambition for architectural reasons
documented in §4.

---

## 2. Current state as of 2026-08-22

**Stack:** Vite 4 + React 18 SPA. Deployed to Vercel. `type: module`.

**Dependencies:** `@anthropic-ai/sdk`, `better-sqlite3`, `express`, `concurrently`,
`pdfjs-dist`, `recharts`, `react`/`react-dom`.

**Files that matter:**

| File | Lines | Role |
|---|---:|---|
| `src/App.jsx` | 4431 | The entire application. Monolith. |
| `server.js` | 147 | Local Express server on `:3001`. Reads iMessage SQLite. |
| `api/chat.js` | 37 | Vercel fn. Proxies Anthropic API. |
| `api/config.js` | 82 | Vercel fn. Syncs settings to a GitHub Gist. **See §4.3.** |
| `vite.config.js` | 11 | Proxies `/api` → `localhost:3001` in dev. |
| `src/App.css` | 202 | Styles. |

**Git:** last commit `62e9dd3` on 2026-05-22. **888 uncommitted lines in `src/App.jsx`**
plus changes to `package.json`, `vite.config.js`, `index.html`. A checkpoint commit was
recommended before any refactor; permission was pending at handoff.

**Tabs currently implemented:** briefing, ai, analytics, training, macros, environment,
recipes, body, sleep, plans, integrations, settings.

**Integrations wired up:** Oura Ring, Google Calendar (implicit OAuth), Spotify,
Philips Hue, ElevenLabs TTS, Groq (fallback LLM), CoinGecko, Open-Meteo weather,
Nominatim reverse-geocode, make.com webhooks, iMessage (local SQLite read).

**Data model:** everything lives in browser `localStorage` across ~30 `jarvis_*` keys
(macros, macro_history, measurements, sleep, workouts, memories, workouts, tokens, keys).
A whitelist subset is synced to a GitHub Gist for cross-device config.

---

## 3. The one thing that already works and should be the template

`server.js` is a local Express server that opens `~/Library/Messages/chat.db` with
`better-sqlite3` and serves parsed iMessage data to the UI over the Vite proxy. It is
currently single-purpose (feeding one "plans scanner" tab), but **it is already the
Mac-as-API pattern**. The rebuild generalizes this rather than inventing something new.

---

## 4. Problems identified

### 4.1 The architecture fights itself — this is the root cause

The app is served over HTTPS from Vercel, but the features that would make it actually
JARVIS all require reaching things only the Mac can reach: the Hue bridge at a
`192.168.x.x` LAN address, the iMessage database, the filesystem, any local device.
Browsers block HTTP requests to local IPs from an HTTPS page. **The codebase already
admits this at `src/App.jsx:3662`**, where a warning tells the user Hue only works when
running locally.

Consequence: the deployed app can only ever be a read-only face over hand-typed data.
Everything ambitious was blocked by the hosting model, not by effort or design taste.

### 4.2 `localStorage` as source of truth

No durable history (a cache clear wipes everything), no time-series depth for analytics,
and — critically — nothing can write data while the page isn't open. Unattended
collection is impossible by construction.

### 4.3 SECURITY — API keys synced to a GitHub Gist

`api/config.js` defines `SYNC_KEYS`, which includes `jarvis_api_key`, `jarvis_eleven_key`,
and `jarvis_groq_key`. These are written into a Gist file named `jarvis-config.json`.

- **If that Gist is public, the Anthropic, ElevenLabs, and Groq keys are exposed.**
- **Status at handoff: UNVERIFIED.** The owner was asked to check the Gist's visibility
  and rotate all three keys if public. Confirm this was done before proceeding.
- Verified clean: no `.env` or secret file has ever been committed to git history.
- The rebuild removes this class of problem — keys move to a `.env` read only by the
  local server, and never reach the browser.

### 4.4 Monolith

`src/App.jsx` is 4431 lines containing every hook, component, and view. This is the
proximate cause of the "old and shitty UI" complaint being hard to fix incrementally.

### 4.5 Repo hygiene — FIXED 2026-08-22

No `.gitignore` existed; 184MB of `node_modules` and a `dist/` build were untracked.
A `.gitignore` has been added covering node_modules, dist, `.env*`, `data/`, `*.db*`,
logs, `.claude/settings.local.json`, and `.DS_Store`.

---

## 5. Decisions already made

These were settled with the owner in the discovery session. Treat as given unless he
revisits them.

**Architecture: local-first.** The Mac becomes the API; the browser only renders.
The owner asked directly what he loses, and was given the honest list:

- Phone / away-from-home access (biggest loss)
- Always-on behavior — it's a laptop, so a closed lid stops collection
- Zero-maintenance deploys (`git push` → live)
- Ability to share a link

Mitigations agreed: **Tailscale as a later follow-up** to restore phone access over a
private network; collectors written to be **idempotent with backfill on wake**, so a
closed lid means late data rather than lost data; anything needing true 24/7 can run as
a cloud-scheduled task instead of on the Mac.

**UI direction: keep the JARVIS ambition, execute it far better.** The owner's words:
*"i like the tony stark vibes and such but i feel like we did a TEMU version of it,
i want top in class."* So: not a reskin, and not abandoning the theme — a real design
system with a refined dark palette, genuine typographic scale, purposeful motion, and
restraint with the glow/glass effects. Defined as tokens once, inherited everywhere.

**Data sources in scope — all four were selected:** health & wearables; money &
subscriptions; home, energy & devices; calendar & time.

**Location:** built into the existing `~/jarvis` project, not a new repo.

---

## 6. The plan (12 tasks, in dependency order)

Foundation first, deliberately — the UI problem is downstream of the architecture.

1. Kill Gist key sync; move secrets to a local `.env`; add `.env.example`.
2. Build the SQLite data layer — `data/jarvis.db`, time-series schema
   (source, metric, value, timestamp) plus events, devices, import tracking.
3. Migrate existing `localStorage` data into SQLite so no history is lost.
4. Expand `server.js` into the real local API — modular routes for metrics, device
   control, and integration proxying. All LAN calls move server-side, which dissolves
   the mixed-content problem in §4.1.
5. Write collectors: Oura, Google Calendar, Hue/LAN. Idempotent, backfill on wake.
6. Build the watched-folder ingester — the Mac-as-API centerpiece. Any export dropped
   into a folder gets parsed into SQLite: bank/card CSVs, utility Green Button data,
   Apple Health exports, wearable exports. This is how no-API devices get in.
7. launchd agent — server starts at login, collectors run on intervals.
8. Design the JARVIS visual system (the "top in class" pass).
9. Break up `App.jsx` into hooks / components / one file per view.
10. Rebuild core views (Briefing, Analytics, Environment, Sleep, Body) on live data.
11. Add cross-source insight views — sleep vs. meeting density, training load vs.
    calendar pressure, spend drift and subscription creep. The payoff no single vendor
    app can produce, because each needs two sources at once.
12. Verify end to end; write a run book.

---

## 7. Open questions at handoff

- Is the Gist public? Were the three keys rotated? (§4.3 — resolve first)
- Permission to make a checkpoint commit of the 888 uncommitted lines before refactoring?
- What devices does he actually own beyond the Hue bridge and Oura ring? This determines
  how much of task 6 is local polling vs. file ingestion. Home Assistant was raised as
  the aggregator option for devices with no public API.
- Which bank / utility export formats are actually available to him?

---

## 8. Environment facts

- macOS, arm64. Device name `marks-laptop-lan`. User `markadler`.
- Repo at `/Users/markadler/jarvis`. In Cowork sessions it mounts at `$HOME/mnt/jarvis` —
  the literal `/Users/...` path is **not** reachable from the sandboxed device shell.
- Folders connected in the originating session: `~/jarvis`, `~/Downloads`.
- Google Calendar and Google Drive connectors were available.
- The Claude Chrome extension is installed but **not linked** — zero connected browsers.
  Needs sign-in on the extension plus Settings → Connectors → Claude in Chrome toggled on.
  Recommended site access setting: **On specific sites** (not "On all sites").
- Note: the sandboxed device shell has no network access and cannot reach the LAN. Local
  device polling must run in the Jarvis server process itself, not from an agent shell.

---

## 9. How to use this document

Point the project-kickoff skill at this file. It is intentionally written to be
self-contained: current state, root-cause analysis, settled decisions with the reasoning
behind them, the sequenced plan, and what's still unknown.

Keep it current. When decisions change or tasks complete, update this file rather than
letting the context live only in a chat transcript — that's the failure mode this
document exists to prevent.
