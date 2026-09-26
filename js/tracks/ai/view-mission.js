/**
 * Today's AI mission: learn one thing, prove it, then build — or, on a
 * frontier day, pick something that dropped this week, learn it with AI, try
 * it, and log it on GitHub. The AI tab opens here; the Today card is a copy.
 */
import { S, commitsOn, today } from '../../state.js';
import {
  mission, isVerified, bossReady, frontierFor, frontierRepo, pickFrontier, setFrontierRepo, verifyFrontier, XP_FRONTIER,
} from './actions.js';
import { missionAt, monthByN, topicById, buildById, stepLine, stepName, TOTAL_MISSIONS, bossFor } from './plan.js';
import { skillById } from './skills.js';
import { esc, sheet, toast, sfx, confetti, rewardToast, $ } from '../../ui.js';
import { icon } from '../../icons.js';
import * as P from '../../views/player.js';
import * as E from '../../learn/session.js';
import { tutorPrompt, tutorMinutes } from '../../learn/tutor.js';
import * as Parts from '../../views/mission-parts.js';
import { openBuild } from './view-builds.js';
import { openTab } from './hub.js';
import { go } from '../../router.js';

const T = 'ai';
const KIND = { paper: '📄 Paper', model: '🤗 Model', repo: '🐙 Repo' };

export const missionTitle = m => (m.boss ? `Boss day: ${bossFor(m.month).name}` : m.frontier ? 'Frontier day' : m.learn);

/** Today's cached feed, if the New tab has loaded it — render stays synchronous. */
export function cachedFeed() {
  try {
    const c = JSON.parse(localStorage.getItem('codify.aifeed.v1') || 'null');
    return c?.day === today() ? c.feed : null;
  } catch { return null; }
}

/* --------------------------------- steps ---------------------------------- */

function learnStep(m) {
  const t = topicById(m.topic);
  return `<button class="m-step tap" data-ai-learn>
    <span class="m-num">1</span>
    <div class="grow"><div class="label">Learn</div>
      <div class="h3">${esc(m.learn)}</div>
      <div class="tiny">🤖 AI tutor prompt · ${t.resources.filter(x => x.url).length} links · ${esc(t.name)}</div></div>
    ${icon('chevron', 16).value}
  </button>`;
}

function buildStep(m) {
  if (!m.build) return '';
  const b = buildById(m.build.id), verified = isVerified(b.id), commits = commitsOn();
  const check = verified ? '<div class="tiny ok-line">✓ Verified</div>'
    : b.verify === 'hf' ? '<div class="tiny m-check">Checked on Hugging Face when you ship it.</div>'
    : !S.github.user ? '<div class="tiny m-check">Add your GitHub on Hero so your pushes count</div>'
    : commits ? `<div class="tiny ok-line">✓ ${commits} commit${commits === 1 ? '' : 's'} today</div>`
    : '<div class="tiny m-check">Push what you get done today.</div>';
  return `<button class="m-step tap ${verified ? 'done' : ''}" data-build="${b.id}">
    <span class="m-num">3</span>
    <div class="grow"><div class="label">${b.capstone ? '🏆 Reproduction' : 'Build'} · ${stepName(m.build)} ${m.build.step}/${m.build.of} · ${b.compute === 'cheap' ? '💳 cheap GPU' : '🆓 free'}</div>
      <div class="h3">${esc(b.name)}</div>
      <div class="tiny m-task">${esc(stepLine(m.build, b))}</div>${check}</div>
    ${icon('chevron', 16).value}
  </button>`;
}

