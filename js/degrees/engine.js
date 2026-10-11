/**
 * Each degree's practice, registered with the shared engine — so a degree
 * check levels skills and pays exactly as a mission's check does. Kept apart
 * from the screens so the tests can load it without a page.
 */
import { S } from '../state.js';
import * as E from '../learn/session.js';
import { skillById } from '../skillbook.js';
import { DEGREES } from './load.js';
import { COURSE_PRACTICE } from './practice/index.js';

for (const d of DEGREES) {
  const ids = [...new Set(Object.entries(COURSE_PRACTICE).filter(([k]) => k.startsWith(`${d.id}/`)).flatMap(([, v]) => v))];
  E.registerTrack({
    id: d.id, kind: 'degree', name: d.title, short: d.short, color: d.color, slice: () => S.tracks[d.id],
    plan: [], months: [], skills: ids.map(skillById).filter(Boolean), skillById: id => (ids.includes(id) ? skillById(id) : null),
    unlockedSkillIds: () => ids, budget: () => 8, lootSet: 'desk',
  });
}
