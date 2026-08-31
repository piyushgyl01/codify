/**
 * Log — the three logs and the day they add up to, with the dashboard beneath.
 *
 * One dense scrolling page rather than charts split across tabs: the point is to
 * read today, this week and the trend without navigating, and see how they relate.
 */
import {
  S, getDay, dayTotals, targets, today, quests,
  logFocus, removeFocus, logProblem, removeProblem, logShip, removeShip,
} from '../state.js';
import { MODES, modeFor, PATTERNS, patternName, DIFFICULTIES, difficultyFor,
         SHIP_KINDS, shipKindFor, CONTEXTS, effectiveMinutes } from '../data/practice.js';
import { PATHS, pathFor } from '../data/skilltree.js';
import { pathOrder } from '../game.js';
import { modeBreakdown, dayStats, rollingAverages, overreach } from '../analytics.js';
import { renderCharts, mountCharts } from './dashboard.js';
import {
  h, raw, esc, $, $$, bar, splitBar, hm, fmt, timeOf, sfx, haptic,
  sheet, dialog, toast, rewardToast, bind,
} from '../ui.js';
import { icon } from '../icons.js';

/* --------------------------------- render --------------------------------- */

export function render() {
  const day = getDay();
  const t = targets();
  const st = dayStats(day);
  const modes = modeBreakdown(day);
  const avg = rollingAverages(7);
  const over = overreach(7);

  return h`
    <div class="between">
      <div>
        <div class="h2">Log</div>
        <div class="sub">${st.sessions
          ? `${hm(st.minutes)} logged · ${hm(st.effMinutes)} effective`
          : 'Nothing logged today yet.'}</div>
      </div>
      <div class="badge ${st.band === 'on' ? 'good' : st.band === 'near' ? 'warn' : ''}">
        ${st.minutes}/${t.focus}m
      </div>
    </div>

    <div class="wrap" style="margin-top:14px">
      <button class="btn primary grow" data-act="add-focus">${raw(icon('plus', 16).value)} Session</button>
      <button class="btn grow" data-act="add-problem">◎ Problem</button>
      <button class="btn grow" data-act="add-ship">↑ Ship</button>
    </div>

    ${raw(over ? `
      <div class="card rail" style="--rail:var(--warn);margin-top:14px">
        <div class="row"><span style="color:var(--warn)">⚠</span>
          <div class="grow">
            <div class="h3">You are running above your own ceiling</div>
            <div class="sub" style="margin-top:4px">
              ${hm(over.avg)} a day across ${over.days} days, against a stated capacity of
              ${hm(over.capacity)}. That is the pattern that produces three good weeks and
              then three months off. Nothing here is worth that trade.
            </div>
          </div></div>
      </div>` : '')}

    ${raw(dayCard(st, modes, t, avg))}
    ${raw(entriesSection(day))}

    <hr class="rule" style="margin-top:28px">
    ${raw(renderCharts())}`;
}

/* -------------------------------- day card -------------------------------- */

function dayCard(st, modes, t, avg) {
  const pctOfTarget = t.focus ? (st.minutes / t.focus) * 100 : 0;
  const effPct = t.focus ? (st.effMinutes / t.focus) * 100 : 0;

  return `
  <div class="card" style="margin-top:14px">
    <div class="between">
      <div class="label">Today</div>
      <div class="tiny">${st.trained ? '' : ''}7-day avg ${hm(avg.minutes)}</div>
    </div>

    <div class="row" style="margin-top:12px;align-items:flex-end">
      <div class="grow">
        <div class="num" style="font-size:30px;font-weight:800;letter-spacing:-.03em">
          ${hm(st.minutes)}</div>
        <div class="tiny">logged · target ${hm(t.focus)}</div>
      </div>
      <div class="right">
        <div class="num h2" style="color:var(--accent)">${hm(st.effMinutes)}</div>
        <div class="tiny">effective</div>
      </div>
    </div>

    <div style="margin-top:10px">${bar(pctOfTarget, { tall: true,
      color: st.band === 'on' ? 'var(--good)' : st.band === 'near' ? 'var(--warn)' : 'var(--bad)' })}</div>
    <div style="margin-top:6px">${bar(effPct, { color: 'var(--accent)' })}</div>
    <div class="between tiny" style="margin-top:6px">
      <span>raw ${Math.round(pctOfTarget)}% of target</span>
      <span>effective ${Math.round(effPct)}%</span>
    </div>

    ${modes ? `
      <hr class="rule" style="margin:14px 0">
      <div class="between">
        <div class="label">Deliberate share</div>
        <div class="badge ${st.hitDeliberate ? 'good' : 'warn'}">
          ${Math.round(modes.deliberatePct)}% / ${st.deliberateFloor}%
        </div>
      </div>
      <div style="margin-top:8px">${splitBar(modes.groups.map(g => ({
        pct: g.pct, color: g.color, name: `${g.name} ${Math.round(g.pct)}%`,
      })))}</div>
      <div class="wrap" style="margin-top:8px">
        ${modes.groups.filter(g => g.minutes > 0).map(g => `
          <span class="badge"><span class="dot" style="background:${g.color}"></span>
            ${g.name} ${hm(g.minutes)} <span style="color:var(--faint)">×${g.weight.toFixed(2)}</span>
          </span>`).join('')}
      </div>
      ${modes.passivePct >= 50 ? `
        <div class="sub" style="margin-top:10px;color:var(--warn)">
          Over half of today was video. It counts, at ${modeFor('watch').weight.toFixed(2)}×,
          but nothing you watched today will show up in a retest.
        </div>` : ''}
    ` : ''}

    <hr class="rule" style="margin:14px 0">
    <div class="grid3">
      <div class="tile"><div class="v">${st.solved}<span style="font-size:13px;color:var(--faint)">/${st.problems}</span></div><div class="k">solved</div></div>
      <div class="tile"><div class="v">${st.ships}</div><div class="k">shipped</div></div>
      <div class="tile"><div class="v">${st.retests}</div><div class="k">retests</div></div>
    </div>
  </div>`;
}

