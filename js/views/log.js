/**
 * Log — what actually happened, and the charts built from it.
 *
 * Verified entries (accepted solves, public pushes) and unverified ones (notes
 * you typed) are kept visibly apart. The second kind is here so your record is
 * complete, not so it can be counted.
 */
import {
  S, dayTotals, historySeries, solvedList, solvesOn, pushesOn, getDay,
  logSession, removeSession, logNote, removeNote, isLinked,
} from '../state.js';
import { targetsFor, dayKey } from '../game.js';
import {
  ratingHistogram, colorForRating, movingAverage, rollingAverages, weeklyBuckets,
  topicCoverage, ceilingOverTime, verifiedMix, BANDS, treeCompletion,
} from '../analytics.js';
import { syncAll, describeSync, lastSync } from '../sync.js';
import { problemUrl } from '../platforms.js';
import { seriesChart, lineChart, calendarGrid, barRows } from '../charts.js';
import {
  h, raw, esc, $, $$, bind, bar, hm, fmt, pct, timeOf, shortDate,
  sheet, toast, sfx, haptic, rewardToast,
} from '../ui.js';

let historyDays = 7;

export function render() {
  const t = targetsFor(S.profile);
  const tot = dayTotals();
  const avg = rollingAverages(7);

  return h`
    <div class="between">
      <div>
        <div class="h2">Log</div>
        <div class="sub">${tot.solved} solved today · ${tot.commits} commits</div>
      </div>
      <button class="btn xs" data-act="sync">Sync</button>
    </div>

    ${raw(todayCard(tot, t, avg))}
    ${raw(entries())}

    <div class="row" style="margin-top:16px">
      <button class="btn grow" data-act="timer">Start a timer</button>
      <button class="btn ghost grow" data-act="note">Add a note</button>
    </div>

    <hr class="rule" style="margin-top:26px">
    ${raw(charts())}`;
}

/* -------------------------------- today ----------------------------------- */

function todayCard(tot, t, avg) {
  return `
  <div class="card" style="margin-top:14px">
    <div class="between">
      <div class="label">Today</div>
      <div class="tiny">7-day avg ${avg.solved}/day</div>
    </div>
    <div class="grid3" style="margin-top:12px">
      <div class="tile"><div class="v">${tot.solved}</div><div class="k">solved</div></div>
      <div class="tile"><div class="v">${tot.bestRating || '—'}</div><div class="k">best</div></div>
      <div class="tile"><div class="v">${tot.commits}</div><div class="k">commits</div></div>
    </div>
    <div style="margin-top:12px">${bar(t.solves ? (tot.solved / t.solves) * 100 : 0, {
      tall: true, color: tot.solved >= t.solves ? 'var(--good)' : 'var(--accent)' })}</div>
    <div class="between tiny" style="margin-top:6px">
      <span>target ${t.solves} a day</span>
      <span>${hm(tot.verifiedMinutes)} timed</span>
    </div>
  </div>`;
}

function entries() {
  const key = dayKey();
  const day = getDay(key);
  const rows = [
    ...solvesOn(key).map(s => ({ kind:'solve', ts:s.at * 1000, s })),
    ...pushesOn(key).map(p => ({ kind:'push', ts:p.at * 1000, p })),
    ...(day.focus || []).map(f => ({ kind:'focus', ts:f.ts, f })),
    ...(day.notes || []).map(n => ({ kind:'note', ts:n.ts, n })),
  ].sort((a, b) => b.ts - a.ts);

  if (!rows.length) {
    return `<div class="empty" style="margin-top:16px">
      Nothing today yet. Solve something, then sync.</div>`;
  }

  return `<div class="section">
    <div class="label">Today’s entries</div>
    <div class="stack s2">${rows.map(r => row(r)).join('')}</div>
  </div>`;
}

