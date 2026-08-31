/** Today — what to do now, what is due, and where the day stands. */
import {
  S, getDay, dayTotals, targets, quests, claimQuest, progress,
  dueRetests, historySeries, decayRanking,
} from '../state.js';
import { rankFor, nextRank, dayKey } from '../game.js';
import { modeBreakdown, calibration, targetStreak } from '../analytics.js';
import { DRILLS, TIER_LOCK, drillMinutes } from '../data/drills.js';
import { pathFor } from '../data/skilltree.js';
import { go } from '../router.js';
import { openFocusSheet, openProblemSheet, openShipSheet } from './log.js';
import { openRetest } from './skills.js';
import { startSession } from './player.js';
import {
  h, raw, esc, $, $$, bind, ring, bar, splitBar, hm, fmt, pct,
  relDays, sfx, haptic, rewardToast, toast,
} from '../ui.js';
import { icon } from '../icons.js';

const greet = () => {
  const hr = new Date().getHours();
  if (hr < 5)  return 'Still up';
  if (hr < 12) return 'Morning';
  if (hr < 18) return 'Afternoon';
  return 'Evening';
};

const LINES = [
  'Hours are the input. Retention is the output.',
  'The pattern you avoid is the one that decides it.',
  'Build beats read. Read beats watch. Watch beats nothing.',
  'You cannot cram what you did not space.',
  'Finish something small today.',
  'A skill you cannot re-prove is a skill you had.',
  'Narrate while you solve. Silence is what fails interviews.',
  'Measure before you optimise. Both in code and in this.',
];
/** Stable for the whole day rather than changing on every repaint. */
const lineOfDay = key => LINES[[...key].reduce((n, c) => n + c.charCodeAt(0), 0) % LINES.length];

export function render() {
  const day = getDay();
  const t = targets();
  const tot = dayTotals();
  const p = progress();
  const rank = rankFor(p.level);
  const next = nextRank(p.level);
  const due = dueRetests();
  const qs = quests();
  const modes = modeBreakdown(day);
  const key = dayKey();

  const focusPct = t.focus ? Math.min(100, (tot.minutes / t.focus) * 100) : 0;
  const left = Math.max(0, t.focus - tot.minutes);

  return h`
    <div class="hero-card" style="border-color:${rank.color}33">
      <div class="label">${greet()}${S.profile.name ? `, ${S.profile.name}` : ''}</div>
      <div class="h1" style="margin-top:4px;color:${rank.color}">${rank.icon} ${rank.name}</div>
      <div class="sub" style="margin-top:6px">${lineOfDay(key)}</div>
      ${raw(next ? `<div class="tiny" style="margin-top:10px">
        ${next.icon} ${next.name} at level ${next.at} — ${next.at - p.level} to go
      </div>` : '<div class="tiny" style="margin-top:10px">Top rank. Nothing left to promote you to.</div>')}
    </div>

    ${raw(due.length ? dueCard(due) : '')}

    <div class="card" style="margin-top:14px">
      <div class="row" style="align-items:center;gap:18px">
        ${raw(ring({
          pct: focusPct,
          value: left > 0 ? hm(left) : '✓',
          label: left > 0 ? 'to go' : 'target met',
          color: focusPct >= 100 ? 'var(--good)' : 'var(--accent)',
          size: 118, stroke: 11,
        }))}
        <div class="grow stack s2">
          <div class="between"><span class="tiny">LOGGED</span>
            <span class="num h3">${hm(tot.minutes)}</span></div>
          <div class="between"><span class="tiny">EFFECTIVE</span>
            <span class="num h3" style="color:var(--accent)">${hm(tot.effMinutes)}</span></div>
          <div class="between"><span class="tiny">TARGET</span>
            <span class="num h3">${hm(t.focus)}</span></div>
          <div class="between"><span class="tiny">SOLVED</span>
            <span class="num h3">${tot.solved}</span></div>
        </div>
      </div>

      ${raw(modes ? `
        <div style="margin-top:14px">${splitBar(modes.groups.map(g => ({
          pct: g.pct, color: g.color, name: g.name })))}</div>
        <div class="between tiny" style="margin-top:6px">
          <span>${Math.round(modes.deliberatePct)}% deliberate</span>
          <span>floor ${t.deliberate}%</span>
        </div>` : `
        <div class="tiny" style="margin-top:14px">Nothing logged yet today.</div>`)}

      <div class="wrap" style="margin-top:14px">
        <button class="btn primary grow" data-act="add-focus">Log a session</button>
        <button class="btn grow" data-act="add-problem">Problem</button>
        <button class="btn grow" data-act="add-ship">Ship</button>
      </div>
    </div>

    ${raw(questSection(qs, day))}
    ${raw(weekStrip())}
    ${raw(recommendation(p.level))}
    ${raw(decaySection())}
    ${raw(calibrationTeaser())}`;
}

