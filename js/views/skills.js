/**
 * Skills — the topic tree, and the problems to go and do next.
 *
 * Nothing on this screen can be clicked to complete. A tier fills in when
 * Codeforces says you solved enough problems with that tag at that rating, which
 * is why the only action available is a link out to a problem.
 */
import {
  S, treeProgress, topicStatus, staleness, solvedList, isLinked, progress,
} from '../state.js';
import { PATHS, TIERS, TOPICS, pathFor, topicById } from '../data/skilltree.js';
import { suggestProblems, problemUrl, leetcodeTagUrl } from '../platforms.js';
import { colorForRating, treeCompletion } from '../analytics.js';
import { go } from '../router.js';
import {
  h, raw, esc, $, $$, bind, bar, pct, sheet, toast, sfx, haptic,
} from '../ui.js';

let filter = 'all';

export function render() {
  if (!isLinked()) {
    return h`
      <div class="h2">Skill tree</div>
      <div class="empty" style="margin-top:16px">
        Connect a Codeforces handle from the Hero tab. Every tier here is filled in
        from your accepted submissions, so there is nothing to show until then.
      </div>`;
  }

  const tree = treeProgress();
  const done = treeCompletion();
  const paths = filter === 'all' ? PATHS : PATHS.filter(p => p.id === filter);

  return h`
    <div class="between">
      <div>
        <div class="h2">Skill tree</div>
        <div class="sub">${done.cleared} of ${done.total} tiers cleared</div>
      </div>
      <div class="badge">${pct(done.pct)}</div>
    </div>

    <div style="margin-top:12px">${raw(bar(done.pct))}</div>

    <div class="pill-scroll" style="margin-top:16px">
      <button class="pill ${filter === 'all' ? 'on' : ''}" data-filter="all">All</button>
      ${raw(PATHS.map(p => `<button class="pill ${filter === p.id ? 'on' : ''}"
        data-filter="${p.id}">${p.icon} ${p.short}</button>`).join(''))}
    </div>

    ${raw(paths.map(p => pathBlock(p, tree)).join(''))}`;
}

function pathBlock(path, tree) {
  const rows = tree.filter(t => t.topic.path === path.id);
  const cleared = rows.reduce((n, r) => n + r.cleared, 0);
  const total = rows.length * TIERS.length;

  return `
  <section class="section">
    <div class="between">
      <div class="row" style="gap:10px">
        <span class="path-glyph">${path.icon}</span>
        <div>
          <div class="h3">${esc(path.name)}</div>
          <div class="tiny">${esc(path.blurb)}</div>
        </div>
      </div>
      <div class="num h3" style="flex:none">${cleared}/${total}</div>
    </div>

    <div class="tree" style="margin-top:12px">
      ${rows.map(r => topicRow(r)).join('')}
    </div>
  </section>`;
}

function topicRow(p) {
  const st = staleness(p.topic.id);
  const stale = !st?.never && st?.days >= 45;

  return `
  <button class="tree-node ${p.cleared ? 'mastered' : p.total ? 'available' : 'locked'}"
          data-topic="${p.topic.id}" style="--pc:var(--accent)">
    <span class="grow">
      <span class="tree-name">${esc(p.topic.name)}</span>
      <span class="tree-meta">
        ${p.total ? `${p.total} solved · best ${p.best || '—'}` : 'nothing solved yet'}
        ${st?.never ? '' : ` · ${st.days}d ago`}
      </span>
      <span class="tier-pips">
        ${TIERS.map(t => {
          const tier = p.tiers.find(x => x.n === t.n);
          return `<i class="${tier.cleared ? 'on' : ''}" title="${t.name} · ${t.min}+ · ${tier.solved}/${t.need}"></i>`;
        }).join('')}
      </span>
    </span>
    ${stale ? '<span class="badge warn">stale</span>' : ''}
    <span class="badge ${p.cleared === TIERS.length ? 'good' : ''}">${p.cleared}/${TIERS.length}</span>
  </button>`;
}

