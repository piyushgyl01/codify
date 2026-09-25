/**
 * The pieces of a mission card that every track shares: the header, the
 * "Prove it" step, testing out of a week, the skill-score chart and what is
 * coming up. Each track adds its own Learn step and its own third step.
 */
import { S, today } from '../state.js';
import * as E from '../learn/session.js';
import { skillById } from '../skillbook.js';
import { roundFor, levelOf, addDays } from '../game.js';
import { esc, bar, shortDate } from '../ui.js';
import { lineChart } from '../charts.js';
import { icon } from '../icons.js';
import { openMission, openTestOut, resumeSession } from './player.js';

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const levelChip = (track, id) => {
  const l = E.skillLevel(track, id);
  return `<span class="lv-chip ${l ? '' : 'new'}">${esc(skillById(id).name)} <b>${l ? `Lv ${l}` : 'new'}</b></span>`;
};

/** The top of the full card: which mission, how far through, and when you finish at one a day. */
export function header(track, m, month) {
  const total = E.trackCfg(track).plan.length, done = E.missionsDone(track) + E.missionsSkipped(track);
  const left = total - done - (m.done ? 0 : 1);
  return `<div class="between"><span class="label">${m.done ? 'Done today' : 'Today'} · ${esc(month.level)}</span>
      <span class="badge" style="background:${month.color}">${month.icon} ${esc(month.short)}</span></div>
    <div class="h2" style="margin-top:6px">Mission ${m.n} of ${total}</div>
    <div style="margin-top:10px">${bar((done / total) * 100, { color: 'var(--ink)' })}</div>
    <div class="tiny" style="margin-top:4px">${done} of ${total} done · at one a day, finished ${esc(shortDate(addDays(today(), Math.max(0, left))))}</div>`;
}

/** Step 2: today's timed check — or its result once it is done. */
export function proveStep(track, m, num = 2, { note = '' } = {}) {
  const active = S.active;
  let body, action = '';
  if (m.check) {
    const rec = E.counters(track).mission;
    body = `<div class="h3">${m.check.score}/${m.check.total} right${m.check.ups ? ` · ${plural(m.check.ups, 'level-up')}` : ''}</div>
      ${rec?.n === m.n ? `<div class="tiny">Skill score ${rec.scoreFrom} → ${rec.scoreTo}</div>` : ''}`;
    action = '<span class="badge good">✓ Done</span>';
  } else {
    const ids = E.missionSkills(track, m);
    const qs = ids.reduce((k, id) => k + roundFor(levelOf(S.tracks[track].skills?.[id])).n, 0);
    body = `<div class="h3">${plural(ids.length, 'skill')} · ${qs} questions, timed</div>${note}
      <div class="lv-chips">${ids.map(id => levelChip(track, id)).join('')}</div>`;
    body += active && active.track === track && active.mode === 'mission'
      ? '<button class="btn primary block m-go" data-mission="resume">Resume</button>'
      : '<button class="btn primary block m-go" data-mission="start">Start</button>';
  }
  return `<div class="m-step ${m.check ? 'done' : ''}">
    <span class="m-num">${num}</span>
    <div class="grow"><div class="label">${m.boss ? 'Prove the month' : 'Prove it'}</div>${body}</div>
    ${action}
  </div>`;
}

/** Already know this week? Six questions at level 4; five right skips the rest of it. The first time, it is the placement test. */
export function testOutRow(track, m) {
  if (m.done || m.boss) return '';
  const t = E.testOut(track, m.week);
  if (!t.ok || t.passed) return '';
  const first = E.missionsDone(track) + E.missionsSkipped(track) === 0;
  return `<div class="m-test">
    <div class="grow"><div class="h3">${first ? 'Placement: know week 1 already?' : `Know week ${m.week} already?`}</div>
      <div class="tiny">${E.TEST_OUT.questions} questions on ${plural(t.skills.length, 'skill')}. ${E.TEST_OUT.pass} right skips ${plural(t.left.length, 'mission')}${first ? ' — then try the next week' : ''}.</div></div>
    ${t.triedToday ? '<span class="badge mute">Tomorrow</span>' : `<button class="btn sm" data-testout="${m.week}">Test out</button>`}
  </div>`;
}

export function tomorrow(next, title) {
  return next ? `<div class="m-next"><span class="label">Tomorrow · mission ${next.n}</span>
    <div class="tiny">${esc(title(next))}</div></div>` : '';
}

