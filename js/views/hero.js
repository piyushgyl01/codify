/** Hero: the character, every track at a glance, accounts, gear, achievements, settings, backup. */
import {
  S, THEMES, ownsTheme, buyTheme, selectTheme, buyFreeze, FREEZE_COST, progress, gearBonus, statsSnapshot,
  saveProfile, trackOn, TRACK_IDS, resetSave, exportSave, importSave, importBotify, describeSave,
  priorSave, undoImport, backupFilename, markBackup, saveHealthy, linkGithub, unlinkGithub, dayIsActive, DEGREE_IDS,
} from '../state.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { LOOT, RARITY, LOOT_CAP } from '../data/loot.js';
import { TRACKS, trackById } from '../tracks/index.js';
import { linkCodeforces, unlinkCodeforces, setDailySolves } from '../tracks/cp/actions.js';
import { linkHf, unlinkHf } from '../tracks/ai/actions.js';
import { checkHfUser } from '../hf.js';
import { checkHandle } from '../tracks/cp/codeforces.js';
import { colorForRating } from '../tracks/cp/model.js';
import { verifiedCount, setStart, mission as roboMission } from '../tracks/robotics/actions.js';
import { mission as codeMission } from '../tracks/cp/actions.js';
import { BOSSES } from '../tracks/robotics/bosses.js';
import { SOURCE, BUILDS } from '../tracks/robotics/roadmap.js';
import { checkGithub } from '../platforms.js';
import { syncAll, describeSync } from '../sync.js';
import { cloudState, cloudConnect, cloudChoose, cloudDisconnect, cloudSync, cloudToken, CLOUD_REPO } from '../cloud.js';
import { openPortfolio, portfolioLine } from '../career/view.js';
import { rankFor, nextRank, dayKey, addDays } from '../game.js';
import { seriesChart, calendarGrid } from '../charts.js';
import { h, raw, esc, bind, sheet, dialog, toast, fmt, hm, confetti, sfx, $, shortDate } from '../ui.js';
import { canInstall, isInstalled, promptInstall } from '../pwa.js';
import { APP_VERSION } from '../version.js';
import { degreeData, degreeMeta } from '../degrees/load.js';
import { degreeProgress } from '../degrees/model.js';

/* --------------------------------- pieces --------------------------------- */

function head() {
  const p = progress(), rank = rankFor(p.level), next = nextRank(p.level);
  return h`<div class="hero-head">
    <div class="hero-rank">${rank.icon}</div>
    <div class="h1" style="margin-top:12px">${S.profile.name || 'Engineer'}</div>
    <div class="h3" style="margin-top:4px">${rank.name} · level ${p.level}</div>
    <div class="bar" style="margin:14px auto 0;max-width:280px"><i style="width:${p.pct}%;background:var(--card)"></i></div>
    <div class="tiny" style="margin-top:8px">${fmt(p.into)} / ${fmt(p.need)} XP${raw(next ? ` · ${esc(next.name)} at level ${next.at}` : '')}</div>
  </div>`;
}

/** Each track's own measure of you, beside the character level. */
function trackBadges() {
  const cards = [];
  if (trackOn('cp')) {
    const c = S.tracks.cp;
    cards.push(`<div class="card pad-s rail" style="--rail:var(--blue)"><div class="label">🧩 Programming</div>
      <div class="h3" style="margin-top:4px">${c.handle ? `${esc(c.rank || 'unrated')} · ${c.rating ?? '—'}` : 'Not connected'}</div>
      <div class="tiny">Mission ${codeMission().n} · ${S.stats.solved} solved · ${S.stats.tiersCleared} tiers</div></div>`);
  }
  if (trackOn('robotics')) {
    const won = Object.values(S.tracks.robotics.bosses).filter(b => b.won).length;
    cards.push(`<div class="card pad-s rail" style="--rail:var(--acid)"><div class="label">🤖 Robotics</div>
      <div class="h3" style="margin-top:4px">Mission ${roboMission().n} · ${won}/${BOSSES.length} bosses</div>
      <div class="tiny">${verifiedCount()}/${BUILDS.length} builds verified</div></div>`);
  }
  for (const id of DEGREE_IDS.filter(trackOn)) {
    const D = degreeData(id), meta = degreeMeta(id);
    if (!D) continue;
    const p = degreeProgress(D, S.tracks[id]);
    cards.push(`<div class="card pad-s rail" style="--rail:${meta.color}"><div class="label">${meta.icon} ${esc(meta.title)}</div>
      <div class="h3" style="margin-top:4px">${p.passed}/${p.courses} courses · ${p.credits} credits</div>
      <div class="tiny">${p.unitsDone}/${p.units} units done</div></div>`);
  }
  return `<div class="grid2">${cards.join('')}</div>`;
}

