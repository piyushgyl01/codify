/**
 * The dashboard, rendered inline at the bottom of the Log tab.
 *
 * Everything here is derived from data the app already had. The order is
 * deliberate: calibration first, because it is the only section that can tell
 * you the rest of the page is lying to you.
 */
import { S, historySeries, targets, getDay, dayTotals } from '../state.js';
import {
  calibration, retentionForecast, queueForecast, retentionBands,
  movingAverage, focusBand, BAND_COLOR, patternCoverage, pathBalance,
  weeklyBuckets, problemHealth, modeBreakdown, dayStats, median,
} from '../analytics.js';
import { MODES, modeFor, patternName, difficultyFor, shipKindFor } from '../data/practice.js';
import { seriesChart, stackedChart, lineChart, calendarGrid, barRows } from '../charts.js';
import { h, raw, esc, $, $$, hm, fmt, pct, bar, splitBar, shortDate, relDays, timeOf } from '../ui.js';

let logDays = 7;
export const setLogDays = n => { logDays = n; };

/* --------------------------------- helpers -------------------------------- */

/**
 * A dashboard section. The legend sits under the title rather than beside it —
 * these legends run long, and a right-aligned column fighting the label for a
 * 375px line produces three wrapped lines colliding with the heading.
 */
const block = (id, title, legend, body) => `
  <section class="dash" id="${id}">
    <div class="label">${title}</div>
    ${legend ? `<div class="tiny" style="margin-top:4px">${legend}</div>` : ''}
    <div style="margin-top:10px">${body}</div>
  </section>`;

const SECTIONS = [
  ['d-calibration', 'Calibration'], ['d-retention', 'Retention'], ['d-queue', 'Queue'],
  ['d-focus', 'Focus'], ['d-modes', 'Modes'], ['d-problems', 'Problems'],
  ['d-patterns', 'Patterns'], ['d-paths', 'Paths'], ['d-ships', 'Ships'],
  ['d-activity', 'Activity'], ['d-history', 'History'],
];

/* --------------------------------- render --------------------------------- */

export function renderCharts() {
  const days = historySeries(60);
  return `
    <div class="between" style="margin-bottom:4px">
      <div class="h2">Dashboard</div>
      <div class="tiny">${days.filter(d => d.logged).length} logged days</div>
    </div>

    <div class="pill-scroll" style="margin-top:10px">
      ${SECTIONS.map(([id, name]) =>
        `<button class="pill" data-jump="${id}">${name}</button>`).join('')}
    </div>

    ${renderCalibration()}
    ${renderRetention()}
    ${renderQueue()}
    ${renderFocus(days)}
    ${renderModes(days)}
    ${renderProblems(days)}
    ${renderPatterns()}
    ${renderPaths()}
    ${renderShips()}
    ${renderActivity(days)}
    ${renderHistory(days)}`;
}

/* ------------------------------- calibration ------------------------------ */

function renderCalibration() {
  const c = calibration();

  if (c.tooFew) {
    return block('d-calibration', 'Calibration',
      'The headline number, once there is enough evidence', `
      <div class="card sunk">
        <div class="h3">Not enough retests yet</div>
        <p class="sub" style="margin-top:8px">
          ${c.have} of ${c.need} logged. Once you have re-proven a few skills, this card
          compares what the retention model predicted against what actually happened —
          and tells you which one to stop trusting.
        </p>
        <div style="margin-top:12px">${bar((c.have / c.need) * 100)}</div>
      </div>`);
  }

  const v = c.verdict;
  const tone = { good:'var(--good)', bad:'var(--bad)', info:'var(--info)' }[v.tone];

  return block('d-calibration', 'Calibration',
    `${c.events} retests · ±${Math.round(c.tolerance * 100)}% tolerance`, `
    <div class="card rail" style="--rail:${tone}">
      <div class="h3" style="color:${tone}">${esc(v.title)}</div>
      <p class="sub" style="margin-top:8px">${esc(v.text)}</p>

      <div class="grid2" style="margin-top:14px">
        <div class="tile">
          <div class="v">${pct(c.predicted * 100)}</div>
          <div class="k">model predicted</div>
        </div>
        <div class="tile">
          <div class="v" style="color:${tone}">${pct(c.actual * 100)}</div>
          <div class="k">actually held</div>
        </div>
      </div>

      <div style="margin-top:12px">
        <div class="between tiny"><span>predicted</span><span>${pct(c.predicted * 100)}</span></div>
        ${bar(c.predicted * 100, { color: 'var(--dim)' })}
        <div class="between tiny" style="margin-top:8px"><span>actual</span><span>${pct(c.actual * 100)}</span></div>
        ${bar(c.actual * 100, { color: tone })}
      </div>

      <div class="tiny" style="margin-top:12px">
        Gap ${c.gap >= 0 ? '+' : ''}${pct(c.gap * 100)} — inside ±${pct(c.tolerance * 100)} counts as agreement.
        The tolerance narrows as you log more retests.
      </div>
    </div>

    <div class="card sunk" style="margin-top:10px">
      <div class="label">Recent retests</div>
      <div class="wrap" style="margin-top:8px">
        ${c.recent.map(e => `
          <span class="badge ${e.passed ? 'good' : 'bad'}" title="${esc(e.node.name)} · predicted ${pct(e.predicted * 100)}">
            ${e.passed ? '✓' : '✕'} ${esc(e.node.name)}
          </span>`).join('')}
      </div>
    </div>`);
}

