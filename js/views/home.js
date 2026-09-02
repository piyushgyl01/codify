/** Today — what the judge says happened, and what is left to do. */
import {
  S, dayTotals, quests, claimQuest, progress, historySeries,
  isLinked, solvesOn, commitsOn, activeContest, rustiest, treeProgress,
} from '../state.js';
import { rankFor, nextRank, targetsFor, dayKey } from '../game.js';
import { solveStreak, colorForRating, daysSinceLastSolve, staleTopics } from '../analytics.js';
import { syncAll, describeSync, isSyncing, lastSync } from '../sync.js';
import { problemUrl } from '../platforms.js';
import { go } from '../router.js';
import {
  h, raw, esc, $, $$, bind, bar, hm, fmt, relDays, sfx, haptic, rewardToast, toast,
} from '../ui.js';
import { icon } from '../icons.js';

const greet = () => {
  const hr = new Date().getHours();
  return hr < 5 ? 'Still up' : hr < 12 ? 'Morning' : hr < 18 ? 'Afternoon' : 'Evening';
};

export function render() {
  const p = progress();
  const rank = rankFor(p.level);
  const next = nextRank(p.level);
  const t = targetsFor(S.profile);
  const tot = dayTotals();
  const qs = quests();
  const live = activeContest();

  if (!isLinked()) return h`${raw(notLinked(rank, p))}`;

  const solvePct = t.solves ? Math.min(100, (tot.solved / t.solves) * 100) : 0;

  return h`
    <div class="hero-card">
      <div class="label">${greet()}${S.profile.name ? `, ${S.profile.name}` : ''}</div>
      <div class="h1" style="margin-top:4px">${rank.icon} ${rank.name}</div>
      <div class="sub" style="margin-top:6px">
        ${raw(next ? `Level ${p.level} — ${next.at - p.level} to ${esc(next.name)}`
                   : `Level ${p.level} — top rank`)}
      </div>
    </div>

    ${raw(live ? liveContest(live) : '')}

    <div class="card" style="margin-top:14px">
      <div class="between">
        <div class="label">Today</div>
        <button class="btn xs" data-act="sync">${isSyncing() ? 'Syncing…' : 'Sync'}</button>
      </div>

      <div class="row" style="margin-top:12px;align-items:flex-end">
        <div class="grow">
          <div class="num" style="font-size:34px;font-weight:800;letter-spacing:-.04em">
            ${tot.solved}<span style="font-size:17px;color:var(--dim)">/${t.solves}</span></div>
          <div class="tiny">problems accepted</div>
        </div>
        <div class="right">
          <div class="num h2">${tot.bestRating || '—'}</div>
          <div class="tiny">best today</div>
        </div>
      </div>

      <div style="margin-top:10px">${raw(bar(solvePct, {
        tall: true, color: solvePct >= 100 ? 'var(--good)' : 'var(--accent)' }))}</div>

      <div class="grid3" style="margin-top:12px">
        <div class="tile"><div class="v">${tot.commits}</div><div class="k">commits</div></div>
        <div class="tile"><div class="v">${hm(tot.verifiedMinutes)}</div><div class="k">timed</div></div>
        <div class="tile"><div class="v">${tot.tags}</div><div class="k">topics</div></div>
      </div>

      ${raw(tot.solved ? solveList(solvesOn()) : `
        <div class="tiny" style="margin-top:12px">
          Nothing accepted yet today. ${lastSync() ? `Last checked ${relDays(0)} at ${
            new Date(lastSync()).toTimeString().slice(0, 5)}.` : 'Hit sync once you have solved something.'}
        </div>`)}

      <div class="row" style="margin-top:14px">
        <button class="btn primary grow" data-act="practice">Find a problem</button>
        <button class="btn grow" data-act="contest">Contests</button>
      </div>
    </div>

    ${raw(questSection(qs))}
    ${raw(weekStrip())}
    ${raw(staleSection())}`;
}

/* ------------------------------- not linked ------------------------------- */

function notLinked(rank, p) {
  return `
  <div class="hero-card">
    <div class="label">${greet()}${S.profile.name ? `, ${S.profile.name}` : ''}</div>
    <div class="h1" style="margin-top:4px">${rank.icon} ${rank.name}</div>
    <div class="sub" style="margin-top:6px">Level ${p.level}</div>
  </div>

  <div class="card rail" style="--rail:var(--warn);margin-top:14px">
    <div class="h3">Nothing is connected yet</div>
    <p class="sub" style="margin-top:8px">
      Every level, tier and streak in this app comes from your accepted submissions
      on Codeforces. Until a handle is connected there is nothing to read, so the
      numbers will all sit at zero.
    </p>
    <button class="btn primary block" style="margin-top:14px" data-act="link">Connect Codeforces</button>
  </div>`;
}

/* ------------------------------ live contest ------------------------------ */

function liveContest(live) {
  const mins = Math.floor(live.secondsLeft / 60);
  const secs = live.secondsLeft % 60;
  return `
  <button class="card tap rail" style="--rail:${live.won ? 'var(--good)' : 'var(--bad)'};margin-top:14px"
          data-act="contest">
    <div class="between">
      <div>
        <div class="label">${live.won ? 'Contest won' : 'Contest running'}</div>
        <div class="h2" style="margin-top:4px">${esc(live.contest.name)}</div>
        <div class="sub" style="margin-top:4px">
          ${live.solved}/${live.need} solved at ${live.contest.minRating}+
        </div>
      </div>
      <div class="right">
        <div class="num h1">${live.expired ? '—' : `${mins}:${String(secs).padStart(2, '0')}`}</div>
        <div class="tiny">${live.expired ? 'time up' : 'left'}</div>
      </div>
    </div>
  </button>`;
}

