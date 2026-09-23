/**
 * The programming track: the topic tree, timed contests, and your solves.
 *
 * Nothing here can be clicked to complete. A tier fills in when Codeforces says
 * you solved enough problems with that tag at that rating; a contest is settled
 * by the timestamps the judge recorded. The only actions are links out to real
 * problems, a clock, and a sync.
 */
import { S, today } from '../../state.js';
import { PATHS, TIERS, topicById } from './topics.js';
import { CONTESTS } from './contests.js';
import {
  isLinked, solvedList, treeProgress, treeCompletion, topicStatus, staleness,
  activeContest, startContest, finishContest, abandonContest, linkCodeforces,
} from './actions.js';
import { colorForRating, BANDS } from './model.js';
import { suggestProblems, problemUrl, leetcodeTagUrl, checkHandle } from './codeforces.js';
import { syncAll, describeSync, isSyncing } from '../../sync.js';
import { seriesChart } from '../../charts.js';
import { h, raw, esc, $, $$, bind, bar, pct, sheet, dialog, toast, sfx, haptic, confetti, rewardToast, fmt, shortDate } from '../../ui.js';
import { dayKey, addDays } from '../../game.js';

const TABS = [['topics', 'Topics'], ['contests', 'Contests'], ['solves', 'Solves']];
let tab = 'topics', filter = 'all', ticker = null;

export const openTab = t => { if (TABS.some(([k]) => k === t)) tab = t; };

/* ------------------------------- not linked ------------------------------- */

function connect() {
  return `<div class="card">
    <div class="h2">Connect Codeforces</div>
    <p class="sub" style="margin-top:8px">Every tier, contest and solve here is read from your accepted submissions.
      Nothing to type in and nothing to claim — the judge decides.</p>
    <div class="field" style="margin-top:14px"><label for="cp-handle">Codeforces handle</label>
      <input class="input" id="cp-handle" autocapitalize="off" spellcheck="false" placeholder="tourist"></div>
    <button class="btn primary block" style="margin-top:12px" data-cp="link">Connect</button>
    <div class="tiny" style="margin-top:8px">No sign-in. The handle is checked against Codeforces' public API.</div>
  </div>`;
}

/* --------------------------------- topics --------------------------------- */

function topics() {
  const tree = treeProgress(), done = treeCompletion();
  const paths = filter === 'all' ? PATHS : PATHS.filter(p => p.id === filter);
  return `
    <div class="between"><div class="sub">${done.cleared} of ${done.total} tiers cleared</div><span class="badge">${pct(done.pct)}</span></div>
    <div style="margin-top:8px">${bar(done.pct)}</div>
    <div class="pill-scroll" style="margin-top:14px">
      <button class="pill ${filter === 'all' ? 'on' : ''}" data-filter="all">All</button>
      ${PATHS.map(p => `<button class="pill ${filter === p.id ? 'on' : ''}" data-filter="${p.id}">${p.icon} ${p.short}</button>`).join('')}
    </div>
    ${paths.map(p => pathBlock(p, tree)).join('')}`;
}

function pathBlock(path, tree) {
  const rows = tree.filter(t => t.topic.path === path.id);
  const cleared = rows.reduce((n, r) => n + r.cleared, 0), total = rows.length * TIERS.length;
  return `<section class="section">
    <div class="between"><div class="row" style="gap:10px"><span class="path-glyph">${path.icon}</span>
      <div><div class="h3">${esc(path.name)}</div><div class="tiny">${esc(path.blurb)}</div></div></div>
      <div class="num h3" style="flex:none">${cleared}/${total}</div></div>
    <div class="tree" style="margin-top:12px">${rows.map(topicRow).join('')}</div>
  </section>`;
}

function topicRow(p) {
  const st = staleness(p.topic.id), stale = !st?.never && st?.days >= 45;
  return `<button class="tree-node ${p.cleared ? 'mastered' : p.total ? 'available' : 'locked'}" data-topic="${p.topic.id}" style="--pc:var(--accent)">
    <span class="grow"><span class="tree-name">${esc(p.topic.name)}</span>
      <span class="tree-meta">${p.total ? `${p.total} solved · best ${p.best || '—'}` : 'nothing solved yet'}${st?.never ? '' : ` · ${st.days}d ago`}</span>
      <span class="tier-pips">${TIERS.map(t => `<i class="${p.tiers.find(x => x.n === t.n).cleared ? 'on' : ''}"></i>`).join('')}</span></span>
    ${stale ? '<span class="badge warn">stale</span>' : ''}
    <span class="badge ${p.cleared === TIERS.length ? 'good' : ''}">${p.cleared}/${TIERS.length}</span>
  </button>`;
}

