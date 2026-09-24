/** The plan: six months as a path, and each month opened up in full. */
import { S } from '../../state.js';
import { setDirection } from './actions.js';
import { plan, monthProgress, milestoneDone, isVerified, skillBox, bossReady, isUnlocked, toggleRead } from './actions.js';
import { monthOpensOn } from './model.js';
import { MONTHS, monthByN, topicsIn, buildsIn, MILESTONES, PLAN_DAYS, MONTH_DAYS, buildById, SOURCE, DIRECTIONS } from './roadmap.js';
import { skillsForTopic, skillById } from './skills.js';
import { bossFor } from './bosses.js';
import { h, raw, esc, bind, bar, shortDate } from '../../ui.js';
import { icon } from '../../icons.js';
import { openBuild } from './view-builds.js';
import { openPractice, openBoss } from './player.js';

let openMonth = null;          // null = the overview; a number = that month's page
const openTopics = new Set();  // topic ids whose <details> are expanded, kept across repaints

const pips = box => `<span class="pips" aria-label="box ${box} of 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= box ? 'on' : ''}"></i>`).join('')}</span>`;

/* -------------------------------- overview -------------------------------- */

function overview() {
  const p = plan();
  const cards = MONTHS.map(m => {
    const open = p.unlocked.includes(m.n), pr = monthProgress(m.n);
    const status = pr.cleared ? '<span class="badge good">★ Cleared</span>'
      : open ? '<span class="badge solid">Open</span>'
      : `<span class="badge mute">Opens ${esc(shortDate(monthOpensOn(S.tracks.robotics.start, m.n)))}</span>`;
    return `<button class="card tap month-card ${open ? '' : 'locked'}" data-month="${m.n}" style="--mc:${m.color}">
      <div class="row">
        <div class="month-num">${m.icon}</div>
        <div class="grow">
          <div class="between"><span class="label">Month ${m.n}</span>${status}</div>
          <div class="h3" style="margin-top:3px">${esc(m.title)}</div>
        </div>
      </div>
      <div class="month-stats">
        <span>${pr.builds}/${pr.buildsTotal} builds</span>
        <span>${pr.skills}/${pr.skillsTotal} skills held</span>
        <span>${pr.milestones}/${pr.milestonesTotal} milestones</span>
        <span>${pr.bossWon ? 'boss ✓' : 'boss —'}</span>
      </div>
      <div style="margin-top:8px">${bar(((pr.builds / pr.buildsTotal) + (pr.milestones / pr.milestonesTotal)) * 50, { color: m.color })}</div>
    </button>`;
  }).join('<div class="path-join" aria-hidden="true"></div>');

  return h`
    <div class="fade-up">
      <div class="month-path">${raw(cards)}</div>
      <div class="section"><div class="section-head"><div class="h2">Your direction</div></div>
        <div class="stack s2">${raw(DIRECTIONS.map(d => `
          <button class="card tap pad-s opt ${S.tracks.robotics.direction === d.id ? 'on' : ''}" data-dir="${d.id}">
            <div class="row"><span style="font-size:22px">${d.icon}</span>
              <div class="grow"><div class="h3">${esc(d.name)}</div><div class="tiny">${esc(d.desc)}</div></div></div>
          </button>`).join(''))}</div>
