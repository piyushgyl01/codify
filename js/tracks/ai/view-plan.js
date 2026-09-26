/** The AI plan: eight parts, the 240-mission map, and each part opened up — topics, links, builds and the boss. */
import { S } from '../../state.js';
import { isUnlocked, partProgress, bossReady, isVerified } from './actions.js';
import { MONTHS, monthByN, topicsIn, buildsIn, bossFor, capstoneOf } from './plan.js';
import { skillsIn } from './skills.js';
import { MONTH_DAYS } from '../../learn/plan.js';
import { esc, bar, shortDate } from '../../ui.js';
import { icon } from '../../icons.js';
import { missionMap } from '../../views/mission-parts.js';
import { openBuild } from './view-builds.js';
import * as P from '../../views/player.js';

let openPart = null;
const openTopics = new Set();

function overview() {
  const cards = MONTHS.map(m => {
    const open = isUnlocked(m.n), p = partProgress(m.n), cap = capstoneOf(m.n);
    return `<button class="card tap month-card ${open ? '' : 'locked'}" data-part="${m.n}" style="--mc:${m.color}">
      <div class="row"><div class="month-num">${m.icon}</div>
        <div class="grow"><div class="between"><span class="label">Part ${m.n} · ${esc(m.level)}</span>
          ${p.bossWon ? '<span class="badge good">★ Boss down</span>' : open ? '<span class="badge solid">Open</span>' : `<span class="badge mute">From mission ${MONTH_DAYS * (m.n - 1) + 1}</span>`}</div>
          <div class="h3" style="margin-top:3px">${esc(m.title)}</div></div></div>
      <div class="month-stats"><span>${p.builds}/${p.buildsTotal} builds</span><span>${p.skills}/${p.skillsTotal} skills at Lv 3+</span>
        <span>🏆 ${isVerified(cap.id) ? 'reproduced' : esc(cap.name.replace('Reproduce: ', ''))}</span></div>
      <div style="margin-top:8px">${bar((p.builds / p.buildsTotal) * 100, { color: m.color })}</div>
    </button>`;
  }).join('<div class="path-join" aria-hidden="true"></div>');
  return `<div class="fade-up">${missionMap('ai', MONTHS)}<div class="month-path" style="margin-top:16px">${cards}</div></div>`;
}

function topicBlock(t) {
  const skills = skillsIn(t.month).filter(s => s.topic === t.id);
  return `<details class="topic card flush" data-topic="${t.id}" ${openTopics.has(t.id) ? 'open' : ''}>
    <summary><div class="grow"><div class="h3">${esc(t.name)}</div><div class="tiny">${t.resources.length} links${skills.length ? ` · ${skills.length} skill${skills.length === 1 ? '' : 's'}` : ''}</div></div>
      <span class="chev">${icon('chevron', 16).value}</span></summary>
    <div class="topic-bd"><p class="sub">${esc(t.why)}</p>
      <div class="res-list" style="margin-top:10px">${t.resources.map(x => `<div class="res"><div class="grow">
        <div class="res-name"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)} ${icon('ext', 12).value}</a></div>
        ${x.note ? `<div class="tiny">${esc(x.note)}</div>` : ''}</div><span class="badge price">${esc(x.price)}</span></div>`).join('')}</div>
      ${skills.length ? `<div class="label" style="margin-top:12px">Skills</div><div class="wrap" style="margin-top:6px">${skills.map(s => `<span class="skill-chip">${esc(s.name)}</span>`).join('')}</div>` : ''}</div>
  </details>`;
}

function partPage(n) {
  const m = monthByN(n), boss = bossFor(n), st = S.tracks.ai.bosses?.[n] || {}, ready = bossReady(n), start = MONTH_DAYS * (n - 1) + 1;
  const builds = buildsIn(n).map(b => {
    const s = S.tracks.ai.builds?.[b.id];
    return `<button class="build-row" data-build="${b.id}"><div class="grow"><div class="h3">${b.capstone ? '🏆 ' : ''}${esc(b.name)}</div>
      <div class="tiny">${b.compute === 'cheap' ? '💳 cheap GPU' : '🆓 free'}</div></div>
      ${s?.verified ? '<span class="badge good">✓ verified</span>' : s?.checks ? `<span class="badge warn">${s.checks.filter(c => c.pass).length}/${s.checks.length}</span>` : '<span class="badge mute">to do</span>'}</button>`;
  }).join('');
  return `<div class="fade-up">
    <button class="act-back" data-part-back>‹ All parts</button>
    <div class="month-head" style="--mc:${m.color};margin-top:12px">
      <div class="label">Part ${n} · ${esc(m.level)} · missions ${start}–${start + MONTH_DAYS - 1}</div>
      <div class="h1" style="margin-top:6px">${m.icon} ${esc(m.title)}</div>
      <div class="sub" style="margin-top:6px">${esc(m.goal)}</div></div>
    <div class="section"><div class="card boss-card ${st.won ? 'won' : ''}"><div class="row"><div class="boss-ico">${boss.icon}</div>
      <div class="grow"><div class="label">Boss</div><div class="h3">${esc(boss.name)}</div>
        <div class="tiny" style="margin-top:2px">${esc(st.won ? boss.won : ready.ok ? `“${boss.intro}”` : ready.why)}</div></div>
      ${st.won ? `<span class="badge good">Beaten ${esc(shortDate(st.wonAt))}</span>` : ready.ok ? `<button class="btn hot sm" data-part-boss="${n}">Fight</button>` : ''}</div></div></div>
    <div class="section"><div class="section-head"><div class="h2">Builds</div></div><div class="card flush">${builds}</div></div>
    <div class="section"><div class="section-head"><div class="h2">Topics</div></div><div class="stack s2">${topicsIn(n).map(topicBlock).join('')}</div></div>
  </div>`;
}

export const showPart = n => { openPart = n; };
export const render = () => (openPart ? partPage(openPart) : overview());

export function mount(root, rerender) {
  root.querySelector('[data-part-back]')?.addEventListener('click', () => { openPart = null; rerender(); document.getElementById('view').scrollTop = 0; });
  root.querySelectorAll('[data-part]').forEach(b => { b.onclick = () => { openPart = +b.dataset.part; rerender(); document.getElementById('view').scrollTop = 0; }; });
  root.querySelectorAll('[data-build]').forEach(b => { b.onclick = () => openBuild(b.dataset.build, rerender); });
  root.querySelectorAll('[data-part-boss]').forEach(b => { b.onclick = () => P.openBoss(+b.dataset.partBoss, rerender, 'ai'); });
  root.querySelectorAll('details.topic').forEach(d => d.addEventListener('toggle', () => { d.open ? openTopics.add(d.dataset.topic) : openTopics.delete(d.dataset.topic); }));
}
