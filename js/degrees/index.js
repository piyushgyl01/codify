/**
 * The five degrees from Course Atlas, as Codify tracks.
 *
 * Each is a track like any other — it sits on the Tracks tab, puts a card on
 * Today, tags the focus timer — with a degree's own screens. Its practice runs
 * through the shared engine, so a degree check levels skills and pays exactly
 * like a mission's check does.
 */
import './engine.js';
import { DEGREES } from './load.js';
import { hubFor, todayCard, mountToday, timerTags } from './views.js';

export const DEGREE_TRACKS = DEGREES.map(d => ({
  id: d.id, kind: 'degree', name: d.title, nav: d.short, icon: d.icon, color: d.color,
  tagline: `${d.duration}, ${d.courses} courses in order, every one built on free material — ${d.concentrations.length} concentrations to choose from.`,
  checks: 'practice the app marks, and time on the timer — ticking work done and marking assessments is your own account',
  hub: hubFor(d.id),
  today: { render: () => todayCard(d.id), mount: (root, rerender) => mountToday(d.id, root, rerender), timerTags: () => timerTags(d.id) },
}));
