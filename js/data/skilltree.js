/**
 * The skill tree: 65 nodes across 8 paths.
 *
 * A node is claimed by doing its `task` — a concrete thing you either did or
 * did not do, from memory, with a timer running. Nothing here is a quiz. The
 * honesty of the whole app rests on these tasks being specific enough that
 * lying to yourself takes effort.
 *
 * Every node unlocks on two conditions: a level gate (so the tree reveals
 * itself at the pace you actually train) and a prerequisite (so the order is
 * the order the ideas depend on each other).
 *
 * Mastery is not permanent. `state.js` schedules retests, and `analytics.js`
 * models how much of a node you should still hold. A node you passed ten months
 * ago and never revisited is not a node you know.
 */

export const PATHS = [
  { id:'lang',  name:'Foundations',  short:'Lang',   icon:'{}', color:'var(--info)',
    blurb:'The language itself — the part every other path is written in.' },
  { id:'data',  name:'Data Structures', short:'Data', icon:'[]', color:'var(--violet)',
    blurb:'What memory looks like when you give it a shape.' },
  { id:'algo',  name:'Patterns',     short:'Algo',   icon:'</>', color:'var(--teal)',
    blurb:'The dozen shapes most interview problems are wearing a costume over.' },
  { id:'web',   name:'Web & Interfaces', short:'Web', icon:'@',  color:'var(--pink)',
    blurb:'The part other people actually touch.' },
  { id:'store', name:'Data Stores',  short:'Store',  icon:'::',  color:'var(--warn)',
    blurb:'Where the data goes when the process exits.' },
  { id:'sys',   name:'Systems',      short:'Sys',    icon:'#!',  color:'var(--good)',
    blurb:'What is underneath the thing you usually write.' },
  { id:'craft', name:'Craft',        short:'Craft',  icon:'~/',  color:'#C4B5FD',
    blurb:'The habits that decide whether the code survives contact with a team.' },
  { id:'scale', name:'Scale & Ops',  short:'Scale',  icon:'^^',  color:'#FB923C',
    blurb:'What changes when it is not just you and it is not just one box.' },
];

export const pathFor = id => PATHS.find(p => p.id === id) || PATHS[0];

/**
 * `lvl` gates on player level, `needs` on the node before it.
 * `task` is what you have to do to claim it — and what a retest re-runs.
 * `mins` is a rough expectation, shown so an unfamiliar node is not a blank cheque.
 */
