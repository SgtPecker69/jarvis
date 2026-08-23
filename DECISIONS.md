# Decisions

Append-only, newest first. One entry per choice that would be annoying to reverse.

---

## 2026-08-22 — Memories get their own table, not `events`
**Why:** `jarvis_memory_file` and the "remember that…" notes are text facts, not numbers and not
things that happened at a time. Forcing them into `events` would have meant a fake `start_ts` and a
`title` holding a paragraph. A `memories` table with `kind` = `profile` | `note` costs one table
and keeps `events` meaning what it says.
**Instead of:** `events` with `kind='memory'`, which was the cheaper schema and the worse model.

## 2026-08-22 — History starts from today; nothing was recovered
**Why:** Searched every place the data could be — both browser origins, and the config Gist. Both
browsers held one key. The Gist held settings, keys and the memory profile, but **none** of
`jarvis_measurements`, `jarvis_sleep`, `jarvis_workouts` or `jarvis_macro_history`, even though all
four were in `SYNC_KEYS` and would have been pushed on any write. They were never written — the app
was used for voice, music and lights, not logging. `jarvis_memories` had been overwritten with the
string `"undefined"`.
**What survived:** the AI-written memory profile, 2,192 chars, now in the `memories` table.
**Consequence:** the Body/Sleep/Training views have no past to render. Accepted — the point of the
rebuild is that from here forward the data is kept.
**Not ruled out:** a Chrome profile on disk could still hold it, but Terminal lacks Full Disk Access
so the search returned a false negative. Judged not worth the friction; nothing was deleted, so
this can be revisited.

## 2026-08-22 — Store all three wearables; never silently reconcile them
**Why:** Oura, Whoop and Apple Watch all measure sleep and heart rate and will report different
numbers for the same night. Mark wants to see all three. The metrics table is source-tagged, so
this costs nothing structurally — the cost lands in the views, where "what's my resting HR" no
longer has a single answer. Every view must therefore choose a source explicitly or show all three.
**Instead of:** Naming one device authoritative per metric, which would have been a simpler schema
and simpler charts, at the cost of hiding real disagreement between devices.

## 2026-08-22 — Adherence is the north star, which requires a targets table
**Why:** Mark's definition of a good day is "did I do the things I said I'd do." Every table in the
plan records what *happened* — metrics, events, transactions. Nothing records intent. Adherence
cannot be computed without a targets/commitments model, so one goes into the schema at task 2
rather than being discovered as missing at task 11.

## 2026-08-22 — Body composition is tracked as weight paired with strength, never weight alone
**Why:** Goal is 180-185 lb → 165-170 while building strength. In a recomp, weight alone can't
distinguish fat loss from muscle loss. Weight trending down with lifts holding means it's working;
lifts dropping means the deficit is too aggressive. The two metrics are only meaningful together,
so the Body view presents them as one thing.

## 2026-08-22 — Rocket Money export, not raw Chase CSV
**Why:** Rocket Money already aggregates Chase, categorizes transactions, and tracks subscriptions
— which is the subscription-creep insight the plan wants, pre-computed. One export instead of two.
**Instead of:** Pulling raw Chase CSV. Revisit only if Rocket Money's categories prove too coarse.

## 2026-08-22 — Whoop added as a collector; Verizon dropped as a data source
**Why:** Whoop has a documented OAuth developer platform giving recovery, strain, sleep and
workouts — a real API, not a file drop. Verizon FiOS exposes nothing worth collecting.

## 2026-08-22 — RETRACTED: the four entries from the first kickoff pass
**Why:** The first kickoff of 2026-08-22 ran without the Rebuild Context Brief and logged four
proposals that contradict decisions already settled with Mark — "no rewrite ever", "no TypeScript
migration", "don't leave Vercel", and "split `App.jsx` incrementally, first". The first and third
would have actively blocked the local-first re-architecture; the fourth had the dependency order
backwards, since the monolith is split *after* the design system (task 9), not before the
foundation. All four are withdrawn. Recorded rather than deleted so a future session understands
why the earlier framing disappeared.

---

*Settled with Mark in the discovery session that produced the Rebuild Context Brief.*

## 2026-08-22 — Architecture: local-first. The Mac is the API; the browser only renders.
**Why:** The app is HTTPS on Vercel, but everything that makes it Jarvis — the Hue bridge on the
LAN, iMessage, the filesystem — is reachable only from the Mac, and browsers block HTTP-to-LAN from
an HTTPS page (`src/App.jsx:3662` already concedes this). The hosting model, not effort or taste,
is what capped the app at a read-only face over hand-typed data.
**Accepted losses, named at the time:** phone/away access (the biggest), always-on behavior since a
closed lid stops collection, zero-maintenance `git push` deploys, and the ability to share a link.
**Mitigations agreed:** Tailscale later for phone access; collectors idempotent with backfill on
wake, so a closed lid means late data rather than lost data; anything needing true 24/7 runs as a
cloud scheduled task instead.

## 2026-08-22 — UI: keep the JARVIS ambition, execute it properly
**Why:** Mark's words — *"i like the tony stark vibes and such but i feel like we did a TEMU version
of it, i want top in class."* So not a reskin and not abandoning the theme: a real design system
with a refined dark palette, genuine typographic scale, purposeful motion, and restraint with the
glow/glass effects. Tokens defined once, inherited everywhere.

## 2026-08-22 — All four data domains in scope
**Why:** Health & wearables, money & subscriptions, home/energy/devices, and calendar & time were
all selected. The cross-source views in task 11 are the actual payoff and each needs two domains at
once, so narrowing to one would remove the reason to build this at all.

## 2026-08-22 — Built inside `~/jarvis`, not a new repo
**Why:** 44 commits of working integrations are the asset. The re-architecture reshapes the
foundation under them rather than starting over.

## 2026-08-22 — `server.js` is the template, not the exception
**Why:** It already opens `~/Library/Messages/chat.db` with better-sqlite3 and serves parsed data
to the UI over the Vite proxy. That *is* the Mac-as-API pattern, already working. The rebuild
generalizes it rather than inventing something new.

---

*Reconstructed from git history — inferred, not recorded at the time. Correct anything wrong.*

## 2026-05 — Google Calendar uses OAuth implicit flow
**Why:** The authorization-code flow needs a `client_secret`, which can't be kept secret in a
browser app. Note: local-first removes this constraint — revisit if a proper flow becomes useful.

## 2026-05 — Claude for the brain, Groq as fallback, Haiku by default
**Why:** Quality from Claude, a fallback path when it's unavailable, and Haiku to keep personal API
costs low. Several commits of model churn established that this account has only claude-4-family
models.

## 2026-05 — Spotify playback via album context rather than bare track URIs
**Why:** Playing a track URI directly hit a restriction; album context plus offset was what
actually played the right song.

## 2026-05 — Config synced through a GitHub Gist rather than a database
**Why:** Settings needed to follow the user across devices with no backend to run or pay for.
**Superseded 2026-08-22 by task 1** — this is the decision that put API keys in the browser and
then in a Gist. Local-first removes the need for it entirely.
