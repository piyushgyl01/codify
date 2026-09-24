/** Skills: every drillable skill, where it sits in its Leitner box, and practice. */
import { S, getDay } from '../../state.js';
import { drillDoneToday, dueSkills, skillBox, skillEntry, isUnlocked, XP } from './actions.js';
import { SKILLS, skillsIn } from './skills.js';
import { MONTHS, topicById } from './roadmap.js';
import { INTERVALS, MAX_BOX } from '../../game.js';
import { esc, bind, relDays, splitBar } from '../../ui.js';
import { daysBetween, dayKey } from '../../game.js';
import { icon } from '../../icons.js';
import { openDrill, openPractice, resumeSession } from './player.js';

const BOX_COLOR = ['var(--muted)', 'var(--red)', 'var(--orange)', 'var(--yellow)', 'var(--acid)', 'var(--cyan)'];
const pips = box => `<span class="pips">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= box ? 'on' : ''}" style="${i <= box ? `background:${BOX_COLOR[box]}` : ''}"></i>`).join('')}</span>`;

function header() {
  const due = dueSkills().length, done = drillDoneToday(), day = { drill: getDay().robotics?.drill };
  const open = SKILLS.filter(s => isUnlocked(s.month));
  const counts = [0, 1, 2, 3, 4, 5].map(b => open.filter(s => skillBox(s.id) === b).length);
  const action = S.active ? `<button class="btn primary sm" data-act="resume">Resume</button>`
    : done ? `<span class="badge good">Drill ✓ ${day.drill.score}/${day.drill.total}</span>`
    : `<button class="btn primary sm" data-act="drill">Start drill</button>`;
  return `<div class="card">
    <div class="between"><div><div class="label">Today</div>
      <div class="h2" style="margin-top:4px">${due ? `${due} review${due === 1 ? '' : 's'} due` : 'Nothing due'}</div></div>${action}</div>
    <div style="margin-top:14px">${splitBar(counts.map((c, b) => ({ pct: open.length ? (c / open.length) * 100 : 0, color: BOX_COLOR[b], name: `box ${b}` })))}</div>
    <div class="box-legend">${counts.map((c, b) => `<span><i style="background:${BOX_COLOR[b]}"></i><b>${c}</b> ${b === 0 ? 'new' : `in box ${b}`}</span>`).join('')}</div>
  </div>`;
}

function explainer() {
  return `<details class="card sunk flush explain">
    <summary><span class="h3 grow">How the boxes work</span><span class="chev">${icon('chevron', 16).value}</span></summary>
    <div class="topic-bd"><p class="sub">Every skill sits in one of five boxes. A right answer in the daily drill moves it up
      a box and pushes its next review further out — ${INTERVALS.slice(1).map((d, i) => `box ${i + 1}: ${d} day${d === 1 ? '' : 's'}`).join(', ')}.
      A wrong answer sends it back to box 1. Box 3 counts as held for milestones.</p>
      <p class="sub" style="margin-top:8px">Practice never moves a skill between boxes — only a scheduled review can, or the
      schedule would mean nothing. Practice pays ${XP.practiceRight} XP a right answer, up to ${XP.practiceCap} a day.</p></div>
  </details>`;
}

function skillRow(s) {
  const e = skillEntry(s.id), box = skillBox(s.id), today = dayKey();
  const acc = e?.seen ? e.right : null;
  const due = e?.box ? daysBetween(today, e.due) : null;
  const when = !e?.box ? '<span class="badge mute">new</span>'
    : due <= 0 ? '<span class="badge warn">due</span>'
    : `<span class="tiny">next ${relDays(due)}</span>`;
  const topic = topicById(s.topic);
  return `<button class="skill-row" data-practice="${s.id}">
    <div class="grow">
      <div class="h3">${esc(s.name)}</div>
      <div class="tiny truncate">${esc(topic.name)}${acc != null ? ` · ${e.right}/${e.seen} right` : ''}</div>
    </div>
    <div class="skill-meta">${pips(box)}${when}</div>
  </button>`;
}

function monthGroup(m) {
  const skills = skillsIn(m.n), open = isUnlocked(m.n);
  if (!open) {
    return `<div class="card sunk pad-s locked-group">
      <div class="between"><span class="h3">${m.icon} Month ${m.n} · ${esc(m.short)}</span><span class="badge mute">${skills.length} skills · locked</span></div>
    </div>`;
  }
  const held = skills.filter(s => skillBox(s.id) >= 3).length;
  return `<div>
    <div class="section-head"><div class="h2">${m.icon} Month ${m.n}</div><span class="tiny">${held}/${skills.length} held</span></div>
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
  bind(root, {
    drill:  () => openDrill(rerender),
    resume: () => resumeSession(rerender),
  });
  root.querySelectorAll('[data-practice]').forEach(b => { b.onclick = () => openPractice(b.dataset.practice, rerender); });
}
