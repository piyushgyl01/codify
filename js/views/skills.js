/**
 * Skills — the tree, and the retest queue that keeps it honest.
 *
 * A node is claimed by doing its task, not by clicking a button, and the app
 * cannot check. What it can do is make the claim specific, time it, and come
 * back weeks later to ask again — which is the only lever available to something
 * that runs entirely on your own device.
 */
import {
  S, progress, nodeState, claimNode, logRetest, releaseNode,
  skillStatus, dueRetests, pathHours, decayRanking,
} from '../state.js';
import { NODES, PATHS, pathFor, nodeById, nodesOfPath, chainTo } from '../data/skilltree.js';
import { pathOrder, FRESHNESS } from '../game.js';
import { retentionBands } from '../analytics.js';
import {
  h, raw, esc, $, $$, bind, bar, splitBar, hm, pct, relDays,
  sheet, dialog, toast, sfx, haptic, confetti, rewardToast,
} from '../ui.js';
import { icon } from '../icons.js';

let filter = 'all';

export function render() {
  const level = progress().level;
  const hours = pathHours();
  const due = dueRetests();
  const bands = retentionBands();
  const held = Object.keys(S.skills).length;

  const paths = pathOrder(S.profile.track);
  const shown = filter === 'all' ? paths : paths.filter(p => p.id === filter);

  return h`
    <div class="between">
      <div>
        <div class="h2">Skill tree</div>
        <div class="sub">${held} of ${NODES.length} claimed${
          bands.total ? ` · ${pct(bands.held * 100)} still fresh or warm` : ''}</div>
      </div>
      <div class="badge">LVL ${level}</div>
    </div>

    ${raw(due.length ? `
      <button class="card tap rail" style="--rail:var(--bad);margin-top:14px" data-act="retest">
        <div class="between">
          <div>
            <div class="h3">${due.length} retest${due.length === 1 ? '' : 's'} due</div>
            <div class="sub" style="margin-top:4px">
              Re-prove them or watch the tree go cold. This is the part that matters.
            </div>
          </div>
          <span class="badge bad">Start</span>
        </div>
      </button>` : held ? `
      <div class="card sunk" style="margin-top:14px">
        <div class="row"><span style="color:var(--good)">✓</span>
          <div class="grow"><div class="h3">Queue clear</div>
          <div class="tiny">Next retest ${relDays(nextDueIn())}.</div></div>
        </div>
      </div>` : '')}

    ${raw(bands.total ? bandsBar(bands) : '')}

    <div class="pill-scroll" style="margin-top:16px">
      <button class="pill ${filter === 'all' ? 'on' : ''}" data-filter="all">All</button>
      ${raw(paths.map(p => `
        <button class="pill ${filter === p.id ? 'on' : ''}" data-filter="${p.id}">
          ${p.icon} ${p.short}</button>`).join(''))}
    </div>

    ${raw(shown.map(p => pathBlock(p, level, hours)).join(''))}`;
}

function nextDueIn() {
  const all = Object.keys(S.skills).map(id => skillStatus(id)).filter(Boolean);
  if (!all.length) return 0;
  return Math.min(...all.map(s => s.dueIn));
}

function bandsBar(b) {
  const parts = [
    { pct:(b.bands.fresh / b.total) * 100, color:'var(--good)', name:'Fresh' },
    { pct:(b.bands.warm  / b.total) * 100, color:'var(--info)', name:'Warm' },
    { pct:(b.bands.rusty / b.total) * 100, color:'var(--warn)', name:'Rusty' },
    { pct:(b.bands.cold  / b.total) * 100, color:'var(--bad)',  name:'Cold' },
  ];
  return `<div style="margin-top:14px">
    ${splitBar(parts)}
    <div class="wrap" style="margin-top:8px">
      ${FRESHNESS.map(f => `<span class="badge ${f.badge}">${f.name} ${b.bands[f.id]}</span>`).join('')}
    </div>
  </div>`;
}

/* ------------------------------- path blocks ------------------------------ */

function pathBlock(p, level, hours) {
  const nodes = nodesOfPath(p.id);
  const held = nodes.filter(n => S.skills[n.id]).length;

  return `
  <section class="section">
    <div class="between">
      <div class="row" style="gap:8px">
        <span class="path-glyph" style="color:${p.color}">${p.icon}</span>
        <div>
          <div class="h3">${esc(p.name)}</div>
          <div class="tiny">${esc(p.blurb)}</div>
        </div>
      </div>
      <div class="right" style="flex:none">
        <div class="num h3">${held}/${nodes.length}</div>
        <div class="tiny">${Math.round((hours[p.id] || 0) * 10) / 10}h</div>
      </div>
    </div>

    <div style="margin-top:10px">${bar((held / nodes.length) * 100, { color: p.color })}</div>

    <div class="tree" style="margin-top:12px">
      ${nodes.map(n => nodeRow(n, level, hours, p)).join('')}
    </div>
  </section>`;
}

