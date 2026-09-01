/** View switching, the topbar and the bottom nav. */
import { S, progress, quests, getDay, dueRetests } from './state.js';
import { icon } from './icons.js';
import { rankFor } from './game.js';
import { h, raw, esc, fmt, $, sfx, haptic } from './ui.js';

import * as home     from './views/home.js';
import * as train    from './views/train.js';
import * as log      from './views/log.js';
import * as skills   from './views/skills.js';
import * as hero     from './views/hero.js';
import * as onboarding from './views/onboarding.js';

const ROUTES = {
  home:   { view: home,   icon:'home',    label:'Today'  },
  train:  { view: train,  icon:'train',   label:'Train'  },
  log:    { view: log,    icon:'log',     label:'Log'    },
  skills: { view: skills, icon:'skills',  label:'Skills' },
  hero:   { view: hero,   icon:'profile', label:'Hero'   },
};

let current = 'home';
const scrollMemory = {};

export function go(name, { scrollTo = null } = {}) {
  if (!ROUTES[name]) return;
  if (name === current) {
    if (scrollTo) scrollIntoView(scrollTo);
    return;
  }
  scrollMemory[current] = $('#view').scrollTop;
  current = name;
  sfx('tick'); haptic(8);
  paint({ resetScroll: true });
  if (scrollTo) requestAnimationFrame(() => scrollIntoView(scrollTo));
}

function scrollIntoView(id) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function rerender() { paint({ resetScroll: false }); }
export const currentRoute = () => current;

/* -------------------------------- chrome ---------------------------------- */

function topbar() {
  const p = progress();
  const rank = rankFor(p.level);
  return h`
    <div class="topbar">
      <button class="avatar" data-nav="hero" aria-label="Profile"
              >${rank.icon}<span class="lvl num">${p.level}</span></button>
      <div class="grow">
        <div class="h3 truncate">${S.profile.name || 'Engineer'}</div>
        <div class="tiny truncate">${rank.name} · ${fmt(p.into)}/${fmt(p.need)} XP</div>
      </div>
      <div class="chip-stat">${icon('coin', 13)} ${fmt(S.coins)}</div>
      <div class="chip-stat ${S.streak.current > 0 ? 'live' : ''}">${icon('flame', 13)} ${S.streak.current}</div>
    </div>
    <div class="topbar-xp"><i style="width:${p.pct}%"></i></div>`;
}

function nav() {
  const day = getDay();
  const claimable = quests().filter(q => q.done && !day.claimed.includes(q.id)).length;
  const due = dueRetests().length;

  const dots = { home: claimable, skills: due };

  return raw(Object.entries(ROUTES).map(([k, r]) => `
    <button class="${k === current ? 'on' : ''}" data-nav="${k}"
            aria-current="${k === current ? 'page' : 'false'}">
      <span class="ico">${icon(r.icon, 21).value}</span>${r.label}
      ${dots[k] ? '<span class="nav-dot"></span>' : ''}
    </button>`).join(''));
}

/* --------------------------------- paint ---------------------------------- */

/**
 * Render a view into a throwaway container. Listeners are bound to that
 * container, so the next paint discards them rather than stacking duplicates.
 */
function mountView(view, onRerender) {
  const holder = document.createElement('div');
  holder.innerHTML = view.render();
  // The markup is already built by this point. If wiring listeners throws, show
  // the page anyway and lose only its interactivity — letting the error escape
  // would skip the swap below and leave a blank screen under a working nav,
  // which is far harder to diagnose from a bug report.
  try {
    view.mount(holder, onRerender);
  } catch (err) {
    console.error('View failed to mount:', err);
  }
  return holder;
}

function paint({ resetScroll = false } = {}) {
  const chrome = $('#chrome'), viewEl = $('#view'), navEl = $('#nav');

  if (!S.profile.onboarded) {
    chrome.innerHTML = '';
    navEl.classList.add('hide');
    viewEl.style.paddingBottom = '32px';
    viewEl.replaceChildren(mountView(onboarding, rerender));
    return;
  }

  navEl.classList.remove('hide');
  viewEl.style.paddingBottom = '';
  chrome.innerHTML = topbar();
  navEl.innerHTML = nav().value;

  const keep = viewEl.scrollTop;
  viewEl.replaceChildren(mountView(ROUTES[current].view, rerender));
  viewEl.scrollTop = resetScroll ? (scrollMemory[current] ?? 0) : keep;
}

export function boot() {
  for (const sel of ['#nav', '#chrome']) {
    $(sel).addEventListener('click', e => {
      const b = e.target.closest('[data-nav]');
      if (b) go(b.dataset.nav);
    });
  }
  paint({ resetScroll: true });
}
