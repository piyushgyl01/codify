/**
 * Robotics — pure reads over the track's slice of the save.
 * `r` is S.tracks.robotics; `key` is today's date. No storage, no network.
 */
import { SKILLS, skillsIn } from './skills.js';
import { BUILDS, buildsIn, MILESTONES, MONTHS, MONTH_DAYS } from './roadmap.js';
import { daysBetween, addDays, isDue, MAX_BOX } from '../../game.js';

/* --------------------------------- months --------------------------------- */

export const planDay = (start, key) => Math.max(0, daysBetween(start, key));
export const calendarMonth = (start, key) => Math.min(6, Math.floor(planDay(start, key) / MONTH_DAYS) + 1);
export const monthOpensOn = (start, n) => addDays(start, MONTH_DAYS * (n - 1));

/**
 * Month n opens when the calendar reaches it, or early once you beat the boss
 * before it — nobody waits on a parcel, and nobody ahead waits on the calendar.
 */
export function unlockedMonths(start, key, won = {}) {
  const day = planDay(start, key);
  const open = [];
  for (let n = 1; n <= 6; n++) {
    const byDate = day >= MONTH_DAYS * (n - 1);
    const early = n > 1 && open.includes(n - 1) && !!won[n - 1];
    if (n === 1 || byDate || early) open.push(n);
  }
  return open;
}

export const bossesWon = r =>
  Object.fromEntries(Object.entries(r.bosses || {}).filter(([, b]) => b.won).map(([m]) => [m, true]));

export function plan(r, key) {
  const start = r.start || key;
  return { day: planDay(start, key), month: calendarMonth(start, key), unlocked: unlockedMonths(start, key, bossesWon(r)) };
}
export const isUnlocked = (r, month, key) => plan(r, key).unlocked.includes(month);
export const currentMonth = (r, key) => Math.max(...plan(r, key).unlocked);

/* --------------------------------- skills --------------------------------- */

export const skillBox = (r, id) => r.skills?.[id]?.box || 0;
export const unlockedSkillIds = (r, key) => SKILLS.filter(s => isUnlocked(r, s.month, key)).map(s => s.id);
export const dueSkills = (r, key) => unlockedSkillIds(r, key).filter(id => isDue(r.skills?.[id], key));

/* --------------------------------- builds --------------------------------- */

export const isVerified = (r, id) => !!r.builds?.[id]?.verified;
export const verifiedCount = r => Object.values(r.builds || {}).filter(b => b.verified).length;

export const claimedTargets = (r, exceptId) => Object.entries(r.builds || {})
  .filter(([id, b]) => id !== exceptId && b.verified && b.target)
  .map(([, b]) => `${b.target.owner}/${b.target.repo}/${b.target.path || ''}`.toLowerCase());

/* ------------------------------ milestones -------------------------------- */

export const milestoneDone = (r, ms) =>
  (ms.builds || []).every(id => isVerified(r, id))
  && (ms.skills || []).every(id => skillBox(r, id) >= 3)
  && (!ms.direction || !!r.direction);

export function monthProgress(r, n) {
  const builds = buildsIn(n), skills = skillsIn(n), ms = MILESTONES[n] || [];
  const b = r.bosses?.[n] || {};
  const doneMs = ms.filter(m => milestoneDone(r, m)).length;
  return {
    builds: builds.filter(x => isVerified(r, x.id)).length, buildsTotal: builds.length,
    skills: skills.filter(s => skillBox(r, s.id) >= 3).length, skillsTotal: skills.length,
    seen: skills.filter(s => skillBox(r, s.id) >= 1).length,
    milestones: doneMs, milestonesTotal: ms.length,
    bossWon: !!b.won,
    cleared: !!b.won && doneMs === ms.length,
  };
}

/** Can month n's boss be fought today? { ok, why } */
export function bossReady(r, n, key) {
  const b = r.bosses?.[n] || {};
  if (b.won) return { ok:false, why:'Defeated.' };
  if (!isUnlocked(r, n, key)) return { ok:false, why:'This month is not open yet.' };
  const p = monthProgress(r, n);
  if (p.seen < p.skillsTotal) return { ok:false, why:`Meet every skill in a drill or practice first — ${p.seen} of ${p.skillsTotal}.` };
  if (p.builds < 1) return { ok:false, why:'Verify at least one of this month\'s builds first.' };
  if (b.lastTry === key) return { ok:false, why:'You fought it today. Come back tomorrow.' };
  return { ok:true, why:'' };
}

/* --------------------------------- per day -------------------------------- */

export const emptyRoboDay = () => ({
  drill: null, answered: 0, correct: 0, bestRun: 0, reviewCorrect: 0, practiceCorrect: 0, practiceXp: 0,
});
export const roboDayOf = day => ({ ...emptyRoboDay(), ...(day?.robotics || {}) });

export function snapshot(r) {
  return {
    builds: verifiedCount(r), totalBuilds: BUILDS.length,
    bosses: Object.values(r.bosses || {}).filter(b => b.won).length,
    monthsCleared: MONTHS.filter(m => monthProgress(r, m.n).cleared).length,
    box5: SKILLS.filter(s => skillBox(r, s.id) >= MAX_BOX).length, totalSkills: SKILLS.length,
  };
}
