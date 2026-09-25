/**
 * Robotics — pure reads over the track's slice of the save.
 * `r` is S.tracks.robotics; `key` is today's date. No storage, no network.
 */
import { SKILLS, skillsIn } from './skills.js';
import { BUILDS, buildsIn, MILESTONES, MONTHS } from './roadmap.js';
import { MISSIONS } from './plan.js';
import { levelOf, MAX_LEVEL } from '../../game.js';
import * as P from '../../learn/plan.js';

/* --------------------------------- months --------------------------------- */

export const bossesWon = r =>
  Object.fromEntries(Object.entries(r.bosses || {}).filter(([, b]) => b.won).map(([m]) => [m, true]));

export function plan(r, key) {
  const mission = P.nextMission(r, MISSIONS.length);
  return { mission, done: P.missionsDone(r), skipped: P.missionsSkipped(r),
           unlocked: P.unlockedMonths(r.start || key, key, bossesWon(r), mission, MONTHS.length) };
}
export const isUnlocked = (r, month, key) => plan(r, key).unlocked.includes(month);
export const currentMonth = (r, key) => Math.max(...plan(r, key).unlocked);

/* --------------------------------- skills --------------------------------- */

export const skillLevel = (r, id) => levelOf(r.skills?.[id]);
/** Every skill level added up — the one number that says how far you have come. */
export const skillScore = r => SKILLS.reduce((n, s) => n + skillLevel(r, s.id), 0);
export const MAX_SCORE = SKILLS.length * MAX_LEVEL;
export const unlockedSkillIds = (r, key) => SKILLS.filter(s => isUnlocked(r, s.month, key)).map(s => s.id);

/* --------------------------------- builds --------------------------------- */

export const isVerified = (r, id) => !!r.builds?.[id]?.verified;
export const verifiedCount = r => Object.values(r.builds || {}).filter(b => b.verified).length;

export const claimedTargets = (r, exceptId) => Object.entries(r.builds || {})
  .filter(([id, b]) => id !== exceptId && b.verified && b.target)
  .map(([, b]) => `${b.target.owner}/${b.target.repo}/${b.target.path || ''}`.toLowerCase());

/* ------------------------------ milestones -------------------------------- */

export const milestoneDone = (r, ms) =>
  (ms.builds || []).every(id => isVerified(r, id))
  && (ms.skills || []).every(id => skillLevel(r, id) >= 3)
  && (!ms.direction || !!r.direction);

export function monthProgress(r, n) {
  const builds = buildsIn(n), skills = skillsIn(n), ms = MILESTONES[n] || [];
  const b = r.bosses?.[n] || {};
  const doneMs = ms.filter(m => milestoneDone(r, m)).length;
  return {
    builds: builds.filter(x => isVerified(r, x.id)).length, buildsTotal: builds.length,
    skills: skills.filter(s => skillLevel(r, s.id) >= 3).length, skillsTotal: skills.length,
    seen: skills.filter(s => skillLevel(r, s.id) >= 1).length,
    milestones: doneMs, milestonesTotal: ms.length,
    bossWon: !!b.won,
    cleared: !!b.won && doneMs === ms.length,
  };
}

/** Can month n's boss be fought today? { ok, why } */
export function bossReady(r, n, key) {
  const b = r.bosses?.[n] || {};
  if (b.won) return { ok:false, why:'Defeated.' };
  if (!isUnlocked(r, n, key)) return { ok:false, why:'This part is not open yet.' };
  const p = monthProgress(r, n);
  if (p.seen < p.skillsTotal) return { ok:false, why:`Start every skill of this part first — ${p.seen} of ${p.skillsTotal}.` };
  if (p.builds < 1) return { ok:false, why:'Verify at least one of this part\'s builds first.' };
  if (b.lastTry === key) return { ok:false, why:'You fought it today. Come back tomorrow.' };
  return { ok:true, why:'' };
}

/* --------------------------------- per day -------------------------------- */

export const emptyRoboDay = () => ({
  mission: null, drill: null, check: null, answered: 0, correct: 0, bestRun: 0, ups: 0, practiceCorrect: 0, practiceXp: 0,
});
export const roboDayOf = day => ({ ...emptyRoboDay(), ...(day?.robotics || {}) });

export function snapshot(r) {
  return {
    builds: verifiedCount(r), totalBuilds: BUILDS.length,
    bosses: Object.values(r.bosses || {}).filter(b => b.won).length,
    monthsCleared: MONTHS.filter(m => monthProgress(r, m.n).cleared).length,
    lvl5: SKILLS.filter(s => skillLevel(r, s.id) >= 5).length, totalSkills: SKILLS.length,
    maxSkill: Math.max(0, ...SKILLS.map(s => skillLevel(r, s.id))),
    skillScore: skillScore(r), missions: P.missionsDone(r) + P.missionsSkipped(r),
  };
}
