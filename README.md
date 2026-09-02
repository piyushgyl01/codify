# `</>` Codify

An RPG where the XP is real.

You solve problems on Codeforces like you already would. This reads your accepted
submissions from their public API and turns them into levels, tiers, streaks and loot.
There is no "mark as done" button anywhere in the app.

**Live:** https://codify-beryl.vercel.app

```bash
npm start    # http://localhost:5179
npm test     # 141 headless assertions
```

## Look

The same neobrutalist system as Fitify, deliberately: cream paper `#FFF8E8`, 3px black
outlines on everything, hard offset shadows with no blur, flat saturated colour, Outfit
for type. Buttons slide into their own shadow when pressed.

Nothing is de-emphasised with `opacity` — it greys out the black outlines the style
depends on, and the page stops reading as a set of solid objects. Secondary things get a
muted fill and keep pure black lines. Colour is carried by fills rather than coloured
text, so no value has to stay legible as a saturated hue at 11px.

## Why it works this way

The first version of this app was a diary that graded itself. You typed in hours, it
believed you, then showed you confident numbers about your own guesses. It even had a
"calibration" feature that checked a forgetting curve I invented against tests you
marked yourself — a guess versus a guess.

It was a weighing scale that asked you how much you weighed.

So everything the game pays out for now comes from somewhere that does not care what
you type:

| Source | What it gives | Verified |
|---|---|---|
| Codeforces `user.status` | accepted submissions, tags, ratings, timestamps | yes |
| GitHub `users/:u/events/public` | public pushes and commit counts | yes |
| The in-app timer | minutes the app itself held the clock | yes |
| Notes you type | your own record | **no — pays nothing** |

Both APIs send `Access-Control-Allow-Origin: *`, so a static page can read them with no
key and no backend.

**LeetCode is not verifiable.** Its GraphQL endpoint returns data to `curl` but sends no
CORS header, so a browser cannot read it. The app links out to LeetCode for practice and
says plainly that nothing solved there will move a number. Pretending otherwise would
put the original problem straight back in.

## The tree

18 Codeforces tags × 5 rating tiers = 90 tiers.

```
Foundations  implementation · sortings · strings · brute force
Searching    binary search · two pointers · greedy
Structures   data structures · dsu · trees
Graphs       graphs · dfs and similar · shortest paths
DP & Maths   dp · math · number theory · combinatorics · bitmasks
```

A tier clears when the judge has accepted three problems with that tag at that rating —
`I` at 800+, `II` at 1200+, up to `V` at 2100+. A harder solve counts towards every tier
below it, so a 2100 advances five rows at once.

Tap a topic and it queries the Codeforces problem set for unsolved problems in your next
band and links straight to them. That is the entire "practice" flow: the app tells you
what to go and do, and a real judge decides whether you did it.

## Contests

The boss fights. A clock and a target the judge settles.

| Contest | Target | Window |
|---|---|---|
| Warm-Up | 2 problems at 800+ | 45 min |
| The Sprint | 3 at 1100+ | 60 min |
| The Ladder | 3 at 1400+ | 120 min |
| The Gauntlet | 4 at 1600+ | 150 min |
| The Summit | 3 at 2000+ | 180 min |

Everything you had already solved is recorded the moment the clock starts, so the window
cannot be gamed. You can lose, and losing pays 30% of the ratio you reached.

## What is not here any more

- The forgetting model, and the calibration built on top of it. Replaced by a date:
  *"you last solved a graph problem 74 days ago"* is a fact, not a prediction.
- 65 hand-written skill nodes, 26 drills and 38 achievements generated in one sitting.
- An in-app code judge. Real judges exist and are better than anything I would write.
- The witty one-liner on every single object.

## Layout

```
index.html            markup shell — no framework, no build step
dev-server.mjs        static server, no-store
sw.js                 precache + cache-first, offline shell
tools/make-icons.mjs  rasterises the icon set
css/                  base (tokens) · components · views — neobrutalism
js/
  platforms.js        Codeforces and GitHub. Fetching only.
  sync.js             when to pull, and surviving one source failing
  state.js            the save, and the accounting that pays out
  game.js             levels, ranks, quest metrics, dates
  analytics.js        histograms, coverage, staleness
  data/               skilltree (tags × tiers) · contests · quests · achievements · loot
  views/              home · train · log · skills · hero · onboarding
test/smoke.test.js    141 assertions, no network
```

## Notes

- **Syncs are idempotent.** `credited.problems`, `credited.tiers` and `credited.pushes`
  record what has already been paid for. Without them every sync pays again for the same
  work, which is the easiest possible way to make the XP meaningless.

- **A contest excludes prior work.** `startContest` snapshots your solved keys, and
  `settle` ignores anything in that set. Otherwise starting a clock over yesterday's
  solves wins instantly.

- **Removing a session rewinds the lifetime stats.** They are a ledger, not a cache.

- **`/api/` is excluded from the service worker.** Cache Storage ignores `Cache-Control`,
  so a same-origin API GET would otherwise be frozen at its first response forever.

- **Bump `CACHE_VERSION` in `sw.js` whenever a shipped file changes**, keeping
  `APP_VERSION` equal to it. A test fails if they drift.

- Nothing is de-emphasised with `opacity` — it greys out the black outlines the visual
  style depends on. Secondary things get a muted fill and keep pure black lines.