/* -------------------------------- retention ------------------------------- */

function renderRetention() {
  const b = retentionBands();
  if (!b.total) {
    return block('d-retention', 'Retention', '',
      `<div class="empty">Claim a skill node and this fills in.</div>`);
  }

  const forecast = retentionForecast(90);
  const parts = [
    { pct: (b.bands.fresh / b.total) * 100, color:'var(--good)', name:'Fresh' },
    { pct: (b.bands.warm  / b.total) * 100, color:'var(--info)', name:'Warm' },
    { pct: (b.bands.rusty / b.total) * 100, color:'var(--warn)', name:'Rusty' },
    { pct: (b.bands.cold  / b.total) * 100, color:'var(--bad)',  name:'Cold' },
  ];

  return block('d-retention', 'Retention',
    'What the model thinks you still hold, and where it goes if you do nothing', `
    <div class="card">
      <div class="between">
        <div><div class="num h1">${pct(b.held * 100)}</div>
          <div class="tiny">of ${b.total} nodes still fresh or warm</div></div>
        <div class="right tiny">
          fresh ${b.bands.fresh} · warm ${b.bands.warm}<br>
          rusty ${b.bands.rusty} · cold ${b.bands.cold}
        </div>
      </div>
      <div style="margin-top:12px">${splitBar(parts)}</div>

      <div style="margin-top:16px">
        <div class="between tiny"><span>if you retest nothing for 90 days</span>
          <span>${pct((forecast.at(-1)?.value || 0) * 100)}</span></div>
        <div style="margin-top:6px">
          ${lineChart(forecast, { height: 96, maxY: 1, minY: 0, band: [0.5, 1],
                                  color: 'var(--accent)' })}
        </div>
        <div class="between tiny" style="margin-top:4px"><span>today</span><span>+90d</span></div>
      </div>
    </div>`);
}

function renderQueue() {
  const q = queueForecast(14);
  const total = q.reduce((n, b) => n + b.count, 0);
  if (!total) return '';

  const dueNow = q[0].count;
  const data = q.map((b, i) => ({
    value: b.count,
    color: i === 0 && b.count ? 'var(--bad)' : 'var(--info)',
    label: `${relDays(b.day)} · ${b.count}`,
    axis: i % 3 === 0 ? (i === 0 ? 'now' : `+${i}`) : '',
  }));

  return block('d-queue', 'Retest queue', 'When your skills come round again', `
    <div class="card">
      <div class="between">
        <div><div class="num h1" style="color:${dueNow ? 'var(--bad)' : 'var(--good)'}">${dueNow}</div>
          <div class="tiny">due right now</div></div>
        <div class="right"><div class="num h2">${total}</div>
          <div class="tiny">in the next 14 days</div></div>
      </div>
      <div style="margin-top:12px">${seriesChart(data, { height: 84, axisEvery: 3 })}</div>
    </div>`);
}

/* ---------------------------------- focus --------------------------------- */

function renderFocus(days) {
  const t = targets();
  const shown = days.slice(-30);
  const avg = movingAverage(shown, 'minutes', 7);
  const med = median(shown.filter(d => d.minutes > 0).map(d => d.minutes));

  const data = shown.map((d, i) => ({
    value: d.minutes,
    color: BAND_COLOR[focusBand(d.minutes, t.focus)],
    label: `${shortDate(d.key)} · ${hm(d.minutes)}`,
    axis: shortDate(d.key),
  }));

  const effData = shown.map(d => ({
    value: d.effMinutes,
    color: 'var(--accent)',
    label: `${shortDate(d.key)} · ${hm(d.effMinutes)} effective`,
    axis: shortDate(d.key),
  }));

  // One scale for both charts, so the second visibly sits lower than the first.
  const scale = Math.max(...shown.map(d => d.minutes), t.focus, 1) * 1.12;

  return block('d-focus', 'Focus minutes',
    `green ≥ target, amber ≥60% · — 7-day avg · ┆ target ${hm(t.focus)} · median ${hm(med)}`,
    `${seriesChart(data, { height: 128, target: t.focus, avg, axisEvery: 6, maxValue: scale })}
     <div class="label" style="margin-top:16px">Effective minutes</div>
     <div class="tiny">The same days and the same scale, after mode weighting — the drop is
       what passive practice costs you.</div>
     <div style="margin-top:8px">${seriesChart(effData, { height: 128, target: t.focus, axisEvery: 6, maxValue: scale })}</div>`);
}

