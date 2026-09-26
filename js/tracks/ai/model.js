/**
 * AI — pure reads over the track's slice of the save.
 * `r` is S.tracks.ai; `key` is today's date. No storage, no network.
 */
import { SKILLS, skillsIn } from './skills.js';
import { BUILDS, buildsIn, MONTHS, MISSIONS, capstoneOf } from './plan.js';
import { levelOf, MAX_LEVEL } from '../../game.js';
import * as P from '../../learn/plan.js';

export const bossesWon = r =>
  Object.fromEntries(Object.entries(r.bosses || {}).filter(([, b]) => b.won).map(([m]) => [m, true]));

export function plan(r, key) {
  const mission = P.nextMission(r, MISSIONS.length);
  return { mission, done: P.missionsDone(r), skipped: P.missionsSkipped(r),
           unlocked: P.unlockedMonths(r.start || key, key, bossesWon(r), mission, MONTHS.length) };
}
export const isUnlocked = (r, part, key) => plan(r, key).unlocked.includes(part);
export const currentPart = (r, key) => Math.max(...plan(r, key).unlocked);

export const skillLevel = (r, id) => levelOf(r.skills?.[id]);
export const skillScore = r => SKILLS.reduce((n, s) => n + skillLevel(r, s.id), 0);
export const MAX_SCORE = SKILLS.length * MAX_LEVEL;
export const unlockedSkillIds = (r, key) => SKILLS.filter(s => isUnlocked(r, s.month, key)).map(s => s.id);

export const isVerified = (r, id) => !!r.builds?.[id]?.verified;
export const verifiedCount = r => Object.values(r.builds || {}).filter(b => b.verified).length;
export const claimedTargets = (r, exceptId) => Object.entries(r.builds || {})
  .filter(([id, b]) => id !== exceptId && b.verified && b.target && !b.target.kind)
  .map(([, b]) => `${b.target.owner}/${b.target.repo}/${b.target.path || ''}`.toLowerCase());

export function partProgress(r, n) {
  const builds = buildsIn(n), skills = skillsIn(n), b = r.bosses?.[n] || {};
  return {
    builds: builds.filter(x => isVerified(r, x.id)).length, buildsTotal: builds.length,
    skills: skills.filter(s => skillLevel(r, s.id) >= 3).length, skillsTotal: skills.length,
    seen: skills.filter(s => skillLevel(r, s.id) >= 1).length,
    capstone: isVerified(r, capstoneOf(n).id), bossWon: !!b.won,
  };
}

/** A part's boss can be fought once its skills are started and its paper reproduction is verified. */
export function bossReady(r, n, key) {
  const b = r.bosses?.[n] || {};
  if (b.won) return { ok:false, why:'Defeated.' };
  if (!isUnlocked(r, n, key)) return { ok:false, why:'This part is not open yet.' };
  const p = partProgress(r, n);
  if (p.seen < p.skillsTotal) return { ok:false, why:`Start every skill of this part first — ${p.seen} of ${p.skillsTotal}.` };
  if (!p.capstone) return { ok:false, why:`Verify the reproduction first: ${capstoneOf(n).name}.` };
  if (b.lastTry === key) return { ok:false, why:'You fought it today. Come back tomorrow.' };
  return { ok:true, why:'' };
}

/** Frontier entries: r.frontier[n] = { item, picked, verified }. */
export const frontierLogged = r => Object.values(r.frontier || {}).filter(f => f.verified).length;

export function snapshot(r) {
  return {
    aiMissions: P.missionsDone(r) + P.missionsSkipped(r),
    aiScore: skillScore(r),
    aiBuilds: verifiedCount(r), aiTotalBuilds: BUILDS.length,
    aiBosses: Object.values(r.bosses || {}).filter(b => b.won).length,
    aiCapstones: MONTHS.filter(m => isVerified(r, capstoneOf(m.n).id)).length,
    frontier: frontierLogged(r),
  };
}
