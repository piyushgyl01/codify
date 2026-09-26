/** AI builds: all 34, what each needs, what it costs to run, and the check — on GitHub or Hugging Face. */
import { S, linkGithub } from '../../state.js';
import { isUnlocked, isVerified, applyVerification, parseTarget, checkBuild, hfUser, linkHf } from './actions.js';
import { BUILDS, buildById, MONTHS, monthByN, topicById, buildXp } from './plan.js';
import { parseRepo, targetUrl } from '../../github.js';
import { checkHfUser, hfUrl } from '../../hf.js';
import { esc, sheet, toast, rewardToast, confetti, sfx, shortDate, $ } from '../../ui.js';
import { icon } from '../../icons.js';

let filter = 'all';

const WHERE = { github: 'GitHub', hf: 'Hugging Face', portfolio: 'your other builds' };

/** The checklist before a check has run — the same list the verifier uses. */
function requirements(b) {
  const p = b.proof || {};
  if (p.meta === 'portfolio') return [`${p.count} verified builds whose README opens with a figure`];
  if (b.verify === 'hf') {
    const kind = p.hf.kind === 'space' ? 'Space (a live demo)' : p.hf.kind;
    return [`A public ${kind} under your Hugging Face account`, `A card (README) with ${p.hf.words ?? 80}+ words`,
      ...(p.hf.card || []).map(c => c.label), ...(p.hf.kind === 'space' ? ['The demo is running'] : [])];
  }
  const out = ['A public repo you own', 'Not already used for another build', 'README in the build\'s folder', `At least ${p.words ?? 120} words of write-up`,
    'A figure (a plot or a screenshot)', 'A section on what didn\'t work and how you fixed it'];
  if (p.video) out.push('A video of it working');
  if (p.ci) out.push('Tests pass on GitHub Actions');
  for (const x of p.readme || []) out.push(x.label);
  for (const x of p.files || []) out.push(x.label);
  out.push('3+ commits by you touching it');
  return out;
}

function checklist(b) {
  const st = S.tracks.ai.builds?.[b.id];
  const rows = st?.checks?.length ? st.checks : requirements(b).map(label => ({ label, pending: true }));
  return rows.map(c => `<div class="chk ${c.pending ? '' : c.pass ? 'pass' : 'fail'}">
      <span class="chk-mark">${c.pending ? '' : c.pass ? '✓' : '✗'}</span>
      <div class="grow"><div class="chk-label">${esc(c.label)}</div>${!c.pending && !c.pass && c.detail ? `<div class="tiny">${esc(c.detail)}</div>` : ''}</div>
    </div>`).join('');
}

const shownTarget = t => (!t ? '' : t.kind ? hfUrl(t) : targetUrl(t));

export function openBuild(id, rerender) {
  const b = buildById(id);
  if (!b) return;
  const m = monthByN(b.month), st = S.tracks.ai.builds?.[b.id], open = isUnlocked(b.month);
  const gh = S.github.user, hf = hfUser();
  const prefill = st?.target ? (st.target.kind ? st.target.id : [st.target.owner, st.target.repo, st.target.path].filter(Boolean).join('/'))
    : b.verify === 'hf' ? (hf ? `${hf}/` : '') : gh ? `${gh}/` : '';

  const needAccount = b.verify === 'hf' && !hf ? 'hf' : b.verify === 'github' && !gh ? 'gh' : null;
  const form = !open
    ? `<div class="card sunk"><div class="h3">Opens at mission ${30 * (b.month - 1) + 1}</div>
        <div class="tiny" style="margin-top:4px">Start whenever you like — it can be checked once that part opens.</div></div>`
    : b.verify === 'portfolio' ? `<button class="btn primary block" data-check>${st?.checks ? 'Check again' : 'Check my builds'}</button>`
    : needAccount ? `<div class="card warn-card"><div class="h3">Add your ${needAccount === 'hf' ? 'Hugging Face' : 'GitHub'} username first</div>
        <div class="field" style="margin-top:10px"><input class="input" id="bd-user" placeholder="${needAccount === 'hf' ? 'Hugging Face' : 'GitHub'} username" autocapitalize="off" spellcheck="false"></div>
        <button class="btn primary block sm" style="margin-top:10px" data-user="${needAccount}">Save</button></div>`
    : `<div class="field"><label for="bd-target">${b.verify === 'hf' ? `Your Hugging Face ${b.proof.hf.kind === 'space' ? 'Space' : b.proof.hf.kind}` : 'GitHub folder for this build'}</label>
        <input class="input" id="bd-target" value="${esc(prefill)}" autocapitalize="off" spellcheck="false"
          placeholder="${b.verify === 'hf' ? `${esc(hf)}/my-${b.id}` : `${esc(gh)}/ai/${b.id}`}">
        <div class="tiny">${b.verify === 'hf' ? 'user/name, or paste the huggingface.co link.' : 'owner/repo, owner/repo/folder, or paste the GitHub link.'}</div></div>
      <button class="btn primary block" style="margin-top:12px" data-check>${st?.checks ? 'Check again' : `Check on ${WHERE[b.verify]}`}</button>`;

  sheet(b.name, `
    <div class="wrap"><span class="badge" style="background:${m.color}">Part ${b.month}</span>
      ${b.capstone ? '<span class="badge warn">🏆 Paper reproduction</span>' : ''}
      <span class="badge">${esc(topicById(b.topic).name)}</span></div>
    <div class="card ${b.compute === 'cheap' ? 'warn-card' : 'sunk'} pad-s" style="margin-top:10px"><div class="tiny">${b.compute === 'cheap' ? '💳' : '🆓'} ${esc(b.cost)}</div></div>
    <p class="build-task">${esc(b.task)}</p>
    ${st?.verified ? `<div class="card verified-card"><div class="between"><div><div class="h3">✓ Verified ${esc(shortDate(st.verifiedAt))}</div>
        ${st.target ? `<a class="tiny" href="${esc(shownTarget(st.target))}" target="_blank" rel="noopener">${esc(shownTarget(st.target).replace(/^https:\/\/(github\.com|huggingface\.co)\//, ''))} ${icon('ext', 11).value}</a>` : ''}</div>
        <span class="badge">+${buildXp(b)} XP</span></div></div>` : ''}
    <div class="label" style="margin-top:16px">What passes — checked on ${WHERE[b.verify]}</div>
    <div class="checklist">${checklist(b)}</div>
    <div class="tiny" style="margin-top:6px">It checks the evidence exists, not that every number is right — but a convincing fake costs as much as the real thing.</div>
    <div style="margin-top:16px">${form}</div>`,
  (el, close) => {
    $('[data-user]', el)?.addEventListener('click', async e => {
      const kind = e.currentTarget.dataset.user, v = $('#bd-user', el).value.trim().replace(/^@/, '');
      try {
        if (kind === 'hf') { const u = await checkHfUser(v); linkHf({ user: u.user, avatar: u.avatar }); }
        else { if (!parseRepo(`${v}/x`)) throw new Error('That is not a GitHub username.'); linkGithub({ login: v }); }
        close(); openBuild(id, rerender);
      } catch (err) { toast(esc(err.message)); }
    });
    const btn = $('[data-check]', el);
    if (!btn) return;
    const input = $('#bd-target', el);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
    btn.onclick = async () => {
      const target = b.verify === 'portfolio' ? {} : parseTarget(b, input.value);
      if (!target) { toast(b.verify === 'hf' ? 'Use user/name or a huggingface.co link.' : 'Use owner/repo or owner/repo/folder.'); input.focus(); return; }
      btn.disabled = true; btn.textContent = 'Checking…';
      let result;
      try { result = await checkBuild(b, target); }
      catch (err) { console.error(err); result = { ok: false, error: 'Something went wrong running the check.' }; }
      if (!result.ok) { btn.disabled = false; btn.textContent = 'Check again'; toast(esc(result.error), 5000); return; }
      const applied = applyVerification(b.id, target, result);
      if (applied?.newly) { confetti(b.capstone ? 160 : 120); sfx('reward'); rewardToast(applied.reward); }
      else if (!result.verified) { sfx('fail'); toast(`${result.checks.filter(c => c.pass).length} of ${result.checks.length} checks pass — see what is missing.`); }
      else toast('Still verified.');
      close(); openBuild(id, rerender); rerender();
    };
  });
}

