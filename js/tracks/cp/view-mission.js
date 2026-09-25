/**
 * Today's programming mission: learn one idea, prove it, then solve problems
 * with that tag on Codeforces at your level for it. The Code tab opens here, and
 * the programming card on Today is a smaller copy of the same card.
 */
import { S } from '../../state.js';
import {
  mission, solveStatus, lowerTarget, contestFor, isLinked, solvedList, activeContest, startContest,
} from './actions.js';
import { missionAt, monthByN, MONTHS, TOTAL_MISSIONS } from './plan.js';
import { skillById } from './skills.js';
import { suggestProblems } from './codeforces.js';
import { colorForRating, MIN_TARGET } from './model.js';
import { syncAll, describeSync } from '../../sync.js';
import { esc, sheet, dialog, toast, sfx, haptic, $ } from '../../ui.js';
import { icon } from '../../icons.js';
import * as Parts from '../../views/mission-parts.js';
import * as E from '../../learn/session.js';

const T = 'cp';
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const tagName = tag => (tag ? `“${tag}”` : 'any tag');
const cfSearch = (tag, from) => `https://codeforces.com/problemset?tags=${tag ? `${encodeURIComponent(tag)},` : ''}${from}-${from + 200}`;

export const missionTitle = m => (m.boss ? `Contest day: ${contestFor(m).name}` : m.learn);

/* --------------------------------- steps ---------------------------------- */

function learnStep(m) {
  return `<button class="m-step tap" data-cp-learn>
    <span class="m-num">1</span>
    <div class="grow"><div class="label">Learn</div>
      <div class="h3">${esc(m.learn)}</div>
      <div class="tiny">${m.links.length ? plural(m.links.length, 'link') : 'Practice day — use what you have learned'}</div></div>
    ${icon('chevron', 16).value}
  </button>`;
}

function solveStep(m) {
  const st = solveStatus(m), got = Math.min(st.counted.length, m.count), met = st.met;
  const action = !isLinked()
    ? '<div class="tiny m-check">Connect Codeforces above so your solves count.</div>'
    : `${met ? `<div class="tiny ok-line">✓ ${got}/${m.count} accepted today</div>`
        : `<div class="tiny m-check">${got}/${m.count} accepted today at ${st.target}+ — the judge decides, then sync.</div>`}
       <div class="row m-go" style="gap:8px"><button class="btn primary sm grow" data-cp-find>Find problems</button>
         <button class="btn sm" data-cp-sync>Sync</button></div>
       ${!met && st.target > MIN_TARGET ? `<button class="linkish" data-cp-lower>Too hard today? Drop to ${st.target - 100}</button>` : ''}`;
  return `<div class="m-step ${met ? 'done' : ''}">
    <span class="m-num">3</span>
    <div class="grow"><div class="label">Solve · your level for ${tagName(m.tag)}: ${st.target}</div>
      <div class="h3">${plural(m.count, 'problem')} ${m.tag ? `tagged ${tagName(m.tag)}` : 'with any tag'}, rated ${st.target}+</div>
      <div class="tiny">Clear it and your level for ${tagName(m.tag)} goes up to ${Math.min(3500, st.target + 100)}.</div>
      ${action}</div>
  </div>`;
}

/** The last day of each month is a contest, settled by the judge like any other. */
function contestStep(m) {
  const c = contestFor(m), live = activeContest();
  const body = m.done ? `<span class="badge good">✓ ${esc(S.tracks.cp.contests[c.id]?.won ? 'Won' : 'Done')}</span>`
    : live ? `<div class="tiny">${esc(live.contest.name)} is running · ${live.solved}/${live.need} counted</div>
        <button class="btn primary block m-go" data-go="cp" data-cptab="contests">Open it</button>`
    : !isLinked() ? '<div class="tiny m-check">Connect Codeforces above to run it.</div>'
    : `<button class="btn hot block m-go" data-cp-contest="${c.id}">Start the clock</button>`;
  return `<div class="m-step ${m.done ? 'done' : ''}">
    <span class="m-num">1</span>
    <div class="grow"><div class="label">This part's contest</div>
      <div class="h3">${c.icon} ${esc(c.name)}</div>
      <div class="tiny">${c.need} problems rated ${c.minRating}+ in ${c.minutes} minutes. Won or lost, finishing it completes the mission.</div>
      ${body}</div>
  </div>`;
}

