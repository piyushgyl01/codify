/**
 * Train — the contests.
 *
 * A contest is a clock plus a target the judge settles. Start it, go and solve on
 * Codeforces, come back and sync: solves accepted inside the window at or above
 * the rating floor are what count. Problems you had already solved before the
 * clock started are excluded, so the window cannot be gamed.
 */
import {
  S, progress, isLinked, activeContest, startContest, finishContest, abandonContest,
} from '../state.js';
import { CONTESTS } from '../data/contests.js';
import { syncAll, describeSync } from '../sync.js';
import { colorForRating } from '../analytics.js';
import { problemUrl } from '../platforms.js';
import { go } from '../router.js';
import {
  h, raw, esc, $, $$, bind, bar, mmss, fmt, dialog, toast, sfx, haptic, confetti, rewardToast,
} from '../ui.js';

export function render() {
  const level = progress().level;
  const live = activeContest();

  if (!isLinked()) {
    return h`
      <div class="h2">Contests</div>
      <div class="empty" style="margin-top:16px">
        Contests are settled by Codeforces, so connect a handle from the Hero tab first.
      </div>`;
  }

  if (live) return h`${raw(liveView(live))}`;

  return h`
    <div>
      <div class="h2">Contests</div>
      <div class="sub">A clock and a target. The judge decides, not you.</div>
    </div>

    <div class="stack" style="margin-top:16px">
      ${raw(CONTESTS.map(c => card(c, level)).join(''))}
    </div>

    <div class="card sunk" style="margin-top:20px">
      <div class="label">How it is settled</div>
      <p class="sub" style="margin-top:8px">
        Start the clock, then solve on Codeforces as normal. A problem counts if it
        was accepted inside the window, is rated at or above the floor, and was not
        already solved before you started. Sync to see the count move.
      </p>
    </div>`;
}

function card(c, level) {
  const rec = S.contests[c.id] || {};
  const locked = level < c.lvl;
  return `
  <button class="card tap ${rec.won ? 'gauntlet won' : ''} ${locked ? 'gauntlet locked' : ''}"
          data-start="${c.id}" ${locked ? 'disabled' : ''}>
    <div class="between">
      <div class="row" style="gap:12px">
        <span class="g-glyph">${c.icon}</span>
        <div class="grow">
          <div class="h3">${esc(c.name)}</div>
          <div class="tiny" style="margin-top:2px">
            ${locked ? `Unlocks at level ${c.lvl}`
              : `${c.need} problems rated ${c.minRating}+ in ${c.minutes} minutes`}
          </div>
        </div>
      </div>
      <span class="badge ${rec.won ? 'good' : locked ? '' : 'warn'}">
        ${rec.won ? 'won' : locked ? `lvl ${c.lvl}` : `+${c.xp}`}</span>
    </div>
    ${!locked ? `<div class="tiny" style="margin-top:8px">${esc(c.blurb)}</div>` : ''}
    ${rec.attempts ? `<div class="tiny" style="margin-top:6px">
      ${rec.attempts} attempt${rec.attempts === 1 ? '' : 's'} · best ${rec.best}/${c.need}</div>` : ''}
  </button>`;
}

/* --------------------------------- running -------------------------------- */

