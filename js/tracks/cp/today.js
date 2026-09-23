/** The programming card on Today: what the judge accepted today, and what to do next. */
import { S } from '../../state.js';
import { isLinked, dayTotals, solvesOn, activeContest } from './actions.js';
import { TOPICS } from './topics.js';
import { colorForRating } from './model.js';
import { problemUrl } from './codeforces.js';
import { syncAll, describeSync, isSyncing, lastSync } from '../../sync.js';
import { esc, bar, toast, timeOf } from '../../ui.js';

export function render() {
  if (!isLinked()) {
    return `<div class="card track-card" style="--tc:var(--blue)">
      <div class="between"><span class="label">⌨️ Programming</span><button class="btn xs" data-go="cp">Open</button></div>
      <div class="h3" style="margin-top:6px">Connect Codeforces to start</div>
      <div class="tiny" style="margin-top:4px">Every number in this track comes from your accepted submissions.</div>
    </div>`;
  }
  const t = dayTotals(), goal = S.tracks.cp.dailySolves, live = activeContest();
  const recent = solvesOn().slice(-3);
  return `<div class="card track-card" style="--tc:var(--blue)">
    <div class="between"><span class="label">⌨️ Programming</span>
      <div class="row" style="gap:6px"><button class="btn xs" data-cpsync>${isSyncing() ? 'Syncing…' : 'Sync'}</button>
      <button class="btn xs" data-go="cp">Open</button></div></div>
    ${live ? `<button class="track-row tap live" data-go="cp" data-cptab="contests">
      <div class="grow"><div class="h3">${esc(live.contest.name)} is running</div>
        <div class="tiny">${live.solved}/${live.need} counted · ${Math.floor(live.secondsLeft / 60)} min left</div></div>
      <span class="badge ${live.won ? 'good' : 'warn'}">${live.won ? 'won' : 'live'}</span></button>` : ''}
    <div class="row" style="margin-top:10px;align-items:flex-end">
      <div class="grow"><div class="today-big num">${t.solved}<span style="font-size:17px;color:var(--dim)">/${goal}</span></div>
        <div class="tiny">accepted today · ${esc(S.tracks.cp.handle)}</div></div>
      <div class="right"><div class="h2 num">${t.bestRating || '—'}</div><div class="tiny">hardest today</div></div>
    </div>
    <div style="margin-top:8px">${bar(Math.min(100, (t.solved / goal) * 100), { tall: true, color: t.solved >= goal ? 'var(--good)' : 'var(--accent)' })}</div>
    ${recent.length ? `<div class="stack s2" style="margin-top:10px">${recent.map(s => `<a class="mini-solve" href="${esc(problemUrl(s))}" target="_blank" rel="noopener">
      <span class="truncate">${esc(s.name)}</span><span class="badge" style="background:${colorForRating(s.rating)}">${s.rating ?? '—'}</span></a>`).join('')}</div>`
      : `<div class="tiny" style="margin-top:8px">${lastSync() ? `Last checked at ${timeOf(lastSync())}.` : 'Solve something, then sync.'}</div>`}
    <button class="btn primary block sm" style="margin-top:12px" data-go="cp">Find a problem</button>
  </div>`;
}

export function mount(root, rerender) {
  const s = root.querySelector('[data-cpsync]');
  if (s) s.onclick = async () => { s.textContent = 'Syncing…'; const r = await syncAll({ force: true }); toast(esc(describeSync(r)), 3200); rerender(); };
}

/** Things the focus timer can be tagged with: the topics. */
export const timerTags = () => TOPICS.map(t => ({ value: `cp:${t.id}`, label: `Programming · ${t.name}` }));