function nodeRow(node, level, hours, path) {
  const state = nodeState(node);
  const st = state === 'mastered' ? skillStatus(node.id, hours) : null;
  const need = node.needs ? nodeById(node.needs) : null;

  const badge =
    state === 'mastered'
      ? `<span class="badge ${st.freshness.badge}">
           ${pct(st.retention * 100)}${st.due ? ' · DUE' : ''}</span>`
      : state === 'available'
        ? '<span class="badge good">open</span>'
        : `<span class="badge">${level < node.lvl ? `lvl ${node.lvl}` : 'locked'}</span>`;

  return `
  <button class="tree-node ${state}" data-node="${node.id}"
          style="--pc:${path.color}${st ? `;--fc:${st.freshness.color}` : ''}">
    <span class="tree-dot"></span>
    <span class="grow">
      <span class="tree-name">${esc(node.name)}</span>
      <span class="tree-meta">
        ${state === 'mastered'
          ? `held ${st.since}d · due ${relDays(st.dueIn)}${st.passes ? ` · ${st.passes}×` : ''}`
          : state === 'available'
            ? `${node.mins}m task`
            : need && !S.skills[need.id] ? `needs ${esc(need.name)}` : `level ${node.lvl}`}
      </span>
    </span>
    ${badge}
  </button>`;
}

/* -------------------------------- node sheet ------------------------------ */

function openNode(id, rerender) {
  const node = nodeById(id);
  if (!node) return;
  const state = nodeState(node);
  const path = pathFor(node.path);
  const st = state === 'mastered' ? skillStatus(node.id) : null;
  const chain = chainTo(node.id);

  sheet(node.name, `
    <div class="row" style="gap:8px">
      <span class="badge" style="color:${path.color}">${path.icon} ${path.name}</span>
      <span class="badge">level ${node.lvl}</span>
      <span class="badge">~${node.mins}m</span>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="label">The task</div>
      <p style="margin-top:8px;line-height:1.5">${esc(node.task)}</p>
    </div>

    ${st ? `
      <div class="card sunk" style="margin-top:12px">
        <div class="between">
          <div class="label">Retention</div>
          <span class="badge ${st.freshness.badge}">${st.freshness.name}</span>
        </div>
        <div style="margin-top:10px">${bar(st.retention * 100, { color: st.freshness.color })}</div>
        <div class="tiny" style="margin-top:8px">
          Proven ${st.since} days ago · ${st.passes} pass${st.passes === 1 ? '' : 'es'}${
            st.fails ? ` · ${st.fails} failed` : ''} · half-life ${Math.round(st.halfLife)}d
        </div>
        <div class="tiny" style="margin-top:4px">
          Next retest ${relDays(st.dueIn)}. Modelled from ${
            Math.round((pathHours()[node.path] || 0) * 10) / 10}h on this path.
        </div>
      </div>` : ''}

    ${state === 'locked' ? `
      <div class="card sunk" style="margin-top:12px">
        <div class="label">Locked</div>
        <div class="sub" style="margin-top:6px">
          ${progress().level < node.lvl ? `Needs level ${node.lvl}. ` : ''}
          ${chain.filter(n => !S.skills[n.id]).length
            ? `First: ${chain.filter(n => !S.skills[n.id]).map(n => esc(n.name)).join(' → ')}.`
            : ''}
        </div>
      </div>` : ''}

    ${state === 'available' ? `
      <div class="field" style="margin-top:16px">
        <label>How long did it take you?</label>
        <div class="stepper">
          <button data-step="-5">−</button>
          <input class="input num" id="nd-min" type="number" inputmode="numeric"
                 min="0" max="600" value="${node.mins}">
          <button data-step="5">+</button>
        </div>
      </div>
      <div class="card sunk" style="margin-top:12px">
        <div class="sub">Only claim this if you actually did the task, without looking up
          the answer. Nothing checks — which is exactly why it only works if you are strict.
          A node you claimed dishonestly fails its first retest and tells you nothing you
          did not already know.</div>
      </div>
      <button class="btn primary block" style="margin-top:16px" data-claim>I did it — claim</button>
    ` : ''}

    ${state === 'mastered' ? `
      <button class="btn primary block" style="margin-top:16px" data-retest>Retest it now</button>
      <button class="btn ghost block sm" style="margin-top:8px" data-release>Give it up</button>
    ` : ''}
  `, (el, close) => {
    $$('[data-step]', el).forEach(b => b.onclick = () => {
      const i = $('#nd-min', el);
      i.value = Math.max(0, (+i.value || 0) + (+b.dataset.step));
    });

    $('[data-claim]', el)?.addEventListener('click', () => {
      const r = claimNode(node.id, +$('#nd-min', el).value || 0);
      close();
      if (r) { sfx('achieve'); confetti(80); haptic(18); rewardToast(r);
               toast(`◈ <b>${esc(node.name)}</b> claimed — first retest in 7 days`, 3400); }
      rerender();
    });

    $('[data-retest]', el)?.addEventListener('click', () => { close(); retestOne(node.id, rerender); });

    $('[data-release]', el)?.addEventListener('click', () => {
      dialog(`<div class="h2">Give up ${esc(node.name)}?</div>
        <p class="sub" style="margin:12px 0 20px">It goes back to unclaimed. Its retest
          history is kept, so the calibration figures stay honest.</p>
        <button class="btn hot block" data-yes>Give it up</button>
        <button class="btn ghost block sm" style="margin-top:8px" data-no>Keep it</button>`,
        (d, closeDialog) => {
          d.querySelector('[data-no]').onclick = closeDialog;
          d.querySelector('[data-yes]').onclick = () => {
            releaseNode(node.id); closeDialog(); close(); rerender();
          };
        });
    });
  });
}

