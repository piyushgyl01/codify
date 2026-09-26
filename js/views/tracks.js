/**
 * Tracks: the ones you are doing, and every other one you could add. The nav
 * never grows — however many tracks there are, they live here, with a search
 * once the list is long enough to need one.
 */
import { enabledTracks, trackOn, setTrack } from '../state.js';
import { TRACKS, trackById } from '../tracks/index.js';
import * as E from '../learn/session.js';
import { esc, toast, sfx, $ } from '../ui.js';
import { icon } from '../icons.js';
import { go } from '../router.js';

const SEARCH_FROM = 7;          // below this many tracks, a search box is just clutter
let editing = false;

const words = t => esc(`${t.name} ${t.nav} ${t.tagline}`.toLowerCase());

/** Where you are in a track, and whether it still wants something today. */
function status(id) {
  const total = E.trackCfg(id).plan.length, done = E.missionsDone(id), p = E.paceInfo(id);
  const left = p.missionDay ? !E.missionDoneToday(id) : !E.reviewDoneToday(id);
  return { line: done >= total ? `All ${total} missions done` : `Mission ${E.mission(id).n} of ${total}`, left };
}

function mine(t) {
  const s = status(t.id);
  const badge = editing ? `<span class="pill" data-remove="${t.id}">Remove</span>`
    : s.left ? '<span class="badge warn">to do</span>' : '<span class="badge good">✓ today</span>';
  return `<button class="card tap rail" style="--rail:${t.color}" ${editing ? '' : `data-open="${t.id}"`} data-find="${words(t)}">
    <div class="between"><div class="h2">${t.icon} ${esc(t.name)}</div>${badge}</div>
    <div class="tiny" style="margin-top:4px">${esc(s.line)}</div></button>`;
}

function more(t) {
  return `<div class="card pad-s" data-find="${words(t)}"><div class="between">
    <div class="grow"><div class="h3">${t.icon} ${esc(t.name)}</div><div class="tiny">${esc(t.tagline)}</div></div>
    <button class="pill" data-add="${t.id}">Add</button></div></div>`;
}

export function render() {
  const on = enabledTracks().map(trackById), off = TRACKS.filter(t => !trackOn(t.id));
  const search = TRACKS.length >= SEARCH_FROM ? `<div class="field search-field">${icon('search', 16).value}
      <input class="input" id="tr-find" type="search" placeholder="Search ${TRACKS.length} tracks" autocapitalize="off" spellcheck="false"></div>` : '';
  return `<div class="stack s4 fade-up">
    <div class="page-head"><div class="h1">Tracks</div><div class="sub">${on.length} of ${TRACKS.length} switched on</div></div>
    ${search}
    <div><div class="section-head"><div class="h2">Yours</div>
        ${on.length > 1 || editing ? `<button class="btn xs" data-edit>${editing ? 'Done' : 'Edit'}</button>` : ''}</div>
      <div class="stack s2">${on.map(mine).join('')}</div></div>
    ${off.length ? `<div><div class="section-head"><div class="h2">More tracks</div></div>
      <div class="stack s2">${off.map(more).join('')}</div></div>` : ''}
    <div class="empty hide" data-none>No track matches that.</div>
  </div>`;
}

export function mount(root, rerender) {
  root.querySelectorAll('[data-open]').forEach(b => { b.onclick = () => go(b.dataset.open); });
  root.querySelector('[data-edit]')?.addEventListener('click', () => { editing = !editing; rerender(); });
  root.querySelectorAll('[data-add]').forEach(b => {
    b.onclick = () => { setTrack(b.dataset.add, true); editing = false; sfx('tick'); toast(`${esc(trackById(b.dataset.add).name)} added — its first mission is on Today.`); rerender(); };
  });
  root.querySelectorAll('[data-remove]').forEach(b => {
    b.onclick = () => {
      if (!setTrack(b.dataset.remove, false)) { toast('At least one track has to stay on.'); return; }
      if (enabledTracks().length < 2) editing = false;
      toast('Removed. Your progress is kept — add it back any time.');
      rerender();
    };
  });
  // Filter in place, so typing never loses focus to a repaint.
  $('#tr-find', root)?.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    let shown = 0;
    root.querySelectorAll('[data-find]').forEach(el => { const hit = !q || el.dataset.find.includes(q); el.classList.toggle('hide', !hit); shown += hit; });
    root.querySelector('[data-none]').classList.toggle('hide', shown > 0);
  });
}
