/** Skills: every skill the app can check, its level, and when it comes back. Tap one to practise it. */
import { skillLevel, skillEntry, skillScore, isUnlocked, XP } from './actions.js';
import { SKILLS, skillsIn } from './skills.js';
import { MONTHS, topicById } from './roadmap.js';
import { LEVELS, MAX_LEVEL, lastRound, daysBetween, dayKey } from '../../game.js';
import { MAX_SCORE } from './model.js';
import { esc, relDays, splitBar } from '../../ui.js';
import { icon } from '../../icons.js';
import { openPractice, clock } from './player.js';

/* Level bands, each a fill rather than coloured text. */
const BANDS = [
  { name: 'not started', test: l => l === 0,  color: 'var(--muted)' },
  { name: 'level 1–2',   test: l => l >= 1 && l <= 2, color: 'var(--red)' },
  { name: 'level 3–4',   test: l => l >= 3 && l <= 4, color: 'var(--yellow)' },
  { name: 'level 5–7',   test: l => l >= 5 && l <= 7, color: 'var(--acid)' },
  { name: 'level 8–10',  test: l => l >= 8, color: 'var(--cyan)' },
];
const bandOf = l => BANDS.find(b => b.test(l));

function header() {
  const open = SKILLS.filter(s => isUnlocked(s.month));
  const counts = BANDS.map(b => open.filter(s => b.test(skillLevel(s.id))).length);
  return `<div class="card">
    <div class="between"><div><div class="label">Skill score</div><div class="big-num">${skillScore()}</div></div>
      <span class="tiny">of ${MAX_SCORE}</span></div>
    <div style="margin-top:12px">${splitBar(counts.map((c, i) => ({ pct: open.length ? (c / open.length) * 100 : 0, color: BANDS[i].color, name: BANDS[i].name })))}</div>
    <div class="box-legend">${counts.map((c, i) => `<span><i style="background:${BANDS[i].color}"></i><b>${c}</b> ${BANDS[i].name}</span>`).join('')}</div>
  </div>`;
}

function explainer() {
  const rows = [1, 3, 5, 7, 10].map(l => `<span><b>Lv ${l}</b> ${LEVELS[l][0]} questions · ${LEVELS[l][1]}s typed / ${LEVELS[l][2]}s choice</span>`).join('');
  return `<details class="card sunk flush explain">
    <summary><span class="h3 grow">How levels work</span><span class="chev">${icon('chevron', 16).value}</span></summary>
    <div class="topic-bd"><p class="sub">Each skill has a level from 1 to ${MAX_LEVEL}. The higher it is, the more questions its round asks and the less time you get for each.</p>
      <div class="lv-table">${rows}</div>
      <p class="sub" style="margin-top:8px">All right: up a level, and it comes back later. One wrong: same level, back tomorrow.
        Two or more wrong: down a level, back tomorrow. Level 3 counts for milestones.</p>
      <p class="sub" style="margin-top:8px">Levels only move in the daily mission. Practice has no clock and moves nothing —
        it pays ${XP.practiceRight} XP a right answer, up to ${XP.practiceCap} a day.</p></div>
  </details>`;
}

function skillRow(s) {
  const e = skillEntry(s.id), lvl = skillLevel(s.id), today = dayKey();
  const last = lastRound(e);
  const due = lvl && e.due ? daysBetween(today, e.due) : null;
  const when = !lvl ? '<span class="badge mute">new</span>'
    : due <= 0 ? '<span class="badge warn">due</span>'
    : `<span class="tiny">back ${relDays(due)}</span>`;
  const meta = last ? `last ${last.right}/${last.asked} in ${clock(last.secs)}` : topicById(s.topic).name;
  return `<button class="skill-row" data-practice="${s.id}">
    <span class="lv-badge" style="background:${bandOf(lvl).color}">${lvl || '–'}</span>
    <div class="grow">
      <div class="h3">${esc(s.name)}</div>
      <div class="tiny truncate">${esc(meta)}${e?.best > lvl ? ` · best ${e.best}` : ''}</div>
    </div>
    <div class="skill-meta">${when}</div>
  </button>`;
}

function monthGroup(m) {
  const skills = skillsIn(m.n), open = isUnlocked(m.n);
  if (!open) {
    return `<div class="card sunk pad-s locked-group">
      <div class="between"><span class="h3">${m.icon} Part ${m.n} · ${esc(m.short)}</span><span class="badge mute">${skills.length} skills · locked</span></div>
    </div>`;
  }
  const held = skills.filter(s => skillLevel(s.id) >= 3).length;
  return `<div>
    <div class="section-head"><div class="h2">${m.icon} Part ${m.n}</div><span class="tiny">${held}/${skills.length} at level 3+</span></div>
    <div class="card flush">${skills.map(skillRow).join('')}</div>
  </div>`;
}

export function render() {
  return `<div class="stack s4 fade-up">
    ${header()}
    ${explainer()}
    ${MONTHS.map(monthGroup).join('')}
  </div>`;
}

export function mount(root, rerender) {
  root.querySelectorAll('[data-practice]').forEach(b => { b.onclick = () => openPractice(b.dataset.practice, rerender); });
}
