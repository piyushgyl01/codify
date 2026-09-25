/** The shared player, bound to the robotics track. */
import * as P from '../../views/player.js';

export const openMission = rerender => P.openMission('robotics', rerender);
export const openPractice = (skillId, rerender) => P.openPractice('robotics', skillId, rerender);
export const openTestOut = (week, rerender) => P.openTestOut('robotics', week, rerender);
export const { openBoss, resumeSession, clock, versus } = P;
