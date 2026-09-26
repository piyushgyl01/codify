/**
 * View switching, the topbar and the bottom nav.
 *
 * Three tabs, however many tracks there are: Today, Tracks and Hero. A track
 * opens from Today's card or from the Tracks tab, and its page sits under
 * Tracks with a way back.
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

const ROUTES = {
  home:   { view: home, icon: 'home', label: 'Today' },
  tracks: { view: tracksView, icon: 'grid', label: 'Tracks' },
  hero:   { view: hero, icon: 'profile', label: 'Hero' },
};

let current = 'home';
const scrollMemory = {};

export function go(name) {
  // A track is reached by its id; its page lives under the Tracks tab.
  const target = ROUTES[name] || trackById(name) ? name : null;
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
  if (ROUTES[name]) return ROUTES[name].view;
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
  const here = trackById(current) ? 'tracks' : current;
  return Object.entries(ROUTES).map(([k, r]) => `
    <button class="${k === here ? 'on' : ''}" data-nav="${k}" aria-current="${k === here ? 'page' : 'false'}">
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
  navEl.style.gridTemplateColumns = `repeat(${Object.keys(ROUTES).length}, 1fr)`;
  viewEl.style.paddingBottom = '';
  chrome.innerHTML = topbar();
  navEl.innerHTML = nav();

  const keep = viewEl.scrollTop;
  const page = mountView(viewFor(current));
  if (trackById(current)) page.prepend(backToTracks());
  viewEl.replaceChildren(page);
  viewEl.scrollTop = resetScroll ? (scrollMemory[current] ?? 0) : keep;
}

function backToTracks() {
  const b = document.createElement('button');
  b.className = 'back-link';
  b.innerHTML = `${icon('back', 16).value} Tracks`;
  b.onclick = () => go('tracks');
  return b;
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