/* -------------------------------- entries --------------------------------- */

function entriesSection(day) {
  const rows = [
    ...day.focus.map(e => ({ kind: 'focus', ts: e.ts, e })),
    ...day.problems.map(e => ({ kind: 'problem', ts: e.ts, e })),
    ...day.ships.map(e => ({ kind: 'ship', ts: e.ts, e })),
    ...day.retests.map(e => ({ kind: 'retest', ts: e.ts, e })),
  ].sort((a, b) => b.ts - a.ts);

  if (!rows.length) {
    return `<div class="section">
      <div class="empty"><div class="big">▤</div>
        Nothing logged today. Start with a session — even fifteen minutes counts.</div>
    </div>`;
  }

  return `<div class="section">
    <div class="label">Today’s entries · ${rows.length}</div>
    <div class="stack s2">${rows.map(r => entryRow(r)).join('')}</div>
  </div>`;
}

function entryRow({ kind, e }) {
  if (kind === 'focus') {
    const m = modeFor(e.mode);
    const p = e.path ? pathFor(e.path) : null;
    return `<div class="card pad-s rail entry" style="--rail:${m.color}">
      <div class="between">
        <div class="grow">
          <div class="row" style="gap:8px">
            <span class="badge" style="color:${m.color}">${m.icon} ${m.name}</span>
            ${p ? `<span class="badge">${p.short}</span>` : ''}
            ${e.drillId ? '<span class="badge">drill</span>' : ''}
          </div>
          <div class="h3 truncate" style="margin-top:6px">${esc(e.topic || m.name)}</div>
          ${e.note ? `<div class="tiny" style="margin-top:3px">${esc(e.note)}</div>` : ''}
        </div>
        <div class="right" style="flex:none">
          <div class="num h3">${hm(e.minutes)}</div>
          <div class="tiny">${hm(effectiveMinutes(e))} eff</div>
          <div class="tiny">${timeOf(e.ts)}</div>
        </div>
      </div>
      <button class="btn ghost xs" style="margin-top:8px" data-del-focus="${e.uid}">Remove</button>
    </div>`;
  }

  if (kind === 'problem') {
    const d = difficultyFor(e.difficulty);
    return `<div class="card pad-s rail entry" style="--rail:${d.color}">
      <div class="between">
        <div class="grow">
          <div class="row" style="gap:8px">
            <span class="badge" style="color:${d.color}">${d.name}</span>
            ${e.pattern ? `<span class="badge">${esc(patternName(e.pattern))}</span>` : ''}
            ${e.hinted ? '<span class="badge warn">hint</span>' : ''}
            ${e.solved ? '' : '<span class="badge bad">unsolved</span>'}
          </div>
          <div class="h3 truncate" style="margin-top:6px">${esc(e.name)}</div>
        </div>
        <div class="right" style="flex:none">
          <div class="num h3">${e.minutes || '—'}${e.minutes ? 'm' : ''}</div>
          <div class="tiny">${timeOf(e.ts)}</div>
        </div>
      </div>
      <button class="btn ghost xs" style="margin-top:8px" data-del-problem="${e.uid}">Remove</button>
    </div>`;
  }

  if (kind === 'ship') {
    const k = shipKindFor(e.kind);
    return `<div class="card pad-s rail entry" style="--rail:${k.color}">
      <div class="between">
        <div class="grow">
          <span class="badge" style="color:${k.color}">${k.icon} ${k.name}</span>
          <div class="h3" style="margin-top:6px">
            ${e.count > 1 ? `${e.count} × ` : ''}${esc(e.repo || k.name)}</div>
          ${e.note ? `<div class="tiny" style="margin-top:3px">${esc(e.note)}</div>` : ''}
        </div>
        <div class="tiny" style="flex:none">${timeOf(e.ts)}</div>
      </div>
      <button class="btn ghost xs" style="margin-top:8px" data-del-ship="${e.uid}">Remove</button>
    </div>`;
  }

  // retest — read-only on purpose: see the note in the sheet that writes them.
  return `<div class="card pad-s rail entry" style="--rail:${e.passed ? 'var(--good)' : 'var(--bad)'}">
    <div class="between">
      <div class="grow">
        <span class="badge ${e.passed ? 'good' : 'bad'}">${e.passed ? '✓ held' : '✕ lost'}</span>
        <div class="h3" style="margin-top:6px">Retest · ${esc(e.nodeId)}</div>
      </div>
      <div class="tiny">${timeOf(e.ts)}</div>
    </div>
  </div>`;
}