/* ---------------------------------- modes --------------------------------- */

function renderModes(days) {
  const shown = days.slice(-30);
  const any = shown.some(d => d.minutes > 0);
  if (!any) return '';

  const data = shown.map(d => ({
    parts: MODES.map(m => ({ v: d.byMode?.[m.id] || 0, color: m.color })),
    axis: shortDate(d.key),
  }));

  const deliberate = shown.map(d => ({
    value: d.logged ? d.deliberatePct : 0,
    color: d.deliberatePct >= targets().deliberate ? 'var(--good)' : 'var(--warn)',
    label: `${shortDate(d.key)} · ${d.deliberatePct}%`,
    axis: shortDate(d.key),
  }));
  const delAvg = movingAverage(shown, 'deliberatePct', 7, { overLogged: true });

  return block('d-modes', 'How you practised',
    MODES.map(m => `<span style="color:${m.color}">■</span> ${m.name}`).join(' '),
    `${stackedChart(data, { height: 120, axisEvery: 6 })}
     <div class="label" style="margin-top:16px">Deliberate share</div>
     <div class="tiny">Build and Drill as a percentage of each day. ┆ floor ${targets().deliberate}%</div>
     <div style="margin-top:8px">
       ${seriesChart(deliberate, { height: 96, target: targets().deliberate, avg: delAvg, axisEvery: 6 })}
     </div>`);
}

/* -------------------------------- problems -------------------------------- */

function renderProblems(days) {
  const shown = days.slice(-30);
  if (!shown.some(d => d.problems > 0)) return '';

  const data = shown.map(d => ({
    value: d.solved,
    color: d.solved ? 'var(--info)' : 'var(--line)',
    label: `${shortDate(d.key)} · ${d.solved} solved of ${d.problems}`,
    axis: shortDate(d.key),
  }));

  const hp = problemHealth(30);

  return block('d-problems', 'Problems solved', 'Last 30 days', `
    ${seriesChart(data, { height: 100, axisEvery: 6 })}
    ${hp ? `
      <div class="card sunk" style="margin-top:14px">
        <div class="between">
          <div><div class="num h2">${pct(hp.solveRate * 100)}</div><div class="tiny">solve rate</div></div>
          <div class="right"><div class="num h2">${pct(hp.hintRate * 100)}</div><div class="tiny">needed a hint</div></div>
        </div>
        <div class="stack s2" style="margin-top:12px">
          ${hp.byDifficulty.filter(d => d.attempted).map(d => {
            const meta = difficultyFor(d.id);
            return `<div>
              <div class="between tiny"><span style="color:${meta.color}">${meta.name}</span>
                <span>${d.solved}/${d.attempted} · median ${d.medianMinutes || '—'}m</span></div>
              ${bar(d.rate * 100, { color: meta.color })}
            </div>`;
          }).join('')}
        </div>
        ${hp.note ? `<div class="sub" style="margin-top:12px;color:var(--warn)">${esc(hp.note)}</div>` : ''}
      </div>` : ''}`);
}

function renderPatterns() {
  const cov = patternCoverage();
  if (!cov.total) return '';

  return block('d-patterns', 'Pattern coverage',
    `${cov.covered} of ${cov.of} patterns touched`, `
    ${barRows(cov.rows.filter(r => r.count > 0).map(r => ({
      name: r.name, value: r.count, color: 'var(--info)',
    })), { showValue: v => v })}
    ${cov.thin.length ? `
      <div class="card sunk" style="margin-top:12px">
        <div class="label">Never attempted</div>
        <div class="wrap" style="margin-top:8px">
          ${cov.thin.map(p => `<span class="badge warn">${esc(p.name)}</span>`).join('')}
        </div>
        <div class="tiny" style="margin-top:8px">
          The pattern you avoid is the one that decides an interview. One of these
          shows up as a quest when it is your thinnest.
        </div>
      </div>` : ''}`);
}

/* ---------------------------------- paths --------------------------------- */