function tiles() {
  const s = statsSnapshot();
  const acc = s.answered ? `${Math.round((s.correct / s.answered) * 100)}%` : '—';
  const t = [
    [S.streak.current, 'streak'], [S.streak.best, 'best streak'], [S.streak.freezes, 'freezes'],
    [hm(s.timerMin), 'focus time'], [s.commits, 'commits'], [s.quests, 'quests'],
  ];
  if (trackOn('cp')) t.push([s.solved, 'solved'], [s.bestRating || '—', 'hardest'], [s.contestsWon, 'contests won']);
  if (trackOn('robotics')) t.push([s.missions, 'missions'], [acc, 'accuracy'], [s.skillScore, 'skill score']);
  if (trackOn('ai')) t.push([s.aiMissions, 'AI missions'], [s.aiCapstones, 'papers reproduced'], [s.frontier, 'frontier logs']);
  return `<div class="grid3">${t.map(([v, k]) => `<div class="tile"><div class="v">${v}</div><div class="k">${k}</div></div>`).join('')}</div>`;
}

function charts() {
  const goal = S.profile.focusGoal || 120;
  const keys = Array.from({ length: 30 }, (_, i) => addDays(dayKey(), i - 29));
  const focus = keys.map((k, i) => {
    const m = S.days[k]?.timerMin || 0;
    return { value: m, color: m >= goal ? 'var(--acid)' : 'var(--card)', label: `${shortDate(k)}: ${hm(m)}`,
             axis: i % 7 === 0 || i === 29 ? shortDate(k) : '' };
  });
  const start = addDays(dayKey(), -181);
  const grid = Array.from({ length: 182 }, (_, i) => {
    const k = addDays(start, i), m = S.days[k]?.timerMin || 0;
    const level = !dayIsActive(k) ? 0 : 1 + (m >= goal / 2 ? 1 : 0) + (m >= goal ? 1 : 0);
    return { color: ['var(--sunk)', 'var(--yellow)', 'var(--lime)', 'var(--acid)'][level], label: `${shortDate(k)}${m ? ` · ${hm(m)}` : ''}` };
  });
  return `
    <div class="card"><div class="between"><span class="label">Focus minutes · 30 days</span><span class="tiny">green = goal met</span></div>
      <div style="margin-top:12px">${seriesChart(focus, { height: 110, target: goal, axisEvery: 7 })}</div></div>
    <div class="card"><div class="between"><span class="label">Six months</span><span class="tiny">darker = more done</span></div>
      <div style="margin-top:12px">${calendarGrid(grid, { cell: 11, gap: 3 })}</div></div>`;
}

function accounts() {
  const c = S.tracks.cp, g = S.github;
  return `<div class="stack s2">
    ${trackOn('cp') ? `<button class="card tap pad-s" data-act="cf"><div class="between"><div><div class="h3">Codeforces</div>
      <div class="tiny">${c.handle ? `${esc(c.handle)} · ${c.rating ?? 'unrated'}` : 'Not connected — Programming reads nothing until it is'}</div></div>
      ${c.handle ? `<span class="badge" style="background:${colorForRating(c.rating)}">${c.rating ?? '—'}</span>` : '<span>›</span>'}</div></button>` : ''}
    <button class="card tap pad-s" data-act="gh"><div class="between"><div><div class="h3">GitHub</div>
      <div class="tiny">${g.user ? `${esc(g.user)} · ${S.stats.commits} commits credited` : 'Not connected — builds cannot be verified, commits earn nothing'}</div></div><span>›</span></div></button>
    ${trackOn('ai') ? `<button class="card tap pad-s" data-act="hf"><div class="between"><div><div class="h3">Hugging Face</div>
      <div class="tiny">${S.tracks.ai.hf?.user ? esc(S.tracks.ai.hf.user) : 'Not connected — AI models and demos cannot be verified'}</div></div><span>›</span></div></button>` : ''}
    ${c.handle || g.user ? '<button class="btn block sm" data-act="sync">Sync now</button>' : ''}
  </div>`;
}

