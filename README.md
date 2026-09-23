# ⚙️ Codify — tech, as an RPG

One character that levels up across everything you learn in tech. Like Fitify grew
from calisthenics into gym, diet and the rest of fitness, Codify is one game with
**tracks** — separate skill areas that share a single level, streak, timer, gear
collection, quest board and backup.

Two tracks today:

| Track | What it is | What checks your work |
|---|---|---|
| ⌨️ **Programming** | Codeforces topics at real rating tiers, and timed contests | Accepted submissions on Codeforces |
| 🤖 **Robotics** | A six-month roadmap to robotics engineer, with a boss every month | Graded answers, and builds verified on your GitHub |

No build step, no backend, no account. Installable as a PWA; works offline apart from
the syncs and GitHub checks.

```bash
npm start          # http://localhost:5179
npm test           # 171 headless assertions
```

## The one rule

**The game pays only for what it can check.** Everything else is recorded and pays nothing.

| Source | How it is checked | Track |
|---|---|---|
| A solved problem | Codeforces' public API: verdict, rating, tags, timestamp | Programming |
| A contest | Accepted timestamps inside the window, at or above the floor | Programming |
| A drill or boss answer | Graded in code against a number the generator just computed | Robotics |
| A build | Your public GitHub folder, checked against the roadmap's portfolio standard | Robotics |
| A commit | GitHub's public events | Shared |
| Focus time | The app's own timer — there is no field anywhere to type minutes in | Shared |

A day counts for the streak when something verified happened in it: a solve, a finished
drill, a commit, or twenty timed minutes.

## Tracks

### ⌨️ Programming

18 topics in five paths, each with five rating tiers straight off the Codeforces scale
(800 → 2100+). A tier clears when you have solved three problems with that tag at or
above its rating; a hard solve counts towards every tier below it. Each topic suggests
unsolved problems in your next band and links straight to them. Topics you have not
touched in 45 days are marked stale — a date from the judge, not a model.

**Contests** are a clock and a target: start it, solve on Codeforces, sync. A problem
counts if it was accepted inside the window, meets the rating floor, and was not already
solved before the clock started. You can lose; a loss pays partial credit.

LeetCode sends no CORS header, so a browser cannot read it. Topics link out to it for
practice and say plainly that nothing solved there is counted.

### 🤖 Robotics

Built on **“How to become a Robotics Engineer in 6 months” by
[Ronin (@DeRonin_)](https://x.com/DeRonin_)** — six months, 29 topics, 124 resources
with prices, 28 builds and the article's milestones, summarised and credited.

- **The drill:** five questions a day from 51 skills. Numeric ones draw fresh values every
  time; answers are read the way people type them (`4.7k`, `4k7`, `2,5`). Skills sit in
  Leitner boxes (1, 2, 4, 8, 16 days) — due reviews come first.
- **Builds** are verified by reading your public GitHub folder: a repo you own, a README
  with 120+ words, a photo or video, a "what broke" section, three or more commits by you,
  plus each build's own evidence (the numbers you measured, the files the task implies,
  and no ROS 1). It checks the evidence exists, not that the robot works — a convincing
  fake costs as much as the real write-up, and the real one is your portfolio.
- **Bosses:** each month's skills as a fight — 1,000 HP, three hearts, a clock on every
  question. Beating one opens the next month early; otherwise months open every 30 days.

## Shared across tracks

- **Level** on one curve (`50 × level^1.2`) and a career-ladder rank:
  🥚 Newbie → 🔌 Tinkerer → 🛠️ Builder → ⚙️ Engineer → 🧭 Senior → 🏛️ Architect →
  🧠 Principal → 🐉 Legend. Each track also shows its own measure: your real Codeforces
  rating, your robotics month and bosses.
- **The focus timer**, tagged to a topic or a build. One XP a minute up to 1.5× your
  daily goal; a session counts four hours at most and can be trimmed down, never up.
- **Quests:** three a day — one shared, and one from each of two switched-on tracks. A
  track only deals quests once it can be checked, and rating goals are only dealt within
  reach of your actual rating.
- **Gear:** 34 pieces in two sets — desk gear drops from programming, bench gear from
  robotics. Each is a permanent XP bonus, capped at +40% in total.
- **Achievements, streak freezes, accents, backup.**

Switch tracks on and off in Hero. The nav follows: Today, one tab per track, Hero — and
past three tracks they fold into a single Tracks tab.

## Coming from Codify or Botify

- **Codify:** the save upgrades in place on first open. Handle, solves, contests, gear,
  streak and achievements carry over; re-syncing pays nothing twice. Timed sessions
  become timer minutes. Hand-typed sessions and notes paid nothing and are no longer
  shown — they are kept in the save under `legacy`, not deleted.
- **Botify:** Hero → Backup → **Import Botify progress** folds a Botify backup into this
  character: its robotics progress becomes the Robotics track, and its XP, gear and
  history are *added* to yours rather than replacing them. One undo afterwards.

## Adding a track

A track is a folder under `js/tracks/` and one entry in `js/tracks/index.js`:

```
data            what there is to learn
model.js        pure reads over the track's slice of the save
actions.js      everything that changes it — and pays only for what it can check
hub.js          the track's own tab
today.js        its card on Today, and what the focus timer can be tagged with
```

Then its slice in `freshSave()`, its quest pools in `js/data/quests.js`, and its
achievements. Nothing else has to know it exists.

## Layout

```
js/
  main.js router.js       boot; tabs that follow the switched-on tracks
  state.js                the character: save, migrations, rewards, streak, timer, quests
  game.js                 pure maths: levels, ranks, Leitner boxes, combos
  quiz.js github.js       question grading; build verification against GitHub
  platforms.js sync.js    GitHub events; pulling every linked source
  data/                   gear, achievements, quests — shared by every track
  tracks/cp/              topics, contests, Codeforces, model, actions, hub, today
  tracks/robotics/        roadmap, skills, bosses, model, actions, player, views
  views/                  home, hero, onboarding, the focus timer
test/smoke.test.js        171 assertions, with a fake GitHub for the verifier
```

Bump `CACHE_VERSION` in `sw.js` and `APP_VERSION` in `js/version.js` together whenever a
shipped file changes — a test fails if they drift, and another if a module is missing
from the precache list.