/* --------------------------------- sheets --------------------------------- */

const guessMode = () => 'build';

/**
 * Log a focus session.
 *
 * Minutes are entered with a stepper and a row of common lengths rather than a
 * keyboard: on a phone the numeric keypad covers the sheet you are filling in.
 */
export function openFocusSheet(rerender, preset = {}) {
  let mode = preset.mode || guessMode();
  let path = preset.path || null;
  let minutes = preset.minutes || 45;
  let ctx = null;

  sheet('Log a session', `
    <div class="field">
      <label>What kind of practice?</label>
      <div class="stack s2">
        ${MODES.map(m => `
          <button class="card tap pad-s opt ${m.id === mode ? 'on' : ''}" data-mode="${m.id}">
            <div class="between">
              <div class="row" style="gap:10px">
                <span style="color:${m.color};font-size:17px">${m.icon}</span>
                <div><div class="h3">${m.name}</div>
                <div class="tiny">${esc(m.blurb)}</div></div>
              </div>
              <span class="badge" style="color:${m.color}">×${m.weight.toFixed(2)}</span>
            </div>
          </button>`).join('')}
      </div>
    </div>

    <div class="field" style="margin-top:18px">
      <label>How long?</label>
      <div class="stepper">
        <button data-step="-5" aria-label="Less">−</button>
        <input class="input num" id="lf-min" type="number" inputmode="numeric"
               min="1" max="720" value="${minutes}">
        <button data-step="5" aria-label="More">+</button>
      </div>
      <div class="pill-row" style="margin-top:8px">
        ${[15, 25, 45, 60, 90, 120].map(v =>
          `<button class="pill" data-quick="${v}">${hm(v)}</button>`).join('')}
      </div>
      <div class="sub" id="lf-eff" style="margin-top:8px"></div>
    </div>

    <div class="field" style="margin-top:18px">
      <label>Which path? <span class="tiny">— feeds skill retention</span></label>
      <div class="pill-row">
        ${pathOrder(S.profile.track).map(p => `
          <button class="pill" data-path="${p.id}">${p.icon} ${p.short}</button>`).join('')}
      </div>
    </div>

    <div class="field" style="margin-top:18px">
      <label>What were you working on?</label>
      <input class="input" id="lf-topic" maxlength="80" placeholder="Parser for the toy language">
    </div>

    <div class="field" style="margin-top:14px">
      <label>What did you learn? <span class="tiny">— optional, but this is the bit you re-read</span></label>
      <textarea class="input" id="lf-note" maxlength="300"
        placeholder="Precedence climbing is much shorter than the nested-function version."></textarea>
    </div>

    <div class="field" style="margin-top:14px">
      <label>Context</label>
      <div class="pill-row">
        ${CONTEXTS.map(c => `<button class="pill" data-ctx="${c.id}">${c.icon} ${c.name}</button>`).join('')}
      </div>
    </div>

    <button class="btn primary block" style="margin-top:20px" data-save>Log it</button>
  `, (el, close) => {
    const input = $('#lf-min', el);
    const eff = $('#lf-eff', el);

    const paint = () => {
      minutes = Math.max(1, Math.min(720, Math.round(+input.value || 0)));
      const m = modeFor(mode);
      eff.innerHTML = `<span class="num">${hm(minutes)}</span> at ${m.name.toLowerCase()}
        weight ×${m.weight.toFixed(2)} = <b class="num" style="color:var(--accent)">${hm(Math.round(minutes * m.weight))} effective</b>`;
    };

    input.addEventListener('input', paint);
    $$('[data-step]', el).forEach(b => b.onclick = () => {
      input.value = Math.max(1, (+input.value || 0) + (+b.dataset.step));
      paint(); haptic(6);
    });
    $$('[data-quick]', el).forEach(b => b.onclick = () => {
      input.value = b.dataset.quick; paint(); haptic(6);
    });
    $$('[data-mode]', el).forEach(b => b.onclick = () => {
      mode = b.dataset.mode;
      $$('[data-mode]', el).forEach(x => x.classList.toggle('on', x === b));
      paint(); haptic(6);
    });
    $$('[data-path]', el).forEach(b => {
      if (b.dataset.path === path) b.classList.add('on');
      b.onclick = () => {
        path = path === b.dataset.path ? null : b.dataset.path;
        $$('[data-path]', el).forEach(x => x.classList.toggle('on', x.dataset.path === path));
        haptic(6);
      };
    });
    $$('[data-ctx]', el).forEach(b => b.onclick = () => {
      ctx = ctx === b.dataset.ctx ? null : b.dataset.ctx;
      $$('[data-ctx]', el).forEach(x => x.classList.toggle('on', x.dataset.ctx === ctx));
    });

    paint();

    $('[data-save]', el).onclick = () => {
      const r = logFocus({
        minutes, mode, path,
        topic: $('#lf-topic', el).value,
        note: $('#lf-note', el).value,
        ctx,
      });
      close(); sfx('reward'); haptic(14);
      rewardToast(r);
      rerender();
    };
  });
}