/** Skill score over time: the number that should go up. */
export function progressCard(track, extra = '') {
  const scores = Object.entries(S.tracks[track].scores || {}).sort(([a], [b]) => a.localeCompare(b));
  const now = E.skillScore(track), weekAgo = addDays(today(), -7);
  const before = scores.filter(([d]) => d <= weekAgo).at(-1)?.[1] ?? (scores[0]?.[1] ?? 0);
  const pts = [{ value: 0 }, ...scores.slice(-30).map(([, v]) => ({ value: v }))];
  const started = Object.values(S.tracks[track].skills || {}).filter(e => levelOf(e) >= 1).length;
  const done = E.missionsDone(track), skipped = E.missionsSkipped(track);
  return `<div class="card">
    <div class="between"><div><div class="label">Skill score</div><div class="big-num">${now}</div></div>
      ${now > before ? `<span class="badge good">+${now - before} this week</span>` : `<span class="tiny">of ${E.maxScore(track)}</span>`}</div>
    <div class="tiny">Every skill's level added up. It goes up when a skill levels up, and down when one slips.</div>
    <div style="margin-top:12px">${lineChart(pts, { height: 90, color: 'var(--acid)', minY: 0 })}</div>
    <div class="path-stats"><span><b>${started}</b> ${started === 1 ? 'skill' : 'skills'} started</span>
      <span><b>${done}</b> ${done === 1 ? 'mission' : 'missions'} done</span>${skipped ? `<span><b>${skipped}</b> tested out</span>` : ''}${extra}</div>
  </div>`;
}

/** Every mission at a glance: done, tested out of, today, still to come. The last square of each month is its boss or contest. */
export function missionMap(track, months, bossWord = 'boss') {
  const cfg = E.trackCfg(track), r = S.tracks[track], done = r.missions || {}, skipped = r.skipped || {};
  const next = E.mission(track).n;
  const rows = months.map(m => `<div class="mmap-row"><span class="mmap-m">M${m.n}</span><div class="mmap-cells">${
    cfg.plan.filter(x => x.month === m.n).map(x => `<i class="${done[x.n] ? 'done' : skipped[x.n] ? 'skip' : x.n === next ? 'now' : ''}${x.boss ? ' boss' : ''}"
      style="--mc:${m.color}" title="Mission ${x.n}"></i>`).join('')}</div></div>`).join('');
  const n = Object.keys(done).length + Object.keys(skipped).length;
  return `<div class="card">
    <div class="between"><div class="h3">${n} of ${cfg.plan.length} missions</div><span class="tiny">one a day</span></div>
    <div class="mmap">${rows}</div>
    <div class="tiny" style="margin-top:8px">Each square is a day's mission; striped ones you tested out of. The last square of every month is its ${bossWord}.</div>
  </div>`;
}

/** The next five missions, described by the track. */
export function comingUp(track, describe) {
  const cfg = E.trackCfg(track), m = E.mission(track);
  const rows = Array.from({ length: 5 }, (_, i) => m.n + 1 + i).filter(n => n <= cfg.plan.length).map(n => {
    const x = cfg.plan[n - 1], d = describe(x);
    return `<div class="up-row"><span class="up-n">${n}</span>
      <div class="grow"><div class="h3">${esc(d.title)}</div>${d.sub ? `<div class="tiny">${esc(d.sub)}</div>` : ''}</div></div>`;
  }).join('');
  return rows ? `<div class="section"><div class="section-head"><div class="h2">Coming up</div></div>
    <div class="card flush">${rows}</div></div>` : '';
}

export function howItWorks(track, third) {
  const total = E.trackCfg(track).plan.length;
  return `<details class="card sunk flush explain">
    <summary><span class="h3 grow">How missions work</span><span class="chev">${icon('chevron', 16).value}</span></summary>
    <div class="topic-bd">
      <p class="sub">${total} missions, one a day, four months. Each one builds on the days before it. Miss a day and the next mission waits — nothing is skipped unless you test out of it.</p>
      <p class="sub" style="margin-top:8px">Every skill has a level from 1 to 10. Higher levels ask more questions with less time on each.
        Get a skill's round fully right and it levels up and comes back later. Miss one and it stays. Miss two and it drops a level and comes back tomorrow.</p>
      <p class="sub" style="margin-top:8px">${third}</p>
      <p class="sub" style="margin-top:8px">Know a week already? Test out: ${E.TEST_OUT.questions} questions at level ${E.TEST_OUT.level}, and ${E.TEST_OUT.pass} right skips the rest of that week. Once a day per week.</p>
    </div>
  </details>`;
}

export function mountParts(root, track, rerender) {
  root.querySelectorAll('[data-mission]').forEach(el => {
    const a = el.dataset.mission;
    if (a === 'start') el.onclick = () => openMission(track, rerender);
    else if (a === 'resume') el.onclick = () => resumeSession(rerender);
  });
  root.querySelectorAll('[data-testout]').forEach(el => { el.onclick = () => openTestOut(track, +el.dataset.testout, rerender); });
}
