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
import * as aiHub from './ai/hub.js';
import * as aiToday from './ai/today.js';

export const TRACKS = [
  { id:'cp', name:'Programming', nav:'Code', icon:'🧩', navIcon:'code', color:'var(--blue)',
    tagline:'120 daily missions over four months: learn a DSA idea, prove it, solve at your level. The judge decides.',
    checks:'accepted submissions on Codeforces', hub: cpHub, today: cpToday },
  { id:'robotics', name:'Robotics', nav:'Robots', icon:'🤖', navIcon:'robot', color:'var(--acid)',
    tagline:'120 daily missions over four months: learn one thing, prove it, build a step. Skills level up as you go.',
    checks:'graded answers and builds on your GitHub', hub: roHub, today: roToday },
  { id:'ai', name:'AI', nav:'AI', icon:'🧠', navIcon:'spark', color:'var(--violet)',
    tagline:'240 missions in eight parts, from the maths to the frontier: learn, prove it, build, and reproduce a paper each part.',
    checks:'graded answers, and builds on GitHub and Hugging Face', hub: aiHub, today: aiToday },
];

export const trackById = id => TRACKS.find(t => t.id === id) || null;