function liveView(live) {
  const { contest } = live;
  const mins = Math.floor(live.secondsLeft / 60);
  const secs = live.secondsLeft % 60;

  return `
  <div class="between">
    <div>
      <div class="h2">${esc(contest.name)}</div>
      <div class="sub">${contest.need} problems rated ${contest.minRating}+</div>
    </div>
    <span class="badge ${live.won ? 'good' : live.expired ? 'bad' : 'warn'}">
      ${live.won ? 'won' : live.expired ? 'time up' : 'running'}</span>
  </div>

  <div class="card" style="margin-top:16px;text-align:center">
    <div class="pl-timer ${live.expired ? 'over' : ''}" id="ct-clock">
      ${live.expired ? '00:00' : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
    </div>
    <div class="tiny" style="margin-top:12px">${live.expired ? 'window closed' : 'remaining'}</div>

    <div style="margin-top:16px">${bar((live.solved / live.need) * 100, {
      tall: true, color: live.won ? 'var(--good)' : 'var(--accent)' })}</div>
    <div class="num h2" style="margin-top:8px">${live.solved} / ${live.need}</div>
  </div>

  ${live.counted.length ? `
    <div class="section">
      <div class="label">Counted so far</div>
      <div class="stack s2">
        ${live.counted.map(s => `
          <a class="card pad-s" style="display:block;text-decoration:none"
             href="${esc(problemUrl(s))}" target="_blank" rel="noopener">
            <div class="between">
              <div class="grow truncate"><div class="h3 truncate">${esc(s.name)}</div></div>
              <span class="badge" style="background:${colorForRating(s.rating)};color:var(--ink)">${s.rating}</span>
            </div>
          </a>`).join('')}
      </div>
    </div>` : `
    <div class="empty" style="margin-top:16px">
      Nothing counted yet. Solve on Codeforces, then sync.
    </div>`}

  <div class="row" style="margin-top:18px">
    <button class="btn grow" data-act="sync">Sync</button>
    <button class="btn primary grow" data-act="finish">
      ${live.won ? 'Claim the win' : live.expired ? 'Bank it' : 'Finish early'}</button>
  </div>
  <button class="btn ghost block sm" style="margin-top:8px" data-act="abandon">Abandon</button>

  <a class="btn ghost block sm" style="margin-top:16px;text-decoration:none"
     href="https://codeforces.com/problemset?tags=*${contest.minRating}-" target="_blank" rel="noopener">
    Open the Codeforces problem set
  </a>`;
}

/* ---------------------------------- mount --------------------------------- */

let ticker = null;

export function mount(root, rerender) {
  clearInterval(ticker);

  $$('[data-start]', root).forEach(b => b.onclick = () => {
    const c = CONTESTS.find(x => x.id === b.dataset.start);
    dialog(`<div class="h2">Start ${esc(c.name)}?</div>
      <p class="sub" style="margin:12px 0 16px">
        ${c.need} problems rated ${c.minRating}+ within ${c.minutes} minutes.
        Everything you have already solved is recorded now and will not count.</p>
      <button class="btn primary block" data-yes>Start the clock</button>
      <button class="btn ghost block sm" style="margin-top:8px" data-no>Not now</button>`,
      (d, close) => {
        d.querySelector('[data-no]').onclick = close;
        d.querySelector('[data-yes]').onclick = () => {
          startContest(c.id); close(); sfx('start'); haptic(16); rerender();
        };
      });
  });

  bind(root, {
    sync: async (el) => {
      el.textContent = 'Syncing…';
      const r = await syncAll({ force: true });
      toast(describeSync(r), 3200);
      rerender();
    },
    finish: () => {
      const done = finishContest();
      if (!done) return;
      if (done.result.won) { sfx('reward'); confetti(150); } else sfx('fail');
      rewardToast(done.reward);
      toast(done.result.won
        ? `${done.contest.name} cleared — ${done.result.solved}/${done.contest.need}`
        : `Banked ${done.result.solved}/${done.contest.need}. Come back stronger.`, 3600);
      rerender();
    },
    abandon: () => {
      dialog(`<div class="h2">Abandon the run?</div>
        <p class="sub" style="margin:12px 0 16px">No credit, no attempt recorded.</p>
        <button class="btn hot block" data-yes>Abandon</button>
        <button class="btn ghost block sm" style="margin-top:8px" data-no>Keep going</button>`,
        (d, close) => {
          d.querySelector('[data-no]').onclick = close;
          d.querySelector('[data-yes]').onclick = () => { abandonContest(); close(); rerender(); };
        });
    },
  });

  // The clock is redrawn in place rather than by repainting the whole view,
  // which would fight with anything the user is scrolling.
  const clock = $('#ct-clock', root);
  if (clock) {
    ticker = setInterval(() => {
      const live = activeContest();
      if (!live) { clearInterval(ticker); return; }
      if (live.expired) { clock.textContent = '00:00'; clock.classList.add('over'); return; }
      const m = Math.floor(live.secondsLeft / 60), s = live.secondsLeft % 60;
      clock.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }
}
