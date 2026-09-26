/**
 * What's new: this week's papers, models and repos, live — and your frontier
 * log. Anything here can be picked for the next frontier day.
 */
import { S } from '../../state.js';
import { mission, frontierFor, pickFrontier, frontierRepo, setFrontierRepo } from './actions.js';
import { MISSIONS } from './plan.js';
import { loadFeed } from './feed.js';
import { esc, toast, sfx, $ } from '../../ui.js';
import { icon } from '../../icons.js';

let feed = null, loading = false, error = '';
const KIND = { paper: '📄', model: '🤗', repo: '🐙' };

/** The frontier mission a pick is for: today's if it is one, otherwise the next. */
export function nextFrontier() {
  const m = mission();
  return MISSIONS.find(x => x.frontier && x.n >= m.n) || null;
}

async function refresh(rerender, force = false) {
  if (loading) return;
  loading = true; error = '';
  try { feed = await loadFeed({ force }); } catch (err) { error = err.message; }
  loading = false;
  rerender();
}

function item(x, target, picked) {
  const mine = picked?.item?.url === x.url;
  return `<div class="fr-item ${mine ? 'on' : ''}">
    <div class="grow"><a class="h3" href="${esc(x.url)}" target="_blank" rel="noopener">${KIND[x.kind]} ${esc(x.title)} ${icon('ext', 11).value}</a>
      <div class="tiny">${esc(x.note)}</div></div>
    ${target && !picked?.verified ? `<button class="btn xs ${mine ? 'primary' : ''}" data-pick='${esc(JSON.stringify(x))}'>${mine ? '✓ Picked' : 'Pick'}</button>` : ''}
  </div>`;
}

function section(title, list, target, picked) {
  return `<div class="section"><div class="section-head"><div class="h2">${title}</div></div>
    <div class="card flush">${list.length ? list.map(x => item(x, target, picked)).join('') : '<div class="empty">Nothing this week.</div>'}</div></div>`;
}

function log() {
  const entries = Object.entries(S.tracks.ai.frontier || {}).sort((a, b) => b[0] - a[0]);
  const repo = frontierRepo();
  return `<div class="section"><div class="section-head"><div class="h2">Your frontier log</div>
      <span class="tiny">${entries.filter(([, f]) => f.verified).length} logged</span></div>
    <div class="card">
      ${repo ? `<div class="tiny">Logged in <a href="https://github.com/${esc(repo.owner)}/${esc(repo.repo)}" target="_blank" rel="noopener">${esc(repo.owner)}/${esc(repo.repo)}</a> — one short entry per frontier day, with the link.</div>`
        : `<div class="field"><label for="fl-repo">Your frontier-log repo (public, on GitHub)</label>
            <input class="input" id="fl-repo" placeholder="${esc(S.github.user || 'you')}/frontier-log" autocapitalize="off" spellcheck="false"></div>
           <button class="btn sm block" style="margin-top:8px" data-fl-repo>Save</button>`}
      ${entries.length ? `<div class="stack s2" style="margin-top:12px">${entries.map(([n, f]) => `<div class="between res-row">
          <span class="${f.verified ? 'ok' : 'miss'}">${f.verified ? '✓' : '…'}</span>
          <span class="grow sub truncate">${esc(f.item.title)}</span><span class="tiny">mission ${n}</span></div>`).join('')}</div>` : ''}
    </div></div>`;
}

export function render() {
  const target = nextFrontier(), picked = target ? frontierFor(target.n) : null;
  const head = `<div class="card">
    <div class="between"><div class="h3">🔭 What's new in AI</div><button class="btn xs" data-feed-refresh>${loading ? 'Loading…' : 'Refresh'}</button></div>
    <div class="tiny" style="margin-top:4px">Live from Hugging Face and GitHub, this week. ${target ? `Pick one for mission ${target.n}, your ${target.n === mission().n ? 'frontier day today' : 'next frontier day'}.` : ''}</div>
    ${picked ? `<div class="tiny ok-line">Picked: ${esc(picked.item.title)}</div>` : ''}
  </div>`;
  const body = error ? `<div class="empty">${esc(error)}</div>`
    : !feed ? '<div class="empty">Loading this week\'s papers, models and repos…</div>'
    : section('Papers', feed.papers, target, picked) + section('Models', feed.models, target, picked) + section('Repos', feed.repos, target, picked);
  return `<div class="stack s4 fade-up">${head}${body}${log()}</div>`;
}

export function mount(root, rerender) {
  if (!feed && !loading && !error) refresh(rerender);
  root.querySelector('[data-feed-refresh]')?.addEventListener('click', () => refresh(rerender, true));
  root.querySelectorAll('[data-pick]').forEach(b => {
    b.onclick = () => {
      const t = nextFrontier();
      if (!t) return;
      pickFrontier(t.n, JSON.parse(b.dataset.pick)); sfx('tick');
      toast(`Picked for mission ${t.n}. Learn it with AI from the mission card.`);
      rerender();
    };
  });
  root.querySelector('[data-fl-repo]')?.addEventListener('click', () => {
    if (!setFrontierRepo($('#fl-repo', root).value)) { toast('Use owner/repo, like you/frontier-log.'); return; }
    rerender();
  });
}