/** Between missions at a slower pace: keep solving in the last mission's tag. Counted, never required. */
function keepSolving(m) {
  const prev = m.n > 1 ? missionAt(m.n - 1) : null;
  if (!prev || prev.boss) return '';
  const st = solveStatus({ ...prev, count: 1 });
  return `<div class="m-step ${st.met ? 'done' : ''}">
    <span class="m-num">2</span>
    <div class="grow"><div class="label">Keep going · ${tagName(prev.tag)}</div>
      <div class="h3">One more problem ${prev.tag ? `tagged ${tagName(prev.tag)}` : 'with any tag'}, rated ${st.target}+</div>
      ${!isLinked() ? '<div class="tiny m-check">Connect Codeforces above so it counts.</div>'
        : st.met ? '<div class="tiny ok-line">✓ Solved one today</div>'
        : `<div class="tiny m-check">Optional — it pays like any solve, and keeps the topic warm.</div>
           <div class="row m-go" style="gap:8px"><button class="btn sm grow" data-cp-find-prev>Find problems</button><button class="btn sm" data-cp-sync>Sync</button></div>`}</div>
  </div>`;
}

/** The mission card. `compact` is the version on Today. */
export function missionCard({ compact = false } = {}) {
  const m = mission(), month = monthByN(m.month);
  if (m.finished && !m.done) {
    return `<div class="card mission-card"><div class="h2">All missions done</div>
      <p class="sub" style="margin-top:6px">That is the whole plan. Keep entering contests.</p></div>`;
  }
  if (!m.done && !m.check && !E.paceInfo(T).missionDay) {
    return `<div class="${compact ? 'm-inner' : 'card mission-card'}" style="--mc:${month.color}">
      ${compact ? '' : Parts.header(T, m, month, { keepGoing: true })}
      <div class="m-steps">${Parts.keepGoing(T, m, keepSolving(m))}</div>
    </div>`;
  }
  const next = m.done && m.n < TOTAL_MISSIONS ? missionAt(m.n + 1) : null;
  const steps = m.boss ? contestStep(m) : learnStep(m) + Parts.proveStep(T, m) + solveStep(m);
  return `<div class="${compact ? 'm-inner' : 'card mission-card'}" style="--mc:${month.color}">
    ${compact ? '' : Parts.header(T, m, month)}
    <div class="m-steps">${steps}</div>
    ${Parts.testOutRow(T, m)}
    ${Parts.tomorrow(next, missionTitle)}
  </div>`;
}

/* --------------------------------- sheets --------------------------------- */

function openLearn(m) {
  const skills = m.skills.map(id => skillById(id).name);
  sheet('Learn', `<div class="label">Mission ${m.n}</div>
    <div class="h2" style="margin-top:6px">${esc(m.learn)}</div>
    ${skills.length ? `<div class="card sunk pad-s" style="margin-top:14px"><div class="label">New in today's check</div>
      <div class="h3" style="margin-top:4px">${esc(skills.join(', '))}</div></div>` : ''}
    ${m.links.length ? `<div class="label" style="margin-top:16px">Where to learn it</div>
      <div class="res-list">${m.links.map(r => `<div class="res"><div class="grow">
        <div class="res-name"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)} ${icon('ext', 12).value}</a></div>
        ${r.note ? `<div class="tiny">${esc(r.note)}</div>` : ''}</div><span class="badge price">${esc(r.price)}</span></div>`).join('')}</div>`
      : '<p class="sub" style="margin-top:14px">No new reading today. Solve, and look back at the week\'s links when you get stuck.</p>'}`);
}