/* -------------------------------- retests --------------------------------- */

function dueCard(due) {
  const worst = due[0];
  return `
  <button class="card tap rail" style="--rail:var(--bad);margin-top:14px" data-act="retest">
    <div class="between">
      <div class="grow">
        <div class="row" style="gap:8px">
          <span class="badge bad">${due.length} due</span>
          <span class="label">RETEST QUEUE</span>
        </div>
        <div class="h3" style="margin-top:8px">${esc(worst.node.name)}
          ${due.length > 1 ? `<span class="sub">and ${due.length - 1} more</span>` : ''}</div>
        <div class="sub" style="margin-top:4px">
          Last proven ${worst.since} days ago. The model gives it
          <b style="color:${worst.freshness.color}">${pct(worst.retention * 100)}</b> — find out.
        </div>
      </div>
      <span style="color:var(--dim)">›</span>
    </div>
  </button>`;
}

function decaySection() {
  const cold = decayRanking(3).filter(s => s.retention < 0.5 && !s.due);
  if (!cold.length) return '';
  return `
  <div class="section">
    <div class="label">Fading</div>
    <div class="stack s2">
      ${cold.map(s => `
        <div class="card pad-s rail" style="--rail:${s.freshness.color}">
          <div class="between">
            <div class="grow truncate">
              <div class="h3 truncate">${esc(s.node.name)}</div>
              <div class="tiny">${pathFor(s.node.path).name} · due ${relDays(s.dueIn)}</div>
            </div>
            <span class="badge" style="color:${s.freshness.color}">${pct(s.retention * 100)}</span>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

/* --------------------------------- quests --------------------------------- */

function questSection(qs, day) {
  return `
  <div class="section">
    <div class="between">
      <div class="label">Daily quests</div>
      <div class="tiny">${qs.filter(q => q.done).length}/3 done</div>
    </div>
    <div class="stack s2">
      ${qs.map(q => {
        const claimed = day.claimed.includes(q.id);
        return `<div class="card pad-s ${q.done ? 'rail' : ''}" ${q.done ? 'style="--rail:var(--good)"' : ''}>
          <div class="between">
            <div class="grow">
              <div class="h3">${esc(q.name)}</div>
              <div class="tiny" style="margin-top:2px">${esc(q.hint)}</div>
            </div>
            <div class="right" style="flex:none">
              <div class="num h3">${Math.min(q.value, q.goal)}<span style="color:var(--faint)">/${q.goal}</span></div>
              <div class="tiny">${esc(q.unit)}</div>
            </div>
          </div>
          <div style="margin-top:8px">${bar(q.pct, {
            color: q.done ? 'var(--good)' : 'var(--accent)' })}</div>
          <div class="row" style="margin-top:8px">
            ${claimed
              ? '<span class="badge good">✓ claimed</span>'
              : q.done
                ? `<button class="btn primary sm grow" data-claim="${q.id}">Claim +${q.xp} XP</button>`
                : `<button class="btn ghost sm grow" data-goto="${q.tab}">Go to ${q.tab}</button>`}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

/* ---------------------------------- week ---------------------------------- */

function weekStrip() {
  const days = historySeries(7);
  const t = targets();
  const streak = targetStreak();

  return `
  <div class="section">
    <div class="between">
      <div class="label">This week</div>
      <div class="tiny">${streak ? `${streak}-day target streak` : `${S.streak.current}-day streak`}</div>
    </div>
    <div class="week">
      ${days.map(d => {
        const ratio = t.focus ? Math.min(1.6, d.minutes / t.focus) : 0;
        const hgt = Math.max(3, Math.round(ratio * 46));
        const isToday = d.key === dayKey();
        return `<div class="week-col ${isToday ? 'now' : ''}">
          <div class="week-bar" style="height:46px">
            <i style="height:${hgt}px;background:${
              ratio >= 1 ? 'var(--good)' : ratio >= 0.6 ? 'var(--warn)' : ratio > 0 ? 'var(--bad)' : 'var(--line)'
            }"></i>
          </div>
          <div class="tiny">${d.date.toLocaleDateString(undefined, { weekday: 'narrow' })}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="between tiny" style="margin-top:8px">
      <span>${hm(days.reduce((n, d) => n + d.minutes, 0))} this week</span>
      <span>target ${hm(t.weekly)}</span>
    </div>
  </div>`;
}

/* ------------------------------ recommendation ---------------------------- */

/** One drill to run right now, chosen for level and how much of the day is left. */
function recommendation(level) {
  const t = targets();
  const done = dayTotals().minutes;
  const room = Math.max(15, t.focus - done);

  const open = DRILLS.filter(d => level >= TIER_LOCK[d.tier]);
  if (!open.length) return '';

  // Prefer the biggest drill that still fits what is left of the target.
  const fits = open.filter(d => drillMinutes(d) <= room + 15);
  const pick = (fits.length ? fits : open).sort((a, b) => drillMinutes(b) - drillMinutes(a))[0];
  const p = pathFor(pick.path);

  return `
  <div class="section">
    <div class="label">Suggested now</div>
    <button class="card tap rail" style="--rail:${p.color}" data-drill="${pick.id}">
      <div class="between">
        <div class="grow">
          <div class="row" style="gap:8px">
            <span class="badge" style="color:${p.color}">${p.short}</span>
            <span class="badge">${hm(drillMinutes(pick))}</span>
          </div>
          <div class="h3" style="margin-top:8px">${pick.icon} ${esc(pick.name)}</div>
          <div class="tiny" style="margin-top:4px">${esc(pick.blurb)}</div>
        </div>
      </div>
      <div class="row" style="margin-top:10px">
        <span class="btn primary sm grow">Start</span>
      </div>
    </button>
  </div>`;
}

/* ------------------------------- calibration ------------------------------ */

function calibrationTeaser() {
  const c = calibration();
  if (c.tooFew) return '';
  const tone = { good:'var(--good)', bad:'var(--bad)', info:'var(--info)' }[c.verdict.tone];
  return `
  <div class="section">
    <div class="label">Calibration</div>
    <button class="card tap rail" style="--rail:${tone}" data-act="dash">
      <div class="h3" style="color:${tone}">${esc(c.verdict.title)}</div>
      <div class="sub" style="margin-top:6px">
        Model said ${pct(c.predicted * 100)}, you held ${pct(c.actual * 100)},
        over ${c.events} retests.
      </div>
      <div class="tiny" style="margin-top:8px">See the full breakdown ›</div>
    </button>
  </div>`;
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  bind(root, {
    'add-focus':   () => openFocusSheet(rerender),
    'add-problem': () => openProblemSheet(rerender),
    'add-ship':    () => openShipSheet(rerender),
    'retest':      () => openRetest(rerender),
    'dash':        () => go('log', { scrollTo: 'd-calibration' }),
  });

  $$('[data-claim]', root).forEach(b => b.onclick = () => {
    const r = claimQuest(b.dataset.claim);
    if (!r) return;
    sfx('reward'); haptic(14);
    rewardToast(r);
    rerender();
  });

  $$('[data-goto]', root).forEach(b => b.onclick = () => go(b.dataset.goto));

  $$('[data-drill]', root).forEach(b => b.onclick = () => {
    startSession(b.dataset.drill, rerender);
  });
}