function openHf(rerender) {
  const current = S.tracks.ai.hf?.user || '';
  sheet('Hugging Face', `<p class="sub">AI builds you publish — models, adapters, demos — are verified on your public Hugging Face account. No sign-in; only the name is sent.</p>
    <div class="field" style="margin-top:14px"><label for="hf-v">Username</label>
      <input class="input" id="hf-v" value="${esc(current)}" autocapitalize="off" spellcheck="false" placeholder="your-name"></div>
    <button class="btn primary block" style="margin-top:16px" data-save>Save</button>
    ${current ? '<button class="btn ghost block sm" style="margin-top:8px" data-unlink>Disconnect</button>' : ''}`,
  (el, close) => {
    $('[data-save]', el).onclick = async e => {
      e.target.disabled = true; e.target.textContent = 'Checking…';
      try { const u = await checkHfUser($('#hf-v', el).value); linkHf({ user: u.user, avatar: u.avatar }); close(); toast(`Connected to <b>${esc(u.user)}</b>`); }
      catch (err) { toast(esc(err.message), 4000); e.target.disabled = false; e.target.textContent = 'Save'; }
      rerender();
    };
    $('[data-unlink]', el)?.addEventListener('click', () => { unlinkHf(); close(); toast('Disconnected. Credit already earned stays.'); rerender(); });
  });
}

function gear() {
  const bonus = Math.round((gearBonus() - 1) * 100);
  const set = (id, title) => `<div class="label" style="margin:12px 0 8px">${title}</div>
    <div class="gear-grid">${LOOT.filter(l => l.set === id).map(l => {
      const have = !!S.loot[l.id];
      return `<div class="gear ${have ? 'have' : ''}" style="--rc:${RARITY[l.rarity].color}" title="${esc(l.desc)}">
        <div class="g-ico">${have ? l.icon : '?'}</div>
        <div class="tiny">${have ? esc(l.name) : esc(RARITY[l.rarity].name)}</div>
        ${have ? `<div class="tiny num">+${(l.bonus * 100).toFixed(1).replace('.0', '')}%</div>` : ''}</div>`;
    }).join('')}</div>`;
  return `<div class="section-head"><div class="h2">Gear</div><span class="badge ${bonus ? 'solid' : ''}">+${bonus}% XP${bonus >= LOOT_CAP * 100 ? ' (max)' : ''}</span></div>
    ${set('desk', 'Desk')}${set('bench', 'Bench')}`;
}

function achievements() {
  const groups = [['core', 'The character'], ...TRACKS.map(t => [t.id, `${t.icon} ${t.name}`])];
  const got = ACHIEVEMENTS.filter(a => S.earned[a.id]).length;
  return `<div class="section-head"><div class="h2">Achievements</div><span class="tiny">${got}/${ACHIEVEMENTS.length}</span></div>
    ${groups.map(([id, title]) => `<div class="tiny" style="margin:12px 0 6px;font-weight:800">${esc(title)}</div>
      <div class="stack s2">${ACHIEVEMENTS.filter(a => a.track === id).map(a => {
        const on = !!S.earned[a.id];
        return `<div class="card pad-s ach ${on ? 'got' : ''}"><div class="row"><div class="ach-ico">${on ? a.icon : '·'}</div>
          <div class="grow"><div class="h3">${esc(a.name)}</div><div class="tiny">${esc(a.desc)}</div></div>
          ${a.xp ? `<span class="badge">${on ? '✓' : `${a.xp} XP`}</span>` : on ? '<span class="badge">✓</span>' : ''}</div></div>`;
      }).join('')}</div>`).join('')}`;
}

function shop() {
  return `<div class="card"><div class="between"><div><div class="h3">Streak freeze</div>
      <div class="tiny">Covers a missed day automatically. You have ${S.streak.freezes}. One more every five levels.</div></div>
      <button class="btn sm" data-act="freeze" ${S.coins < FREEZE_COST ? 'disabled' : ''}>${FREEZE_COST}c</button></div></div>
    <div style="margin-top:16px"><div class="section-head"><div class="h2">Accent</div><span class="badge">${fmt(S.coins)}c</span></div></div>
    <div class="theme-grid">${THEMES.map(t => {
      const owned = ownsTheme(t.id), on = S.profile.theme === t.id;
      return `<button class="theme ${on ? 'on' : ''} ${owned ? '' : 'locked'}" data-theme="${t.id}">
        <span class="sw" style="background:${t.accent}"></span><span class="tiny">${t.name}</span>
        <span class="tiny state">${on ? 'active' : owned ? 'owned' : `${t.cost}c`}</span></button>`;
    }).join('')}</div>`;
}