/* -------------------------------- solves ---------------------------------- */

function solveList(solves) {
  return `<div class="stack s2" style="margin-top:12px">
    ${solves.slice(-4).reverse().map(s => `
      <a class="card pad-s flat" style="display:block;text-decoration:none"
         href="${esc(problemUrl(s))}" target="_blank" rel="noopener">
        <div class="between">
          <div class="grow truncate">
            <div class="h3 truncate">${esc(s.name)}</div>
            <div class="tiny truncate">${esc((s.tags || []).slice(0, 3).join(' · '))}</div>
          </div>
          <span class="badge" style="background:${colorForRating(s.rating)};color:var(--ink)">
            ${s.rating ?? '—'}</span>
        </div>
      </a>`).join('')}
  </div>`;
}

/* --------------------------------- quests --------------------------------- */

function questSection(qs) {
  const day = S.days[dayKey()] || { claimed: [] };
  return `
  <div class="section">
    <div class="between">
      <div class="label">Daily quests</div>
      <div class="tiny">${qs.filter(q => q.done).length}/3 done</div>
    </div>
    <div class="stack s2">
      ${qs.map(q => {
        const claimed = (day.claimed || []).includes(q.id);
        return `<div class="card pad-s ${q.done ? 'rail' : ''}" ${q.done ? 'style="--rail:var(--good)"' : ''}>
          <div class="between">
            <div class="grow">
              <div class="h3">${esc(q.name)}</div>
              <div class="tiny" style="margin-top:2px">${esc(q.hint)}</div>
            </div>
            <div class="right" style="flex:none">
              <div class="num h3">${Math.min(q.value, q.goal)}<span style="color:var(--dim)">/${q.goal}</span></div>
              <div class="tiny">${esc(q.unit)}</div>
            </div>
          </div>
          <div style="margin-top:8px">${bar(q.pct, { color: q.done ? 'var(--good)' : 'var(--accent)' })}</div>
          ${claimed ? '<div class="row" style="margin-top:8px"><span class="badge good">claimed</span></div>'
            : q.done ? `<button class="btn primary sm block" style="margin-top:8px" data-claim="${q.id}">Claim +${q.xp} XP</button>`
            : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

/* ---------------------------------- week ---------------------------------- */

function weekStrip() {
  const days = historySeries(7);
  const streak = solveStreak();
  const peak = Math.max(...days.map(d => d.solved), 1);
  return `
  <div class="section">
    <div class="between">
      <div class="label">This week</div>
      <div class="tiny">${streak ? `${streak}-day solve streak` : `${S.streak.current}-day streak`}</div>
    </div>
    <div class="week">
      ${days.map(d => `
        <div class="week-col ${d.key === dayKey() ? 'now' : ''}">
          <div class="week-bar" style="height:48px">
            <i style="height:${Math.max(3, Math.round((d.solved / peak) * 46))}px;background:${
              d.solved ? 'var(--good)' : 'var(--muted)'}"></i>
          </div>
          <div class="tiny">${d.date.toLocaleDateString(undefined, { weekday: 'narrow' })}</div>
        </div>`).join('')}
    </div>
    <div class="between tiny" style="margin-top:8px">
      <span>${days.reduce((n, d) => n + d.solved, 0)} solved this week</span>
      <span>${days.reduce((n, d) => n + d.commits, 0)} commits</span>
    </div>
  </div>`;
}

/* --------------------------------- stale ---------------------------------- */

function staleSection() {
  const stale = staleTopics(3);
  const last = daysSinceLastSolve();
  if (!stale.length && (!last || last.days < 7)) return '';

  return `
  <div class="section">
    <div class="label">Going cold</div>
    ${last && last.days >= 7 ? `
      <div class="card pad-s" style="margin-bottom:8px">
        <div class="h3">${last.days} days since your last solve</div>
        <div class="tiny" style="margin-top:2px">Last was ${esc(last.problem.name)}.</div>
      </div>` : ''}
    <div class="stack s2">
      ${stale.map(r => `
        <button class="card tap pad-s" data-topic="${r.topic.id}">
          <div class="between">
            <div class="grow truncate">
              <div class="h3 truncate">${esc(r.topic.name)}</div>
              <div class="tiny">${r.solves} solved · best ${r.best || '—'}</div>
            </div>
            <span class="badge warn">${r.days}d</span>
          </div>
        </button>`).join('')}
    </div>
    <div class="tiny" style="margin-top:8px">
      Days since the judge last accepted anything with that tag. Not a prediction — a date.
    </div>
  </div>`;
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  bind(root, {
    sync: async (el) => {
      el.textContent = 'Syncing…';
      const r = await syncAll({ force: true });
      toast(describeSync(r), 3400);
      if (r.cf?.reward) rewardToast(r.cf.reward);
      if (r.gh?.reward) rewardToast(r.gh.reward);
      rerender();
    },
    practice: () => go('skills'),
    contest:  () => go('train'),
    link:     () => go('hero'),
  });

  $$('[data-claim]', root).forEach(b => b.onclick = () => {
    const r = claimQuest(b.dataset.claim);
    if (!r) return;
    sfx('reward'); haptic(14); rewardToast(r); rerender();
  });

  $$('[data-topic]', root).forEach(b => b.onclick = () => go('skills'));
}
