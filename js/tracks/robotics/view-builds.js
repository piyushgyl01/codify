/** Builds: all 28, what each one's README has to contain, and the GitHub check. */
import { S, linkGithub } from '../../state.js';
import { isUnlocked, isVerified, verifiedCount, applyVerification, claimedTargets } from './actions.js';
import { monthOpensOn } from './model.js';
import { BUILDS, buildById, MONTHS, monthByN, topicById, buildXp } from './roadmap.js';
import { parseRepo, verifyBuild, verifyPortfolio, targetUrl } from '../../github.js';
import { esc, bind, sheet, toast, rewardToast, confetti, sfx, shortDate, $ } from '../../ui.js';
import { icon } from '../../icons.js';

let filter = 'all';

/* -------------------------- what the README needs ------------------------- */

/** The checklist shown before any check has run — the same list the verifier uses. */
function requirements(b) {
  const p = b.proof || {};
  if (p.meta === 'portfolio') return [`${p.count || 3} verified builds with a photo or video at the top of the README`];
  const out = ['A public repo you own'];
  if (p.universal !== false) out.push('Not already used for another build');
  out.push(`${p.doc || 'README'} in the build's folder`, `At least ${p.words ?? 120} words of write-up`);
  if (p.universal !== false) out.push('A photo or video of it', 'A section on what broke and how you fixed it');
  if (p.video) out.push(p.video > 1 ? `${p.video} videos of it moving` : 'A video of it moving');
  if (p.questions) out.push(`${p.questions}+ questions answered`);
  for (const r of p.readme || []) out.push(r.label);
  for (const f of p.forbid || []) out.push(f.label);
  for (const f of p.files || []) out.push(f.label);
  out.push(p.universal === false ? 'At least one commit by you' : '3+ commits by you touching it');
  return out;
}

function checklist(b) {
  const st = S.tracks.robotics.builds[b.id];
  if (st?.checks?.length) {
    return st.checks.map(c => `<div class="chk ${c.pass ? 'pass' : 'fail'}">
      <span class="chk-mark">${c.pass ? '✓' : '✗'}</span>
      <div class="grow"><div class="chk-label">${esc(c.label)}</div>
        ${!c.pass && c.detail ? `<div class="tiny">${esc(c.detail)}</div>` : ''}</div>
    </div>`).join('');
  }
  return requirements(b).map(label => `<div class="chk"><span class="chk-mark"></span>
    <div class="grow"><div class="chk-label">${esc(label)}</div></div></div>`).join('');
}

/* ---------------------------------- sheet --------------------------------- */

export function openBuild(id, rerender) {
  const b = buildById(id);
  if (!b) return;
  const m = monthByN(b.month), topic = topicById(b.topic), st = S.tracks.robotics.builds[b.id];
  const open = isUnlocked(b.month);
  const portfolio = b.proof?.meta === 'portfolio';
  const user = S.github.user;
  const prefill = st?.target ? [st.target.owner, st.target.repo, st.target.path].filter(Boolean).join('/') : user ? `${user}/` : '';

  const status = st?.verified
    ? `<div class="card verified-card"><div class="between"><div><div class="h3">✓ Verified ${esc(shortDate(st.verifiedAt))}</div>
        ${st.meta?.url ? `<a class="tiny" href="${esc(st.meta.url)}" target="_blank" rel="noopener">${esc(st.meta.url.replace('https://github.com/', ''))} ${icon('ext', 11).value}</a>` : ''}</div>
        <span class="badge">+${buildXp(b)} XP</span></div>
        ${st.lastPassed === false ? '<div class="tiny" style="margin-top:6px">The last re-check failed — the build stays verified, but look at what changed.</div>' : ''}</div>`
    : '';

  const form = !open
    ? `<div class="card sunk"><div class="h3">Opens ${esc(shortDate(monthOpensOn(S.tracks.robotics.start, b.month)))}</div>
        <div class="tiny" style="margin-top:4px">Or beat month ${b.month - 1}'s boss to open it now. Start building whenever you like — it can be checked once the month opens.</div></div>`
    : portfolio
    ? `<button class="btn primary block" data-check>${st?.checks ? 'Check again' : 'Check my builds'}</button>`
    : !user
    ? `<div class="card warn-card"><div class="h3">Add your GitHub username first</div>
        <div class="field" style="margin-top:10px"><input class="input" id="bd-user" placeholder="GitHub username" autocapitalize="off" spellcheck="false"></div>
        <button class="btn primary block sm" style="margin-top:10px" data-user>Save</button></div>`
    : `<div class="field">
        <label for="bd-repo">GitHub folder for this build</label>
        <input class="input" id="bd-repo" value="${esc(prefill)}" autocapitalize="off" spellcheck="false"
               placeholder="${esc(user)}/robotics/m${b.month}-${b.id}">
        <div class="tiny">owner/repo, owner/repo/folder, or paste the GitHub link.</div>
      </div>
      <button class="btn primary block" style="margin-top:12px" data-check>${st?.checks ? 'Check again' : 'Check on GitHub'}</button>`;

  sheet(b.name, `
    <div class="wrap"><span class="badge" style="background:${m.color}">Month ${b.month}</span>
      <span class="badge">${esc(topic.name)}</span><span class="badge price">${esc(b.cost)}</span></div>
    <p class="build-task">${esc(b.task)}</p>
    ${status}
    <div class="label" style="margin-top:16px">${portfolio ? 'What passes' : `What the ${b.proof?.doc || 'README'} needs`}</div>
    <div class="checklist" id="bd-checks">${checklist(b)}</div>
    ${!portfolio ? '<div class="tiny" style="margin-top:6px">Checks the write-up exists, not that the robot works.</div>' : ''}
    <div style="margin-top:16px">${form}</div>
  `, (el, close) => {
    $('[data-user]', el)?.addEventListener('click', () => {
      const v = $('#bd-user', el).value.trim().replace(/^@/, '');
      if (!parseRepo(`${v}/x`)) { toast('That is not a GitHub username.'); return; }
      linkGithub({ login: v }); close(); openBuild(id, rerender);
    });

    const btn = $('[data-check]', el);
    if (!btn) return;
    const input = $('#bd-repo', el);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    btn.onclick = async () => {
      let target = null, result;
      if (!portfolio) {
        target = parseRepo(input.value);
        if (!target) { toast('Use owner/repo or owner/repo/folder.'); input.focus(); return; }
      }
      btn.disabled = true; btn.textContent = 'Checking…';
      try {
        result = portfolio
          ? verifyPortfolio(b, S.tracks.robotics.builds)
          : await verifyBuild(b, target, { user: S.github.user, usedBy: claimedTargets(b.id) });
      } catch (err) {
        console.error(err);
        result = { ok:false, error:'Something went wrong running the check.' };
      }
      if (!result.ok) {
        btn.disabled = false; btn.textContent = 'Check again';
        toast(esc(result.error), 5000);
        return;
      }
      const applied = applyVerification(b.id, target, result);
      if (applied?.newly) {
        confetti(120); sfx('reward');
        rewardToast(applied.reward);
        if (applied.drop) setTimeout(() => toast(`${applied.drop.icon} <b>${esc(applied.drop.name)}</b> ${applied.drop.dupe ? `— duplicate, +${applied.drop.credit}c` : '— new gear'}`, 3600), 700);
      } else if (!result.verified) {
        sfx('fail');
        toast(`${result.checks.filter(c => c.pass).length} of ${result.checks.length} checks pass — see what is missing.`);
      } else toast('Still verified.');
      close(); openBuild(id, rerender);
    };
  });
}

