# Working context — JARVIS

## The project

Personal life-operations system, single user (Mark). Being re-architected from a Vercel-hosted SPA
over `localStorage` into a **local-first** system: the Mac runs the API and owns the data in
SQLite, the browser only renders. Full detail in `PRD.md`, sequenced plan in `TASKS.md`.

## How to work on this

- Read `PRD.md` and `TASKS.md` at the start of a session.
- Tick tasks off in `TASKS.md`; add new ones as they surface.
- Append to `DECISIONS.md` whenever something is chosen that would be annoying to reverse.
- Update **Current state** at the bottom of this file before ending a session.
- The Drive doc "JARVIS — Rebuild Context Brief" is the origin of this plan. If a decision changes,
  update these files *and* that doc, or they'll drift.
- Start `CHANGELOG.md` and `docs/` once there's real content for them. Not before.

## Conventions

- **Module systems differ by directory.** `api/*.js` are CommonJS Vercel functions. Everything else
  is ESM (`"type": "module"`). Don't mix them.
- `npm run dev` runs Vite and `server.js` together. Vite proxies `/api` → `localhost:3001`.
- Secrets live in a local `.env` read only by the server. Never in the repo, never in the browser,
  never in `SYNC_KEYS`.
- New hooks in `src/hooks/`, views in `src/views/`, shared UI in `src/ui/` — created during task 9.
- Every metrics row is source-tagged. Three wearables write the same metrics and disagree.
- Collectors are idempotent and backfill on wake. A closed laptop means late data, not lost data.

## Preferences

- **Keep answers short and plain. This is a hard rule.** Long, technical answers lose him, and
  losing him is the named risk that kills this project. Lead with the answer in one or two
  sentences. Explain the *why* briefly, in plain words. No walls of text, no jargon dumps.
  Offer detail if he wants it — don't front-load it.
- An unmaintainable fix is how this project dies — see "Biggest risk" in `PRD.md`. But explaining
  it at length is also how it dies. Short and clear beats thorough.
- Small, finishable changes. Foundation before polish, but never a whole phase of pure chores.
- Commit at the end of every session, always.
- Jarvis proposes; Mark approves. Any feature that would act autonomously needs a confirm step.
- Say plainly when something doesn't add up. A plan that fails late is worse than an argument now.

## Don't

- Don't add auth, accounts, or anything multi-user. One user, forever.
- Don't put API keys in `SYNC_KEYS` or anywhere the browser can read them.
- Don't try to make `server.js` run on Vercel — it reads `~/Library/Messages/chat.db` and is
  local by design. That property is now the whole architecture, not a limitation.
- Don't poll LAN devices from an agent shell — the sandboxed shell has no LAN access. Device
  polling runs inside the Jarvis server process.
- Don't start a new repo. This is built inside `~/jarvis`.
- Don't reconcile the three wearables into one number silently. Pick a source per view, visibly.

## Where things live

```
src/App.jsx        Monolith — hooks, views, components (4,431 lines). Split in task 9.
src/main.jsx       Entry point
src/App.css        Styles — superseded by the design system in task 8
server.js          Express on :3001. iMessage → Claude plan extraction. Becomes the real API (task 4).
api/chat.js        Vercel fn — Claude proxy
api/config.js      Vercel fn — Gist config sync. Being retired in task 1.
data/jarvis.db     SQLite source of truth (task 2 — does not exist yet)
vite.config.js     Dev proxy to :3001
```

Repo: `/Users/markadler/jarvis` — mounts at `$HOME/mnt/jarvis` in Cowork sessions; the literal
`/Users/...` path is **not** reachable from the sandboxed device shell.
Remote: `git@github.com:SgtPecker69/jarvis.git`

## Current state

<!-- Update this before ending a session. It's what a fresh session reads first. -->

**As of 2026-08-22:** Rebuild planned but not started — no code has changed yet. The app works and
is deployed: Oura, Google Calendar, Spotify, Hue, weather, crypto, webhooks, ElevenLabs, Claude and
Groq, recipe library with PDF import, iMessage plan scanning. All of it over `localStorage`.

Two blockers, both unresolved:

1. **Nothing committed since 2026-05-22.** 870 new lines in `App.jsx`; `server.js` and `public/`
   have never been committed at all. A `.gitignore` exists but is still untracked.
2. **Key leak — CLOSED 2026-08-22.** `/api/config` on the Vercel deploy served keys publicly from
   2026-05-22. Keys rotated; `GITHUB_PAT` and `GITHUB_GIST_ID` deleted from Vercel and the site
   redeployed. Endpoint now returns `not-configured` — verified. The Gist itself was **secret**,
   never public, so the deploy was the only exposure path. Remaining: the auto-push in
   `src/App.jsx:129` is still in the code (harmless now, but remove it in Task 1).

**Next up:** `git add -A && git commit && git push` (Task 0).