function settings() {
  return `<div class="stack s2">
    <button class="card tap pad-s" data-act="portfolio"><div class="between"><div><div class="h3">Portfolio &amp; jobs</div>
      <div class="tiny">${portfolioLine()}</div></div><span>›</span></div></button>
    <button class="card tap pad-s" data-act="profile"><div class="between"><div><div class="h3">Profile and goals</div>
      <div class="tiny">${esc(S.profile.name)} · ${S.profile.focusGoal} min a day${trackOn('cp') ? ` · ${S.tracks.cp.dailySolves} problems` : ''}</div></div><span>›</span></div></button>
    <button class="card tap pad-s" data-act="cloud"><div class="between"><div><div class="h3">AI &amp; sync</div>
      <div class="tiny">${cloudLine()}</div></div><span>›</span></div></button>
    <button class="card tap pad-s" data-act="backup"><div class="between"><div><div class="h3">Backup &amp; restore</div>
      <div class="tiny">${S.backupAt ? `Last backup ${esc(shortDate(dayKey(new Date(S.backupAt))))}` : 'Never backed up'}</div></div><span>›</span></div></button>
    <div class="card pad-s"><div class="between"><span class="h3">Sound</span>
      <button class="pill ${S.settings.sound ? 'on' : ''}" data-act="sound">${S.settings.sound ? 'On' : 'Off'}</button></div></div>
    <div class="card pad-s"><div class="between"><span class="h3">Reduce motion</span>
      <button class="pill ${S.settings.reduceMotion ? 'on' : ''}" data-act="motion">${S.settings.reduceMotion ? 'On' : 'Off'}</button></div></div>
    ${isInstalled() ? '' : `<button class="card tap pad-s" data-act="install"><div class="between"><div><div class="h3">Install the app</div>
      <div class="tiny">Home screen, full screen, works offline.</div></div><span>›</span></div></button>`}
  </div>`;
}

/* --------------------------------- sheets --------------------------------- */

function openProfile(rerender) {
  sheet('Profile and goals', `
    <div class="field"><label for="pf-name">Name</label><input class="input" id="pf-name" maxlength="32" value="${esc(S.profile.name)}"></div>
    <div class="field" style="margin-top:12px"><label for="pf-goal">Daily focus goal (minutes)</label>
      <input class="input num" id="pf-goal" type="number" inputmode="numeric" min="30" max="360" step="15" value="${S.profile.focusGoal}"></div>
    ${trackOn('cp') ? `<div class="field" style="margin-top:12px"><label for="pf-solves">Codeforces problems a day</label>
      <input class="input num" id="pf-solves" type="number" inputmode="numeric" min="1" max="6" value="${S.tracks.cp.dailySolves}"></div>` : ''}
    ${trackOn('robotics') ? `<div class="field" style="margin-top:12px"><label for="pf-start">Robotics plan start date</label>
      <input class="input" id="pf-start" type="date" value="${esc(S.tracks.robotics.start)}" max="${dayKey()}"></div>
      <div class="tiny" style="margin-top:6px">An earlier start opens parts sooner. It changes the calendar, not your progress.</div>` : ''}
    <button class="btn primary block" style="margin-top:16px" data-save>Save</button>`,
    (el, close) => {
      $('[data-save]', el).onclick = () => {
        const name = $('#pf-name', el).value.trim().slice(0, 32) || S.profile.name;
        const focusGoal = Math.max(30, Math.min(360, Math.round(+$('#pf-goal', el).value || 120)));
        const solves = $('#pf-solves', el);
        if (solves) setDailySolves(+solves.value || 2);
        const start = $('#pf-start', el)?.value;
        if (start && /^\d{4}-\d{2}-\d{2}$/.test(start)) setStart(start > dayKey() ? dayKey() : start);
        saveProfile({ name, focusGoal });
        close(); toast('Saved'); rerender();
      };
    });
}

