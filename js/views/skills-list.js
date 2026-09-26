/** Every skill a track can check, grouped by part: its level, when it comes back, and practice. */
import { S, today } from '../state.js';
import * as E from '../learn/session.js';
import { LEVELS, MAX_LEVEL, lastRound, daysBetween, levelOf } from '../game.js';
import { esc, relDays, splitBar } from '../ui.js';
import { icon } from '../icons.js';
import { openPractice, clock } from './player.js';

const BANDS = [
  { name: 'not started', test: l => l === 0, color: 'var(--muted)' },
  { name: 'level 1–2', test: l => l >= 1 && l <= 2, color: 'var(--red)' },
  { name: 'level 3–4', test: l => l >= 3 && l <= 4, color: 'var(--yellow)' },
  { name: 'level 5–7', test: l => l >= 5 && l <= 7, color: 'var(--acid)' },
  { name: 'level 8–10', test: l => l >= 8, color: 'var(--cyan)' },
];
const bandOf = l => BANDS.find(b => b.test(l));

export function render(track, { topicName = () => '' } = {}) {
  const cfg = E.trackCfg(track), st = S.tracks[track].skills || {}, open = new Set(cfg.unlockedSkillIds(today()));
  const level = id => levelOf(st[id]);
  const counts = BANDS.map(b => cfg.skills.filter(s => open.has(s.id) && b.test(level(s.id))).length);
  const header = `<div class="card">
    <div class="between"><div><div class="label">Skill score</div><div class="big-num">${E.skillScore(track)}</div></div><span class="tiny">of ${E.maxScore(track)}</span></div>
    <div style="margin-top:12px">${splitBar(counts.map((c, i) => ({ pct: open.size ? (c / open.size) * 100 : 0, color: BANDS[i].color, name: BANDS[i].name })))}</div>
    <div class="box-legend">${counts.map((c, i) => `<span><i style="background:${BANDS[i].color}"></i><b>${c}</b> ${BANDS[i].name}</span>`).join('')}</div>
  </div>`;
  const rows = [1, 3, 5, 7, 10].map(l => `<span><b>Lv ${l}</b> ${LEVELS[l][0]} questions · ${LEVELS[l][1]}s typed / ${LEVELS[l][2]}s choice</span>`).join('');
  const explain = `<details class="card sunk flush explain">
    <summary><span class="h3 grow">How levels work</span><span class="chev">${icon('chevron', 16).value}</span></summary>
    <div class="topic-bd"><p class="sub">Each skill has a level from 1 to ${MAX_LEVEL}. Higher levels ask more questions with less time on each.</p>
      <div class="lv-table">${rows}</div>
      <p class="sub" style="margin-top:8px">All right: up a level, back later. One wrong: same level, back tomorrow. Two wrong: down a level. Practice has no clock and moves nothing.</p></div>
  </details>`;
  const row = s => {
    const e = st[s.id], l = level(s.id), last = lastRound(e), due = l && e.due ? daysBetween(today(), e.due) : null;
    const when = !l ? '<span class="badge mute">new</span>' : due <= 0 ? '<span class="badge warn">due</span>' : `<span class="tiny">back ${relDays(due)}</span>`;
    return `<button class="skill-row" data-practice="${s.id}" ${open.has(s.id) ? '' : 'disabled'}>
      <span class="lv-badge" style="background:${bandOf(l).color}">${l || '–'}</span>
      <div class="grow"><div class="h3">${esc(s.name)}</div>
        <div class="tiny truncate">${esc(last ? `last ${last.right}/${last.asked} in ${clock(last.secs)}` : topicName(s.topic))}</div></div>
      <div class="skill-meta">${when}</div></button>`;
  };
  const groups = cfg.months.map(m => {
    const skills = cfg.skills.filter(s => s.month === m.n);
    if (!skills.length) return '';
    if (!skills.some(s => open.has(s.id))) {
      return `<div class="card sunk pad-s locked-group"><div class="between"><span class="h3">${m.icon} Part ${m.n} · ${esc(m.short)}</span>
        <span class="badge mute">${skills.length} skills · locked</span></div></div>`;
    }
    return `<div><div class="section-head"><div class="h2">${m.icon} Part ${m.n}</div>
      <span class="tiny">${skills.filter(s => level(s.id) >= 3).length}/${skills.length} at level 3+</span></div>
      <div class="card flush">${skills.map(row).join('')}</div></div>`;
  }).join('');
  return `<div class="stack s4 fade-up">${header}${explain}${groups}</div>`;
}

export function mount(root, track, rerender) {
  root.querySelectorAll('[data-practice]').forEach(b => { b.onclick = () => openPractice(track, b.dataset.practice, rerender); });
}