function renderPaths() {
  const b = pathBalance();
  if (!b.total) return '';

  const peak = Math.max(...b.rows.map(r => r.hours), 1);

  return block('d-paths', 'Where your hours went',
    'Effective hours per path, all time', `
    <div class="stack s2">
      ${b.rows.map(r => `
        <div class="path-row">
          <div class="between">
            <span class="h3" style="color:${r.color}">${r.icon} ${esc(r.name)}</span>
            <span class="tiny num">${Math.round(r.hours * 10) / 10}h · ${r.held}/${r.nodes}</span>
          </div>
          <div style="margin-top:6px">${bar((r.hours / peak) * 100, { color: r.color })}</div>
        </div>`).join('')}
    </div>

    ${b.starved.length ? `
      <div class="sub" style="margin-top:12px">
        Barely touched: ${esc(b.starved.join(', '))}.
        Not automatically a problem — a track has priorities — but worth knowing.
      </div>` : ''}`);
}

/* ---------------------------------- ships --------------------------------- */

function renderShips() {
  const weeks = weeklyBuckets(8);
  if (!weeks.some(w => w.ships > 0)) return '';

  const data = weeks.map(w => ({
    value: w.ships,
    color: 'var(--violet)',
    label: `week of ${w.from} · ${w.ships}`,
    axis: w.label,
  }));

  return block('d-ships', 'Shipped per week', `target ${targets().ships}/week`,
    seriesChart(data, { height: 96, target: targets().ships, axisEvery: 2 }));
}

/* --------------------------------- activity ------------------------------- */

function renderActivity(days) {
  const t = targets();
  const cells = days.map(d => {
    const ratio = t.focus ? Math.min(1, d.minutes / t.focus) : 0;
    return {
      color: !d.logged ? 'var(--line-soft)'
        : ratio >= 1 ? 'var(--accent)'
        : ratio >= 0.6 ? 'color-mix(in srgb, var(--accent) 60%, var(--sunk))'
        : 'color-mix(in srgb, var(--accent) 28%, var(--sunk))',
      label: `${d.key} · ${hm(d.minutes)}`,
    };
  });

  return block('d-activity', 'Activity', 'Last 60 days · darker is more',
    `<div class="card sunk">${calendarGrid(cells)}</div>`);
}

/* --------------------------------- history -------------------------------- */

function renderHistory(days) {
  const t = targets();
  const shown = [...days].reverse().filter(d => d.logged).slice(0, logDays);
  if (!shown.length) return '';

  return block('d-history', 'Day by day', '', `
    <div class="stack">${shown.map(d => historyCard(d, t)).join('')}</div>
    <button class="btn ghost block sm" style="margin-top:12px" data-more>
      Show ${logDays === 7 ? '30' : logDays === 30 ? 'all' : 'fewer'} days
    </button>`);
}

function historyCard(d, t) {
  const day = S.days[d.key];
  const modes = modeBreakdown(day);
  const band = focusBand(d.minutes, t.focus);

  return `<div class="card">
    <div class="between">
      <div>
        <div class="h3">${shortDate(d.key)}</div>
        <div class="tiny">${d.sessions} session${d.sessions === 1 ? '' : 's'}
          ${d.solved ? ` · ${d.solved} solved` : ''}${d.ships ? ` · ${d.ships} shipped` : ''}
          ${d.retests ? ` · ${d.retests} retest${d.retests === 1 ? '' : 's'}` : ''}</div>
      </div>
      <div class="badge ${band === 'on' ? 'good' : band === 'near' ? 'warn' : 'bad'}">${hm(d.minutes)}</div>
    </div>

    <div style="margin-top:10px">${bar((d.minutes / t.focus) * 100, {
      color: BAND_COLOR[band], tick: 100 })}</div>

    ${modes ? `
      <div style="margin-top:8px">${splitBar(modes.groups.map(g => ({
        pct: g.pct, color: g.color, name: g.name })))}</div>
      <div class="between tiny" style="margin-top:6px">
        <span>${hm(d.effMinutes)} effective</span>
        <span style="color:${d.deliberatePct >= t.deliberate ? 'var(--good)' : 'var(--warn)'}">
          ${d.deliberatePct}% deliberate</span>
      </div>` : ''}

    ${(day?.focus || []).length ? `
      <div class="stack s2" style="margin-top:10px">
        ${day.focus.map(e => {
          const m = modeFor(e.mode);
          return `<div class="between tiny">
            <span class="truncate"><span style="color:${m.color}">${m.icon}</span>
              ${esc(e.topic || m.name)}</span>
            <span class="num" style="flex:none">${hm(e.minutes)}</span>
          </div>`;
        }).join('')}
      </div>` : ''}
  </div>`;
}

/* ---------------------------------- mount --------------------------------- */

export function mountCharts(root, rerender) {
  $$('[data-jump]', root).forEach(b => b.onclick = () => {
    document.getElementById(b.dataset.jump)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const more = $('[data-more]', root);
  if (more) more.onclick = () => {
    setLogDays(logDays === 7 ? 30 : logDays === 30 ? 3650 : 7);
    rerender();
  };
}
