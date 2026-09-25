/**
 * The shape every track's plan shares: 120 missions, four months of thirty,
 * four weeks a month, a boss on day 30.
 *
 * A track writes its days in order; this numbers them. Everything about the
 * pointer — which mission is today's, what counts as done — is a pure function
 * of the plan and the track's slice of the save, so the tests can drive it.
 *
 *   r.missions   { n: day }   missions finished, by the day they were finished
 *   r.skipped    { n: day }   missions skipped by passing a week's test
 */
import { daysBetween } from '../game.js';

export const MONTH_DAYS = 30;

/** Week within a month: days 1–7, 8–14, 15–21, then 22–30 (the boss closes week 4). */
export const weekInMonth = day => Math.min(4, Math.floor((day - 1) / 7) + 1);

/** Number a track's days. `days` is every day in order; each 30th must be a boss. */
export function numberDays(days) {
  return days.map((d, i) => {
    const month = Math.floor(i / MONTH_DAYS) + 1, day = (i % MONTH_DAYS) + 1;
    const week = (month - 1) * 4 + weekInMonth(day);
    return { skills: [], ...d, n: i + 1, month, day, week, boss: day === MONTH_DAYS };
  });
}

/* --------------------------------- pointer -------------------------------- */

export const isComplete = (r, n) => !!(r.missions?.[n] || r.skipped?.[n]);
export const missionsDone = r => Object.keys(r.missions || {}).length;
export const missionsSkipped = r => Object.keys(r.skipped || {}).length;

/** The first mission not yet finished or skipped. Past the end, the last one. */
export function nextMission(r, total) {
  for (let n = 1; n <= total; n++) if (!isComplete(r, n)) return n;
  return total;
}

/** The mission finished on a given day, if any. Skipping never uses up a day. */
export function missionDoneOn(r, key) {
  const hit = Object.entries(r.missions || {}).find(([, d]) => d === key);
  return hit ? +hit[0] : 0;
}

/** Today's mission: the one finished today, or the next one to do. */
export function todaysMission(r, plan, key) {
  const doneN = missionDoneOn(r, key);
  const n = doneN || nextMission(r, plan.length);
  const finished = plan.every(m => isComplete(r, m.n));
  return { ...plan[n - 1], done: !!doneN, finished };
}

/**
 * A month opens when your missions reach it, when the calendar does, or early
 * once you beat the boss before it.
 */
export function unlockedMonths(start, key, won = {}, mission = 1, months = 4) {
  const day = Math.max(0, daysBetween(start || key, key));
  const open = [];
  for (let n = 1; n <= months; n++) {
    const byDate = day >= MONTH_DAYS * (n - 1);
    const byMission = mission > MONTH_DAYS * (n - 1);
    const early = n > 1 && open.includes(n - 1) && !!won[n - 1];
    if (n === 1 || byDate || byMission || early) open.push(n);
  }
  return open;
}

/* --------------------------------- weeks ---------------------------------- */

export const weekDays = (plan, week) => plan.filter(m => m.week === week);
export const weekSkills = (plan, week) => weekDays(plan, week).flatMap(m => m.skills);

/**
 * A week can be tested out of when it introduces at least two skills to test,
 * and it still has days left to skip. The boss is never skipped.
 */
export function testOutFor(r, plan, week) {
  const skills = weekSkills(plan, week);
  const left = weekDays(plan, week).filter(m => !m.boss && !isComplete(r, m.n));
  return { week, skills, left, ok: skills.length >= 2 && left.length > 0 };
}
