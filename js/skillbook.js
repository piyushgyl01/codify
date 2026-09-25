/**
 * Every skill the app can quiz, from every track, in one place — so a question
 * can be generated and graded knowing only its skill id. Ids are unique across
 * tracks; a test checks that.
 */
import { SKILLS as ROBOTICS } from './tracks/robotics/skills.js';
import { SKILLS as CODE } from './tracks/cp/skills.js';

export const ALL_SKILLS = [...ROBOTICS, ...CODE];
const byId = new Map(ALL_SKILLS.map(s => [s.id, s]));
export const skillById = id => byId.get(id) || null;
