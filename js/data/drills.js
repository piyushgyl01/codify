/**
 * Drills — structured practice sessions, and the four gauntlets.
 *
 * A drill is a list of timed steps. The runner in views/player.js walks them one
 * at a time with a clock, inserts the rests, and lets you mark each step done or
 * skipped. Finishing a step chains a combo; skipping one breaks it.
 *
 * Every drill declares the `mode` its minutes are logged under, so running one
 * writes into the focus log exactly as a hand-typed session would. Nothing here
 * is a separate currency — a drill is just practice you did not have to plan.
 */

/** Level needed for each tier. Two tiers are open at the start so day one has choice. */
export const TIER_LOCK = { 1: 1, 2: 1, 3: 5, 4: 12, 5: 22 };
export const TIER_NAME = { 1:'Warmup', 2:'Standard', 3:'Focused', 4:'Advanced', 5:'Elite' };

export const DRILLS = [
  /* ---------------------------------- tier 1 ---------------------------------- */
  { id:'cold-start', name:'Cold Start', icon:'▲', path:'lang', tier:1, mode:'drill', rest:2,
    xp:60, coins:18, blurb:'Twenty minutes to prove the language is still in your hands.',
    steps: [
      { label:'FizzBuzz from an empty file', minutes:5, note:'No reference. No autocomplete if you can turn it off.' },
      { label:'Reverse a string in place', minutes:5 },
      { label:'Group a list of records by one field', minutes:10, note:'map / filter / reduce only.' },
    ] },

  { id:'array-warmup', name:'Array Warmup', icon:'▤', path:'data', tier:1, mode:'drill', rest:2,
    xp:70, coins:20, blurb:'The three array moves everything else is built on.',
    steps: [
      { label:'Two-sum with a hash map', minutes:8 },
      { label:'Rotate an array in place', minutes:8, note:'O(1) extra space. The reversal trick.' },
      { label:'Merge two sorted arrays', minutes:9, note:'Backwards, from the end.' },
    ] },

  { id:'git-reps', name:'Git Reps', icon:'⑂', path:'craft', tier:1, mode:'drill', rest:2,
    xp:65, coins:20, blurb:'The commands you always look up, until you stop having to.',
    steps: [
      { label:'Interactive rebase: squash three commits', minutes:7 },
      { label:'Create and resolve a merge conflict on purpose', minutes:8 },
      { label:'Recover a commit you deleted, with reflog', minutes:5 },
    ] },

  { id:'source-dive', name:'Source Dive', icon:'▤', path:'craft', tier:1, mode:'read', rest:3,
    xp:55, coins:14, blurb:'Read a library you use every day until one function makes sense.',
    steps: [
      { label:'Pick one function you call often and find its source', minutes:8 },
      { label:'Read it until you can say what it does line by line', minutes:14 },
      { label:'Write down one thing it does that surprised you', minutes:3 },
    ] },

  { id:'small-ship', name:'Small Ship', icon:'↑', path:'scale', tier:1, mode:'build', rest:3,
    xp:90, coins:30, blurb:'Something leaves your machine today. Size is not the point.',
    steps: [
      { label:'Pick the smallest useful change you have been putting off', minutes:5 },
      { label:'Build it', minutes:18 },
      { label:'Commit and push it', minutes:5, note:'A real message. Say why, not what.' },
    ] },

  /* ---------------------------------- tier 2 ---------------------------------- */
  { id:'deep-block', name:'Deep Block', icon:'⬛', path:'lang', tier:2, mode:'build', rest:5,
    xp:150, coins:45, blurb:'One problem, fifty minutes, nothing else open. The whole app is really about this.',
    steps: [
      { label:'Write the one sentence you are trying to make true', minutes:4 },
      { label:'Build, phone face down', minutes:25 },
      { label:'Build, still face down', minutes:20, note:'If you are stuck, write down what you tried.' },
      { label:'Write the next first step for tomorrow', minutes:3 },
    ] },

  { id:'pointer-gauntlet', name:'Pointer Gauntlet', icon:'⇄', path:'algo', tier:2, mode:'drill', rest:3,
    xp:130, coins:38, blurb:'Four two-pointer problems back to back. The pattern should stop feeling clever.',
    steps: [
      { label:'Valid palindrome, ignoring non-alphanumerics', minutes:8 },
      { label:'Container with most water', minutes:10 },
      { label:'Three-sum, no duplicate triples', minutes:14 },
      { label:'Trapping rain water', minutes:14, note:'Two pointers, not a stack, not prefix arrays.' },
    ] },

  { id:'hash-hour', name:'Hash & Map', icon:'#', path:'data', tier:2, mode:'drill', rest:3,
    xp:135, coins:40, blurb:'Hashing is the cheapest speed-up in the business. Earn it.',
    steps: [
      { label:'Group anagrams', minutes:10 },
      { label:'Longest consecutive sequence in O(n)', minutes:14 },
      { label:'Implement a hash map with chaining', minutes:18, note:'From scratch. Resize at 0.75.' },
    ] },

  { id:'dom-drill', name:'DOM Drill', icon:'@', path:'web', tier:2, mode:'build', rest:3,
    xp:120, coins:34, blurb:'No framework. Just you and the platform.',
    steps: [
      { label:'Render a list from an array, no library', minutes:10 },
      { label:'One delegated listener for every row', minutes:12 },
      { label:'Re-render and prove the listener survived', minutes:8 },
    ] },

  { id:'query-sets', name:'Query Sets', icon:'::', path:'store', tier:2, mode:'drill', rest:3,
    xp:120, coins:34, blurb:'SQL is a language you either write weekly or forget entirely.',
    steps: [
      { label:'Join three tables and aggregate', minutes:10 },
      { label:'Window function: rank within a group', minutes:12 },
      { label:'Rewrite a subquery as a join, compare plans', minutes:11 },
    ] },

  /* ---------------------------------- tier 3 ---------------------------------- */
  { id:'window-set', name:'Window Set', icon:'▭', path:'algo', tier:3, mode:'drill', rest:3,
    xp:180, coins:52, blurb:'Sliding window until the invariant writes itself.',
    steps: [
      { label:'Longest substring without repeats', minutes:10 },
      { label:'Minimum window substring', minutes:18, note:'The hard one. State the invariant before coding.' },
      { label:'Longest repeating character replacement', minutes:14 },
    ] },

  { id:'test-first', name:'Test First', icon:'✓', path:'craft', tier:3, mode:'build', rest:4,
    xp:190, coins:55, blurb:'Red, green, refactor — done properly once, on something real.',
    steps: [
      { label:'Write a failing test for behaviour that does not exist', minutes:10 },
      { label:'Watch it fail for the right reason', minutes:4, note:'Wrong failure means the test is wrong.' },
      { label:'Make it pass with the dumbest code that works', minutes:14 },
      { label:'Refactor with the test green throughout', minutes:16 },
    ] },

  { id:'tree-circuit', name:'Tree Circuit', icon:'⋔', path:'data', tier:3, mode:'drill', rest:3,
    xp:185, coins:54, blurb:'Recursion you can write without a running start.',
    steps: [
      { label:'In-order traversal, recursive then iterative', minutes:12 },
      { label:'Validate a BST', minutes:12, note:'Bounds, not just comparing children.' },
      { label:'Lowest common ancestor', minutes:12 },
      { label:'Serialise and deserialise a binary tree', minutes:16 },
    ] },

  { id:'http-by-hand', name:'HTTP by Hand', icon:'⇉', path:'sys', tier:3, mode:'build', rest:4,
    xp:175, coins:50, blurb:'The protocol stops being magic the first time you type it yourself.',
    steps: [
      { label:'Open a TCP socket to a real host', minutes:10 },
      { label:'Write a GET request by hand and read the response', minutes:15 },
      { label:'Add a header that changes the answer', minutes:10, note:'Accept-Encoding, or a conditional GET.' },
      { label:'Now do it with keep-alive and two requests', minutes:12 },
    ] },

  { id:'refactor-kata', name:'Refactor Kata', icon:'↻', path:'craft', tier:3, mode:'build', rest:4,
    xp:200, coins:58, blurb:'Take the worst function you own and leave it better than the tests found it.',
    steps: [
      { label:'Find your longest function and cover it with tests', minutes:15 },
      { label:'Extract until nothing is over 30 lines', minutes:20 },
      { label:'Delete something. Anything.', minutes:10, note:'Dead code, a flag, a parameter nobody passes.' },
      { label:'Run the tests one final time', minutes:5 },
    ] },

  { id:'double-block', name:'Double Block', icon:'⬛', path:'lang', tier:3, mode:'build', rest:8,
    xp:280, coins:80, blurb:'Two deep blocks with one real break. The most productive 100 minutes available to you.',
    steps: [
      { label:'Block one: build', minutes:45 },
      { label:'Block two: build', minutes:45, note:'Same problem. Do not switch — switching is the tax.' },
    ] },

  /* ---------------------------------- tier 4 ---------------------------------- */
  { id:'graph-gauntlet', name:'Graph Gauntlet', icon:'◈', path:'data', tier:4, mode:'drill', rest:4,
    xp:260, coins:74, blurb:'Graphs are where interviews go to separate people. Be on the right side of it.',
    steps: [
      { label:'Number of islands, iterative and recursive', minutes:12 },
      { label:'Clone a graph', minutes:12 },
      { label:'Course schedule with cycle detection', minutes:16 },
      { label:'Dijkstra on a weighted graph', minutes:20, note:'With a real priority queue.' },
    ] },

  { id:'dp-ladder', name:'DP Ladder', icon:'▦', path:'algo', tier:4, mode:'drill', rest:5,
    xp:300, coins:86, blurb:'Four rungs from trivial to genuinely hard, in the order that makes DP click.',
    steps: [
      { label:'Climbing stairs, memoised then tabulated', minutes:12 },
      { label:'House robber, then the circular version', minutes:14 },
      { label:'Coin change, and say why greedy fails', minutes:16 },
      { label:'Longest common subsequence, O(n) space', minutes:20 },
    ] },

  { id:'race-lab', name:'Race Lab', icon:'⚡', path:'sys', tier:4, mode:'build', rest:5,
    xp:270, coins:78, blurb:'Cause a data race deliberately. It is the only way to believe in them.',
    steps: [
      { label:'Two threads incrementing one counter, unsynchronised', minutes:12 },
      { label:'Run it until the total is wrong', minutes:8, note:'Loop it. Race conditions are shy.' },
      { label:'Fix it with a mutex', minutes:12 },
      { label:'Fix it again with an atomic or a channel', minutes:18 },
    ] },

  { id:'index-lab', name:'Index Lab', icon:'⌸', path:'store', tier:4, mode:'build', rest:4,
    xp:240, coins:68, blurb:'A query plan is a fact. Read one.',
    steps: [
      { label:'Generate a table with a million rows', minutes:10 },
      { label:'Write a query that takes seconds', minutes:10 },
      { label:'Add the index and show the plan change', minutes:14 },
      { label:'Add a second index that makes a write slower', minutes:12, note:'Indexes are not free. Measure the cost.' },
    ] },

  { id:'perf-hunt', name:'Perf Hunt', icon:'◉', path:'craft', tier:4, mode:'build', rest:4,
    xp:260, coins:74, blurb:'Measure, then change, then measure. In that order or not at all.',
    steps: [
      { label:'Profile something real and save the baseline', minutes:12 },
      { label:'Write down your guess before you look', minutes:4, note:'You will be wrong. That is the lesson.' },
      { label:'Find the actual hot path', minutes:14 },
      { label:'Fix it and re-measure', minutes:18 },
    ] },

  { id:'design-sprint', name:'Design Sprint', icon:'▣', path:'scale', tier:4, mode:'build', rest:4,
    xp:250, coins:70, blurb:'Forty-five minutes and one page. Constraints first, boxes last.',
    steps: [
      { label:'Write the requirements and the numbers', minutes:10, note:'QPS, data size, read/write ratio.' },
      { label:'Sketch the boxes and the data flow', minutes:15 },
      { label:'Name the bottleneck and what you would do at 10x', minutes:12 },
      { label:'Write the alternative you rejected', minutes:8 },
    ] },

  /* ---------------------------------- tier 5 ---------------------------------- */
  { id:'mock-loop', name:'Mock Loop', icon:'▩', path:'algo', tier:5, mode:'drill', rest:6,
    xp:420, coins:120, blurb:'A full interview loop, timed, out loud, with nobody to rescue you.',
    steps: [
      { label:'Medium problem, talking through it aloud', minutes:25, note:'Narrate. Silence is the thing that fails you.' },
      { label:'Hard problem, same rules', minutes:35 },
      { label:'System design question', minutes:25 },
      { label:'Write down every place you went quiet', minutes:8 },
    ] },

  { id:'compiler-day', name:'Compiler Day', icon:'⟨⟩', path:'sys', tier:5, mode:'build', rest:10,
    xp:600, coins:170, blurb:'Two hours to turn text into a value. Nothing teaches parsing like writing one.',
    steps: [
      { label:'Tokeniser: numbers, operators, parens', minutes:30 },
      { label:'Recursive-descent parser with precedence', minutes:45 },
      { label:'Tree-walking evaluator', minutes:25 },
      { label:'Add unary minus without breaking precedence', minutes:20, note:'This is the step that finds your bugs.' },
    ] },

  { id:'incident-drill', name:'Incident Drill', icon:'▲', path:'scale', tier:5, mode:'build', rest:5,
    xp:400, coins:115, blurb:'Break your own thing on purpose, on a day when nothing is on fire.',
    steps: [
      { label:'Pick a dependency and kill it', minutes:10 },
      { label:'Watch what your monitoring actually told you', minutes:15, note:'Usually less than you assumed.' },
      { label:'Fix the blind spot you just found', minutes:25 },
      { label:'Write the three-line postmortem', minutes:10 },
    ] },

  { id:'full-review', name:'Full Design Review', icon:'▣', path:'scale', tier:5, mode:'build', rest:6,
    xp:450, coins:128, blurb:'Take one of your own systems apart in front of an imaginary staff engineer.',
    steps: [
      { label:'Draw what you actually built, not what you meant to', minutes:20 },
      { label:'Find every single point of failure', minutes:20 },
      { label:'Cost it: what does 10x traffic break first', minutes:20 },
      { label:'Write the migration you would need', minutes:15 },
    ] },
];