function openAccount(kind, rerender) {
  const isCf = kind === 'cf';
  const current = isCf ? S.tracks.cp.handle : S.github.user;
  sheet(isCf ? 'Codeforces' : 'GitHub', `
    <p class="sub">${isCf ? 'Programming reads your accepted submissions from Codeforces\' public API. No sign-in.'
      : 'Robotics builds are verified against public repos this account owns, and public commits earn XP. No sign-in; only names are sent.'}</p>
    <div class="field" style="margin-top:14px"><label for="acc-v">${isCf ? 'Handle' : 'Username'}</label>
      <input class="input" id="acc-v" value="${esc(current)}" autocapitalize="off" spellcheck="false" placeholder="${isCf ? 'tourist' : 'octocat'}"></div>
    <button class="btn primary block" style="margin-top:16px" data-save>Save and sync</button>
    ${current ? '<button class="btn ghost block sm" style="margin-top:8px" data-unlink>Disconnect</button>' : ''}`,
    (el, close) => {
      $('[data-save]', el).onclick = async e => {
        const v = $('#acc-v', el).value.trim().replace(/^@/, '');
        if (!v) return;
        e.target.disabled = true; e.target.textContent = 'Checking…';
        try {
          if (isCf) linkCodeforces(await checkHandle(v)); else linkGithub(await checkGithub(v));
          close();
          const r = await syncAll({ force: true });
          toast(esc(describeSync(r)), 3200);
        } catch (err) { toast(esc(err.message), 4000); e.target.disabled = false; e.target.textContent = 'Save and sync'; }
        rerender();
      };
      $('[data-unlink]', el)?.addEventListener('click', () => {
        if (isCf) unlinkCodeforces(); else unlinkGithub();
        close(); toast('Disconnected. Credit already earned stays.'); rerender();
      });
    });
}

/* ------------------------------- AI & sync -------------------------------- */

const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
const lastWriter = by => (!by ? '' : by === 'app' ? 'the app' : by.replace(/^agent:\s*/, ''));

function cloudLine() {
  const c = cloudState();
  if (!c.on) return 'Off — your save is only on this device';
  if (c.error) return `⚠ ${esc(c.error)}`;
  const t = Math.max(c.pushedAt, c.pulledAt);
  return `${esc(c.repo)} · ${c.dirty ? 'changes waiting' : t ? `synced ${ago(t)}` : 'connected'}`;
}

/** What to paste into an AI app. The key URL is for apps that only take a URL. */
function mcpSetup() {
  const c = cloudState(), token = cloudToken(), base = `${location.origin}/mcp`;
  const q = c.repo && c.repo !== `${c.login}/${CLOUD_REPO}` ? `?repo=${encodeURIComponent(c.repo)}` : '';
  return {
    url: base + q,
    keyUrl: `${base}/${token}${q}`,
    claude: `claude mcp add --transport http codify ${base}${q} --header "Authorization: Bearer ${token}"`,
  };
}