function openTopic(id) {
  const p = topicStatus(id);
  if (!p) return;
  const topic = p.topic, st = staleness(id), next = p.next;
  sheet(topic.name, `
    <p class="sub">${esc(topic.blurb)}</p>
    <div class="grid2" style="margin-top:14px">
      <div class="tile"><div class="v">${p.total}</div><div class="k">solved</div></div>
      <div class="tile"><div class="v">${p.best || '—'}</div><div class="k">best rating</div></div>
    </div>
    <div class="label" style="margin-top:18px">Tiers</div>
    <div class="stack s2" style="margin-top:8px">${p.tiers.map(t => `
      <div class="card pad-s ${t.cleared ? 'rail' : 'sunk'}" ${t.cleared ? 'style="--rail:var(--good)"' : ''}>
        <div class="between"><div><div class="h3">${t.name} · ${t.label}</div><div class="tiny">${t.need} problems rated ${t.min}+</div></div>
          <span class="badge ${t.cleared ? 'good' : ''}">${Math.min(t.solved, t.need)}/${t.need}</span></div>
        <div style="margin-top:8px">${bar(t.pct, { color: t.cleared ? 'var(--good)' : 'var(--accent)' })}</div>
      </div>`).join('')}</div>
    ${st?.never ? '' : `<div class="card sunk" style="margin-top:14px"><div class="tiny">Last accepted ${st.days} days ago — ${esc(st.last.name)} (${st.last.rating ?? 'unrated'}).</div></div>`}
    <div class="label" style="margin-top:18px">Go and solve${next ? ` — ${next.min}–${next.max}` : ''}</div>
    <div id="sk-problems" style="margin-top:8px"><div class="empty">Loading problems…</div></div>
    <a class="btn ghost block sm" style="margin-top:12px;text-decoration:none" href="${esc(leetcodeTagUrl(topic.lc))}" target="_blank" rel="noopener">Practise on LeetCode instead</a>
    <div class="tiny" style="margin-top:8px">LeetCode blocks cross-origin reads, so nothing solved there can be verified or counted. The link is for practice only.</div>
  `, async el => {
    const box = $('#sk-problems', el), tier = next || p.tiers.at(-1);
    try {
      const list = await suggestProblems(topic.cf, { minRating: tier.min, maxRating: tier.max, solvedKeys: new Set(solvedList().map(s => s.key)), limit: 6 });
      box.innerHTML = list.length ? `<div class="stack s2">${list.map(pr => `
        <a class="card pad-s" style="display:block;text-decoration:none" href="${esc(pr.url)}" target="_blank" rel="noopener">
          <div class="between"><div class="grow truncate"><div class="h3 truncate">${esc(pr.name)}</div>
            <div class="tiny truncate">${esc(pr.contestId + pr.index)} · ${esc(pr.tags.slice(0, 3).join(' · '))}</div></div>
            <span class="badge" style="background:${colorForRating(pr.rating)}">${pr.rating}</span></div>
        </a>`).join('')}</div>` : '<div class="empty">Nothing unsolved left in this band. Move up a tier.</div>';
    } catch (err) { box.innerHTML = `<div class="empty">${esc(err.message)}</div>`; }
  });
}

/* -------------------------------- contests -------------------------------- */

function contests() {
  const live = activeContest();
  if (live) return liveView(live);
  return `<div class="sub">A clock and a target. Start it, solve on Codeforces, sync — the judge's timestamps settle it.</div>
    <div class="stack" style="margin-top:14px">${CONTESTS.map(contestCard).join('')}</div>
    <div class="card sunk" style="margin-top:16px"><div class="tiny">A problem counts if it was accepted inside the window, is rated at or above
      the floor, and was not already solved before you started.</div></div>`;
}

function contestCard(c) {
  const rec = S.tracks.cp.contests[c.id] || {};
  const rating = S.tracks.cp.rating || 0;
  const hint = rating && c.minRating > rating + 400 ? ' · well above your rating' : '';
  return `<button class="card tap ${rec.won ? 'gauntlet won' : ''}" data-start="${c.id}">
    <div class="between"><div class="row" style="gap:12px"><span class="g-glyph">${c.icon}</span>
      <div class="grow"><div class="h3">${esc(c.name)}</div>
        <div class="tiny" style="margin-top:2px">${c.need} problems rated ${c.minRating}+ in ${c.minutes} minutes${hint}</div></div></div>
      <span class="badge ${rec.won ? 'good' : 'warn'}">${rec.won ? 'won' : `+${c.xp}`}</span></div>
    <div class="tiny" style="margin-top:8px">${esc(c.blurb)}</div>
    ${rec.attempts ? `<div class="tiny" style="margin-top:6px">${rec.attempts} attempt${rec.attempts === 1 ? '' : 's'} · best ${rec.best}/${c.need}</div>` : ''}
  </button>`;
}

