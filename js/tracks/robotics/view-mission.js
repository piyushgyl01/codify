/**
 * Today's mission: learn one thing, prove it, build a step. The Robots tab opens
 * here, and the robotics card on Today is a smaller copy of the same card.
 */
import { S, commitsOn, getDay, today } from '../../state.js';
import {
  mission, missionSkills, missionDoneToday, missionsDone, skillLevel, skillScore, skillEntry,
  isVerified, bossReady, toggleRead,
} from './actions.js';
import { missionAt, stepLine, stepName, checkBudget } from './missions.js';
import { monthByN, topicById, buildById, PLAN_DAYS } from './roadmap.js';
import { skillById } from './skills.js';
import { bossFor } from './bosses.js';
import { roundFor, levelOf, addDays } from '../../game.js';
import { esc, bar, sheet, shortDate } from '../../ui.js';
import { lineChart } from '../../charts.js';
import { icon } from '../../icons.js';
import { openMission, resumeSession } from './player.js';
import { openBuild } from './view-builds.js';
import { showMonth } from './view-plan.js';
import { openTab } from './hub.js';
import { go } from '../../router.js';

/* --------------------------------- pieces --------------------------------- */

export function missionTitle(m) {
  if (m.boss) return `Boss day: ${bossFor(m.month).name}`;
  if (m.learn) return m.learn.text;
  return `Go deeper: ${topicById(m.topic).name}`;
}

const levelChip = id => {
  const l = skillLevel(id);
  return `<span class="lv-chip ${l ? '' : 'new'}">${esc(skillById(id).name)} <b>${l ? `Lv ${l}` : 'new'}</b></span>`;
};