export function openCloud(rerender) {
  const c = cloudState();
  const setup = c.on ? mcpSetup() : null;
  sheet('AI & sync', c.on ? `
    <div class="card"><div class="label">Synced with GitHub</div>
      <div class="h3" style="margin-top:6px">${esc(c.repo)}</div>
      <div class="tiny" style="margin-top:4px">${c.error ? `⚠ ${esc(c.error)}` : c.dirty ? 'Changes waiting to send' : 'Up to date'}${c.pushedAt ? ` · sent ${ago(c.pushedAt)}` : ''}${c.pulledAt ? ` · checked ${ago(c.pulledAt)}` : ''}${c.lastBy ? ` · last change by ${esc(lastWriter(c.lastBy))}` : ''}</div>
      <button class="btn block sm" style="margin-top:10px" data-cloud-sync>Sync now</button></div>
    <hr class="rule">
    <div class="label">Connect an AI app</div>
    <p class="sub" style="margin-top:6px">Codify is an MCP server. An AI app connected to it can read everything here and change it — tick work, mark assessments, quiz you, set your pace — through the app's own rules.</p>
    <div class="field" style="margin-top:12px"><label>Apps that take only a URL (Claude, ChatGPT connectors)</label>
      <div class="row" style="gap:6px"><input class="input" readonly value="${esc(setup.keyUrl)}" data-sel><button class="btn sm" data-copy="keyUrl">Copy</button></div></div>
    <div class="field" style="margin-top:12px"><label>Claude Code</label>
      <div class="row" style="gap:6px"><input class="input" readonly value="${esc(setup.claude)}" data-sel><button class="btn sm" data-copy="claude">Copy</button></div></div>
    <div class="field" style="margin-top:12px"><label>Anything else: this URL, with your token as a Bearer header</label>
      <div class="row" style="gap:6px"><input class="input" readonly value="${esc(setup.url)}" data-sel><button class="btn sm" data-copy="url">Copy</button></div></div>
    <div class="card sunk" style="margin-top:12px"><div class="tiny">The key URL and the token are passwords to your save: anyone with them can read and change it.
      Keep them private. To cut every app off at once, delete the token on GitHub.</div></div>
    <button class="btn ghost block sm" style="margin-top:14px" data-cloud-off>Stop syncing on this device</button>` : `
    <p class="sub">Keep your save in a private GitHub repo. It syncs between your devices, and any AI app or agent can read and change it through Codify's MCP server.</p>
    <ol class="sub" style="margin:12px 0 0 18px;display:flex;flex-direction:column;gap:8px">
      <li><a href="https://github.com/new?name=${CLOUD_REPO}&visibility=private&description=My%20Codify%20save" target="_blank" rel="noopener">Create a private repo</a> named <b>${CLOUD_REPO}</b>.</li>
      <li><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Create a fine-grained token</a>:
        Repository access → <i>Only select repositories</i> → ${CLOUD_REPO}. Permissions → <i>Contents</i> → <i>Read and write</i>.</li>
      <li>Paste it here.</li></ol>
    <div class="field" style="margin-top:14px"><label for="cl-token">Token</label>
      <input class="input" id="cl-token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…"></div>
    <div class="field" style="margin-top:10px"><label for="cl-repo">Repo</label>
      <input class="input" id="cl-repo" autocapitalize="off" spellcheck="false" value="${CLOUD_REPO}"></div>
    <div class="tiny" style="margin-top:6px">The token stays on this device and goes only to GitHub, and to Codify's MCP server when an AI app you connect uses it. It is never put in a backup.</div>
    <button class="btn primary block" style="margin-top:16px" data-cloud-on>Connect</button>`,
  (el, close) => {
    const reopen = () => { close(); rerender(); openCloud(rerender); };
    el.querySelectorAll('[data-sel]').forEach(i => i.addEventListener('focus', () => i.select()));
    el.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(setup[b.dataset.copy]); toast('Copied'); } catch { toast('Could not copy — select it and copy by hand.'); }
    }));
    $('[data-cloud-sync]', el)?.addEventListener('click', async e => { e.target.textContent = 'Syncing…'; await cloudSync(); reopen(); });
    $('[data-cloud-off]', el)?.addEventListener('click', () => { cloudDisconnect(); toast('Sync is off on this device. The save on GitHub stays.'); reopen(); });
    $('[data-cloud-on]', el)?.addEventListener('click', async e => {
      const btn = e.target;
      btn.disabled = true; btn.textContent = 'Checking…';
      try {
        const res = await cloudConnect($('#cl-token', el).value, $('#cl-repo', el).value);
        if (!res.remote) { toast(`Connected — your save is now in ${esc(res.repo)}`, 3200); reopen(); return; }
        const r = res.remote;
        dialog(`<div class="h2">${esc(res.repo)} already has a save</div>
          <div class="card sunk" style="margin-top:14px;text-align:left"><div class="tiny">GitHub: ${esc(r.name)} · level ${r.level} · ${r.days} days${r.savedAt ? ` · saved ${esc(ago(Date.parse(r.savedAt)))}` : ''}</div>
            <div class="tiny" style="margin-top:4px">This device: ${esc(S.profile.name)} · level ${progress().level} · ${Object.keys(S.days).length} days</div></div>
          <p class="tiny" style="margin:12px 0 16px">The other one is replaced. Whichever you drop, Backup &amp; restore keeps one undo.</p>
          <button class="btn primary block" data-theirs>Use the save on GitHub</button>
          <button class="btn block sm" style="margin-top:8px" data-mine>Keep this device's</button>`,
        (d, closeD) => {
          const pick = which => async () => {
            try { await cloudChoose(which); closeD(); toast('Connected', 2400); reopen(); }
            catch (err) { toast(esc(err.message), 5000); }
          };
          d.querySelector('[data-theirs]').onclick = pick('theirs');
          d.querySelector('[data-mine]').onclick = pick('mine');
        }, { dismissable: false });
      } catch (err) {
        toast(esc(err.message), 5000);
        btn.disabled = false; btn.textContent = 'Connect';
      }
    });
  });
}

/* ----------------------------- backup & restore --------------------------- */