/* ------------------------------ portfolio copy ---------------------------- */

/** Your verified builds as Markdown, for a profile README or a CV. */
export function portfolioMarkdown() {
  const done = BUILDS.filter(b => isVerified(b.id));
  const lines = [`# Robotics portfolio`, '', `${done.length} projects, each with a write-up, measured numbers and what broke.`, ''];
  for (const m of MONTHS) {
    const items = done.filter(b => b.month === m.n);
    if (!items.length) continue;
    lines.push(`## ${m.title}`, '');
    for (const b of items) {
      const st = S.tracks.robotics.builds[b.id];
      lines.push(`- **[${b.name}](${st.meta?.url || targetUrl(st.target)})** — ${b.task.split('. ')[0]}.`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/* ---------------------------------- list ---------------------------------- */

function card(b) {
  const m = monthByN(b.month), st = S.tracks.robotics.builds[b.id], open = isUnlocked(b.month);
  const badge = st?.verified ? '<span class="badge good">✓ verified</span>'
    : !open ? '<span class="badge mute">locked</span>'
    : st?.checks ? `<span class="badge warn">${st.checks.filter(c => c.pass).length}/${st.checks.length}</span>`
    : '<span class="badge">to do</span>';
  return `<button class="card tap rail build-card ${open ? '' : 'locked'} ${st?.verified ? 'verified' : ''}" style="--rail:${m.color}" data-build="${b.id}">
    <div class="between"><span class="label">M${b.month} · ${esc(topicById(b.topic).name)}</span>${badge}</div>
    <div class="h3" style="margin-top:4px">${esc(b.name)}</div>
    <div class="tiny" style="margin-top:2px">${esc(b.cost)} · +${buildXp(b)} XP</div>
  </button>`;
}

export function render() {
  const n = verifiedCount();
  const shown = BUILDS.filter(b =>
    filter === 'all' ? true
    : filter === 'done' ? isVerified(b.id)
    : filter === 'todo' ? !isVerified(b.id) && isUnlocked(b.month)
    : b.month === +filter);
  const pills = [['all', 'All'], ['todo', 'To do'], ['done', 'Verified'], ...MONTHS.map(m => [String(m.n), `M${m.n}`])]
    .map(([k, l]) => `<button class="pill ${filter === k ? 'on' : ''}" data-filter="${k}">${l}</button>`).join('');

  return `<div class="stack s4 fade-up">
    <div class="card portfolio">
      <div class="between"><div><div class="h2 num">${n} / ${BUILDS.length}</div><div class="tiny">verified on GitHub</div></div>
        <button class="btn sm" data-act="copy" ${n ? '' : 'disabled'}>${icon('copy', 14).value} Portfolio</button></div>
      <div style="margin-top:10px" class="bar"><i style="width:${(n / BUILDS.length) * 100}%"></i></div>
      <div class="tiny" style="margin-top:8px">${S.github.user ? `Checked on github.com/${esc(S.github.user)}` : 'Add your GitHub in Hero → Accounts.'}</div>
    </div>
    <div class="pill-scroll">${pills}</div>
    <div class="stack s2">${shown.map(card).join('') || '<div class="empty">Nothing here yet.</div>'}</div>
  </div>`;
}

export function mount(root, rerender) {
  bind(root, {
    copy: async () => {
      try { await navigator.clipboard.writeText(portfolioMarkdown()); toast('Portfolio copied as Markdown'); }
      catch { toast('Could not copy on this browser.'); }
    },
  });
  root.querySelectorAll('[data-filter]').forEach(b => { b.onclick = () => { filter = b.dataset.filter; rerender(); }; });
  root.querySelectorAll('[data-build]').forEach(b => { b.onclick = () => openBuild(b.dataset.build, rerender); });
}