function openFind(m) {
  const st = solveStatus(m);
  sheet('Find problems', `<div class="sub">${m.tag ? `Tagged ${esc(tagName(m.tag))}` : 'Any tag'}, rated ${st.target}–${st.target + 200}, that you have not solved.</div>
    <div id="cp-find" style="margin-top:12px"><div class="empty">${m.tag ? 'Loading problems…' : ''}</div></div>
    <a class="btn ghost block sm" style="margin-top:12px;text-decoration:none" href="${esc(cfSearch(m.tag, st.target))}" target="_blank" rel="noopener">Browse on Codeforces</a>`,
  async el => {
    const box = $('#cp-find', el);
    if (!m.tag) { box.innerHTML = '<div class="empty">Any tag counts today — browse the problem set at your level.</div>'; return; }
    try {
      const list = await suggestProblems(m.tag, { minRating: st.target, maxRating: st.target + 200, solvedKeys: new Set(solvedList().map(s => s.key)), limit: 6 });
      box.innerHTML = list.length ? `<div class="stack s2">${list.map(pr => `
        <a class="card pad-s" style="display:block;text-decoration:none" href="${esc(pr.url)}" target="_blank" rel="noopener">
          <div class="between"><div class="grow truncate"><div class="h3 truncate">${esc(pr.name)}</div>
            <div class="tiny truncate">${esc(pr.contestId + pr.index)} · ${esc(pr.tags.slice(0, 3).join(' · '))}</div></div>
            <span class="badge" style="background:${colorForRating(pr.rating)}">${pr.rating}</span></div>
        </a>`).join('')}</div>` : '<div class="empty">Nothing unsolved in this band. Browse Codeforces, or drop your level by 100.</div>';
    } catch (err) { box.innerHTML = `<div class="empty">${esc(err.message)}</div>`; }
  });
}

/* ---------------------------------- wiring -------------------------------- */

export function mountMission(root, rerender) {
  Parts.mountParts(root, T, rerender);
  root.querySelectorAll('[data-cp-learn]').forEach(el => { el.onclick = () => openLearn(mission()); });
  root.querySelectorAll('[data-cp-find]').forEach(el => { el.onclick = () => openFind(mission()); });
  root.querySelectorAll('[data-cp-find-prev]').forEach(el => { el.onclick = () => { const m = mission(); openFind({ ...missionAt(m.n - 1), count: 1 }); }; });
  root.querySelectorAll('[data-cp-lower]').forEach(el => {
    el.onclick = () => { const m = mission(); lowerTarget(m.tag); toast(`Your level for ${esc(tagName(m.tag))} is now ${solveStatus(mission()).target}.`); rerender(); };
  });
  root.querySelectorAll('[data-cp-sync]').forEach(el => {
    el.onclick = async () => {
      el.textContent = 'Syncing…';
      const r = await syncAll({ force: true });
      toast(esc(describeSync(r)), 3200);
      if (r.cf?.settled) { sfx('reward'); toast('Mission done — the judge accepted it.', 3200); }
      rerender();
    };
  });
  root.querySelectorAll('[data-cp-contest]').forEach(el => {
    el.onclick = () => {
      const c = contestFor(mission());
      dialog(`<div class="h2">Start ${esc(c.name)}?</div>
        <p class="sub" style="margin:12px 0 16px">${c.need} problems rated ${c.minRating}+ within ${c.minutes} minutes. Everything you have already solved is recorded now and will not count.</p>
        <button class="btn primary block" data-yes>Start the clock</button>
        <button class="btn ghost block sm" style="margin-top:8px" data-no>Not now</button>`,
      (d, close) => {
        d.querySelector('[data-no]').onclick = close;
        d.querySelector('[data-yes]').onclick = () => { startContest(c.id); close(); sfx('start'); haptic(16); rerender(); };
      });
    };
  });
}

/* ---------------------------------- page ---------------------------------- */

const describe = x => ({
  title: missionTitle(x),
  sub: x.boss ? '' : [
    ...(x.skills.length ? [`new: ${x.skills.map(id => skillById(id).name).join(', ')}`] : []),
    `solve: ${x.tag || 'any tag'}`,
  ].join(' · '),
});

export function render() {
  return `<div class="stack s4">
    ${missionCard()}
    ${Parts.paceCard(T)}
    ${Parts.progressCard(T)}
    ${Parts.missionMap(T, MONTHS, 'contest')}
    ${Parts.comingUp(T, describe)}
    ${Parts.howItWorks(T, 'The Solve step is checked by Codeforces: problems with the day\'s tag, accepted today, rated at or above your level for that tag. Clear it and that level goes up 100, so the next day with that tag is harder. The mission is done when both the check and the solves are.')}
  </div>`;
}

export const mount = mountMission;