/** On a frontier day: pick one new thing, learn it with AI, try it, log it. */
function frontierStep(m) {
  const f = frontierFor(m.n), repo = frontierRepo(), feed = cachedFeed();
  let body;
  if (!f) {
    const top = feed ? [...feed.papers.slice(0, 2), ...feed.models.slice(0, 1), ...feed.repos.slice(0, 1)] : [];
    body = `<div class="h3">Pick one thing that dropped this week</div>
      ${top.length ? `<div class="stack s2" style="margin-top:8px">${top.map(x => `<button class="fr-pick" data-fr-pick='${esc(JSON.stringify(x))}'>
          <span class="badge">${KIND[x.kind]}</span><span class="grow truncate">${esc(x.title)}</span></button>`).join('')}</div>` : ''}
      <button class="btn primary block m-go" data-fr-open>${top.length ? 'See everything new' : 'Open What\'s new'}</button>`;
  } else {
    body = `<div class="h3"><a href="${esc(f.item.url)}" target="_blank" rel="noopener">${esc(f.item.title)} ${icon('ext', 12).value}</a></div>
      <div class="tiny">${KIND[f.item.kind]} · ${esc(f.item.note || '')}</div>
      ${f.verified ? `<div class="tiny ok-line">✓ Logged ${esc(f.verified)}</div>` : `
        <ol class="fr-steps tiny">
          <li>Learn it: copy the tutor prompt below into your AI.</li>
          <li>Try it by hand — run it, test it, or rebuild a small piece.</li>
          <li>Push a short entry to your frontier log with its link: what it is, what you tried, what happened.</li>
        </ol>
        <button class="btn block m-go" data-fr-tutor>🤖 Learn it with AI</button>
        ${repo ? `<div class="tiny" style="margin-top:8px">Log: <a href="https://github.com/${esc(repo.owner)}/${esc(repo.repo)}" target="_blank" rel="noopener">${esc(repo.owner)}/${esc(repo.repo)}</a></div>
          <button class="btn primary block m-go" data-fr-verify>Check my log entry (+${XP_FRONTIER.xp} XP)</button>`
        : `<div class="field" style="margin-top:10px"><label for="fr-repo">Your frontier-log repo (public, on GitHub)</label>
            <input class="input" id="fr-repo" placeholder="${esc(S.github.user || 'you')}/frontier-log" autocapitalize="off" spellcheck="false"></div>
          <button class="btn primary block m-go" data-fr-repo>Save</button>`}
        <button class="linkish" data-fr-change>Pick something else</button>`}`;
  }
  return `<div class="m-step ${f?.verified ? 'done' : ''}">
    <span class="m-num">3</span>
    <div class="grow"><div class="label">🔭 Frontier</div>${body}</div>
  </div>`;
}

function bossStep(m) {
  const won = S.tracks.ai.bosses?.[m.month]?.won, ready = bossReady(m.month), boss = bossFor(m.month);
  if (m.done || m.check || won || !ready.ok) {
    return Parts.proveStep(T, m, 1, { note: m.done ? '' : `<div class="tiny">${esc(won ? 'Boss already beaten.' : ready.why)} Today is a review of this part.</div>` });
  }
  return `<div class="m-step">
    <span class="m-num">1</span>
    <div class="grow"><div class="label">This part's boss</div>
      <div class="h3">${boss.icon} Fight ${esc(boss.name)}</div><div class="tiny">${esc(boss.intro)}</div>
      <button class="btn hot block m-go" data-ai-boss="${m.month}">${S.active?.mode === 'boss' ? 'Resume the fight' : 'Fight'}</button></div>
  </div>`;
}

/** Between missions at a slower pace: keep going on the last build. */
function keepBuilding(m) {
  const prev = m.n > 1 ? missionAt(m.n - 1) : null;
  if (!prev?.build) return '';
  const b = buildById(prev.build.id);
  return `<button class="m-step tap" data-build="${b.id}">
    <span class="m-num">2</span>
    <div class="grow"><div class="label">Keep going · ${stepName(prev.build)} ${prev.build.step}/${prev.build.of}</div>
      <div class="h3">${esc(b.name)}</div><div class="tiny m-task">${esc(stepLine(prev.build, b))}</div></div>
    ${icon('chevron', 16).value}
  </button>`;
}