function row(r) {
  if (r.kind === 'solve') {
    return `<a class="card pad-s rail" style="--rail:var(--good);display:block;text-decoration:none"
       href="${esc(problemUrl(r.s))}" target="_blank" rel="noopener">
      <div class="between">
        <div class="grow truncate">
          <span class="badge good">accepted</span>
          <div class="h3 truncate" style="margin-top:6px">${esc(r.s.name)}</div>
          <div class="tiny truncate">${esc((r.s.tags || []).slice(0, 3).join(' · '))}</div>
        </div>
        <div class="right" style="flex:none">
          <span class="badge" style="background:${colorForRating(r.s.rating)};color:var(--ink)">${r.s.rating ?? '—'}</span>
          <div class="tiny" style="margin-top:4px">${timeOf(r.ts)}</div>
        </div>
      </div>
    </a>`;
  }
  if (r.kind === 'push') {
    return `<div class="card pad-s rail" style="--rail:var(--info)">
      <div class="between">
        <div class="grow truncate">
          <span class="badge info">pushed</span>
          <div class="h3 truncate" style="margin-top:6px">${esc(r.p.repo)}</div>
        </div>
        <div class="right"><div class="num h3">${r.p.commits}</div>
          <div class="tiny">${timeOf(r.ts)}</div></div>
      </div>
    </div>`;
  }
  if (r.kind === 'focus') {
    return `<div class="card pad-s rail" style="--rail:${r.f.verified ? 'var(--accent)' : 'var(--muted)'}">
      <div class="between">
        <div class="grow">
          <span class="badge ${r.f.verified ? '' : 'mute'}">${r.f.verified ? 'timed' : 'typed · unpaid'}</span>
          <div class="h3" style="margin-top:6px">${hm(r.f.minutes)} practice</div>
          ${r.f.note ? `<div class="tiny" style="margin-top:2px">${esc(r.f.note)}</div>` : ''}
        </div>
        <div class="tiny">${timeOf(r.ts)}</div>
      </div>
      <button class="btn ghost xs" style="margin-top:8px" data-del-focus="${r.f.uid}">Remove</button>
    </div>`;
  }
  return `<div class="card pad-s rail" style="--rail:var(--muted)">
    <div class="between">
      <div class="grow">
        <span class="badge mute">note · unpaid</span>
        <div class="sub" style="margin-top:6px">${esc(r.n.text)}</div>
      </div>
      <div class="tiny">${timeOf(r.ts)}</div>
    </div>
    <button class="btn ghost xs" style="margin-top:8px" data-del-note="${r.n.uid}">Remove</button>
  </div>`;
}

/* -------------------------------- charts ---------------------------------- */

const block = (id, title, legend, body) => `
  <section class="dash" id="${id}">
    <div class="label">${title}</div>
    ${legend ? `<div class="tiny" style="margin-top:4px">${legend}</div>` : ''}
    <div style="margin-top:10px">${body}</div>
  </section>`;

function charts() {
  const days = historySeries(60);
  if (!isLinked()) {
    return `<div class="empty">Charts fill in once a Codeforces handle is connected.</div>`;
  }

  return `
    <div class="between"><div class="h2">Dashboard</div>
      <div class="tiny">${days.filter(d => d.logged).length} active days</div></div>
    ${solveChart(days)}
    ${ceilingChart()}
    ${histogramBlock()}
    ${topicsBlock()}
    ${commitChart(days)}
    ${mixBlock()}
    ${activityBlock(days)}
    ${historyBlock(days)}`;
}

function solveChart(days) {
  const shown = days.slice(-30);
  const t = targetsFor(S.profile);
  const avg = movingAverage(shown, 'solved', 7);
  const data = shown.map(d => ({
    value: d.solved,
    color: d.solved >= t.solves ? 'var(--good)' : d.solved ? 'var(--warn)' : 'var(--muted)',
    label: `${shortDate(d.key)} · ${d.solved}`,
    axis: shortDate(d.key),
  }));
  return block('d-solves', 'Problems accepted',
    `green ≥ target · — 7-day avg · ┆ target ${t.solves}/day`,
    seriesChart(data, { height: 120, target: t.solves, avg, axisEvery: 6 }));
}

