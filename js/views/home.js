/** Today: your character, the focus timer, each track's card, the quests, the week. */
import {
  S, progress, getDay, quests, claimQuest, needsBackup, timerRunning, timerMinutes, MAX_SESSION_MIN,
  enabledTracks, dayIsActive, dismissNotice,
} from '../state.js';
import { rankFor, nextRank, dayKey, addDays } from '../game.js';
import { trackById } from '../tracks/index.js';
import { openTab as cpTab } from '../tracks/cp/hub.js';
import { openTab as roTab } from '../tracks/robotics/hub.js';
import { openMission } from '../tracks/robotics/player.js';
import { missionDoneToday } from '../tracks/robotics/actions.js';
import { h, raw, esc, bind, ring, bar, hm, rewardToast, sfx, shortDate } from '../ui.js';
import { icon } from '../icons.js';
import { openFocus } from './focus.js';
import { openBackup } from './hero.js';
import { go } from '../router.js';

const greet = () => {
  const hr = new Date().getHours();
  return hr < 5 ? 'Late one' : hr < 12 ? 'Morning' : hr < 18 ? 'Afternoon' : 'Evening';
};

function heroCard() {
  const p = progress(), rank = rankFor(p.level), next = nextRank(p.level);
  return h`<div class="hero-card">
    <div class="label">${greet()}${S.profile.name ? `, ${S.profile.name}` : ''}</div>
    <div class="h1" style="margin-top:4px">${rank.icon} ${rank.name}</div>
    <div class="sub" style="margin-top:6px">${raw(next ? `Level ${p.level} — ${next.at - p.level} to ${esc(next.name)}` : `Level ${p.level} — the top rank`)}</div>
  </div>`;
}

function notices() {
  let out = '';
  if (S.notice === 'merged') out += `<div class="card notice">
    <div class="between"><span class="label">What's new</span><button class="btn xs" data-act="dismiss">Got it</button></div>
    <div class="h3" style="margin-top:6px">Codify is now one tech RPG</div>
    <div class="sub" style="margin-top:4px">Your progress carried over. Robotics is a new track. Botify progress: Hero → Backup → Import.</div>
  </div>`;
  if (needsBackup()) out += `<div class="card warn-card"><div class="between"><div class="grow"><div class="h3">Back up your progress</div>
      <div class="tiny">It only lives in this browser.</div></div>
      <button class="btn sm" data-act="backup">Back up</button></div></div>`;
  return out;
}

function focusCard() {
  const day = getDay(), goal = S.profile.focusGoal || 120, running = timerRunning();
  const now = day.timerMin + (running ? Math.min(timerMinutes(), MAX_SESSION_MIN) : 0);
  const active = dayIsActive();
  return `<div class="card focus-card">
    <div class="row">
      ${ring({ pct: (now / goal) * 100, size: 88, stroke: 10, value: hm(now), label: `of ${hm(goal)}`, color: 'var(--ink)', track: 'var(--card)' })}
      <div class="grow">
        <div class="label">Focus · ${esc(shortDate(dayKey()))}</div>
        <div class="h3" style="margin-top:4px">${running ? 'Timer running' : now >= goal ? 'Goal reached' : 'Start the timer'}</div>
        <div class="tiny" style="margin-top:2px">${active ? '✓ Streak safe today' : '20 minutes keeps your streak'}</div>
        <button class="btn ${running ? 'hot' : ''} sm" style="margin-top:10px" data-act="focus">
          ${running ? `${icon('stop', 14).value} Stop` : `${icon('play', 14).value} Timer`}</button>
      </div>
    </div>
  </div>`;
}

function questCards() {
  const list = quests();
  if (!list.length) return '';
  return `<div><div class="section-head"><div class="h2">Daily quests</div><span class="tiny">${list.filter(q => q.claimed).length}/${list.length}</span></div>
    <div class="stack s2">${list.map(q => {
      const t = q.track === 'core' ? '' : `${trackById(q.track)?.icon || ''} `;
      const action = q.claimed ? '<span class="badge good">Claimed</span>'
        : q.done ? `<button class="btn primary sm" data-claim="${q.id}">Claim</button>`
        : `<button class="btn sm" data-qgo="${q.go}">Go</button>`;
      return `<div class="card pad-s quest ${q.claimed ? 'claimed' : ''}">
        <div class="between"><div class="grow"><div class="h3">${t}${esc(q.name)}</div><div class="tiny">${esc(q.desc)} · +${q.xp} XP</div></div>${action}</div>
        <div style="margin-top:8px">${bar(q.pct, { color: q.done ? 'var(--good)' : 'var(--accent)' })}</div>
      </div>`;
    }).join('')}</div></div>`;
}

function weekStrip() {
  const goal = S.profile.focusGoal || 120;
  const keys = Array.from({ length: 7 }, (_, i) => addDays(dayKey(), i - 6));
  return `<div><div class="section-head"><div class="h2">This week</div></div><div class="card"><div class="week">${keys.map(k => {
      const min = S.days[k]?.timerMin || 0;
      return `<div class="week-col ${k === dayKey() ? 'now' : ''}">
        <div class="week-bar" style="height:56px"><i style="height:${Math.min(100, (min / goal) * 100)}%;background:var(--accent)"></i></div>
        <span class="week-dot ${dayIsActive(k) ? 'on' : ''}"></span>
        <span class="tiny">${new Date(k + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' })}</span></div>`;
    }).join('')}</div></div></div>`;
}

export function render() {
  const cards = enabledTracks().map(id => trackById(id).today.render()).join('');
  return `<div class="stack s4 fade-up">
    ${heroCard()}${notices()}${focusCard()}${cards}${questCards()}${weekStrip()}
  </div>`;
}

export function mount(root, rerender) {
  bind(root, {
    focus:   () => openFocus(rerender),
    backup:  () => openBackup(rerender),
    dismiss: () => dismissNotice(),
  });
  for (const id of enabledTracks()) trackById(id).today.mount(root, rerender);
  root.querySelectorAll('[data-go]').forEach(el => {
    el.onclick = () => { if (el.dataset.cptab) cpTab(el.dataset.cptab); go(el.dataset.go); };
  });
  root.querySelectorAll('[data-claim]').forEach(b => {
    b.onclick = () => { const r = claimQuest(b.dataset.claim); if (r) { sfx('reward'); rewardToast(r); } };
  });
  root.querySelectorAll('[data-qgo]').forEach(b => {
    b.onclick = () => {
      const where = b.dataset.qgo;
      if (where === 'timer') openFocus(rerender);
      else if (where === 'hero') go('hero');
      else if (where === 'cp') go('cp');
      else if (where === 'mission') { if (missionDoneToday()) { roTab('today'); go('robotics'); } else openMission(rerender); }
      else if (where === 'practice') { roTab('skills'); go('robotics'); }
    };
  });
}
