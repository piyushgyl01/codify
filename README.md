# ⚙️ Codify — tech, as an RPG

One character that levels up across everything you learn in tech. Like Fitify grew
from calisthenics into gym, diet and the rest of fitness, Codify is one game with
**tracks** — separate skill areas that share a single level, streak, timer, gear
collection, quest board and backup.

Three tracks today:

| Track | What it is | What checks your work |
|---|---|---|
| ⌨️ **Programming** | A four-month DSA plan: 120 daily missions, and a contest each month | Graded answers, and accepted submissions on Codeforces |
| 🤖 **Robotics** | A four-month roadmap to robotics engineer: 120 daily missions, and a boss each month | Graded answers, and builds verified on your GitHub |
| 🧠 **AI** | From the maths underneath to the research frontier: 240 missions in eight parts, a boss and a paper reproduction in each | Graded answers, builds verified on GitHub or Hugging Face, and a weekly frontier log |

Every track runs on the same frame. Every day is one **mission** with three steps —
**learn** one idea, **prove it** in a timed check, then **do** something a machine can
verify (solve on Codeforces, push a build step to GitHub, or publish on Hugging Face). Each day only uses what
came before it. Every skill has a level from 1 to 10 that rises as you get it right, so
the check gets harder exactly where you are getting better. Already know a week? **Test
out**: six questions at level 4, five right skips the rest of that week — the first time,
that is your placement test.

**Pick your pace, per track: 4, 6, 8 or 12 months** (AI, twice the size: 8, 12, 16 or 24). It is the same missions either way —
a slower pace means fewer hours a day (about 3, 2, 1½ or 1), not less content. A new
mission comes every 1, 1½, 2 or 3 days; the days between are **keep-going days**: a short
review of the skills due back, and keep going on the build or the topic in hand. You can
always start the next mission early, and changing pace keeps every mission you have done.
The plan's stages are called parts, since at a slower pace a part lasts longer than a
month.

No build step, no backend, no account. Installable as a PWA; works offline apart from
the syncs, the GitHub and Hugging Face checks, and the AI track's live feed.

```bash
npm start          # http://localhost:5179
npm test           # 315 headless assertions
```

## The one rule

**The game pays only for what it can check.** Everything else is recorded and pays nothing.

| Source | How it is checked | Track |
|---|---|---|
| A solved problem | Codeforces' public API: verdict, rating, tags, timestamp | Programming |
| A contest | Accepted timestamps inside the window, at or above the floor | Programming |
| A mission or boss answer | Graded in code against a number the generator just computed, on a clock | Every track |
| A build | Your public GitHub folder, checked against the roadmap's portfolio standard | Robotics, AI |
| A model or demo | Your public Hugging Face model or Space: its owner, its card, and that the demo is running | AI |
| A frontier day | A commit to your frontier-log repo that week, mentioning what you picked | AI |
| A commit | GitHub's public events | Shared |
| Focus time | The app's own timer — there is no field anywhere to type minutes in | Shared |

A day counts for the streak when something verified happened in it: a solve, a finished
mission, a commit, or twenty timed minutes.

## Tracks

### ⌨️ Programming

**120 missions over four months**, in the order the topics build on each other:

| Month | Level | What | Ends with |
|---|---|---|---|
| 1 | Beginner | Complexity, sorting, prefix sums, binary search, two pointers, greedy, the maths toolkit | The Warm-Up |
| 2 | Beginner+ | Stacks, deques, maps, heaps; DFS, BFS, topological sort, union–find, Dijkstra, MSTs, trees | The Sprint |
| 3 | Intermediate | DP (knapsack, LIS, grids, strings, bitmasks, trees), sparse tables, Fenwick and segment trees | The Ladder |
| 4 | Advanced | KMP, Z, hashing, combinatorics, probability, games, LCA, geometry, then contest craft | The Gauntlet |