function downloadBackup() {
  const blob = new Blob([exportSave()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = backupFilename();
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  markBackup();
  toast('Backup downloaded');
}

export function openBackup(rerender) {
  const me = describeSave(JSON.parse(exportSave())), prior = priorSave();
  sheet('Backup & restore', `
    <div class="card"><div class="label">This device</div>
      <div class="h3" style="margin-top:6px">${esc(me.name)} · level ${me.level}</div>
      <div class="tiny" style="margin-top:4px">${me.days} days · ${me.solved} solved · ${me.builds} builds · ${me.bosses} bosses</div></div>
    <div class="card sunk" style="margin-top:12px"><div class="tiny">Everything lives in this browser's storage. Solves can be re-read
      from Codeforces and builds re-checked on GitHub; your streak, skill levels and gear cannot.</div></div>
    <button class="btn primary block" style="margin-top:16px" data-download>Download backup</button>
    <button class="btn block sm" style="margin-top:8px" data-copy>Copy as text</button>
    <hr class="rule">
    <div class="label">Import Botify progress</div>
    <div class="sub" style="margin-top:6px">Folds a Botify backup into this character: its robotics progress becomes the Robotics track,
      and its XP, gear and history are added to yours. Nothing here is replaced.</div>
    <input type="file" id="bt-file" accept="application/json,.json" class="input" style="margin-top:10px">
    <hr class="rule">
    <div class="label">Restore</div>
    <div class="sub" style="margin-top:6px">Replaces everything with a Codify backup. You confirm against a summary first, and get one undo.</div>
    <input type="file" id="bk-file" accept="application/json,.json" class="input" style="margin-top:10px">
    <textarea class="input" id="bk-text" style="margin-top:8px" placeholder="…or paste the JSON"></textarea>
    <button class="btn block" style="margin-top:8px" data-paste>Restore from text</button>
    ${prior ? `<hr class="rule"><div class="label">Undo</div>
      <div class="sub" style="margin-top:6px">The save from before your last import is still here — ${esc(prior.name)}, level ${prior.level}.</div>
      <button class="btn block sm" style="margin-top:10px" data-undo>Put that one back</button>` : ''}
  `, (el, close) => {
    $('[data-download]', el).onclick = () => { downloadBackup(); rerender(); };
    $('[data-copy]', el).onclick = async () => {
      try { await navigator.clipboard.writeText(exportSave()); markBackup(); toast('Copied'); rerender(); }
      catch { toast('Could not copy — download instead.'); }
    };
    $('#bt-file', el).addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if (!f) return;
      const text = await f.text();
      let incoming;
      try { incoming = describeSave(JSON.parse(text)); } catch { toast('That file is not valid JSON.'); return; }
      if (incoming.kind !== 'Botify') { toast('That is not a Botify backup.'); return; }
      dialog(`<div class="h2">Import Botify progress?</div>
        <div class="card sunk" style="margin-top:14px;text-align:left"><div class="tiny">${esc(incoming.name)} · level ${incoming.level} ·
          ${incoming.builds} builds · ${incoming.bosses} bosses · ${incoming.days} days</div></div>
        <p class="tiny" style="margin:12px 0 16px">Its robotics progress replaces this Robotics track; XP, credits and gear are added. One undo afterwards.</p>
        <button class="btn primary block" data-yes>Import it</button>
        <button class="btn ghost block sm" style="margin-top:8px" data-no>Cancel</button>`,
        (d, closeD) => {
          d.querySelector('[data-no]').onclick = closeD;
          d.querySelector('[data-yes]').onclick = () => {
            const r = importBotify(text); closeD();
            if (!r.ok) { toast(esc(r.error)); return; }
            close(); confetti(80); toast('Botify progress imported'); rerender();
          };
        });
    });
    $('#bk-file', el).addEventListener('change', async e => { const f = e.target.files?.[0]; if (f) confirmRestore(await f.text(), close, rerender); });
    $('[data-paste]', el).onclick = () => {
      const text = $('#bk-text', el).value.trim();
      if (!text) { toast('Nothing pasted.'); return; }
      confirmRestore(text, close, rerender);
    };
    $('[data-undo]', el)?.addEventListener('click', () => { if (undoImport()) { close(); toast('Previous save restored'); rerender(); } });
  });
}

