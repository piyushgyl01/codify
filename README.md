# `</>` Codify — an engineering RPG

A skill tracker for programmers that measures **what you retained**, not what you sat
through. Log the practice you actually do, claim skills by proving them, then get
retested weeks later — and find out how much of it was real.

No build step, no backend, no account. Everything runs in the browser and saves to
`localStorage`. Installable as a PWA and fully usable offline.

```bash
npm start          # http://localhost:5179
npm test           # 188 headless assertions over the model
npm run icons      # regenerate icons/*.png
```

**Look:** a dark editor. Near-black canvas, thin cool-grey rules, one saturated accent
the theme swaps, and monospace for every number — this app is mostly numbers, and a
font where `1` and `7` differ and columns align without effort is not decoration.
No web fonts: it has to boot with no network, and a font request that fails leaves
type reflowing on the one screen you open every day.

---

## The argument

Every learning tracker measures hours. Hours are an input. You can spend four hundred
of them on video courses and retain almost nothing, and a tracker built on hours will
congratulate you the entire way. That failure mode costs people years, and it is
invisible from the inside — which is exactly why it needs an instrument.

Codify measures two things no hour-counter can:

**1. Not all practice is equal.** Every logged session declares a mode, and minutes are
weighted by it:

| Mode | Weight | What it is |
|---|---|---|
| ⚒ Build | ×1.00 | Writing code that does something real |
| ◎ Drill | ×0.90 | Problems and katas with a known answer |
| ▤ Read | ×0.65 | Docs, papers, other people's source |
| ▶ Watch | ×0.35 | Video courses, talks, streams |

Sixty minutes of video is **21 effective minutes**. Your daily target is measured in
raw minutes but XP is paid on effective ones, so the discount is something you feel
rather than a footnote. The weights are a judgement call — no study hands you a
constant — but the ordering is not controversial, and they are **not user-editable**:
a dial that lets you decide your own video hours count double is a dial that removes
the only uncomfortable number on the screen.

**2. A skill you cannot re-prove is a skill you had.** Claiming a node schedules a
retest at 7 days, then 21, 60, 150, 365. When it falls due the app asks you to do the
same task again — no notes, no searching — and records the result. Pass and it moves
out a rung. Fail and it drops back and returns in three days.

That is what turns the tree from a trophy case into an inventory.

## Is this working?

The headline card, and the reason the rest exists.

Every mastered node decays on a modelled curve. How slowly depends on two things the
app can observe: effective hours on that node's path, and how many times you have
already re-proven it.

```
halfLife  = 9 days × (1 + log₂(1 + pathHours)) × (1 + 0.45 × passes)
retention = 2 ^ (−daysSinceProof / halfLife)
```

So a node behind 10 effective hours has a ~40-day half-life; after three successful
retests, ~94 days. Nothing revolutionary — each successful recall buys longer than the
last, which is what spacing research finds qualitatively.

**Then it checks itself.** Every retest is replayed against what the model predicted at
the moment it was taken — using the path hours you had *then*, not now — and compared
with what actually happened:

```
predicted = mean(modelled retention at each retest)
actual    = retests passed / retests taken
tolerance = max(0.08, 0.45 / √n)          # narrows as evidence accumulates
```

Three verdicts:

- **Match** — the retention numbers on the tree can be trusted as they stand.
- **Optimistic** — you forget faster than your logged hours imply. Usually too much
  passive time, spacing too generous for how new the material is, or hours that went
  somewhere other than the skill being tested.
- **Conservative** — you hold more than the log accounts for. Usually real practice
  that never gets logged: your day job, reading you did not count.

It declines to say anything at all until five retests exist. A model nobody checks is
a horoscope, and this one is a defensible guess rather than a law — so the honest thing
is to put the check on screen next to it.

## The three logs

**Sessions** — minutes, mode, path, what you worked on, and what you learned. The note
field is the bit you re-read.

**Problems** — name, pattern, difficulty, minutes, solved or not, hint or not. A hint
is worth less than a cold solve but is not a failure; an unsolved attempt still pays,
because an app that pays nothing for the hard problem you lost an hour to is an app
that teaches you to only attempt easy ones. Beating par pays a small, capped bonus so
speed cannot dominate volume.

**Ships** — commits, pull requests, releases, finished projects. The only log measured
in artefacts rather than time, and deliberately coarse: the question is whether things
leave your machine.