function learnStep(m) {
  if (m.boss) return '';
  const t = topicById(m.topic);
  return `<button class="m-step tap" data-mission="learn">
    <span class="m-num">1</span>
    <div class="grow"><div class="label">Learn</div>
      <div class="h3">${esc(m.learn ? m.learn.text : `No new point today. Re-read, redo, or finish yesterday's.`)}</div>
      <div class="tiny">${esc(t.name)} · ${t.resources.filter(r => r.url).length} links</div></div>
    ${icon('chevron', 16).value}
  </button>`;
}

function proveStep(m) {
  const done = missionDoneToday(), active = S.active, rec = getDay().robotics?.mission;
  const boss = m.boss && !S.tracks.robotics.bosses[m.month]?.won && bossReady(m.month).ok;
  let body, action;
  if (done && rec) {
    body = rec.boss
      ? `<div class="h3">${rec.won ? 'Boss beaten' : 'Boss fought'}</div><div class="tiny">${rec.score} hits</div>`
      : `<div class="h3">${rec.score}/${rec.total} right${rec.ups ? ` · ${rec.ups} level-up${rec.ups === 1 ? '' : 's'}` : ''}</div>
         <div class="tiny">Skill score ${rec.scoreFrom} → ${rec.scoreTo}</div>`;
    action = '<span class="badge good">✓ Done</span>';
  } else {
    const ids = boss ? [] : missionSkills(m);
    const qs = ids.reduce((k, id) => k + roundFor(levelOf(skillEntry(id))).n, 0);
    const won = S.tracks.robotics.bosses[m.month]?.won;
    const why = m.boss && !boss ? `<div class="tiny">${won ? 'Boss already beaten' : esc(bossReady(m.month).why)} Today is a review of the month.</div>` : '';
    body = boss
      ? `<div class="h3">Fight ${esc(bossFor(m.month).name)}</div><div class="tiny">${esc(bossFor(m.month).intro)}</div>`
      : `<div class="h3">${ids.length} skill${ids.length === 1 ? '' : 's'} · ${qs} questions, timed</div>${why}
         <div class="lv-chips">${ids.map(levelChip).join('')}</div>`;
    body += active && (active.mode === 'mission' || active.mission)
      ? '<button class="btn primary block m-go" data-mission="resume">Resume</button>'
      : `<button class="btn ${boss ? 'hot' : 'primary'} block m-go" data-mission="start">${boss ? 'Fight' : 'Start'}</button>`;
    action = '';
  }
  return `<div class="m-step ${done ? 'done' : ''}">
    <span class="m-num">${m.boss ? 1 : 2}</span>
    <div class="grow"><div class="label">${m.boss ? 'Prove the month' : 'Prove it'}</div>${body}</div>
    ${action}
  </div>`;
}

function buildStep(m) {
  if (!m.build) return '';
  const b = buildById(m.build.id), verified = isVerified(b.id);
  const commits = commitsOn(), repos = [...new Set((S.github.pushes || []).filter(p => p.day === today()).map(p => p.repo))];
  const check = verified ? '<div class="tiny ok-line">✓ Verified on GitHub</div>'
    : !S.github.user ? '<div class="tiny m-check">Add your GitHub on Hero so your pushes count</div>'
    : commits ? `<div class="tiny ok-line">✓ ${commits} commit${commits === 1 ? '' : 's'} today · ${esc(repos.join(', '))}</div>`
    : '<div class="tiny m-check">Push a commit today. GitHub is checked; there is nothing to tick.</div>';
  const done = verified || (!!S.github.user && commits > 0);
  return `<button class="m-step tap ${done ? 'done' : ''}" data-build="${b.id}">
    <span class="m-num">3</span>
    <div class="grow"><div class="label">Build · ${stepName(m.build)} ${m.build.step}/${m.build.of}</div>
      <div class="h3">${esc(b.name)}</div>
      <div class="tiny m-task">${esc(stepLine(m.build))}</div>
      ${check}</div>
    ${icon('chevron', 16).value}
  </button>`;
}

/** The mission card. `compact` is the version on Today. */
export function missionCard({ compact = false } = {}) {
  const m = mission(), month = monthByN(m.month), done = missionsDone();
  if (done >= PLAN_DAYS && !m.done) {
    return `<div class="card mission-card"><div class="h2">All ${PLAN_DAYS} missions done</div>
      <p class="sub" style="margin-top:6px">That is the whole roadmap. Keep your skills sharp with practice, and ship.</p></div>`;
  }
  const next = m.done && m.n < PLAN_DAYS ? missionAt(m.n + 1) : null;
  return `<div class="${compact ? 'm-inner' : 'card mission-card'}" style="--mc:${month.color}">
    ${compact ? '' : `<div class="between"><span class="label">${m.done ? 'Done today' : 'Today'}</span>
      <span class="badge" style="background:${month.color}">${month.icon} ${esc(month.short)}</span></div>
      <div class="h2" style="margin-top:6px">Mission ${m.n} of ${PLAN_DAYS}</div>
      <div style="margin-top:10px">${bar((done / PLAN_DAYS) * 100, { color: 'var(--ink)' })}</div>
      <div class="tiny" style="margin-top:4px">${done} of ${PLAN_DAYS} done · at one a day, finished ${esc(shortDate(addDays(today(), PLAN_DAYS - done - (m.done ? 0 : 1))))}</div>`}
    <div class="m-steps">${learnStep(m)}${proveStep(m)}${buildStep(m)}</div>
    ${next ? `<div class="m-next"><span class="label">Tomorrow · mission ${next.n}</span>
      <div class="tiny">${esc(missionTitle(next))}</div></div>` : ''}
  </div>`;
}

/* ---------------------------------- learn --------------------------------- */

export function openLearn(n, rerender) {
  const m = missionAt(n), t = topicById(m.topic);
  const paint = () => {
    const res = t.resources.map(r => {
      const done = r.url && S.tracks.robotics.read[r.url];
      return `<div class="res ${done ? 'done' : ''}">
        ${r.url ? `<button class="res-check" data-read="${esc(r.url)}" aria-label="${done ? 'Mark unread' : 'Mark done'}">${done ? '✓' : ''}</button>` : '<span class="res-check static">$</span>'}
        <div class="grow"><div class="res-name">${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)} ${icon('ext', 12).value}</a>` : esc(r.name)}</div>
          ${r.note ? `<div class="tiny">${esc(r.note)}</div>` : ''}</div>
        <span class="badge price">${esc(r.price)}</span></div>`;
    }).join('');
    const skills = m.skills.map(id => skillById(id).name);
    return `<div class="label">Mission ${m.n} · ${esc(t.name)}</div>
      <div class="h2" style="margin-top:6px">${esc(m.learn ? m.learn.text : 'Go deeper on this topic')}</div>
      <p class="sub" style="margin-top:10px">${esc(t.why)}</p>
      ${skills.length ? `<div class="card sunk pad-s" style="margin-top:14px"><div class="label">New in today's check</div>
        <div class="h3" style="margin-top:4px">${esc(skills.join(', '))}</div></div>` : ''}
      <div class="label" style="margin-top:16px">Where to learn it</div>
      <div class="res-list">${res}</div>
      <button class="btn block" style="margin-top:16px" data-open-month>See all of month ${m.month}</button>`;
  };
  sheet('Learn', paint(), (el, close) => {
    const wire = () => {
      el.querySelectorAll('[data-read]').forEach(b => {
        b.onclick = e => { e.preventDefault(); toggleRead(b.dataset.read); el.querySelector('.sheet-bd').innerHTML = paint(); wire(); };
      });
      el.querySelector('[data-open-month]').onclick = () => { close(); showMonth(m.month); openTab('plan'); go('robotics'); rerender(); };
    };
    wire();
  });
}