export const drillById = id => DRILLS.find(d => d.id === id) || null;
export const drillsOfTier = tier => DRILLS.filter(d => d.tier === tier);

/** Planned minutes for a drill, rests included — what the card promises. */
export const drillMinutes = d =>
  d.steps.reduce((n, s) => n + s.minutes, 0) + d.rest * Math.max(0, d.steps.length - 1);

/* --------------------------------- gauntlets -------------------------------- */

/**
 * Four fights you can lose.
 *
 * A gauntlet has HP and you have focus. Finishing a step deals damage scaled by
 * your combo; skipping one costs a focus pip. Run out of focus and it survives,
 * you keep partial XP, and you come back when you are better. Losing has to be
 * possible or winning means nothing.
 */
export const GAUNTLETS = [
  { id:'heisenbug', name:'The Heisenbug', icon:'☣', lvl:3, hp:300, focus:4, tier:2,
    path:'craft', mode:'build', rest:4,
    blurb:'It only happens in production, and only when you are not watching.',
    xp:320, coins:90,
    steps: [
      { label:'Reproduce it reliably', minutes:15, note:'Until you can, everything after this is guessing.' },
      { label:'Bisect to the commit that introduced it', minutes:12 },
      { label:'Write the failing test', minutes:12 },
      { label:'Fix it', minutes:15 },
      { label:'Explain in one sentence why it only showed up there', minutes:6 },
    ],
    taunts: {
      75:'You have not reproduced it yet. You are pattern-matching.',
      50:'Careful — that fix makes the symptom disappear, not the cause.',
      25:'Getting close. Do not stop at the first thing that looks wrong.',
      0:'Found, tested, fixed. It cannot come back without failing a test first.',
    } },

  { id:'monolith', name:'The Monolith', icon:'▓', lvl:8, hp:600, focus:4, tier:3,
    path:'craft', mode:'build', rest:5,
    blurb:'Nine hundred lines, no tests, and everyone is afraid of it. Including the person who wrote it.',
    xp:600, coins:170,
    steps: [
      { label:'Characterisation tests around current behaviour', minutes:20, note:'Not correct behaviour. Current.' },
      { label:'Extract the first seam', minutes:18 },
      { label:'Extract two more', minutes:20 },
      { label:'Delete the dead branches you just exposed', minutes:12 },
      { label:'Make one behaviour change, safely', minutes:15 },
      { label:'All tests green', minutes:8 },
    ],
    taunts: {
      75:'You changed behaviour before you pinned it down. Back up.',
      50:'Two seams in. This is the point where most people stop.',
      25:'It is starting to look like code someone chose to write.',
      0:'Readable, tested, and it does what it did. That is the whole job.',
    } },

  { id:'whiteboard', name:'The Whiteboard', icon:'▢', lvl:15, hp:1000, focus:3,
    tier:4, path:'algo', mode:'drill', rest:5,
    blurb:'Four rounds, one day, and a stranger deciding whether you can think out loud.',
    xp:1000, coins:280,
    steps: [
      { label:'Warmup medium, narrated start to finish', minutes:20 },
      { label:'Hard problem, no hints, no lookups', minutes:35 },
      { label:'Follow-up: same problem, optimise the space', minutes:15 },
      { label:'System design round', minutes:30 },
      { label:'Behavioural: three stories with numbers in them', minutes:15 },
      { label:'Write down every moment you froze', minutes:8 },
    ],
    taunts: {
      75:'You went quiet for ninety seconds. That reads as stuck.',
      50:'Good recovery. Now say the complexity before they ask for it.',
      25:'One round left. The design question is where people relax and lose.',
      0:'Four rounds, narrated, no rescue. That is an offer-shaped performance.',
    } },

  { id:'herd', name:'The Thundering Herd', icon:'⛈', lvl:25, hp:1600, focus:3,
    tier:5, path:'scale', mode:'build', rest:6,
    blurb:'Your cache expired. All of it. At once. Everyone is now asking the database the same question.',
    xp:1800, coins:500,
    steps: [
      { label:'Build the thing and put a cache in front of it', minutes:25 },
      { label:'Expire the whole cache under load and watch it fall over', minutes:20 },
      { label:'Add jitter to the TTLs', minutes:15 },
      { label:'Add request coalescing so one miss makes one query', minutes:30 },
      { label:'Add a circuit breaker with a real fallback', minutes:25 },
      { label:'Load-test again and show the graph flat', minutes:20 },
      { label:'Write what would still break at 100x', minutes:10 },
    ],
    taunts: {
      75:'The graph is a cliff. That is every client retrying in lockstep.',
      50:'Jitter helped. You still have a thousand identical queries in flight.',
      25:'Coalescing is in. Now: what happens when the database is simply down?',
      0:'Flat under load, degrades instead of dying. That is the whole discipline.',
    } },
];

export const gauntletById = id => GAUNTLETS.find(g => g.id === id) || null;

/** Drills and gauntlets share the runner, so it needs one lookup. */
export function getSession(id) {
  const d = drillById(id);
  if (d) return { ...d, isGauntlet: false };
  const g = gauntletById(id);
  return g ? { ...g, isGauntlet: true } : null;
}
