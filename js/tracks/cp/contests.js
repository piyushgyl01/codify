/**
 * Timed challenges — the boss fights.
 *
 * The old version of this was a list of steps you clicked "Done" on, which meant
 * the fight was won by tapping a button five times. These are settled by the
 * judge: you start a clock, go and solve on Codeforces, and the app checks the
 * accepted timestamps against the window when it next syncs.
 *
 * You can lose. Run out of time with two of three solved and you get partial
 * credit and nothing else, which is the only thing that makes winning mean
 * anything.
 */

export const CONTESTS = [
  { id:'warmup', name:'Warm-Up', icon:'▲', minutes:45, need:2, minRating:800, lvl:1,
    xp:200, coins:60,
    blurb:'Two easy problems, forty-five minutes. Mostly about starting.' },

  { id:'sprint', name:'The Sprint', icon:'⇉', minutes:60, need:3, minRating:1100, lvl:5,
    xp:450, coins:130,
    blurb:'Three problems in an hour. Speed is the whole exercise.' },

  { id:'ladder', name:'The Ladder', icon:'◈', minutes:120, need:3, minRating:1400, lvl:12,
    xp:900, coins:260,
    blurb:'Three at 1400 or above. This is where most people stall for months.' },

  { id:'gauntlet', name:'The Gauntlet', icon:'▩', minutes:150, need:4, minRating:1600, lvl:20,
    xp:1600, coins:460,
    blurb:'Four at 1600 in two and a half hours. A real contest, essentially.' },

  { id:'summit', name:'The Summit', icon:'★', minutes:180, need:3, minRating:2000, lvl:32,
    xp:3000, coins:850,
    blurb:'Three at 2000. Very few people finish this one on the first attempt.' },
];

export const contestById = id => CONTESTS.find(c => c.id === id) || null;

/**
 * Settle a contest against the solve list.
 *
 * `startedAt` and the duration define the window; a solve counts when the judge
 * accepted it inside that window and the problem met the rating floor. Solves
 * that were already credited before the contest started are excluded, so you
 * cannot win by starting a clock over work you had already done.
 */
export function settle(contest, startedAt, solved, alreadyKnown = new Set()) {
  const from = Math.floor(startedAt / 1000);
  const to = from + contest.minutes * 60;

  const counted = solved.filter(s =>
    !alreadyKnown.has(s.key) &&
    s.at >= from && s.at <= to &&
    s.rating != null && s.rating >= contest.minRating);

  const now = Math.floor(Date.now() / 1000);
  return {
    counted,
    solved: counted.length,
    need: contest.need,
    won: counted.length >= contest.need,
    expired: now > to,
    secondsLeft: Math.max(0, to - now),
    windowEnd: to,
  };
}

/** Partial credit, so a lost attempt is still worth having made. */
export function contestReward(contest, result) {
  const ratio = Math.min(1, result.solved / contest.need);
  if (result.won) return { xp: contest.xp, coins: contest.coins };
  return { xp: Math.round(contest.xp * 0.3 * ratio), coins: Math.round(contest.coins * 0.3 * ratio) };
}