const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function liveView(live) {
  const { contest } = live;
  return `<div class="between"><div><div class="h2">${esc(contest.name)}</div>
      <div class="sub">${contest.need} problems rated ${contest.minRating}+</div></div>
    <span class="badge ${live.won ? 'good' : live.expired ? 'bad' : 'warn'}">${live.won ? 'won' : live.expired ? 'time up' : 'running'}</span></div>
  <div class="card center" style="margin-top:14px">
    <div class="pl-timer ${live.expired ? 'over' : ''}" id="ct-clock">${live.expired ? '00:00' : clock(live.secondsLeft)}</div>
    <div class="tiny" style="margin-top:12px">${live.expired ? 'window closed' : 'remaining'}</div>
    <div style="margin-top:14px">${bar((live.solved / live.need) * 100, { tall: true, color: live.won ? 'var(--good)' : 'var(--accent)' })}</div>
    <div class="num h2" style="margin-top:8px">${live.solved} / ${live.need}</div>
  </div>
  ${live.counted.length ? `<div class="section"><div class="label">Counted so far</div><div class="stack s2" style="margin-top:8px">${live.counted.map(solveRow).join('')}</div></div>`
    : '<div class="empty" style="margin-top:14px">Nothing counted yet. Solve on Codeforces, then sync.</div>'}
  <div class="row" style="margin-top:16px"><button class="btn grow" data-cp="sync">Sync</button>
    <button class="btn primary grow" data-cp="finish">${live.won ? 'Claim the win' : live.expired ? 'Bank it' : 'Finish early'}</button></div>
  <button class="btn ghost block sm" style="margin-top:8px" data-cp="abandon">Abandon</button>
  <a class="btn ghost block sm" style="margin-top:12px;text-decoration:none" href="https://codeforces.com/problemset?tags=${contest.minRating}-" target="_blank" rel="noopener">Open the problem set</a>`;
}

/* --------------------------------- solves --------------------------------- */

function solveRow(s) {
  return `<a class="card pad-s solve-row" href="${esc(problemUrl(s))}" target="_blank" rel="noopener">
    <div class="between"><div class="grow truncate"><div class="h3 truncate">${esc(s.name)}</div>
      <div class="tiny truncate">${esc(shortDate(s.day))} · ${esc((s.tags || []).slice(0, 3).join(' · ') || 'no tags')}</div></div>
      <span class="badge" style="background:${colorForRating(s.rating)}">${s.rating ?? '—'}</span></div>
  </a>`;
}

function solves() {
  const list = solvedList();
  if (!list.length) return '<div class="empty">No accepted solves yet. Solve something on Codeforces, then sync.</div>';
  const keys = Array.from({ length: 30 }, (_, i) => addDays(dayKey(), i - 29));
  const perDay = keys.map((k, i) => {
    const n = list.filter(s => s.day === k).length;
    return { value: n, color: n >= S.tracks.cp.dailySolves ? 'var(--acid)' : 'var(--card)', label: `${shortDate(k)}: ${n}`, axis: i % 7 === 0 || i === 29 ? shortDate(k) : '' };
  });
  const bands = BANDS.map((b, i) => ({ ...b, n: list.filter(s => s.rating != null && s.rating >= b.min && (i === BANDS.length - 1 || s.rating < BANDS[i + 1].min)).length }));
  const peak = Math.max(1, ...bands.map(b => b.n));
  return `
    <div class="grid3"><div class="tile"><div class="v">${list.length}</div><div class="k">solved</div></div>
      <div class="tile"><div class="v">${S.stats.bestRating || '—'}</div><div class="k">hardest</div></div>
      <div class="tile"><div class="v">${S.tracks.cp.rating ?? '—'}</div><div class="k">rating</div></div></div>
    <div class="card" style="margin-top:12px"><div class="between"><span class="label">Solves · 30 days</span><span class="tiny">green = daily goal met</span></div>
      <div style="margin-top:12px">${seriesChart(perDay, { height: 90, target: S.tracks.cp.dailySolves, axisEvery: 7 })}</div></div>
    <div class="card" style="margin-top:12px"><span class="label">By rating</span>
      <div class="stack s2" style="margin-top:10px">${bands.map(b => `<div class="bar-row"><div class="bar-row-k">${b.name}</div>
        <div class="bar"><i style="width:${(b.n / peak) * 100}%;background:${b.color}"></i></div><div class="bar-row-v">${b.n}</div></div>`).join('')}</div></div>
    <div class="label" style="margin-top:16px">Most recent</div>
    <div class="stack s2" style="margin-top:8px">${[...list].sort((a, b) => b.at - a.at).slice(0, 15).map(solveRow).join('')}</div>`;
}

/* ---------------------------------- view ---------------------------------- */