/** The mission card. `compact` is the version on Today. */
export function missionCard({ compact = false } = {}) {
  const m = mission(), month = monthByN(m.month);
  if (m.finished && !m.done) {
    return `<div class="card mission-card"><div class="h2">All ${TOTAL_MISSIONS} missions done</div>
      <p class="sub" style="margin-top:6px">That is the whole plan. Keep the frontier habit — one new thing a week.</p></div>`;
  }
  if (!m.done && !m.check && !E.paceInfo(T).missionDay) {
    return `<div class="${compact ? 'm-inner' : 'card mission-card'}" style="--mc:${month.color}">
      ${compact ? '' : Parts.header(T, m, month, { keepGoing: true })}
      <div class="m-steps">${Parts.keepGoing(T, m, keepBuilding(m))}</div>
    </div>`;
  }
  const next = m.done && m.n < TOTAL_MISSIONS ? missionAt(m.n + 1) : null;
  const steps = m.boss ? bossStep(m)
    : m.frontier ? learnStep({ ...m, learn: 'Something new: pick it below, then learn it with AI' }) + Parts.proveStep(T, m) + frontierStep(m)
    : learnStep(m) + Parts.proveStep(T, m) + buildStep(m);
  return `<div class="${compact ? 'm-inner' : 'card mission-card'}" style="--mc:${month.color}">
    ${compact ? '' : Parts.header(T, m, month)}
    <div class="m-steps">${steps}</div>
    ${Parts.testOutRow(T, m)}
    ${Parts.tomorrow(next, missionTitle)}
  </div>`;
}

/* ---------------------------------- learn --------------------------------- */

const recentTopics = m => {
  const out = [];
  for (let k = m.n - 1; k >= 1 && out.length < 5; k--) { const x = missionAt(k); if (!x.boss && !x.frontier) out.unshift(x.learn); }
  return out;
};

function tutorFor(m) {
  const t = topicById(m.topic), next = m.n < TOTAL_MISSIONS ? missionAt(m.n + 1) : null, b = m.build && buildById(m.build.id);
  return tutorPrompt({
    subject: 'AI, from the maths underneath to the research frontier', n: m.n, total: TOTAL_MISSIONS, part: monthByN(m.month),
    learn: m.learn, why: t.why, skills: m.skills.map(id => skillById(id).name), recent: recentTopics(m),
    next: next && !next.boss && !next.frontier ? next.learn : '',
    links: t.resources.filter(x => x.url), task: b ? `${b.name} — ${stepName(m.build).toLowerCase()} step ${m.build.step} of ${m.build.of}: ${stepLine(m.build, b)}` : '',
    notes: ['I work in Python. Show code, and make me write the key lines myself.', 'If a step needs a GPU, tell me the free option first (Colab or Kaggle).'],
    minutes: tutorMinutes(E.paceOf(T).hours),
  });
}

function frontierTutor(m, item) {
  return tutorPrompt({
    subject: 'AI, from the maths underneath to the research frontier', n: m.n, total: TOTAL_MISSIONS, part: monthByN(m.month),
    learn: `this week's new thing — ${item.title} (${item.url})`, recent: recentTopics(m),
    links: [{ name: item.title, url: item.url }],
    task: 'try it by hand — run it, test it, or rebuild a small piece of it — then write a short log entry: what it is, what I tried, what happened, and the link.',
    notes: ['If you cannot open the link, say so and work from what I paste in. Do not guess what it says.', 'Explain it using what I have already covered, and tell me honestly whether it matters.'],
    minutes: tutorMinutes(E.paceOf(T).hours),
  });
}

export function openLearn(m, rerender) {
  const t = topicById(m.topic), prompt = tutorFor(m);
  sheet('Learn', `<div class="label">Mission ${m.n} · ${esc(t.name)}</div>
    <div class="h2" style="margin-top:6px">${esc(m.learn)}</div>
    <p class="sub" style="margin-top:10px">${esc(t.why)}</p>
    ${Parts.tutorCard(prompt)}
    ${m.skills.length ? `<div class="card sunk pad-s" style="margin-top:14px"><div class="label">New in today's check</div>
      <div class="h3" style="margin-top:4px">${esc(m.skills.map(id => skillById(id).name).join(', '))}</div></div>` : ''}
    <div class="label" style="margin-top:16px">Or learn it from the sources</div>
    <div class="res-list">${t.resources.map(x => `<div class="res"><div class="grow">
      <div class="res-name"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)} ${icon('ext', 12).value}</a></div>
      ${x.note ? `<div class="tiny">${esc(x.note)}</div>` : ''}</div><span class="badge price">${esc(x.price)}</span></div>`).join('')}</div>`,
  el => Parts.mountTutor(el, prompt));
}