/* --------------------------------- retests -------------------------------- */

/** Walk the whole due queue, one node at a time. Exported for the Today tab. */
export function openRetest(rerender) {
  const queue = dueRetests();
  if (!queue.length) { toast('Nothing due. Come back when something goes rusty.'); return; }
  retestOne(queue[0].node.id, rerender, queue.length);
}

function retestOne(nodeId, rerender, remaining = 0) {
  const st = skillStatus(nodeId);
  const node = nodeById(nodeId);
  if (!node || !st) return;

  sheet('Retest', `
    <div class="row" style="gap:8px">
      <span class="badge" style="color:${pathFor(node.path).color}">${pathFor(node.path).name}</span>
      <span class="badge ${st.freshness.badge}">model says ${pct(st.retention * 100)}</span>
      ${remaining > 1 ? `<span class="badge">${remaining} in queue</span>` : ''}
    </div>

    <div class="h2" style="margin-top:12px">${esc(node.name)}</div>
    <div class="tiny">Last proven ${st.since} days ago.</div>

    <div class="card" style="margin-top:14px">
      <div class="label">Do it again, now</div>
      <p style="margin-top:8px;line-height:1.5">${esc(node.task)}</p>
    </div>

    <div class="card sunk" style="margin-top:12px">
      <div class="sub">
        No notes, no searching, no looking at what you wrote last time. The whole
        value of this is that it is uncomfortable — a retest you can pass with the
        answer open measures your reading speed.
      </div>
    </div>

    <div class="field" style="margin-top:16px">
      <label>Minutes it took</label>
      <div class="stepper">
        <button data-step="-5">−</button>
        <input class="input num" id="rt-min" type="number" inputmode="numeric"
               min="0" max="600" value="${node.mins}">
        <button data-step="5">+</button>
      </div>
    </div>

    <button class="btn primary block" style="margin-top:18px" data-pass>I still have it</button>
    <button class="btn block" style="margin-top:8px" data-fail>I could not do it</button>
    <button class="btn ghost block sm" style="margin-top:8px" data-later>Not now</button>
  `, (el, close) => {
    $$('[data-step]', el).forEach(b => b.onclick = () => {
      const i = $('#rt-min', el);
      i.value = Math.max(0, (+i.value || 0) + (+b.dataset.step));
    });

    const finish = passed => {
      const r = logRetest(nodeId, passed, +$('#rt-min', el).value || 0);
      close();
      if (passed) { sfx('reward'); confetti(50); haptic(14); }
      else { sfx('fail'); haptic(24); }
      rewardToast(r);

      const after = skillStatus(nodeId);
      toast(passed
        ? `✓ held — next retest ${relDays(after.dueIn)}`
        : `✕ lost — back in ${after.dueIn} day${after.dueIn === 1 ? '' : 's'}. That is the system working.`,
        3400);

      // Roll straight into the next one; a queue you have to re-open is a queue
      // that gets abandoned halfway.
      const next = dueRetests();
      if (next.length) setTimeout(() => retestOne(next[0].node.id, rerender, next.length), 700);
      else rerender();
    };

    $('[data-pass]', el).onclick = () => finish(true);
    $('[data-fail]', el).onclick = () => finish(false);
    $('[data-later]', el).onclick = close;
  });
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  bind(root, { retest: () => openRetest(rerender) });

  $$('[data-filter]', root).forEach(b => b.onclick = () => {
    filter = b.dataset.filter;
    sfx('tick');
    rerender();
  });

  $$('[data-node]', root).forEach(b => b.onclick = () => openNode(b.dataset.node, rerender));
}