## Targets

From two answers in onboarding — hours available per day, and how hard you are pushing.

```
capacity = hours × 60
focus    = capacity × intensity        # 0.50 stay sharp … 0.95 interview sprint
ceiling  = capacity × 1.4
```

Never 100%. Nobody converts every available hour into deliberate practice, and a target
you miss by definition every day stops being information.

**The ceiling points the other way.** Sustained practice above your own stated capacity
raises a warning, because three good weeks followed by three months off is a more common
failure among people who would use this app than laziness is. It is the one number here
that does not say *more*.

## The tree

65 nodes over 8 paths, gated by level *and* by prerequisite. Every node is claimed by
doing a concrete task from memory, with a timer running.

```
Foundations  Control Flow → Functions → Collections → Types → Errors → Generics → Async → Meta
Data         Arrays → Hash Maps → Linked Lists → Stacks → Trees → BSTs → Heaps → Graphs → Tries
Patterns     Complexity → Two Pointers → Sliding Window → Binary Search → BFS/DFS
                        → Topological Sort → Memoisation → Tabulation → Greedy
Web          Markup → Layout → DOM → HTTP → State → Auth → Accessibility → Performance
Data Stores  SQL → Schema → Indexes → Transactions → Migrations → Non-Relational → Partitioning
Systems      Shell → Memory → Files → Networking → Threads → Event Loops → Kernel → Compilers
Craft        Git → Unit Tests → Debugging → Refactoring → Review → Property Tests → Profiling → Design Docs
Scale & Ops  Shipping → Logging → Caching → Queues → Load → Observability → Replication → Consensus
```

Tasks are specific enough that lying to yourself takes effort — *"Implement a hash map
from scratch with separate chaining and a resize at load factor 0.75"*, not *"know
hashing"*. Nothing checks. That is the point: a node claimed dishonestly fails its first
retest and tells you nothing you did not already know.

## Training

26 drills across 5 tiers, unlocked by level, plus 4 gauntlets. A drill is a list of
timed steps the runner walks you through with rests inserted, and finishing one writes
into the focus log exactly as a hand-typed session would — so a drill and an hour you
typed in are the same kind of thing on every chart downstream.

**Time is measured, not assumed.** A finished session logs the seconds that actually
elapsed, so a drill you rushed and one you sat through properly are not the same row.

**Gauntlets you can lose.** They have HP; you have focus. Finishing a step deals damage
scaled by your combo; skipping one costs a focus pip. Run out and it survives — you keep
partial XP and come back stronger.

| Gauntlet | Unlocks | HP | Focus |
|---|---|---|---|
| ☣ The Heisenbug | level 3 | 300 | 4 |
| ▓ The Monolith | level 8 | 600 | 4 |
| ▢ The Whiteboard | level 15 | 1000 | 3 |
| ⛈ The Thundering Herd | level 25 | 1600 | 3 |

## Everything else

**Levels & ranks.** `100 × level^1.25`. Eight ranks named after a real engineering
ladder, because that is the ladder being climbed: Novice → Apprentice → Practitioner
→ Engineer → Senior → Staff → Principal → Distinguished.

**Daily quests.** Three a day, drawn deterministically from the date — one practice,
one problem, one wildcard, so a day can never roll three problem quests. Goals scale
with level but never past +50% of base, and percentage goals cap at 80: a day that is
90% Build and Drill is not a better day, just one with no room to read a paper.

**Streaks.** A day counts once you log 20 minutes, solve a problem, ship something, or
clear a retest. Freezes cover a missed day automatically; you earn one every five levels.

**Gear.** 18 items over four rarities — the things that actually compound, from a rubber
duck to a mentor. Each distinct piece is a permanent XP multiplier, capped at +40%.
Duplicates pay credits, not compounding power: without a cap a long save eventually
multiplies everything so far that a hard session and an easy one look the same.

**Also:** 38 achievements, 10 accent themes, a credit economy, and a dashboard.

## The dashboard

Bottom of the Log tab, one dense scroll. Calibration first, because it is the only
section that can tell you the rest of the page is lying to you. Then retention bands
and a 90-day decay forecast, the retest queue, focus minutes against target with a
7-day average, the mode split over time, deliberate share, problems and solve rate by
difficulty, **pattern coverage** — the pattern you never pick is the one that ends an
interview — where your hours went by path, ships per week, an activity calendar, and
day-by-day cards.

