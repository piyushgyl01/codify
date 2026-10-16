/**
 * Career screens: a track's flagship projects, one project in full (its
 * milestones, bar, GitHub check and post kit), and Portfolio & jobs —
 * readiness per field and every verified project with its resume line.
 */
import { S, isDegree } from '../state.js';
import * as C from './model.js';
import { degreeData } from '../degrees/load.js';
import { courseByKey, termShort } from '../degrees/model.js';
import { esc, sheet, toast, bar, $, sfx, confetti, rewardToast } from '../ui.js';

const termLabel = f => (f.track === 'cp' ? `Month ${f.term}` : (() => { const D = degreeData(f.track); return D ? termShort(D.terms[f.term]) : `Term ${f.term + 1}`; })());
const courseNames = f => {
  const D = isDegree(f.track) ? degreeData(f.track) : null;
  return f.uses.map(k => (D ? courseByKey(D, k) : null)).filter(Boolean).map(c => c.code || c.title);
};
const link = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`;
const copy = async (text, what = 'Copied') => { try { await navigator.clipboard.writeText(text); toast(what); } catch { toast('Could not copy — select it and copy by hand.'); } };

function status(f) {
  const p = C.progressOf(f);
  if (p.verified) return '<span class="badge good">✓ verified</span>';
  if (p.started) return `<span class="badge warn">${p.done}/${p.total}</span>`;
  return '<span class="badge">not started</span>';
}

/** One flagship as a tappable card. */
export function projectCard(f, { now = false } = {}) {
  const p = C.progressOf(f), opt = C.optionOf(f);
  return `<button class="card tap pad-s career-card ${now ? 'now' : ''}" data-project="${f.id}">
    <div class="between"><span class="tiny">${esc(termLabel(f))}${now ? ' · now' : ''} · ${f.weeks} weeks</span>${status(f)}</div>
    <div class="h3" style="margin-top:4px">${esc(f.title)}${opt ? ` — ${esc(opt.title)}` : ''}</div>
    <div class="tiny" style="margin-top:2px">${esc(f.hook)}</div>
    ${p.started && !p.verified ? `<div style="margin-top:8px">${bar((p.done / p.total) * 100)}</div>` : ''}
  </button>`;
}

/** A track's projects, the current one first. */
export function projectsTab(track, current) {
  const list = C.flagshipsFor(track);
  if (!list.length) return '';
  const done = list.filter(f => C.progressOf(f).verified).length;
  return `<div class="card sunk"><div class="tiny">One hard, public project per ${track === 'cp' ? 'month' : 'term'}, built on what you are learning, finished to a measurable bar and checked on GitHub. Each is chosen to be worth posting and to get you interview-ready in the field. ${done}/${list.length} verified.</div></div>
    ${current ? projectCard(current, { now: true }) : ''}
    <div class="stack s2">${list.filter(f => f !== current).map(f => projectCard(f)).join('')}</div>`;
}

/** Wire the cards in any screen that shows them. */
export function mountProjects(root, rerender) {
  root.querySelectorAll('[data-project]').forEach(b => b.addEventListener('click', () => openProject(b.dataset.project, rerender)));
}

/* -------------------------------- one project ------------------------------- */

export function openProject(id, rerender) {
  const f = C.flagshipById(id);
  if (!f) return;
  const r = C.recordOf(id), p = C.progressOf(f), opt = C.optionOf(f);
  const uses = courseNames(f);
  const body = `
    <div class="tiny">${esc(termLabel(f))} · ${f.weeks} weeks · ${esc(f.cost)}${uses.length ? ` · uses ${uses.map(esc).join(', ')}` : ''}</div>
    <p class="sub" style="margin-top:8px"><b>${esc(f.hook)}</b></p>
    <p class="sub" style="margin-top:6px">${esc(f.why)}</p>

    ${f.options ? `<div class="label" style="margin-top:14px">Your route</div>
      <div class="stack s2" style="margin-top:6px">${f.options.map(o => `<button class="card tap pad-s ${opt?.concentration === o.concentration ? 'on' : ''}" data-option="${o.concentration}">
        <div class="between"><span class="h3">${esc(o.title)}</span>${opt?.concentration === o.concentration ? '<span class="badge good">chosen</span>' : ''}</div>
        <div class="tiny" style="margin-top:2px">${esc(o.brief)}</div></button>`).join('')}</div>` : ''}

    <div class="label" style="margin-top:14px">Milestones · ${p.done}/${p.total}</div>
    <div class="stack s2" style="margin-top:6px">${f.milestones.map((m, i) => `<label class="career-ms ${r?.milestones?.[i] ? 'done' : ''}">
      <input type="checkbox" data-ms="${i}" ${r?.milestones?.[i] ? 'checked' : ''}>
      <span><b>${esc(m.title)}</b><span class="tiny"> — ${esc(m.done)}</span></span></label>`).join('')}</div>

    <div class="label" style="margin-top:14px">Done means</div>
    <ul class="focus">${[...(opt ? opt.bar : []), ...f.bar].map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    ${f.stretch?.length ? `<details class="deg-more"><summary class="tiny"><b>Go further</b></summary><ul class="focus">${f.stretch.map(s => `<li>${esc(s)}</li>`).join('')}</ul></details>` : ''}

    <div class="label" style="margin-top:14px">Learn from</div>
    <div class="stack s1" style="margin-top:4px">${f.learn.map(l => `<div class="tiny">${link(l.url, l.name)}</div>`).join('')}</div>

    <hr class="rule">
    <div class="label">Check it on GitHub · pays ${C.flagshipXp(f)} XP</div>
    <div class="tiny" style="margin-top:4px">The check reads your public repo: ${C.proofList(f).map(esc).join(' · ')}.</div>
    <div class="row" style="gap:6px;margin-top:10px"><input class="input" id="pj-repo" placeholder="owner/repo or owner/repo/folder" autocapitalize="off" spellcheck="false" value="${esc(r?.url || '')}">
      <button class="btn primary sm" data-check>Check</button></div>
    <div id="pj-checks" class="stack s1" style="margin-top:8px">${r?.checks ? `<div class="tiny">Last check ${esc(r.checks.day)}: ${r.checks.passed}/${r.checks.total} passed${r.verified ? ` · verified ${esc(r.verified)}` : ''}</div>` : ''}</div>

    <hr class="rule">
    <div class="label">Post it</div>
    <div class="tiny" style="margin-top:4px">A finished project nobody hears about does little for you. Fill in your real numbers, keep it short and true, and post it with a photo or video.</div>
    <textarea class="input" readonly style="margin-top:8px;min-height:150px" data-sel>${esc(f.post)}</textarea>
    <div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" data-copy-post>Copy the post</button><button class="btn sm" data-copy-ai>Copy an AI prompt to fill it in</button></div>
    <div class="field" style="margin-top:10px"><label>Resume line</label>
      <div class="row" style="gap:6px"><input class="input" readonly value="${esc(f.bullet)}" data-sel><button class="btn sm" data-copy-bullet>Copy</button></div></div>
    <div class="field" style="margin-top:10px"><label for="pj-posted">Link to your post</label>
      <div class="row" style="gap:6px"><input class="input" id="pj-posted" placeholder="https://www.linkedin.com/posts/…" value="${esc(r?.posted || '')}"><button class="btn sm" data-posted>Save</button></div></div>`;

  sheet(f.title, body, (el, close) => {
    const reopen = () => { close(); rerender?.(); openProject(id, rerender); };
    el.querySelectorAll('[data-sel]').forEach(i => i.addEventListener('focus', () => i.select()));
    el.querySelectorAll('[data-option]').forEach(b => b.addEventListener('click', () => { C.chooseOption(id, b.dataset.option); reopen(); }));
    el.querySelectorAll('[data-ms]').forEach(c => c.addEventListener('change', () => { C.toggleMilestone(id, +c.dataset.ms, c.checked); sfx('tick'); c.closest('.career-ms').classList.toggle('done', c.checked); }));
    $('[data-copy-post]', el).onclick = () => copy(f.post, 'Post copied — fill in the [brackets]');
    $('[data-copy-bullet]', el).onclick = () => copy(f.bullet);
    $('[data-copy-ai]', el).onclick = () => copy(aiPrompt(f), 'Prompt copied — paste it into your AI with the repo link');
    $('[data-posted]', el).onclick = () => {
      if (!C.setPosted(id, $('#pj-posted', el).value)) { toast('Paste the full https:// link to the post.'); return; }
      toast('Saved'); rerender?.();
    };
    $('[data-check]', el).onclick = async e => {
      const btn = e.target, out = $('#pj-checks', el);
      btn.disabled = true; btn.textContent = 'Checking…';
      let res;
      try { res = await C.checkFlagship(id, $('#pj-repo', el).value); }
      catch (err) { console.error(err); res = { ok: false, error: 'Something went wrong running the check.' }; }
      btn.disabled = false; btn.textContent = 'Check again';
      if (!res.ok) { toast(esc(res.error), 5000); return; }
      out.innerHTML = res.checks.map(c => `<div class="tiny">${c.pass ? '✓' : '✗'} ${esc(c.label)}${!c.pass && c.detail ? ` <span class="mute">— ${esc(c.detail)}</span>` : ''}</div>`).join('')
        + (res.verified ? '<div class="h3" style="margin-top:6px">✓ Verified</div>' : '');
      if (res.first) { confetti(140); sfx('reward'); rewardToast(res.reward); rerender?.(); }
      else if (!res.verified) sfx('fail');
    };
  });
}

function aiPrompt(f) {
  const r = C.recordOf(f.id);
  return [
    `Here is my project "${f.title}"${r?.url ? ` at ${r.url}` : ' (repo link: [paste it])'}. Read its README.`,
    'Fill in this LinkedIn post with the real numbers and details from the README. Keep my voice, keep it under 150 words, no hashtags beyond two, no claims the README does not support, and tell me anything you had to guess.',
    '', f.post, '',
    'Then fill in this resume line the same way:', f.bullet,
  ].join('\n');
}

/* ----------------------------- portfolio & jobs ----------------------------- */

export function portfolioLine() {
  const lanes = C.lanesOn().map(C.laneStatus);
  if (!lanes.length) return 'Switch on a track to see what gets you hired in it';
  const best = lanes.reduce((a, b) => (b.done / b.total > a.done / a.total ? b : a));
  return `${C.portfolio().length} verified projects · ${esc(best.lane.name)} ${best.done}/${best.total} ready`;
}

export function openPortfolio(rerender) {
  const lanes = C.lanesOn().map(C.laneStatus), items = C.portfolio(), oss = S.career?.oss;
  const body = `
    <p class="sub">What gets a student a first internship in each field you study, and how much of it you have. Ticks the app can check, it checks.</p>
    ${lanes.map(st => `<div class="card" style="margin-top:12px">
      <div class="between"><div class="h3">${esc(st.lane.name)}</div><span class="badge ${st.done === st.total ? 'good' : ''}">${st.done}/${st.total}</span></div>
      <div style="margin-top:6px">${bar((st.done / st.total) * 100, { color: st.done === st.total ? 'var(--good)' : 'var(--accent)' })}</div>
      <div class="stack s2" style="margin-top:10px">${st.items.map(it => `<div class="career-ready ${it.done ? 'done' : ''}">
        <div class="between"><span class="h3">${it.done ? '✓' : '○'} ${esc(it.label)}</span>
          ${it.kind === 'manual' ? `<button class="btn xs" data-ready="${st.lane.id}:${it.id}" data-on="${it.done ? 0 : 1}">${it.done ? 'Undo' : 'Done'}</button>` : `<span class="tiny">${esc(it.detail || '')}</span>`}</div>
        <div class="tiny">${esc(it.how)}${it.link ? ` · ${link(it.link, 'link')}` : ''}</div></div>`).join('')}</div></div>`).join('')}

    <div class="card" style="margin-top:12px"><div class="between"><div class="h3">Open source</div>
      <button class="btn xs" data-oss>${oss ? 'Check again' : 'Check GitHub'}</button></div>
      <div class="tiny" style="margin-top:4px">${oss ? `${oss.count} merged pull request${oss.count === 1 ? '' : 's'} to projects you don't own.` : 'Merged pull requests to other people\'s repos, read from GitHub.'}</div>
      ${oss?.prs?.length ? `<div class="stack s1" style="margin-top:6px">${oss.prs.slice(0, 6).map(p => `<div class="tiny">${link(p.url, `${p.repo}: ${p.title}`)}</div>`).join('')}</div>` : ''}</div>

    <div class="card" style="margin-top:12px"><div class="between"><div class="h3">Verified projects · ${items.length}</div>
      ${items.some(i => i.bullet) ? '<button class="btn xs" data-bullets>Copy resume lines</button>' : ''}</div>
      ${items.length ? `<div class="stack s1" style="margin-top:8px">${items.map(i => `<div class="tiny">✓ ${i.url ? link(i.url, i.title) : esc(i.title)} · ${esc(i.track)}${i.day ? ` · ${esc(i.day)}` : ''}${i.posted ? ` · ${link(i.posted, 'post')}` : ''}</div>`).join('')}</div>`
        : '<div class="tiny" style="margin-top:6px">None yet. Each track\'s projects are under its Projects tab.</div>'}</div>`;

  sheet('Portfolio & jobs', body, (el, close) => {
    const reopen = () => { close(); rerender?.(); openPortfolio(rerender); };
    el.querySelectorAll('[data-ready]').forEach(b => b.addEventListener('click', () => {
      const [lane, item] = b.dataset.ready.split(':');
      if (b.dataset.on === '1') {
        const url = prompt('Link to it (optional) — the resume PDF, the sheet, the certificate:') || '';
        if (!C.tickReady(lane, item, true, url)) { toast('That link needs to start with https://'); return; }
      } else C.tickReady(lane, item, false);
      reopen();
    }));
    $('[data-oss]', el).onclick = async e => {
      e.target.textContent = 'Checking…';
      const res = await C.checkOss();
      if (!res.ok) toast(esc(res.error), 4000);
      reopen();
    };
    $('[data-bullets]', el)?.addEventListener('click', () => copy(items.filter(i => i.bullet).map(i => `• ${i.bullet}`).join('\n'), 'Resume lines copied — fill in the [brackets]'));
  });
}