function ceilingChart() {
  const pts = ceilingOverTime(12).map(p => ({ value: p.value }));
  if (pts.length < 2) return '';
  const best = pts.at(-1).value;
  return block('d-ceiling', 'Rating ceiling',
    'The hardest problem you have solved, over twelve weeks. A running maximum.',
    `${lineChart(pts, { height: 110, color: 'var(--accent)', maxY: Math.max(best * 1.15, 1200) })}
     <div class="between tiny" style="margin-top:6px"><span>12 weeks ago</span>
       <span class="num">best ${best}</span></div>`);
}

function histogramBlock() {
  const rows = ratingHistogram();
  const total = rows.reduce((n, r) => n + r.count, 0);
  if (!total) return '';
  return block('d-bands', 'Where you solve',
    'Every rated solve, by Codeforces band. The shape of your comfort zone.',
    barRows(rows.map(r => ({ name: `${r.name} ${r.min}+`, value: r.count, color: r.color })),
            { showValue: v => v }));
}

function topicsBlock() {
  const cov = topicCoverage();
  if (!cov.started) return '';
  return block('d-topics', 'Topic coverage', `${cov.started} of ${cov.of} topics started`,
    `${barRows(cov.rows.filter(r => r.solves > 0).map(r => ({
        name: r.topic.name, value: r.solves, color: 'var(--info)' })), { showValue: v => v })}
     ${cov.untouched.length ? `
       <div class="card sunk" style="margin-top:12px">
         <div class="label">Never touched</div>
         <div class="wrap" style="margin-top:8px">
           ${cov.untouched.map(t => `<span class="badge warn">${esc(t.name)}</span>`).join('')}
         </div>
       </div>` : ''}`);
}

function commitChart(days) {
  const shown = days.slice(-30);
  if (!shown.some(d => d.commits)) return '';
  const data = shown.map(d => ({
    value: d.commits, color: d.commits ? 'var(--violet)' : 'var(--muted)',
    label: `${shortDate(d.key)} · ${d.commits}`, axis: shortDate(d.key),
  }));
  return block('d-commits', 'Commits', 'Public pushes, read from GitHub.',
    seriesChart(data, { height: 96, axisEvery: 6 }));
}

function mixBlock() {
  const mix = verifiedMix(30);
  if (!mix.total && !mix.notes) return '';
  return block('d-mix', 'Verified vs typed',
    'Only the verified half moves any number in this app.',
    `<div class="split">
       <i style="width:${mix.pct}%;background:var(--good)"></i>
       <i style="width:${100 - mix.pct}%;background:var(--muted)"></i>
     </div>
     <div class="between tiny" style="margin-top:8px">
       <span>${hm(mix.verified)} timed</span>
       <span>${hm(mix.unverified)} typed · ${mix.notes} notes</span>
     </div>`);
}

function activityBlock(days) {
  const peak = Math.max(...days.map(d => d.solved), 1);
  const cells = days.map(d => ({
    color: !d.solved ? 'var(--muted)'
      : d.solved >= peak * 0.66 ? 'var(--accent)'
      : `color-mix(in srgb, var(--accent) ${d.solved >= peak * 0.33 ? 62 : 30}%, var(--panel))`,
    label: `${d.key} · ${d.solved} solved`,
  }));
  return block('d-activity', 'Activity', 'Last 60 days · darker is more',
    `<div class="card sunk">${calendarGrid(cells)}</div>`);
}

