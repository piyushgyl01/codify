/** Train — browse drills by tier and path, preview them, enter a gauntlet. */
import { S, progress } from '../state.js';
import { DRILLS, GAUNTLETS, TIER_LOCK, TIER_NAME, drillMinutes, getSession } from '../data/drills.js';
import { pathFor, PATHS } from '../data/skilltree.js';
import { modeFor } from '../data/practice.js';
import { pathOrder } from '../game.js';
import { startSession } from './player.js';
import {
  h, raw, esc, $, $$, bind, bar, hm, esc as e2, sheet, toast, sfx, haptic,
} from '../ui.js';
import { icon } from '../icons.js';

let filterPath = 'all';
let filterTier = 'all';

/** Let another view open Train already filtered. */
export function setPath(id = 'all') { filterPath = id; filterTier = 'all'; }

export function render() {
  const level = progress().level;
  const paths = pathOrder(S.profile.track);

  const open = DRILLS.filter(d => level >= TIER_LOCK[d.tier]);
  const locked = DRILLS.filter(d => level < TIER_LOCK[d.tier]);

  const shown = open.filter(d =>
    (filterPath === 'all' || d.path === filterPath) &&
    (filterTier === 'all' || String(d.tier) === filterTier));

  return h`
    <div class="between">
      <div>
        <div class="h2">Train</div>
        <div class="sub">${open.length} drills open · ${locked.length} still locked</div>
      </div>
    </div>

    ${raw(gauntletSection(level))}

    <div class="pill-scroll" style="margin-top:18px">
      <button class="pill ${filterPath === 'all' ? 'on' : ''}" data-path="all">All paths</button>
      ${raw(paths.map(p => `<button class="pill ${filterPath === p.id ? 'on' : ''}"
        data-path="${p.id}">${p.icon} ${p.short}</button>`).join(''))}
    </div>

    <div class="pill-scroll" style="margin-top:8px">
      <button class="pill ${filterTier === 'all' ? 'on' : ''}" data-tier="all">All lengths</button>
      ${raw([1, 2, 3, 4, 5].map(t => `<button class="pill ${filterTier === String(t) ? 'on' : ''}"
        data-tier="${t}" ${level < TIER_LOCK[t] ? 'disabled' : ''}>${TIER_NAME[t]}</button>`).join(''))}
    </div>

    <div class="section">
      ${raw(shown.length
        ? `<div class="stack">${shown.map(d => drillCard(d)).join('')}</div>`
        : '<div class="empty">Nothing matches that filter.</div>')}
    </div>

    ${raw(locked.length ? `
      <div class="section">
        <div class="label">Locked</div>
        <div class="stack s2">
          ${locked.slice(0, 6).map(d => `
            <div class="card pad-s" style="opacity:.6">
              <div class="between">
                <div class="grow truncate">
                  <div class="h3 truncate">${d.icon} ${esc(d.name)}</div>
                  <div class="tiny">${TIER_NAME[d.tier]} · ${hm(drillMinutes(d))}</div>
                </div>
                <span class="badge">level ${TIER_LOCK[d.tier]}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>` : '')}`;
}

function drillCard(d) {
  const p = pathFor(d.path);
  const m = modeFor(d.mode);
  return `
  <button class="card tap rail" style="--rail:${p.color}" data-open="${d.id}">
    <div class="between">
      <div class="grow">
        <div class="row" style="gap:6px">
          <span class="badge" style="color:${p.color}">${p.short}</span>
          <span class="badge" style="color:${m.color}">${m.icon} ${m.name}</span>
          <span class="badge">${TIER_NAME[d.tier]}</span>
        </div>
        <div class="h3" style="margin-top:8px">${d.icon} ${esc(d.name)}</div>
        <div class="tiny" style="margin-top:4px">${esc(d.blurb)}</div>
      </div>
    </div>
    <div class="between" style="margin-top:10px">
      <span class="tiny">${d.steps.length} steps · ${hm(drillMinutes(d))}</span>
      <span class="badge">+${d.xp} XP</span>
    </div>
  </button>`;
}

/* -------------------------------- gauntlets ------------------------------- */

function gauntletSection(level) {
  return `
  <div class="section">
    <div class="between">
      <div class="label">Gauntlets</div>
      <div class="tiny">You can lose these</div>
    </div>
    <div class="stack s2">
      ${GAUNTLETS.map(g => {
        const rec = S.gauntlets[g.id] || {};
        const locked = level < g.lvl;
        return `<button class="card tap gauntlet ${rec.won ? 'won' : ''} ${locked ? 'locked' : ''}"
          data-open="${g.id}" ${locked ? 'disabled' : ''}>
          <div class="between">
            <div class="row" style="gap:12px">
              <span class="g-glyph">${g.icon}</span>
              <div class="grow">
                <div class="h3">${esc(g.name)}</div>
                <div class="tiny" style="margin-top:2px">
                  ${locked ? `Unlocks at level ${g.lvl}`
                    : rec.won ? `Beaten · ${rec.attempts} attempt${rec.attempts === 1 ? '' : 's'}`
                    : rec.attempts ? `${rec.attempts} attempt${rec.attempts === 1 ? '' : 's'} · best ${rec.best}%`
                    : `${g.hp} HP · ${g.focus} focus`}
                </div>
              </div>
            </div>
            <span class="badge ${rec.won ? 'good' : locked ? '' : 'warn'}">
              ${rec.won ? '✓' : locked ? `lvl ${g.lvl}` : 'open'}</span>
          </div>
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

/* --------------------------------- preview -------------------------------- */

function preview(id, rerender) {
  const s = getSession(id);
  if (!s) return;
  const p = pathFor(s.path);
  const m = modeFor(s.mode);
  const total = drillMinutes(s);
  const rec = s.isGauntlet ? (S.gauntlets[s.id] || {}) : null;

  sheet(s.name, `
    <div class="row" style="gap:6px">
      <span class="badge" style="color:${p.color}">${p.icon} ${p.name}</span>
      <span class="badge" style="color:${m.color}">${m.icon} ${m.name}</span>
      <span class="badge">${hm(total)}</span>
    </div>

    <p class="sub" style="margin-top:12px">${esc(s.blurb)}</p>

    ${s.isGauntlet ? `
      <div class="card rail" style="--rail:var(--bad);margin-top:14px">
        <div class="between">
          <div><div class="label">Health</div><div class="num h2">${s.hp}</div></div>
          <div class="right"><div class="label">Your focus</div><div class="num h2">${s.focus}</div></div>
        </div>
        <div class="sub" style="margin-top:10px">
          Finishing a step deals damage scaled by your combo. Skipping one costs a focus
          pip. Run out and it survives — you keep partial XP and come back stronger.
        </div>
        ${rec?.attempts ? `<div class="tiny" style="margin-top:8px">
          ${rec.won ? 'Already beaten.' : `${rec.attempts} attempt${rec.attempts === 1 ? '' : 's'}, best ${rec.best}% cleared.`}
        </div>` : ''}
      </div>` : ''}

    <div class="label" style="margin-top:18px">The steps</div>
    <div class="stack s2" style="margin-top:8px">
      ${s.steps.map((st, i) => `
        <div class="card pad-s sunk">
          <div class="between">
            <div class="grow">
              <div class="h3">${i + 1}. ${esc(st.label)}</div>
              ${st.note ? `<div class="tiny" style="margin-top:3px">${esc(st.note)}</div>` : ''}
            </div>
            <span class="badge">${st.minutes}m</span>
          </div>
        </div>`).join('')}
    </div>

    <div class="card sunk" style="margin-top:14px">
      <div class="between tiny">
        <span>${s.steps.length} steps + ${s.steps.length - 1} rests of ${s.rest}m</span>
        <span>+${s.xp} XP · +${s.coins}c</span>
      </div>
    </div>

    <button class="btn primary block" style="margin-top:18px" data-start>Start</button>
  `, (el, close) => {
    $('[data-start]', el).onclick = () => { close(); startSession(id, rerender); };
  });
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  $$('[data-path]', root).forEach(b => b.onclick = () => {
    filterPath = b.dataset.path; sfx('tick'); rerender();
  });
  $$('[data-tier]', root).forEach(b => b.onclick = () => {
    filterTier = b.dataset.tier; sfx('tick'); rerender();
  });
  $$('[data-open]', root).forEach(b => b.onclick = () => preview(b.dataset.open, rerender));
}