/* -------------------------------- the sheet ------------------------------- */

function openTopic(id, rerender) {
  const p = topicStatus(id);
  if (!p) return;
  const topic = p.topic;
  const st = staleness(id);
  const next = p.next;

  sheet(topic.name, `
    <p class="sub">${esc(topic.blurb)}</p>

    <div class="grid2" style="margin-top:14px">
      <div class="tile"><div class="v">${p.total}</div><div class="k">solved</div></div>
      <div class="tile"><div class="v">${p.best || '—'}</div><div class="k">best rating</div></div>
    </div>

    <div class="label" style="margin-top:20px">Tiers</div>
    <div class="stack s2" style="margin-top:8px">
      ${p.tiers.map(t => `
        <div class="card pad-s ${t.cleared ? 'rail' : 'sunk'}" ${t.cleared ? 'style="--rail:var(--good)"' : ''}>
          <div class="between">
            <div>
              <div class="h3">${t.name} · ${t.label}</div>
              <div class="tiny">${t.need} problems rated ${t.min}+</div>
            </div>
            <span class="badge ${t.cleared ? 'good' : ''}">${Math.min(t.solved, t.need)}/${t.need}</span>
          </div>
          <div style="margin-top:8px">${bar(t.pct, { color: t.cleared ? 'var(--good)' : 'var(--accent)' })}</div>
        </div>`).join('')}
    </div>

    ${st?.never ? '' : `
      <div class="card sunk" style="margin-top:14px">
        <div class="tiny">Last accepted ${st.days} days ago — ${esc(st.last.name)} (${st.last.rating ?? 'unrated'}).</div>
      </div>`}

    <div class="label" style="margin-top:20px">
      Go and solve${next ? ` — ${next.min}–${next.max}` : ''}
    </div>
    <div id="sk-problems" style="margin-top:8px">
      <div class="empty">Loading problems…</div>
    </div>

    <a class="btn ghost block sm" style="margin-top:12px;text-decoration:none"
       href="${esc(leetcodeTagUrl(topic.lc))}" target="_blank" rel="noopener">
      Practise this on LeetCode instead
    </a>
    <div class="tiny" style="margin-top:8px">
      LeetCode blocks cross-origin reads, so anything solved there cannot be verified
      and will not move any number in this app. The link is for practice only.
    </div>
  `, async (el, close) => {
    const box = $('#sk-problems', el);
    const tier = next || p.tiers.at(-1);
    try {
      const solvedKeys = new Set(solvedList().map(s => s.key));
      const list = await suggestProblems(topic.cf, {
        minRating: tier.min, maxRating: tier.max, solvedKeys, limit: 6,
      });
      box.innerHTML = list.length ? `<div class="stack s2">${list.map(pr => `
        <a class="card pad-s" style="display:block;text-decoration:none"
           href="${esc(pr.url)}" target="_blank" rel="noopener">
          <div class="between">
            <div class="grow truncate">
              <div class="h3 truncate">${esc(pr.name)}</div>
              <div class="tiny truncate">${esc(pr.contestId + pr.index)} · ${esc(pr.tags.slice(0, 3).join(' · '))}</div>
            </div>
            <span class="badge" style="background:${colorForRating(pr.rating)};color:var(--panel)">${pr.rating}</span>
          </div>
        </a>`).join('')}</div>`
        : '<div class="empty">Nothing unsolved left in this band. Move up a tier.</div>';
    } catch (err) {
      box.innerHTML = `<div class="empty">${esc(err.message)}</div>`;
    }
  });
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  $$('[data-filter]', root).forEach(b => b.onclick = () => {
    filter = b.dataset.filter; sfx('tick'); rerender();
  });
  $$('[data-topic]', root).forEach(b => b.onclick = () => openTopic(b.dataset.topic, rerender));
}