/** Log a problem. Defaults to solved, because most logged attempts are. */
export function openProblemSheet(rerender, preset = {}) {
  let difficulty = preset.difficulty || 'medium';
  let pattern = preset.pattern || null;
  let solved = true, hinted = false;

  sheet('Log a problem', `
    <div class="field">
      <label>What was it?</label>
      <input class="input" id="lp-name" maxlength="90" placeholder="Longest substring without repeats">
    </div>

    <div class="field" style="margin-top:16px">
      <label>Pattern</label>
      <div class="pill-row">
        ${PATTERNS.map(p => `<button class="pill" data-pattern="${p.id}">${esc(p.name)}</button>`).join('')}
      </div>
    </div>

    <div class="field" style="margin-top:16px">
      <label>Difficulty</label>
      <div class="seg" id="lp-diff">
        ${DIFFICULTIES.map(d => `<button class="${d.id === difficulty ? 'on' : ''}"
          data-diff="${d.id}">${d.name}</button>`).join('')}
      </div>
    </div>

    <div class="field" style="margin-top:16px">
      <label>Minutes taken</label>
      <div class="stepper">
        <button data-step="-5">−</button>
        <input class="input num" id="lp-min" type="number" inputmode="numeric" min="0" max="600" value="25">
        <button data-step="5">+</button>
      </div>
      <div class="tiny" id="lp-par" style="margin-top:6px"></div>
    </div>

    <div class="stack s2" style="margin-top:18px">
      <button class="card tap pad-s opt on" data-toggle="solved">
        <div class="between"><div class="h3">Solved it</div><div class="badge" id="lp-solved">yes</div></div>
      </button>
      <button class="card tap pad-s opt" data-toggle="hinted">
        <div class="between"><div>
          <div class="h3">Needed a hint</div>
          <div class="tiny">Worth less XP, but logging it honestly is what makes the stats mean anything.</div>
        </div><div class="badge" id="lp-hinted">no</div></div>
      </button>
    </div>

    <button class="btn primary block" style="margin-top:20px" data-save>Log it</button>
  `, (el, close) => {
    const parNote = () => {
      const d = difficultyFor(difficulty);
      const mins = +$('#lp-min', el).value || 0;
      $('#lp-par', el).textContent =
        `Par for ${d.name.toLowerCase()} is about ${d.par} minutes` +
        (mins && mins < d.par ? ' — under par pays a small bonus.' : '.');
    };

    $$('[data-diff]', el).forEach(b => b.onclick = () => {
      difficulty = b.dataset.diff;
      $$('[data-diff]', el).forEach(x => x.classList.toggle('on', x === b));
      parNote(); haptic(6);
    });
    $$('[data-pattern]', el).forEach(b => b.onclick = () => {
      pattern = pattern === b.dataset.pattern ? null : b.dataset.pattern;
      $$('[data-pattern]', el).forEach(x => x.classList.toggle('on', x.dataset.pattern === pattern));
      haptic(6);
    });
    $$('[data-step]', el).forEach(b => b.onclick = () => {
      const i = $('#lp-min', el);
      i.value = Math.max(0, (+i.value || 0) + (+b.dataset.step));
      parNote();
    });
    $('#lp-min', el).addEventListener('input', parNote);

    $$('[data-toggle]', el).forEach(b => b.onclick = () => {
      const which = b.dataset.toggle;
      if (which === 'solved') solved = !solved; else hinted = !hinted;
      b.classList.toggle('on', which === 'solved' ? solved : hinted);
      $(`#lp-${which}`, el).textContent = (which === 'solved' ? solved : hinted) ? 'yes' : 'no';
      haptic(6);
    });

    parNote();

    $('[data-save]', el).onclick = () => {
      const name = $('#lp-name', el).value.trim();
      if (!name) { toast('Give it a name so it means something later.'); return; }
      const r = logProblem({ name, pattern, difficulty,
        minutes: +$('#lp-min', el).value || 0, solved, hinted });
      close(); sfx('reward'); haptic(14);
      rewardToast(r);
      rerender();
    };
  });
}