Each day links to where to learn it (CP-Algorithms, the USACO Guide, the Competitive
Programmer's Handbook, Codeforces EDU) and checks it with 42 question generators that
run the algorithm on a small case — the answer is computed, never typed in. The **Solve**
step asks for problems with the day's Codeforces tag, accepted that day, rated at or above
**your level for that tag**. Your level starts from what the judge already knows about you
(within reach of your rating) and goes up 100 each time you clear it, so the next day with
that tag is harder. Too hard? You can drop it by 100; it only ever makes things easier. A
mission is done when both the check and the solves are.

The topic tree is still there: 18 topics in five paths, each with five rating tiers straight off the Codeforces scale
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
[Ronin (@DeRonin_)](https://x.com/DeRonin_)** — its 29 topics, 124 resources with prices,
28 builds and milestones, summarised and credited, and rearranged into **four months**
at about three hours a day, with the maths next to the thing that needs it:

| Month | Level | What | Boss |
|---|---|---|---|
| 1 | Beginner | Circuits, the bench, microcontrollers, motors, sensors → a line follower you tuned | The Short Circuit |
| 2 | Beginner+ | PID properly on a balancing robot, logged and compared; Wi-Fi; CAD, printing, gears | The Oscillator |
| 3 | Intermediate | The SO-101 arm with its kinematics; ROS 2, URDF/TF, Gazebo, ros2_control, SLAM and Nav2 | The Broken TF Tree |
| 4 | Advanced | Cameras and point clouds, MoveIt, LQR, imitation learning and RL, portfolio, interviews | The Third Question |

- **120 missions, one a day.** Each day has one thing to learn (with the topic's links), a
  check on its skills, and a step of the build in hand — plan, make (the article's task,
  stage by stage, or in plain steps), test, ship. Days also say when to order parts, so
  they arrive before you need them. Missions follow the ones you have done, not the
  calendar: miss a day and nothing is skipped.
- **Skills level up.** Each of the 51 skills has a level from 1 to 10. Higher levels ask
  more questions with less time on each (level 1: two questions, three minutes each;
  level 10: seven, 45 seconds). A clean round moves a skill up and spaces it out; one miss
  keeps it; two drop it a level and bring it back tomorrow. So each day's check is a bit
  harder than the last time you passed it, and the question budget grows each month
  (10 → 16). Numeric questions draw fresh values every time; answers are read the way
  people type them (`4.7k`, `4k7`, `2,5`).
- **Build steps** count when GitHub shows a push that day — nothing to tick. The check
  alone finishes a robotics mission, because parts can take days to arrive.
- **Builds** are verified by reading your public GitHub folder: a repo you own, a README
  with 120+ words, a photo or video, a "what broke" section, three or more commits by you,
  plus each build's own evidence (the numbers you measured, the files the task implies,
  and no ROS 1). It checks the evidence exists, not that the robot works — a convincing
  fake costs as much as the real write-up, and the real one is your portfolio.
- **Bosses:** each month's skills as a fight — 1,000 HP, three hearts, a clock on every
  question. On day 30 the fight is the mission; if the boss is not ready yet (every skill
  of the month started, one build verified), the day is a review of the month instead.
  Beating one opens the next month early; otherwise a month opens when your missions
  reach it.

### 🧠 AI

**240 missions in eight parts**, from the maths to where the field is this week — about
three hours a day over eight months, or the same plan over 12, 16 or 24:

| Part | Level | What | Reproduce | Boss |
|---|---|---|---|---|
| 1 | Foundations | Linear algebra, calculus, probability, optimisation — fluent enough to read any paper | Adam | The Exploding Gradient |
| 2 | Foundations | Models that still win on tables, recommendations and forecasts, evaluated honestly | Trees vs deep learning on tables | The Leaky Split |
| 3 | Intermediate | Backprop you wrote yourself, training that works, where the GPU time goes | ResNet's degradation result | The Vanishing Gradient |
| 4 | Intermediate | Tokenizer, attention, a GPT and a pretrained model of your own; scaling laws | Chinchilla at tiny scale | The Loss Spike |
| 5 | Advanced | Fine-tuning, RL, preference tuning and reasoning — how assistants are made | R1-Zero at small scale | The Reward Hacker |
| 6 | Advanced | Retrieval, agents, tools, evals and serving, measured | ReAct | The Hallucination |
| 7 | Advanced | Vision, image generation, speech and robot learning | Diffusion Policy on Push-T | The Mode Collapse |
| 8 | Expert | Interpretability, attacks and defences, research of your own | Latent knowledge without supervision | The Black Box |

- **64 skills**, from dot products and Bayes to KV-cache size, DPO, GRPO and sparse
  autoencoders. Each generator computes its answer — attention weights, parameter counts,
  Chinchilla-optimal tokens, perplexity — so nothing is taken on trust.
- **34 builds.** Each part has three or four builds and one **paper reproduction** in
  week 4. Most are verified on GitHub against the same standard as Robotics (some also need
  tests passing on GitHub Actions); six ship to **Hugging Face** — a pretrained model, a
  LoRA fine-tune, an R1-Zero reproduction, a sparse autoencoder, two live Spaces — and
  are read from its public API: owned by you, a card of 80+ words with each build's own
  numbers, and for a Space, that the demo is running. Every build is marked 🆓 (a laptop or
  free Colab) or 💳 (about $10–50 of rented GPU; three builds).
- **Frontier days.** Days 7, 14, 21 and 28 of every part are about something new. The
  **New** tab reads this week's most upvoted papers (Hugging Face Daily Papers), trending
  models with real downloads, and the fastest-rising new AI repos on GitHub, live from the
  browser. Pick one, learn it with the tutor prompt, try it by hand, and push a short entry
  to your public frontier-log repo. The entry pays when GitHub shows a commit by you that
  week mentioning its link.
- **Bosses** open once a part's skills are started and its reproduction is verified.

### Learn with AI

Every mission's Learn step has a **tutor prompt**: copy it into ChatGPT, Claude or Gemini.
It says where you are in the plan, what you covered recently, today's topic and task, and
the day's links — and asks the model to find out what you know, teach in small steps, make
you do the thinking, not invent links, and quiz you before the app does. It is built from
the plan, so it is right for any day on any track.

## Shared across tracks

- **Level** on one curve (`50 × level^1.2`) and a career-ladder rank:
  🥚 Newbie → 🔌 Tinkerer → 🛠️ Builder → ⚙️ Engineer → 🧭 Senior → 🏛️ Architect →
  🧠 Principal → 🐉 Legend. Each track also shows its own **skill score** — every skill's
  level added up, charted day by day — plus your real Codeforces rating, or your builds and
  bosses.
- **The focus timer**, tagged to a topic or a build. One XP a minute up to 1.5× your
  daily goal; a session counts four hours at most and can be trimmed down, never up.
- **Quests:** three a day — one shared, and one from each of two switched-on tracks. A
  track only deals quests once it can be checked, and rating goals are only dealt within
  reach of your actual rating.
- **Gear:** 34 pieces in two sets — desk gear drops from programming and AI, bench gear
  from robotics. Each is a permanent XP bonus, capped at +40% in total.
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
plan.js         the days: what to learn, which skills each day starts, what to do
skills.js       question generators, each computing its own answer
model.js        pure reads over the track's slice of the save
actions.js      everything that changes it — registers with js/learn/session.js,
                and pays only for what it can check
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
  game.js                 pure maths: levels, ranks, skill levels, combos
  learn/                  the mission engine every track shares: plan pointer, checks, test-outs, pace, tutor prompts
  quiz.js github.js hf.js question grading; build verification on GitHub and Hugging Face
  platforms.js sync.js    GitHub events; pulling every linked source
  data/                   gear, achievements, quests — shared by every track
  tracks/cp/              the 120-day DSA plan, 42 skills, topics, contests, Codeforces, views
  tracks/robotics/        roadmap, the 120-day plan, 51 skills, bosses, builds, views
  tracks/ai/              the 240-day plan, 64 skills, 34 builds, the live What's new feed, views
  views/                  home, hero, onboarding, the focus timer, the shared player and mission card
test/smoke.test.js        315 assertions, with a fake GitHub and Hugging Face for the verifiers
```

Bump `CACHE_VERSION` in `sw.js` and `APP_VERSION` in `js/version.js` together whenever a
shipped file changes — a test fails if they drift, and another if a module is missing
from the precache list.