/* ---------------------------------- wiring -------------------------------- */

export function mountMission(root, rerender) {
  root.querySelectorAll('[data-mission]').forEach(el => {
    el.onclick = () => {
      const a = el.dataset.mission;
      if (a === 'start') openMission(rerender);
      else if (a === 'resume') resumeSession(rerender);
      else if (a === 'learn') openLearn(mission().n, rerender);
    };
  });
  root.querySelectorAll('.m-steps [data-build]').forEach(el => { el.onclick = () => openBuild(el.dataset.build, rerender); });
}

/* ---------------------------------- page ---------------------------------- */

function progressCard() {
  const scores = Object.entries(S.tracks.robotics.scores || {}).sort(([a], [b]) => a.localeCompare(b));
  const now = skillScore(), weekAgo = addDays(today(), -7);
  const before = scores.filter(([d]) => d <= weekAgo).at(-1)?.[1] ?? (scores[0]?.[1] ?? 0);
  const pts = [{ value: 0 }, ...scores.slice(-30).map(([, v]) => ({ value: v }))];
  const started = Object.values(S.tracks.robotics.skills).filter(e => levelOf(e) >= 1).length;
  return `<div class="card">
    <div class="between"><div><div class="label">Skill score</div>
      <div class="big-num">${now}</div></div>
      ${now > before ? `<span class="badge good">+${now - before} this week</span>` : ''}</div>
    <div class="tiny">Every skill's level added up. It goes up when a skill levels up, and down when one slips.</div>
    <div style="margin-top:12px">${lineChart(pts, { height: 90, color: 'var(--acid)', minY: 0 })}</div>
    <div class="path-stats"><span><b>${started}</b> skill${started === 1 ? '' : 's'} started</span><span><b>${missionsDone()}</b> mission${missionsDone() === 1 ? '' : 's'} done</span>
      <span><b>${checkBudget(mission().month)}</b> questions max a day this month</span></div>
  </div>`;
}

function upNext() {
  const m = mission(), from = m.done ? m.n + 1 : m.n + 1;
  const rows = Array.from({ length: 5 }, (_, i) => from + i).filter(n => n <= PLAN_DAYS).map(n => {
    const x = missionAt(n);
    const bits = [
      ...(x.skills.length ? [`new: ${x.skills.map(id => skillById(id).name).join(', ')}`] : []),
      ...(x.build ? [`${stepName(x.build)} · ${buildById(x.build.id).name}`] : []),
    ];
    return `<div class="up-row"><span class="up-n">${n}</span>
      <div class="grow"><div class="h3">${esc(missionTitle(x))}</div>${bits.length ? `<div class="tiny">${esc(bits.join(' · '))}</div>` : ''}</div></div>`;
  }).join('');
  return rows ? `<div class="section"><div class="section-head"><div class="h2">Coming up</div></div>
    <div class="card flush">${rows}</div></div>` : '';
}

function howItWorks() {
  return `<details class="card sunk flush explain">
    <summary><span class="h3 grow">How missions work</span><span class="chev">${icon('chevron', 16).value}</span></summary>
    <div class="topic-bd">
      <p class="sub">The article is cut into ${PLAN_DAYS} missions, one a day. Miss a day and the next mission waits for you — nothing is skipped.</p>
      <p class="sub" style="margin-top:8px">Every skill has a level from 1 to 10. Higher levels ask more questions with less time on each.
        Get a skill's round fully right and it levels up and comes back later. Miss one and it stays. Miss two and it drops a level and comes back tomorrow.</p>
      <p class="sub" style="margin-top:8px">Build steps count when GitHub shows a push that day. A build pays when its folder passes the checks.</p>
    </div>
  </details>`;
}

export function render() {
  return `<div class="stack s4 fade-up">
    ${missionCard()}
    ${progressCard()}
    ${upNext()}
    ${howItWorks()}
  </div>`;
}

export const mount = mountMission;