export function render() {
  const c = S.tracks.cp;
  const head = `<div class="between"><div><div class="label">Programming${c.handle ? ` · ${esc(c.handle)}` : ''}</div>
      <div class="h1" style="margin-top:4px">⌨️ Codeforces</div></div>
    ${c.handle ? `<div class="stack s2" style="align-items:flex-end"><span class="badge" style="background:${colorForRating(c.rating)}">${c.rating ?? 'unrated'}${c.rank ? ` · ${esc(c.rank)}` : ''}</span>
      <button class="btn xs" data-cp="sync">${isSyncing() ? 'Syncing…' : 'Sync'}</button></div>` : ''}</div>`;
  if (!isLinked()) return `<div class="fade-up">${head}<div style="margin-top:16px">${connect()}</div></div>`;
  const body = tab === 'topics' ? topics() : tab === 'contests' ? contests() : solves();
  return `<div class="fade-up">${head}
    <div class="seg" style="margin-top:14px">${TABS.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-sub="${k}">${l}${k === 'contests' && activeContest() ? ' ●' : ''}</button>`).join('')}</div>
    <div style="margin-top:16px">${body}</div></div>`;
}

export function mount(root, rerender) {
  clearInterval(ticker);
  $$('[data-sub]', root).forEach(b => b.onclick = () => { tab = b.dataset.sub; rerender(); document.getElementById('view').scrollTop = 0; });
  $$('[data-filter]', root).forEach(b => b.onclick = () => { filter = b.dataset.filter; sfx('tick'); rerender(); });
  $$('[data-topic]', root).forEach(b => b.onclick = () => openTopic(b.dataset.topic));

  $$('[data-start]', root).forEach(b => b.onclick = () => {
    const c = CONTESTS.find(x => x.id === b.dataset.start);
    dialog(`<div class="h2">Start ${esc(c.name)}?</div>
      <p class="sub" style="margin:12px 0 16px">${c.need} problems rated ${c.minRating}+ within ${c.minutes} minutes. Everything you have already solved is recorded now and will not count.</p>
      <button class="btn primary block" data-yes>Start the clock</button>
      <button class="btn ghost block sm" style="margin-top:8px" data-no>Not now</button>`,
      (d, close) => {
        d.querySelector('[data-no]').onclick = close;
        d.querySelector('[data-yes]').onclick = () => { startContest(c.id); close(); sfx('start'); haptic(16); rerender(); };
      });
  });

  $$('[data-cp]', root).forEach(el => el.onclick = async () => {
    const act = el.dataset.cp;
    if (act === 'sync') {
      el.textContent = 'Syncing…';
      const r = await syncAll({ force: true });
      toast(esc(describeSync(r)), 3200);
      if (r.cf?.drop) toast(`${r.cf.drop.icon} <b>${esc(r.cf.drop.name)}</b>`, 3000);
      rerender();
    } else if (act === 'link') {
      const v = $('#cp-handle', root).value.trim();
      el.disabled = true; el.textContent = 'Checking…';
      try {
        const u = await checkHandle(v);
        linkCodeforces(u);
        toast(`Connected to <b>${esc(u.handle)}</b> — syncing…`);
        const r = await syncAll({ force: true });
        toast(esc(describeSync(r)), 3200);
      } catch (err) { toast(esc(err.message), 4000); el.disabled = false; el.textContent = 'Connect'; }
      rerender();
    } else if (act === 'finish') {
      const done = finishContest();
      if (!done) return;
      if (done.result.won) { sfx('reward'); confetti(150); } else sfx('fail');
      rewardToast(done.reward);
      toast(done.result.won ? `${esc(done.contest.name)} cleared` : `Banked ${done.result.solved}/${done.contest.need}.`, 3600);
      rerender();
    } else if (act === 'abandon') {
      dialog(`<div class="h2">Abandon the run?</div><p class="sub" style="margin:12px 0 16px">No credit, no attempt recorded.</p>
        <button class="btn hot block" data-yes>Abandon</button><button class="btn ghost block sm" style="margin-top:8px" data-no>Keep going</button>`,
        (d, close) => { d.querySelector('[data-no]').onclick = close; d.querySelector('[data-yes]').onclick = () => { abandonContest(); close(); rerender(); }; });
    }
  });

  const handle = $('#cp-handle', root);
  handle?.addEventListener('keydown', e => { if (e.key === 'Enter') root.querySelector('[data-cp="link"]').click(); });

  // The contest clock ticks in place rather than repainting the page under your thumb.
  const clk = $('#ct-clock', root);
  if (clk) ticker = setInterval(() => {
    const live = activeContest();
    if (!live) return clearInterval(ticker);
    if (live.expired) { clk.textContent = '00:00'; clk.classList.add('over'); return; }
    clk.textContent = clock(live.secondsLeft);
  }, 1000);
}