Charts are hand-drawn inline SVG in `js/charts.js`. Bars stretch with
`preserveAspectRatio="none"` so they fill any width, which also squashes any `<text>`
inside the SVG — so labels are HTML laid over the chart, which stays crisp at every width.

## Backup

**Hero → Backup & restore.** Everything is in one browser and nowhere else. Clearing
site data wipes it; on most platforms so does uninstalling the app.

Three things make restoring safe: junk is refused before anything is touched, you
confirm against a summary of the incoming file next to what it would replace, and the
save being overwritten is kept under a separate key so a mistaken restore is one undo
away. Backups from an older build merge onto a fresh save, so they gain fields added
since rather than loading with holes.

**A failed write is reported, not swallowed.** If storage is full, every action after
it is being silently discarded — the worst thing this app could do to someone — so it
raises a toast and the Hero tab carries a banner until a write succeeds.

## Layout

```
index.html            markup shell — no framework
dev-server.mjs        static server that sends no-store (module caching bites otherwise)
sw.js                 service worker: precache + cache-first, offline shell
manifest.webmanifest  PWA manifest
tools/make-icons.mjs  rasterises the icon set (no image dependencies)
css/
  base.css            tokens, reset, shell, motion
  components.css      cards, buttons, bars, nav, sheets, toasts
  views.css           per-view styling
js/
  main.js             boot, theme, day rollover, global listeners
  router.js           view switching, topbar, bottom nav
  state.js            the save file: persistence, selectors, mutations, event bus
  game.js             pure maths — levels, targets, quest metrics, the retention model
  analytics.js        calibration, forecasts, coverage, rolling averages
  ui.js               templating, overlays, toasts, rings, confetti, sound
  icons.js            inline SVG for functional chrome
  charts.js           inline-SVG bar / stacked / line / calendar primitives
  pwa.js              service-worker registration, install prompt, update handling
  data/               skilltree, drills + gauntlets, practice vocabulary, quests,
                      achievements, loot
  views/              home, train, log, dashboard, skills, hero, player, onboarding
test/smoke.test.js    188 headless assertions with localStorage and DOM stubs
```

**Views** export `render() → string` and `mount(root, rerender)`. The router paints each
into a throwaway container, so listeners die with it instead of stacking on re-render.
If `mount()` throws, the markup is shown anyway and only interactivity is lost — letting
the error escape would leave a blank screen under a working nav, which is far harder to
diagnose from a bug report.

**State** is one plain object behind a pub/sub bus. Mutations return a reward
(`{ xp, coins, levelUps, achievements, drop }`) the UI turns into toasts and confetti.
Saves are debounced and merged onto a fresh save on load.

## Notes

- **Removing a log entry rewinds the lifetime stats.** They are a ledger, not a cache —
  leaving totals that no day in the file supports is how a tracker slowly starts lying.

- **Percentages average over every logged day; totals average only over days they
  happened on.** A day that was 100% video has a deliberate share of exactly 0, and
  filtering on "value > 0" makes the worst days invisible and reports the average as
  perfect. `movingAverage` takes an `overLogged` flag for the same reason.

- **`/api/` is excluded from the service worker** even though there is no API here yet.
  Cache Storage ignores `Cache-Control` — a `put()` is explicit — so a same-origin API
  GET would otherwise fall into the cache-first branch and every later call would return
  the first frozen answer. The guard is what keeps that true when there is an API.

- **`cache.addAll(CORE)` is deliberately atomic.** If any core file fails, install fails
  and the browser retries later. Catching per-file produces a worker that looks installed
  but has an empty cache and can never self-heal, because install already succeeded.

- **Bump `CACHE_VERSION` in `sw.js` whenever a shipped file changes**, and keep
  `APP_VERSION` equal to it — a test fails if they drift.

- **The worker stays out of the way on `localhost`.** Cache-first means an edited file
  keeps serving its old copy until you clear the cache by hand, which burns debugging
  time on changes that did in fact apply.

- **`#app` uses `overflow: clip`, not `hidden`** — a `hidden` container is still
  scrollable, and focusing an input near the bottom scrolls the nav off-screen on mobile.

- **`icon()` returns a raw-marked object, not a string.** The `h` template escapes plain
  interpolations, so a string would print SVG source as text.

- All estimates are estimates. The retention model is a defensible shape, not a
  measurement of you — which is what the calibration card is for.