function confirmRestore(text, closeParent, rerender) {
  let incoming;
  try { incoming = describeSave(JSON.parse(text)); } catch { toast('That is not valid JSON.'); return; }
  const me = describeSave(JSON.parse(exportSave()));
  const row = (k, a, b) => `<div class="between tiny" style="padding:4px 0"><span>${k}</span><span><span class="num">${a}</span> → <span class="num">${b}</span></span></div>`;
  dialog(`<div class="h2">Replace everything?</div>
    <div class="card sunk" style="margin-top:14px;text-align:left">
      ${row('from', 'this device', esc(incoming.kind))}${row('name', esc(me.name), esc(incoming.name))}${row('level', me.level, incoming.level)}
      ${row('solved', me.solved, incoming.solved)}${row('builds', me.builds, incoming.builds)}</div>
    <p class="tiny" style="margin:12px 0 16px">The save being replaced is kept, so this can be undone once.</p>
    <button class="btn primary block" data-yes>Restore it</button>
    <button class="btn ghost block sm" style="margin-top:8px" data-no>Cancel</button>`,
    (d, close) => {
      d.querySelector('[data-no]').onclick = close;
      d.querySelector('[data-yes]').onclick = () => {
        const r = importSave(text); close();
        if (!r.ok) { toast(esc(r.error)); return; }
        closeParent?.(); toast('Restored'); rerender();
      };
    });
}

/* --------------------------------- render --------------------------------- */

export function render() {
  const unsaved = !saveHealthy() ? `<div class="card warn-card"><div class="h3">⚠ Saving is failing</div>
    <div class="tiny">Storage is full or blocked, so changes are not being kept. Download a backup now.</div>
    <button class="btn hot block sm" style="margin-top:10px" data-act="backup">Back up now</button></div>` : '';
  return `<div class="stack s4 fade-up">
    ${unsaved}${head()}${trackBadges()}${tiles()}${charts()}
    <div><div class="section-head"><div class="h2">Accounts</div></div>${accounts()}</div>
    <div>${gear()}</div>
    <div>${achievements()}</div>
    <div>${shop()}</div>
    <div><div class="section-head"><div class="h2">Settings</div></div>${settings()}</div>
    ${trackOn('robotics') ? `<div class="card sunk credits"><div class="label">Credits</div>
      <div class="sub" style="margin-top:6px">The robotics roadmap — every month, task, resource and price — is from
        <a href="${esc(SOURCE.url)}" target="_blank" rel="noopener">“${esc(SOURCE.title)}” by ${esc(SOURCE.author)}</a>, summarised in shorter words.</div></div>` : ''}
    <button class="card tap pad-s danger" data-act="reset"><div class="h3">Reset everything</div><div class="tiny">Deletes all progress on this device.</div></button>
    <div class="tiny center">Codify ${APP_VERSION} · ${TRACK_IDS.length} tracks</div>
  </div>`;
}

export function mount(root, rerender) {
  bind(root, {
    profile: () => openProfile(rerender),
    cf:      () => openAccount('cf', rerender),
    gh:      () => openAccount('gh', rerender),
    hf:      () => openHf(rerender),
    backup:  () => openBackup(rerender),
    cloud:   () => openCloud(rerender),
    portfolio: () => openPortfolio(rerender),
    sync:    async el => { el.textContent = 'Syncing…'; const r = await syncAll({ force: true }); toast(esc(describeSync(r)), 3200); rerender(); },
    sound:   () => { S.settings.sound = !S.settings.sound; saveProfile({}); },
    motion:  () => { S.settings.reduceMotion = !S.settings.reduceMotion; saveProfile({}); },
    freeze:  () => { if (buyFreeze()) { sfx('reward'); toast('Streak freeze bought'); } },
    install: async () => {
      if (canInstall()) { await promptInstall(); return; }
      sheet('Install Codify', `<p class="sub">On iPhone: Share → Add to Home Screen. On Android Chrome: menu → Install app.
        On desktop Chrome or Edge: the install icon in the address bar.</p>`);
    },
    reset: () => dialog(`<div class="h2">Reset everything?</div>
      <p class="sub" style="margin:10px 0 18px">Every level, streak, solve record and build on this device goes. Download a backup first if you are unsure.</p>
      <button class="btn hot block" data-yes>Delete my progress</button>
      <button class="btn ghost block sm" style="margin-top:8px" data-no>Keep it</button>`,
      (d, close) => {
        d.querySelector('[data-no]').onclick = close;
        d.querySelector('[data-yes]').onclick = () => { close(); resetSave(); location.reload(); };
      }),
  });
  root.querySelectorAll('[data-theme]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.theme;
      if (ownsTheme(id)) selectTheme(id);
      else if (buyTheme(id)) { confetti(60); sfx('reward'); toast('New accent unlocked'); }
      else toast('Not enough credits yet.');
    };
  });
}