</div>
      <p class="tiny center" style="margin-top:18px">Roadmap: “${SOURCE.title}” by
        <a href="${SOURCE.url}" target="_blank" rel="noopener">${SOURCE.author}</a>.</p>
    </div>`;
}

/* ---------------------------------- month --------------------------------- */

function milestones(n) {
  return (MILESTONES[n] || []).map(ms => {
    const done = milestoneDone(ms);
    const needs = [
      ...(ms.builds || []).map(id => `<span class="need ${isVerified(id) ? 'ok' : ''}">${esc(buildById(id).name)}</span>`),
      ...(ms.skills || []).map(id => `<span class="need ${skillBox(id) >= 3 ? 'ok' : ''}">${esc(skillById(id).name)} ${skillBox(id)}/3</span>`),
      ...(ms.direction ? [`<span class="need ${S.tracks.robotics.direction ? 'ok' : ''}">choose below</span>`] : []),
    ].join('');
    return `<div class="ms-row ${done ? 'done' : ''}">
      <span class="ms-tick">${done ? '✓' : ''}</span>
      <div class="grow"><div class="ms-text">${esc(ms.text)}</div><div class="needs">${needs}</div></div>
    </div>`;
  }).join('');
}

function bossBlock(n) {
  const boss = bossFor(n), st = S.tracks.robotics.bosses[n] || {}, ready = bossReady(n);
  const action = st.won ? `<span class="badge good">Beaten ${esc(shortDate(st.wonAt))}</span>`
    : ready.ok ? `<button class="btn hot sm" data-boss="${n}">Fight</button>` : '';
  return `<div class="card boss-card ${st.won ? 'won' : ''}">
    <div class="row"><div class="boss-ico">${boss.icon}</div>
      <div class="grow"><div class="label">Boss</div><div class="h3">${esc(boss.name)}</div>
        <div class="tiny" style="margin-top:2px">${esc(st.won ? boss.won : ready.ok ? `“${boss.intro}”` : ready.why)}</div>
        ${st.attempts ? `<div class="tiny" style="margin-top:2px">${st.attempts} attempt${st.attempts === 1 ? '' : 's'} · best ${st.bestDealt || 0} damage</div>` : ''}
      </div>${action}</div>
  </div>`;
}

function buildRows(n) {
  return buildsIn(n).map(b => {
    const st = S.tracks.robotics.builds[b.id];
    const badge = st?.verified ? '<span class="badge good">✓ verified</span>'
      : st?.checks ? `<span class="badge warn">${st.checks.filter(c => c.pass).length}/${st.checks.length}</span>`
      : '<span class="badge mute">to do</span>';
    return `<button class="build-row" data-build="${b.id}">
      <div class="grow"><div class="h3">${esc(b.name)}</div><div class="tiny">${esc(b.cost)}</div></div>${badge}
    </button>`;
  }).join('');
}

function topicBlock(t, open) {
  const skills = skillsForTopic(t.id);
  const read = t.resources.filter(r => r.url && S.tracks.robotics.read[r.url]).length;
  const linked = t.resources.filter(r => r.url).length;
  const res = t.resources.map(r => {
    const done = r.url && S.tracks.robotics.read[r.url];
    return `<div class="res ${done ? 'done' : ''}">
      ${r.url ? `<button class="res-check" data-read="${esc(r.url)}" aria-label="${done ? 'Mark unread' : 'Mark done'}">${done ? '✓' : ''}</button>` : '<span class="res-check static">$</span>'}
      <div class="grow">
        <div class="res-name">${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)} ${icon('ext', 12).value}</a>` : esc(r.name)}</div>
        ${r.note ? `<div class="tiny">${esc(r.note)}</div>` : ''}
      </div>
      <span class="badge price">${esc(r.price)}</span>
    </div>`;
  }).join('');
  const sk = skills.map(s => `<button class="skill-chip" data-practice="${s.id}" ${open ? '' : 'disabled'}>
      <span>${esc(s.name)}</span>${pips(skillBox(s.id))}</button>`).join('');

  return `<details class="topic card flush" data-topic="${t.id}" ${openTopics.has(t.id) ? 'open' : ''}>
    <summary>
      <div class="grow"><div class="h3">${esc(t.name)}</div>
        <div class="tiny">${linked ? `${read}/${linked} read · ` : ''}${skills.length} skill${skills.length === 1 ? '' : 's'}</div></div>
      <span class="chev">${icon('chevron', 16).value}</span>
    </summary>
    <div class="topic-bd">
      <p class="sub">${esc(t.why)}</p>
      <div class="label" style="margin-top:14px">Focus on</div>
      <ul class="focus">${t.focus.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      ${res ? `<div class="label" style="margin-top:14px">Resources</div><div class="res-list">${res}</div>` : ''}
      ${sk ? `<div class="label" style="margin-top:14px">Practise</div><div class="wrap" style="margin-top:6px">${sk}</div>` : ''}
    </div>
  </details>`;
}

function monthPage(n) {
  const m = monthByN(n), open = isUnlocked(n), pr = monthProgress(n);
  const startDay = MONTH_DAYS * (n - 1) + 1;
  return `<div class="fade-up">
    <button class="act-back" data-act="back">‹ All months</button>
    <div class="month-head" style="--mc:${m.color};margin-top:12px">
      <div class="label">Month ${n} · days ${startDay}–${startDay + MONTH_DAYS - 1}</div>
      <div class="h1" style="margin-top:6px">${m.icon} ${esc(m.title)}</div>
      <div class="sub" style="margin-top:6px">${esc(m.goal)}</div>
      ${open ? '' : `<div class="badge" style="margin-top:12px">Opens ${esc(shortDate(monthOpensOn(S.tracks.robotics.start, n)))} — read ahead freely</div>`}
    </div>

    <div class="section">
      <div class="section-head"><div class="h2">Milestones</div><span class="tiny">${pr.milestones}/${pr.milestonesTotal}</span></div>
      <div class="card flush ms-list">${milestones(n)}</div>
    </div>

    <div class="section">${bossBlock(n)}</div>

    <div class="section">
      <div class="section-head"><div class="h2">Builds</div><span class="tiny">${pr.builds}/${pr.buildsTotal}</span></div>
      <div class="card flush">${buildRows(n)}</div>
    </div>

    <div class="section">
      <div class="section-head"><div class="h2">Topics</div></div>
      <div class="stack s2">${topicsIn(n).map(t => topicBlock(t, open)).join('')}</div>
    </div>
  </div>`;
}

/* ---------------------------------- view ---------------------------------- */

export const showMonth = n => { openMonth = n; };

export function render() {
  return openMonth ? monthPage(openMonth) : overview();
}

export function mount(root, rerender) {
  bind(root, {
    back: () => { openMonth = null; rerender(); document.getElementById('view').scrollTop = 0; },
  });
  root.querySelectorAll('[data-month]').forEach(b => {
    b.onclick = () => { openMonth = +b.dataset.month; rerender(); document.getElementById('view').scrollTop = 0; };
  });
  root.querySelectorAll('[data-build]').forEach(b => { b.onclick = () => openBuild(b.dataset.build, rerender); });
  root.querySelectorAll('[data-boss]').forEach(b => { b.onclick = () => openBoss(+b.dataset.boss, rerender); });
  root.querySelectorAll('[data-practice]').forEach(b => { b.onclick = () => openPractice(b.dataset.practice, rerender); });
  root.querySelectorAll('[data-dir]').forEach(b => { b.onclick = () => setDirection(b.dataset.dir); });

  // Ticking a resource repaints the page; remembering which topics are open is
  // what stops that repaint collapsing the one you are reading.
  root.querySelectorAll('details.topic').forEach(d => {
    d.addEventListener('toggle', () => { d.open ? openTopics.add(d.dataset.topic) : openTopics.delete(d.dataset.topic); });
  });
  root.querySelectorAll('[data-read]').forEach(b => {
    b.onclick = e => { e.preventDefault(); toggleRead(b.dataset.read); };
  });
}
