/**
 * The tracks. Each is one skill area with its own content and its own way of
 * checking your work, sharing one character: level, streak, timer, gear, quests.
 *
 * Adding a track means a folder beside these two — its data, a pure model over
 * its slice of the save, the actions that change it, a hub and a Today card —
 * and one entry here. Nothing else in the app has to know it exists.
 */
import * as cpHub from './cp/hub.js';
import * as cpToday from './cp/today.js';
import * as roHub from './robotics/hub.js';
import * as roToday from './robotics/today.js';

export const TRACKS = [
  { id:'cp', name:'Programming', nav:'Code', icon:'⌨️', navIcon:'code', color:'var(--blue)',
    tagline:'Codeforces problems at real rating tiers. The judge decides, not you.',
    checks:'accepted submissions on Codeforces', hub: cpHub, today: cpToday },
  { id:'robotics', name:'Robotics', nav:'Robots', icon:'🤖', navIcon:'robot', color:'var(--acid)',
    tagline:'A six-month roadmap: graded drills, GitHub-verified builds, a boss every month.',
    checks:'graded answers and builds on your GitHub', hub: roHub, today: roToday },
];

export const trackById = id => TRACKS.find(t => t.id === id) || null;
