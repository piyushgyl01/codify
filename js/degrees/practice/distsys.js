/**
 * CS520 Distributed Systems — 6.5840-style questions with exact answers:
 * quorum intersection, Lamport and vector clocks, Raft majorities and fault
 * tolerance, availability of replicated and chained services, and two-phase
 * commit outcomes. CS2023 PDC-Coordination, PDC-Algorithms, SF-Reliability.
 *
 * Checks: brute force over every quorum pair, event-by-event clock
 * simulation, Monte Carlo-free exact enumeration of failures, and separate
 * rule implementations.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;

export const DISTSYS = [
  SKILL('dsys.quorum', 'Quorums', 'Read and write quorums overlap when R + W > N — so every read sees the latest write.', t => {
    const N = t.int(3, 7), W = t.int(1, N), R = t.int(1, N);
    const overlap = R + W > N;
    return { kind: 'mc', q: `A replicated store has N = ${N} replicas. Writes wait for W = ${W} acknowledgements and reads query R = ${R} replicas. Is every read guaranteed to reach at least one replica holding the latest acknowledged write?`, options: overlap ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
      explain: overlap ? `R + W = ${R + W} > ${N}, so any read set and any write set share a replica (pigeonhole).` : `R + W = ${R + W} ≤ ${N}: a read can land entirely on replicas the write missed.`,
      python: `from itertools import combinations\nN, R, W = ${N}, ${R}, ${W}\nnodes = range(N)\nprint('Yes' if all(set(r) & set(w) for r in combinations(nodes, R) for w in combinations(nodes, W)) else 'No')` };
  }),

  SKILL('dsys.lamport', 'Lamport clocks', 'Logical time: tick on every event, and on receipt jump past the sender\'s timestamp.', t => {
    const procs = ['P', 'Q', 'R'], events = [], msgs = [];
    for (let i = 0; i < t.int(6, 9); i++) {
      const p = t.pick(procs);
      if (t.rng() < 0.4) { const to = t.pick(procs.filter(x => x !== p)); events.push({ p, kind: 'send', to, id: msgs.length }); msgs.push({ from: p, to, received: false }); }
      else { const pending = msgs.findIndex(m => m.to === p && !m.received); if (pending >= 0) { msgs[pending].received = true; events.push({ p, kind: 'recv', id: pending }); } else events.push({ p, kind: 'local' }); }
    }
    const clock = { P: 0, Q: 0, R: 0 }, stamp = {}, times = [];
    for (const e of events) {
      if (e.kind === 'recv') clock[e.p] = Math.max(clock[e.p], stamp[e.id]) + 1; else clock[e.p] += 1;
      if (e.kind === 'send') stamp[e.id] = clock[e.p];
      times.push(clock[e.p]);
    }
    const k = t.int(1, events.length), text = events.map((e, i) => `${i + 1}. ${e.p} ${e.kind === 'send' ? `sends m${e.id + 1} to ${e.to}` : e.kind === 'recv' ? `receives m${e.id + 1}` : 'does a local step'}`).join('; ');
    return num(`Three processes start with Lamport clock 0. In order: ${text}. What is the Lamport timestamp of event ${k}?`, times[k - 1],
      `Each event increments the process's clock; a receive first takes the max of its own clock and the message's timestamp. Event ${k} gets ${times[k - 1]}. If a happened before b then L(a) < L(b) — but not the other way round.`,
      `E = ${PY(events.map(e => [e.p, e.kind, e.id ?? -1]))}\nL = {'P': 0, 'Q': 0, 'R': 0}; ts = {}; out = []\nfor p, kind, i in E:\n    L[p] = (max(L[p], ts[i]) if kind == 'recv' else L[p]) + 1\n    if kind == 'send': ts[i] = L[p]\n    out.append(L[p])\nprint(out[${k - 1}])`);
  }),

  SKILL('dsys.vclock', 'Vector clocks', 'Vector clocks decide happened-before exactly: a → b iff V(a) ≤ V(b) componentwise and V(a) ≠ V(b).', t => {
    const a = [t.int(0, 4), t.int(0, 4), t.int(0, 4)], b = t.rng() < 0.4 ? a.map(x => x + t.int(0, 2)) : [t.int(0, 4), t.int(0, 4), t.int(0, 4)];
    const le = (x, y) => x.every((v, i) => v <= y[i]), eq = a.every((v, i) => v === b[i]);
    const rel = eq ? 'The same event' : le(a, b) ? 'a happened before b' : le(b, a) ? 'b happened before a' : 'Concurrent';
    const opts = ['a happened before b', 'b happened before a', 'Concurrent', 'The same event'];
    return { kind: 'mc', q: `Event a has vector clock [${a.join(', ')}] and event b has [${b.join(', ')}]. How are they related?`, options: [rel, ...opts.filter(o => o !== rel)], correct: 0,
      explain: `Compare componentwise: ${rel === 'Concurrent' ? 'each is ahead somewhere, so neither happened before the other — exactly the conflicts a system like Dynamo must resolve.' : rel === 'The same event' ? 'identical vectors.' : 'one is ≤ the other everywhere and smaller somewhere.'}`,
      python: `a, b = ${PY(a)}, ${PY(b)}\nle = lambda x, y: all(p <= q for p, q in zip(x, y))\nprint('The same event' if a == b else 'a happened before b' if le(a, b) else 'b happened before a' if le(b, a) else 'Concurrent')` };
  }),

  SKILL('dsys.raft', 'Raft majorities', 'A cluster of n tolerates ⌊(n − 1)/2⌋ failures; commits need a majority.', t => {
    const n = t.int(2, 9), form = t.pick(['majority', 'failures', 'commit']);
    if (form === 'majority') return num(`How many votes does a Raft candidate need to win an election in a ${n}-server cluster?`, Math.floor(n / 2) + 1,
      `A strict majority, ⌊${n}/2⌋ + 1 = ${Math.floor(n / 2) + 1}. Two majorities always share a server, so two leaders cannot win the same term.`,
      `from itertools import combinations\nn = ${n}\nprint(min(k for k in range(1, n + 1) if all(set(a) & set(b) for a in combinations(range(n), k) for b in combinations(range(n), k))))`);
    if (form === 'failures') return num(`How many servers can fail in a ${n}-server Raft cluster while it still makes progress?`, Math.floor((n - 1) / 2),
      `It needs a majority alive: ⌊(${n} − 1)/2⌋ = ${Math.floor((n - 1) / 2)}. ${n % 2 === 0 ? `Note ${n} tolerates no more than ${n - 1} would — even sizes buy nothing.` : ''}`,
      `n = ${n}\nprint(max(f for f in range(n) if n - f > n // 2))`);
    const match = Array.from({ length: n }, () => t.int(3, 9)).sort((x, y) => y - x);
    return num(`A ${n}-server Raft cluster (leader included) has matchIndex values ${match.join(', ')} for the current term's entries. What is the highest index the leader can mark committed?`, match[Math.floor(n / 2)],
      `An index is committed once a majority has it: sort descending and take position ⌊n/2⌋ (0-based): ${match[Math.floor(n / 2)]}.`,
      `m, n = ${PY(match)}, ${n}\nprint(max(i for i in range(0, 20) if sum(1 for x in m if x >= i) > n / 2))`);
  }),

  SKILL('dsys.avail', 'Availability', 'Replicas multiply nines; dependencies in series divide them.', t => {
    const a = t.pick([0.9, 0.95, 0.99, 0.999]), k = t.int(2, 4);
    if (t.rng() < 0.5) {
      const v = 1 - (1 - a) ** k;
      return num(`Each replica is up ${a * 100}% of the time, independently. A request succeeds if any of ${k} replicas is up. What is the availability? (6 decimal places)`, Math.round(v * 1e6) / 1e6,
        `Down only when all are down: 1 − (1 − ${a})^${k} = ${v.toFixed(6)}.`,
        `from itertools import product\nfrom fractions import Fraction as F\nimport math\na = F('${a}')\n# add up the probability of every up/down pattern in which at least one replica is up\nprint(float(sum(math.prod(a if x else 1 - a for x in s) for s in product((0, 1), repeat=${k}) if any(s))))`, { tol: 1e-6, dp: 6 });
    }
    const v = a ** k;
    return num(`A request must pass through ${k} services in series, each up ${a * 100}% of the time independently. What is the end-to-end availability? (6 decimal places)`, Math.round(v * 1e6) / 1e6,
      `All must be up: ${a}^${k} = ${v.toFixed(6)}. Every dependency in the path costs you availability.`,
      `from itertools import product\nimport math\na = ${a}\nprint(sum(math.prod(a if x else 1 - a for x in s) for s in product((0, 1), repeat=${k}) if all(s)))`, { tol: 1e-6, dp: 6 });
  }),

  SKILL('dsys.2pc', 'Two-phase commit', 'All-or-nothing across participants — and where it blocks.', t => {
    const n = t.int(2, 4), votes = Array.from({ length: n }, () => (t.rng() < 0.75 ? 'yes' : 'no')), coordCrash = t.rng() < 0.3;
    const outcome = coordCrash && votes.every(v => v === 'yes') ? 'Blocked until the coordinator recovers' : votes.every(v => v === 'yes') ? 'Commit' : 'Abort';
    const opts = ['Commit', 'Abort', 'Blocked until the coordinator recovers'];
    return { kind: 'mc', q: `Two-phase commit with ${n} participants voting ${votes.join(', ')}.${coordCrash ? ' The coordinator crashes after collecting the votes but before sending its decision.' : ''} What happens?`, options: [outcome, ...opts.filter(o => o !== outcome)], correct: 0,
      explain: outcome === 'Abort' ? 'Any no vote aborts the transaction everywhere.' : outcome === 'Commit' ? 'All voted yes and the decision went out: commit everywhere.' : 'Participants that voted yes cannot decide alone — committing or aborting could contradict the coordinator. 2PC blocks; consensus-based commit (e.g. over Raft) avoids this.',
      python: `votes, crash = ${PY(votes)}, ${coordCrash ? 'True' : 'False'}\nif 'no' in votes: print('Abort')\nelif crash: print('Blocked until the coordinator recovers')\nelse: print('Commit')` };
  }),
];