export const NODES = [
  /* ------------------------------ Foundations ----------------------------- */
  { id:'syntax', path:'lang', name:'Control Flow', lvl:1, needs:null, mins:20,
    task:'Write FizzBuzz from an empty file, no reference open, in a language you are still learning.' },
  { id:'functions', path:'lang', name:'Functions & Scope', lvl:1, needs:'syntax', mins:25,
    task:'Write a function that takes a function and returns a function. Then say out loud exactly what closed over what.' },
  { id:'collections', path:'lang', name:'Collections', lvl:2, needs:'functions', mins:30,
    task:'Turn a list of records into a grouped summary using only map, filter and reduce. No explicit loop.' },
  { id:'types', path:'lang', name:'Types & Interfaces', lvl:4, needs:'collections', mins:40,
    task:'Define a sum type with three variants and handle it exhaustively. Make a compiler or a test prove no case is missed.' },
  { id:'errors', path:'lang', name:'Errors & Absence', lvl:6, needs:'types', mins:45,
    task:'Take a function that throws in three places and rewrite it so every failure is a value the caller is forced to handle.' },
  { id:'generics', path:'lang', name:'Generics', lvl:9, needs:'types', mins:50,
    task:'Write a generic container and a function generic over it. No escape hatches — no any, no casts.' },
  { id:'async_lang', path:'lang', name:'Async & Futures', lvl:12, needs:'errors', mins:50,
    task:'Run three requests concurrently, fail fast on the first error, and cancel the other two. Prove the cancellation happened.' },
  { id:'meta', path:'lang', name:'Metaprogramming', lvl:18, needs:'generics', mins:60,
    task:'Write a decorator or macro that adds timing to any function without editing the function body.' },

  /* --------------------------- Data Structures ---------------------------- */
  { id:'array_', path:'data', name:'Arrays & Slices', lvl:1, needs:null, mins:30,
    task:'Implement a growable array with push. Then explain why doubling makes it O(1) amortised and halving on every pop does not.' },
  { id:'hash', path:'data', name:'Hash Maps', lvl:2, needs:'array_', mins:50,
    task:'Implement a hash map from scratch with separate chaining and a resize at load factor 0.75.' },
  { id:'list', path:'data', name:'Linked Lists', lvl:3, needs:'array_', mins:40,
    task:'Reverse a singly linked list in place, iteratively. Then detect a cycle using O(1) extra memory.' },
  { id:'stackq', path:'data', name:'Stacks & Queues', lvl:4, needs:'list', mins:35,
    task:'Implement a queue out of two stacks with O(1) amortised dequeue, and say where the amortisation hides.' },
  { id:'tree', path:'data', name:'Binary Trees', lvl:6, needs:'stackq', mins:45,
    task:'Write in-order traversal twice: once recursively, once with an explicit stack and no recursion.' },
  { id:'bst', path:'data', name:'Search Trees', lvl:9, needs:'tree', mins:60,
    task:'Implement BST insert and delete covering all three delete cases. Then describe the insertion order that ruins it.' },
  { id:'heap', path:'data', name:'Heaps', lvl:11, needs:'tree', mins:50,
    task:'Implement a binary heap with sift-up and sift-down, then use it to keep top-K over a stream you cannot re-read.' },
  { id:'graph', path:'data', name:'Graphs', lvl:13, needs:'heap', mins:55,
    task:'Build an adjacency list from an edge list, then find a shortest path with BFS. State when BFS stops being correct.' },
  { id:'trie', path:'data', name:'Tries', lvl:17, needs:'graph', mins:50,
    task:'Implement a trie with insert, search and prefix-count. Then say what it costs in memory versus a hash map.' },

  /* -------------------------------- Patterns ------------------------------ */
  { id:'bigo', path:'algo', name:'Complexity', lvl:1, needs:null, mins:25,
    task:'Take three functions you wrote this week and state time and space complexity for each, with the reason, not the label.' },
  { id:'twoptr', path:'algo', name:'Two Pointers', lvl:3, needs:'bigo', mins:35,
    task:'Solve container-with-most-water in O(n), and justify why moving the shorter side can never skip the answer.' },
  { id:'window', path:'algo', name:'Sliding Window', lvl:5, needs:'twoptr', mins:40,
    task:'Longest substring with no repeating character, in one pass, O(n). No nested loop.' },
  { id:'bsearch', path:'algo', name:'Binary Search', lvl:6, needs:'bigo', mins:40,
    task:'Search a rotated sorted array. Then write plain binary search again and get the boundaries right first try.' },
  { id:'traverse', path:'algo', name:'BFS & DFS', lvl:8, needs:'window', mins:45,
    task:'Count islands in a grid both iteratively and recursively, and say at what input size the recursion blows the stack.' },
  { id:'toposort', path:'algo', name:'Topological Sort', lvl:11, needs:'traverse', mins:45,
    task:'Course schedule with cycle detection using Kahn algorithm. Then do it again with DFS colouring.' },
  { id:'dp1', path:'algo', name:'Memoisation', lvl:13, needs:'bsearch', mins:55,
    task:'Solve a DP problem top-down with memoisation. Draw the recursion tree before you write any code.' },
  { id:'dp2', path:'algo', name:'Tabulation', lvl:16, needs:'dp1', mins:55,
    task:'Convert that memoised solution to bottom-up, then cut it to O(1) space if the recurrence allows.' },
  { id:'greedy', path:'algo', name:'Greedy Arguments', lvl:19, needs:'dp2', mins:50,
    task:'Solve interval scheduling greedily, then write the exchange argument that proves it optimal.' },

  /* ---------------------------------- Web --------------------------------- */
  { id:'markup', path:'web', name:'Semantic Markup', lvl:1, needs:null, mins:25,
    task:'Build a form with a fieldset, labels bound to inputs, and not one div standing in for an element that already exists.' },
  { id:'layout', path:'web', name:'Layout', lvl:2, needs:'markup', mins:40,
    task:'Build a responsive three-panel layout with grid. No magic pixel values, no media query patching a broken idea.' },
  { id:'dom', path:'web', name:'DOM & Events', lvl:4, needs:'layout', mins:40,
    task:'Build a list with one delegated listener that keeps working after the list re-renders.' },
  { id:'http', path:'web', name:'HTTP', lvl:5, needs:'dom', mins:30,
    task:'From memory: name every part of a request and a response, then explain 301 against 302 against 307 and when the difference bites.' },
  { id:'state', path:'web', name:'Client State', lvl:8, needs:'dom', mins:50,
    task:'Build a screen with derived state and prove there is exactly one source of truth for every value on it.' },
  { id:'auth', path:'web', name:'Auth & Sessions', lvl:11, needs:'http', mins:60,
    task:'Explain cookie against token auth, then implement a refresh flow that survives closing the tab.' },
  { id:'a11y', path:'web', name:'Accessibility', lvl:13, needs:'state', mins:45,
    task:'Drive your own app with the keyboard only, then with a screen reader. Fix everything you could not reach.' },
  { id:'perf_web', path:'web', name:'Front-End Performance', lvl:16, needs:'a11y', mins:55,
    task:'Profile a real page, find what delays the largest contentful paint, and move the number. Screenshot both.' },

  /* ------------------------------ Data Stores ----------------------------- */
  { id:'sql', path:'store', name:'SQL', lvl:2, needs:null, mins:35,
    task:'Write a query with a join, a group by and a having, without looking up the clause order.' },
  { id:'schema', path:'store', name:'Schema Design', lvl:5, needs:'sql', mins:50,
    task:'Normalise a messy spreadsheet to third normal form, then name the one place you would denormalise and what it buys.' },
  { id:'index', path:'store', name:'Indexes', lvl:8, needs:'schema', mins:45,
    task:'Write a deliberately slow query, add the right index, and show the query plan changing.' },
  { id:'tx', path:'store', name:'Transactions', lvl:11, needs:'index', mins:50,
    task:'Reproduce a lost update, then fix it. Name the isolation level you needed and what it cost.' },
  { id:'migrate', path:'store', name:'Migrations', lvl:13, needs:'tx', mins:45,
    task:'Write a schema change that deploys with zero downtime and can roll back after traffic has hit it.' },
  { id:'nosql', path:'store', name:'Non-Relational', lvl:15, needs:'index', mins:45,
    task:'Model the same data for a document store, then state plainly what you gave up to get it.' },
  { id:'shard', path:'store', name:'Partitioning', lvl:20, needs:'migrate', mins:50,
    task:'Pick a shard key for a real dataset, then describe the query it just made expensive.' },

  /* -------------------------------- Systems ------------------------------- */
  { id:'cli', path:'sys', name:'Shell & Processes', lvl:1, needs:null, mins:25,
    task:'Answer a real question about your own filesystem by chaining four commands with pipes.' },
  { id:'memory', path:'sys', name:'Memory', lvl:4, needs:'cli', mins:45,
    task:'Draw the stack and the heap for a twenty-line program and place every variable in one of them.' },
  { id:'files', path:'sys', name:'Files & I/O', lvl:6, needs:'cli', mins:40,
    task:'Aggregate a file larger than your RAM, line by line, without loading it.' },
  { id:'net', path:'sys', name:'Networking', lvl:8, needs:'files', mins:45,
    task:'Open a raw TCP socket and speak HTTP/1.1 by hand until a real server answers you.' },
  { id:'concurrency', path:'sys', name:'Threads & Locks', lvl:11, needs:'memory', mins:60,
    task:'Write a data race and observe it failing. Fix it with a lock. Then fix it again without one.' },
  { id:'async_sys', path:'sys', name:'Event Loops', lvl:13, needs:'concurrency', mins:50,
    task:'Explain how your runtime schedules an await, then block the loop on purpose and name everything that stalls.' },
  { id:'os', path:'sys', name:'Kernel & Syscalls', lvl:17, needs:'net', mins:55,
    task:'Trace a running program with strace or dtruss and explain its ten most frequent syscalls.' },
  { id:'compile', path:'sys', name:'Compilers', lvl:21, needs:'os', mins:90,
    task:'Write a tokeniser and a recursive-descent parser for arithmetic, then evaluate the tree. Handle precedence correctly.' },

  /* --------------------------------- Craft -------------------------------- */
  { id:'git', path:'craft', name:'Version Control', lvl:1, needs:null, mins:30,
    task:'Rebase a three-commit branch, resolve a real conflict and reword a message — all from the command line.' },
  { id:'test1', path:'craft', name:'Unit Testing', lvl:2, needs:'git', mins:35,
    task:'Write a test that fails for the right reason before the code exists, then make it pass.' },
  { id:'debug', path:'craft', name:'Debugging', lvl:4, needs:'test1', mins:40,
    task:'Find a real bug with a debugger, breakpoints and a watch expression. No print statements at all.' },
  { id:'refactor', path:'craft', name:'Refactoring', lvl:7, needs:'test1', mins:55,
    task:'Take a hundred-line function under thirty lines with the tests green at every single step.' },
  { id:'review', path:'craft', name:'Code Review', lvl:9, needs:'refactor', mins:40,
    task:'Review a real pull request and leave three comments that change the design rather than the formatting.' },
  { id:'test2', path:'craft', name:'Property Testing', lvl:12, needs:'debug', mins:50,
    task:'Write a property-based test that finds a bug your example tests missed. Keep the shrunk counterexample.' },
  { id:'profile', path:'craft', name:'Profiling', lvl:15, needs:'debug', mins:50,
    task:'Profile before you optimise. Show the flame graph, the change, and the number that actually moved.' },
  { id:'design_doc', path:'craft', name:'Design Docs', lvl:18, needs:'review', mins:60,
    task:'Write a one-page design doc whose most useful section is the alternatives you rejected and why.' },

  /* ------------------------------ Scale & Ops ----------------------------- */
  { id:'deploy', path:'scale', name:'Shipping', lvl:3, needs:null, mins:45,
    task:'Deploy something to a URL a stranger can open, starting from a clean clone on a machine that is not yours.' },
  { id:'logs', path:'scale', name:'Logging', lvl:5, needs:'deploy', mins:40,
    task:'Add structured logging with a request id that survives a hop between two services.' },
  { id:'cache', path:'scale', name:'Caching', lvl:9, needs:'logs', mins:50,
    task:'Add a cache, then deliberately serve stale data and decide, in writing, whether you care.' },
  { id:'queue', path:'scale', name:'Queues', lvl:12, needs:'cache', mins:55,
    task:'Move a slow request to a background job with a retry policy and a dead-letter path you have actually tested.' },
  { id:'lb', path:'scale', name:'Load & Failure', lvl:14, needs:'queue', mins:50,
    task:'Load-test until something breaks, then name what broke first and why it was that and not the thing you expected.' },
  { id:'observe', path:'scale', name:'Observability', lvl:16, needs:'logs', mins:50,
    task:'Define an SLO with a real number, then build the one dashboard that tells you when it is at risk.' },
  { id:'replicate', path:'scale', name:'Replication', lvl:19, needs:'lb', mins:45,
    task:'Explain what a follower read can return that a leader read cannot, and the bug that produces.' },
  { id:'consensus', path:'scale', name:'Consensus', lvl:24, needs:'replicate', mins:60,
    task:'Explain Raft leader election from memory, including exactly what happens on a split vote.' },
];

export const ALL_NODES = NODES;
export const nodeById = id => NODES.find(n => n.id === id) || null;
export const nodesOfPath = path => NODES.filter(n => n.path === path);

/** XP for claiming a node. Deeper nodes are worth more because they cost more. */
export const nodeXp = node => 80 + node.lvl * 22;

/** Everything that must already be mastered before `id` is reachable. */
export function chainTo(id) {
  const out = [];
  let cur = nodeById(id);
  while (cur?.needs) { cur = nodeById(cur.needs); if (cur) out.unshift(cur); }
  return out;
}