/* ---------------------------------- list ---------------------------------- */

function card(b) {
  const m = monthByN(b.month), st = S.tracks.ai.builds?.[b.id], open = isUnlocked(b.month);
  const badge = st?.verified ? '<span class="badge good">✓ verified</span>'
    : !open ? '<span class="badge mute">locked</span>'
    : st?.checks ? `<span class="badge warn">${st.checks.filter(c => c.pass).length}/${st.checks.length}</span>`
    : '<span class="badge">to do</span>';
  return `<button class="card tap rail build-card ${open ? '' : 'locked'} ${st?.verified ? 'verified' : ''}" style="--rail:${m.color}" data-build="${b.id}">
    <div class="between"><span class="label">Part ${b.month}${b.capstone ? ' · 🏆 reproduction' : ''}</span>${badge}</div>
    <div class="h3" style="margin-top:4px">${esc(b.name)}</div>
    <div class="tiny" style="margin-top:2px">${b.compute === 'cheap' ? '💳 cheap GPU' : '🆓 free'} · ${WHERE[b.verify]} · +${buildXp(b)} XP</div>
  </button>`;
}

export function render() {
  const n = BUILDS.filter(b => isVerified(b.id)).length;
  const shown = BUILDS.filter(b => filter === 'all' ? true : filter === 'done' ? isVerified(b.id)
    : filter === 'todo' ? !isVerified(b.id) && isUnlocked(b.month) : filter === 'papers' ? b.capstone : b.month === +filter);
  const pills = [['all', 'All'], ['todo', 'To do'], ['done', 'Verified'], ['papers', '🏆 Papers'], ...MONTHS.map(m => [String(m.n), `Part ${m.n}`])]
    .map(([k, l]) => `<button class="pill ${filter === k ? 'on' : ''}" data-filter="${k}">${l}</button>`).join('');
  return `<div class="stack s4 fade-up">
    <div class="card portfolio">
      <div class="between"><div><div class="h2 num">${n} / ${BUILDS.length}</div><div class="tiny">verified builds</div></div>
        <div class="right tiny">${S.github.user ? `GitHub: ${esc(S.github.user)}` : 'GitHub not set'}<br>${hfUser() ? `Hugging Face: ${esc(hfUser())}` : 'Hugging Face not set'}</div></div>
      <div style="margin-top:10px" class="bar"><i style="width:${(n / BUILDS.length) * 100}%"></i></div>
      <div class="tiny" style="margin-top:8px">🆓 free on a laptop or Colab · 💳 cheap means about $10–50 of rented GPU.</div>
    </div>
    <div class="pill-scroll">${pills}</div>
    <div class="stack s2">${shown.map(card).join('') || '<div class="empty">Nothing here yet.</div>'}</div>
  </div>`;
}

export function mount(root, rerender) {
  root.querySelectorAll('[data-filter]').forEach(b => { b.onclick = () => { filter = b.dataset.filter; rerender(); }; });
  root.querySelectorAll('[data-build]').forEach(b => { b.onclick = () => openBuild(b.dataset.build, rerender); });
}
