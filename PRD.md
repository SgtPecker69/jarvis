# JARVIS

**Status:** Active — architectural rebuild in progress · **Last updated:** 2026-08-22

Supersedes the first kickoff pass of 2026-08-22, which was written without the Rebuild Context
Brief and reached the wrong conclusions. See `DECISIONS.md` for what was retracted.

## What this is

A personal life-operations system for one person. A local-first Mac service that collects health,
money, home and calendar data into a durable database, with a React front end that renders it and
a Claude layer that reasons over it.

Not a dashboard over hand-typed numbers. That's what it is today, and that's the thing being fixed.

## Why

A Tony Stark–style Jarvis that actually knows the state of your life and can act on it. There's no
business case and it doesn't need one — but there is a real functional goal underneath: replacing
manual tracking with something that collects on its own and tells you when you're off plan.

## Who it's for

Mark. Alone. Permanently. No auth, no accounts, no multi-tenancy, no sharing, ever.

## The root problem being solved

The current app is served over HTTPS from Vercel, but everything that would make it *Jarvis* is
only reachable from the Mac: the Hue bridge on the LAN, the iMessage database, the filesystem.
Browsers block HTTP-to-LAN requests from an HTTPS page. The code already concedes this at
`src/App.jsx:3662`.

So the deployed app can only ever be a read-only face over data typed in by hand. Everything
ambitious was blocked by the hosting model, not by effort or taste. The fix is inverting it: the
Mac becomes the API, the browser only renders.

Second-order consequence, equally important: `localStorage` as the source of truth means nothing
can be collected while the page is closed. Unattended collection is impossible by construction.

## Done looks like

- [ ] Data arrives without you typing it — Oura, Whoop, calendar, Hue collect on their own
- [ ] A cache clear loses nothing; history lives in SQLite and goes back further than the app has
      been open
- [ ] Adding an integration is a one-sitting job
- [ ] No source file over ~600 lines
- [ ] `git status` clean at the end of every session
- [ ] Every integration either works or names its own failure — no silent breakage
- [ ] No secret is reachable from a browser
- [ ] The UI is something you'd show someone, not a TEMU JARVIS
- [ ] The briefing tells you whether you did what you said you'd do
- [ ] After a month away, `CLAUDE.md` + `TASKS.md` gets you productive in 15 minutes

## The personal goal it serves

Body composition: **180-185 lb now, target 165-170**, while building strength — a recomp.

This gives the Body tab its design: **weight trend and strength maintenance are one paired
metric, never two separate charts.** Weight down with lifts holding means it's working. Lifts
dropping means the deficit is too aggressive. Either number alone is noise.

**North star for the briefing: adherence.** A good day is one where you did what you said you'd
do — training happened, macros hit, calendar honored. This has a hard implication: see Open
Questions.

## Not doing

- **Other users. Ever.** No accounts, auth, sharing or permissions.
- **A native mobile app.** Phone access comes later via Tailscale, not a rewrite.
- **Always-on guarantees.** It's a laptop. A closed lid means late data, not lost data —
  collectors are idempotent and backfill on wake. Anything needing true 24/7 runs as a cloud
  scheduled task instead.
- **Raw Chase CSV**, initially. Rocket Money already aggregates Chase, categorizes it, and tracks
  subscriptions. One export instead of two. Revisit only if the categories prove too coarse.
- **Verizon FiOS as a data source.** Nothing useful comes out of it.
- **A broad test suite.** Tests only where a bug would be silent — Apple-epoch date math, macro
  calculations, collector idempotency.
- **A new repo.** This is built inside `~/jarvis`.

## Constraints

**Stack today:** React 18 + Vite 4, Express 5, better-sqlite3, Anthropic SDK with Groq fallback.
Note `api/*.js` are CommonJS Vercel functions while everything else is ESM.

**Target:** local-first. Express on the Mac is the API and the only thing holding secrets; SQLite
at `data/jarvis.db` is the source of truth; launchd starts it at login.

**Approval gate:** Jarvis may be given access to anything, but nothing fires without explicit
approval. Permanent design constraint, not a phase.

**Effort:** Solo, evenings and weekends, no deadline. API costs personal — Haiku by default.

**Known:** the sandboxed agent shell has no LAN access. Device polling must run inside the Jarvis
server process, never from an agent shell.

## Data sources in scope

| Source | How it gets in |
|---|---|
| Oura | API collector (already wired) |
| Whoop | API collector — OAuth developer platform, new |
| Apple Watch / Apple Health | File drop; Health Auto Export can automate it to a watched folder |
| Google Calendar | API collector (implicit OAuth, already wired) |
| Hue + bridge | Local LAN API — already written, unblocked by local-first |
| Rocket Money | CSV export → watched folder. Covers Chase and subscriptions. |
| ConEd | Green Button download → watched folder. Exact path to confirm. |
| MyFitnessPal | Premium account confirmed → full nutrition CSV export → watched folder |
| iMessage | Local SQLite read (already working — the template for all of this) |

**All three wearables are stored, not reconciled.** Oura, Whoop and Apple Watch will disagree
nightly. The metrics table is source-tagged so this costs nothing structurally, but every view
must explicitly choose a source or show all three. Decided — see `DECISIONS.md`.

## Biggest risk

Complexity outrunning motivation. The mechanism is specific: a 4,431-line `App.jsx` and an
architecture that blocks the interesting features, so effort stops converting into capability.

**What the plan does about it:** foundation first, in dependency order, because the UI problem is
downstream of the architecture — but every task is sized to finish in a sitting or two, and the
payoff tasks (design system, live views, cross-source insights) are real features, not chores.

**Live and urgent:** nothing has been committed since 2026-05-22. 870 new lines in `App.jsx`, and
`server.js` and `public/` have **never been committed at all** — the local Express server your own
brief calls the template for the entire rebuild exists only on this laptop.

## Open questions

- ~~Is the Gist public?~~ **RESOLVED 2026-08-22: yes, and worse.** The deploy itself serves the
  keys. `https://jarvis-self-five.vercel.app/api/config` returns them to an unauthenticated
  request. Public since 2026-05-22. Remediation is Task 1 and it is the top priority in the
  project.
- **Adherence needs a data model that doesn't exist.** Every planned table records what *happened*
  — metrics, events, transactions. Nothing records what you *intended*. Scoring "did I do what I
  said I'd do" requires a targets/commitments table, and it has to land in task 2 with the rest of
  the schema or task 11 has nothing to score against.
- Does ConEd's Green Button export cover the granularity needed, and is it Download-My-Data or
  Connect-My-Data?
- Home Assistant as an aggregator for no-API devices — worth it, or premature?