function openFrontierTutor(m) {
  const f = frontierFor(m.n);
  if (!f) return;
  const prompt = frontierTutor(m, f.item);
  sheet('Learn it with AI', `<div class="label">Frontier · mission ${m.n}</div>
    <div class="h2" style="margin-top:6px">${esc(f.item.title)}</div>${Parts.tutorCard(prompt)}`, el => Parts.mountTutor(el, prompt));
}

/* ---------------------------------- wiring -------------------------------- */

export function mountMission(root, rerender) {
  Parts.mountParts(root, T, rerender);
  const m = mission();
  root.querySelectorAll('[data-ai-learn]').forEach(el => {
    el.onclick = () => (m.frontier ? (frontierFor(m.n) ? openFrontierTutor(m) : (openTab('new'), go('ai'), rerender())) : openLearn(m, rerender));
  });
  root.querySelectorAll('.m-steps [data-build]').forEach(el => { el.onclick = () => openBuild(el.dataset.build, rerender); });
  root.querySelectorAll('[data-ai-boss]').forEach(el => { el.onclick = () => P.openBoss(+el.dataset.aiBoss, rerender, 'ai'); });
  root.querySelectorAll('[data-fr-open]').forEach(el => { el.onclick = () => { openTab('new'); go('ai'); rerender(); }; });
  root.querySelectorAll('[data-fr-pick]').forEach(el => { el.onclick = () => { pickFrontier(m.n, JSON.parse(el.dataset.frPick)); sfx('tick'); rerender(); }; });
  root.querySelectorAll('[data-fr-change]').forEach(el => { el.onclick = () => { delete S.tracks.ai.frontier[m.n]; openTab('new'); go('ai'); rerender(); }; });
  root.querySelectorAll('[data-fr-tutor]').forEach(el => { el.onclick = () => openFrontierTutor(m); });
  root.querySelectorAll('[data-fr-repo]').forEach(el => {
    el.onclick = () => { if (!setFrontierRepo($('#fr-repo', root)?.value)) { toast('Use owner/repo, like you/frontier-log.'); return; } rerender(); };
  });
  root.querySelectorAll('[data-fr-verify]').forEach(el => {
    el.onclick = async () => {
      if (!S.github.user) { toast('Add your GitHub username on Hero first.'); return; }
      el.disabled = true; el.textContent = 'Checking…';
      const res = await verifyFrontier(m.n);
      if (!res.ok) { toast(esc(res.error), 4000); el.disabled = false; el.textContent = 'Check again'; return; }
      if (res.verified) { confetti(80); sfx('reward'); if (res.reward) rewardToast(res.reward); }
      else toast(esc(res.checks.filter(c => !c.pass).map(c => `${c.label}: ${c.detail}`).join(' · ')), 5000);
      rerender();
    };
  });
}

/* ---------------------------------- page ---------------------------------- */

const describe = x => ({
  title: missionTitle(x),
  sub: x.frontier ? 'pick something new from this week' : [
    ...(x.skills.length ? [`new: ${x.skills.map(id => skillById(id).name).join(', ')}`] : []),
    ...(x.build ? [`${stepName(x.build)} · ${buildById(x.build.id).name}`] : []),
  ].join(' · '),
});

export function render() {
  return `<div class="stack s4 fade-up">
    ${missionCard()}
    ${Parts.paceCard(T)}
    ${Parts.progressCard(T)}
    ${Parts.comingUp(T, describe)}
    ${Parts.howItWorks(T, 'Builds are checked on GitHub — tests passing in GitHub Actions, the numbers in the README, commits by you — or on Hugging Face, with a public model or demo and a card that reports its results. Each part ends with a paper reproduction; verify it and the boss opens. Every 7th day is a frontier day: something new, tried by hand and logged.')}
  </div>`;
}

export const mount = mountMission;
