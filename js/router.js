/**
 * View switching, the topbar and the bottom nav.
 *
 * The tabs follow the tracks you have switched on: Today, one tab per track, and
 * Hero. Past three tracks they fold into a single Tracks tab, so the nav never
 * needs more than five buttons however far the app grows.
 */
import { S, progress, quests, getDay, needsBackup, timerRunning, timerMinutes, MAX_SESSION_MIN, enabledTracks } from './state.js';
import { missionDoneToday, reviewDoneToday, paceInfo } from './learn/session.js';
import { TRACKS, trackById } from './tracks/index.js';
import { icon } from './icons.js';
import { rankFor } from './game.js';
import { h, raw, fmt, $, sfx, haptic, hm } from './ui.js';

import * as home       from './views/home.js';
import * as hero       from './views/hero.js';
import * as onboarding from './views/onboarding.js';
import * as tracksView from './views/tracks.js';

function routes() {
  const on = enabledTracks().map(trackById);
  const middle = on.length <= 3
    ? Object.fromEntries(on.map(t => [t.id, { view: t.hub, icon: t.navIcon, label: t.nav }]))
    : { tracks: { view: tracksView, icon: 'grid', label: 'Tracks' } };
  return {
    home: { view: home, icon: 'home', label: 'Today' },
    ...middle,
    hero: { view: hero, icon: 'profile', label: 'Hero' },
  };
}

let current = 'home';
const scrollMemory = {};

export function go(name) {
  const R = routes();
  // A track hidden inside the Tracks tab is still reachable by name.
  const target = R[name] ? name : trackById(name) ? name : null;
  if (!target) return;
  if (target === current) { $('#view').scrollTo({ top: 0, behavior: 'smooth' }); return; }
  scrollMemory[current] = $('#view').scrollTop;
  current = target;
  sfx('tick'); haptic(8);
  paint({ resetScroll: true });
}

export function rerender() { paint({ resetScroll: false }); }
export const currentRoute = () => current;

function viewFor(name) {
  const R = routes();
  if (R[name]) return R[name].view;
  const t = trackById(name);
  return t && enabledTracks().includes(t.id) ? t.hub : null;
}

/* --------------------------------- chrome --------------------------------- */

function topbar() {
  const p = progress(), rank = rankFor(p.level);
  const timer = timerRunning()
    ? `<button class="chip-stat live" data-timer aria-label="Focus timer running">${icon('clock', 13).value} <span data-timer-text>${hm(timerMinutes())}</span></button>` : '';
  return h`
    <div class="topbar">
      <button class="avatar" data-nav="hero" aria-label="Profile">${rank.icon}<span class="lvl-badge">${p.level}</span></button>
      <div class="grow">
        <div class="name truncate">${S.profile.name || 'Engineer'}</div>
        <div class="rank truncate">${rank.icon} ${rank.name}</div>
      </div>
      ${raw(timer)}
      <div class="chip-stat coin">${icon('coin', 14)} ${fmt(S.coins)}</div>
      <div class="chip-stat flame">${icon('flame', 14)} ${S.streak.current}</div>
    </div>
    <div class="topbar-xp"><div class="xpbar"><i style="width:${p.pct}%"></i></div></div>`;
}

function nav() {
  const day = getDay();
  const claimable = quests().some(q => q.done && !day.claimed.includes(q.id));
  // Something left today: the mission on a mission day, the review on a keep-going day.
  const missionTodo = enabledTracks().some(t => (paceInfo(t).missionDay ? !missionDoneToday(t) : !reviewDoneToday(t)));
  const dots = { home: claimable || missionTodo, hero: needsBackup() };
  return Object.entries(routes()).map(([k, r]) => `
    <button class="${k === current ? 'on' : ''}" data-nav="${k}" aria-current="${k === current ? 'page' : 'false'}">
      <span class="ico">${icon(r.icon, 22).value}</span>${r.label}
      ${dots[k] ? '<span class="nav-dot"></span>' : ''}
    </button>`).join('');
}

/* ---------------------------------- paint --------------------------------- */

function mountView(view) {
  const holder = document.createElement('div');
  holder.innerHTML = view.render();
  // If wiring listeners throws, still show the page: a blank screen under a
  // working nav is far harder to diagnose than a page with one dead button.
  try { view.mount(holder, rerender); }
  catch (err) { console.error('View failed to mount:', err); }
  return holder;
}

function paint({ resetScroll = false } = {}) {
  const chrome = $('#chrome'), viewEl = $('#view'), navEl = $('#nav');

  if (!S.profile.onboarded) {
    chrome.innerHTML = '';
    navEl.classList.add('hide');
    viewEl.style.paddingBottom = '32px';
    viewEl.replaceChildren(mountView(onboarding));
    return;
  }

  // A track switched off while its tab was open sends you home.
  if (!viewFor(current)) current = 'home';

  navEl.classList.remove('hide');
  navEl.style.gridTemplateColumns = `repeat(${Object.keys(routes()).length}, 1fr)`;
  viewEl.style.paddingBottom = '';
  chrome.innerHTML = topbar();
  navEl.innerHTML = nav();

  const keep = viewEl.scrollTop;
  viewEl.replaceChildren(mountView(viewFor(current)));
  viewEl.scrollTop = resetScroll ? (scrollMemory[current] ?? 0) : keep;
}

/** Keep the live timer chip honest without repainting the whole page. */
export function tickTimerChip() {
  const el = document.querySelector('[data-timer-text]');
  if (el) el.textContent = hm(timerMinutes());
}

export function boot({ onTimer } = {}) {
  for (const sel of ['#nav', '#chrome']) {
    $(sel).addEventListener('click', e => {
      if (e.target.closest('[data-timer]')) { onTimer?.(); return; }
      const b = e.target.closest('[data-nav]');
      if (b) go(b.dataset.nav);
    });
  }
  paint({ resetScroll: true });
}

export { TRACKS, MAX_SESSION_MIN };