function historyBlock(days) {
  const shown = [...days].reverse().filter(d => d.logged).slice(0, historyDays);
  if (!shown.length) return '';
  return block('d-history', 'Day by day', '',
    `<div class="stack">${shown.map(d => `
       <div class="card">
         <div class="between">
           <div><div class="h3">${shortDate(d.key)}</div>
             <div class="tiny">${d.solved} solved · ${d.commits} commits${
               d.verifiedMinutes ? ` · ${hm(d.verifiedMinutes)} timed` : ''}</div></div>
           <span class="badge ${d.solved ? 'good' : ''}">${d.solved}</span>
         </div>
         ${solvesOn(d.key).length ? `<div class="wrap" style="margin-top:10px">
           ${solvesOn(d.key).map(s => `<span class="badge" style="background:${
             colorForRating(s.rating)};color:var(--ink)">${s.rating ?? '—'}</span>`).join('')}
         </div>` : ''}
       </div>`).join('')}</div>
     <button class="btn ghost block sm" style="margin-top:12px" data-more>
       Show ${historyDays === 7 ? '30' : 'fewer'} days</button>`);
}

/* --------------------------------- sheets --------------------------------- */

/**
 * A timer the app holds itself. This is the only way to earn XP for time, since
 * it is the only duration the app can vouch for.
 */
function openTimer(rerender) {
  let seconds = 0, running = true, tick = null;

  const close = sheet('Practice timer', `
    <div class="center">
      <div class="pl-timer" id="tm-clock">00:00</div>
      <div class="tiny" style="margin-top:14px">
        The app is holding this clock, so the minutes count. Leave the sheet open.
      </div>
    </div>
    <div class="field" style="margin-top:20px">
      <label>What are you working on?</label>
      <input class="input" id="tm-note" maxlength="120" placeholder="Graph problems">
    </div>
    <div class="row" style="margin-top:16px">
      <button class="btn grow" data-pause>Pause</button>
      <button class="btn primary grow" data-save>Save</button>
    </div>
    <button class="btn ghost block sm" style="margin-top:8px" data-discard>Discard</button>
  `, (el, closeSheet) => {
    const clock = $('#tm-clock', el);
    const paint = () => {
      const m = Math.floor(seconds / 60), s = seconds % 60;
      clock.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    tick = setInterval(() => { if (running) { seconds++; paint(); } }, 1000);
    paint();

    $('[data-pause]', el).onclick = (e) => {
      running = !running;
      e.target.textContent = running ? 'Pause' : 'Resume';
      clock.classList.toggle('paused', !running);
    };
    $('[data-discard]', el).onclick = () => { clearInterval(tick); closeSheet(); };
    $('[data-save]', el).onclick = () => {
      clearInterval(tick);
      const minutes = Math.round(seconds / 60);
      if (minutes < 1) { toast('Under a minute — nothing to save.'); closeSheet(); return; }
      const r = logSession({ minutes, note: $('#tm-note', el).value, verified: true });
      closeSheet(); sfx('reward'); haptic(14); rewardToast(r); rerender();
    };
  });
}

function openNote(rerender) {
  sheet('Add a note', `
    <div class="card sunk">
      <div class="tiny">Notes are kept in your log and pay nothing. Use them for work
        this app cannot see — a LeetCode problem, a chapter, an hour at your job.</div>
    </div>
    <div class="field" style="margin-top:14px">
      <label>What happened?</label>
      <textarea class="input" id="nt-text" maxlength="300"
        placeholder="Two LeetCode mediums on sliding window"></textarea>
    </div>
    <button class="btn primary block" style="margin-top:16px" data-save>Save note</button>
  `, (el, close) => {
    $('[data-save]', el).onclick = () => {
      const text = $('#nt-text', el).value.trim();
      if (!text) { toast('Write something first.'); return; }
      logNote({ text });
      close(); rerender();
    };
  });
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  bind(root, {
    sync: async (el) => {
      el.textContent = 'Syncing…';
      const r = await syncAll({ force: true });
      toast(describeSync(r), 3200);
      if (r.cf?.reward) rewardToast(r.cf.reward);
      rerender();
    },
    timer: () => openTimer(rerender),
    note:  () => openNote(rerender),
  });

  $$('[data-del-focus]', root).forEach(b => b.onclick = () => {
    removeSession(b.dataset.delFocus); rerender();
  });
  $$('[data-del-note]', root).forEach(b => b.onclick = () => {
    removeNote(b.dataset.delNote); rerender();
  });

  const more = $('[data-more]', root);
  if (more) more.onclick = () => { historyDays = historyDays === 7 ? 30 : 7; rerender(); };
}