export function openShipSheet(rerender) {
  let kind = 'commit';

  sheet('Log a ship', `
    <div class="field">
      <label>What left your machine?</label>
      <div class="stack s2">
        ${SHIP_KINDS.map(k => `
          <button class="card tap pad-s opt ${k.id === kind ? 'on' : ''}" data-kind="${k.id}">
            <div class="between">
              <div class="row" style="gap:10px">
                <span style="color:${k.color};font-size:16px">${k.icon}</span>
                <div><div class="h3">${k.name}</div><div class="tiny">${esc(k.blurb)}</div></div>
              </div>
              <span class="badge">+${k.xp} XP</span>
            </div>
          </button>`).join('')}
      </div>
    </div>

    <div class="field" style="margin-top:16px" id="ls-count-field">
      <label>How many?</label>
      <div class="stepper">
        <button data-step="-1">−</button>
        <input class="input num" id="ls-count" type="number" inputmode="numeric" min="1" max="200" value="1">
        <button data-step="1">+</button>
      </div>
    </div>

    <div class="field" style="margin-top:16px">
      <label>Where?</label>
      <input class="input" id="ls-repo" maxlength="60" placeholder="repo or project name">
    </div>

    <div class="field" style="margin-top:14px">
      <label>Note</label>
      <input class="input" id="ls-note" maxlength="300" placeholder="optional">
    </div>

    <button class="btn primary block" style="margin-top:20px" data-save>Log it</button>
  `, (el, close) => {
    const countField = $('#ls-count-field', el);

    const paintKind = () => {
      // A release or a finished project is not a thing you did seven of today.
      countField.style.display = shipKindFor(kind).counted ? '' : 'none';
    };

    $$('[data-kind]', el).forEach(b => b.onclick = () => {
      kind = b.dataset.kind;
      $$('[data-kind]', el).forEach(x => x.classList.toggle('on', x === b));
      paintKind(); haptic(6);
    });
    $$('[data-step]', el).forEach(b => b.onclick = () => {
      const i = $('#ls-count', el);
      i.value = Math.max(1, (+i.value || 1) + (+b.dataset.step));
    });
    paintKind();

    $('[data-save]', el).onclick = () => {
      const r = logShip({
        kind,
        count: shipKindFor(kind).counted ? +$('#ls-count', el).value || 1 : 1,
        repo: $('#ls-repo', el).value,
        note: $('#ls-note', el).value,
      });
      close(); sfx('reward'); haptic(14);
      rewardToast(r);
      rerender();
    };
  });
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  bind(root, {
    'add-focus':   () => openFocusSheet(rerender),
    'add-problem': () => openProblemSheet(rerender),
    'add-ship':    () => openShipSheet(rerender),
  });

  const del = (attr, fn) => $$(`[${attr}]`, root).forEach(b => b.onclick = () => {
    fn(b.getAttribute(attr));
    haptic(10);
    rerender();
  });
  del('data-del-focus', removeFocus);
  del('data-del-problem', removeProblem);
  del('data-del-ship', removeShip);

  mountCharts(root, rerender);
}
