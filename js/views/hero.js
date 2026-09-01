/** Hero — the connected accounts, lifetime totals, gear, achievements, data. */
import {
  S, THEMES, themeFor, ownsTheme, buyTheme, selectTheme, buyFreeze, progress,
  statsSnapshot, gearBonus, resetSave, exportSave, importSave, describeSave,
  priorSave, undoImport, backupFilename, saveHealthy, isLinked,
  linkCodeforces, linkGithub, unlinkCodeforces, unlinkGithub, treeProgress,
} from '../state.js';
import { rankFor, nextRank, GOALS } from '../game.js';
import { LOOT, RARITY, LOOT_BY_ID, MAX_BONUS } from '../data/loot.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { TOPICS, TIERS } from '../data/skilltree.js';
import { CONTESTS } from '../data/contests.js';
import { checkHandle, checkGithub } from '../platforms.js';
import { syncAll, describeSync, lastSync } from '../sync.js';
import { treeCompletion } from '../analytics.js';
import { openProfileEditor } from './onboarding.js';
import { canInstall, isInstalled, promptInstall } from '../pwa.js';
import { APP_VERSION } from '../version.js';
import {
  h, raw, esc, $, $$, bind, bar, hm, fmt, pct, sheet, dialog, toast, sfx, haptic, confetti,
} from '../ui.js';
import { icon } from '../icons.js';

export function render() {
  const p = progress();
  const rank = rankFor(p.level);
  const next = nextRank(p.level);
  const st = statsSnapshot();
  const bonus = gearBonus();
  const owned = Object.keys(S.loot).filter(id => LOOT_BY_ID[id]).length;
  const done = treeCompletion();
  const cf = S.platforms.cf, gh = S.platforms.gh;

  const tiles = [
    [fmt(st.solved), 'solved'],
    [fmt(st.bestRating || 0), 'best rating'],
    [`${done.cleared}/${done.total}`, 'tiers'],
    [fmt(st.commits), 'commits'],
    [fmt(st.topicsStarted), 'topics'],
    [hm(st.verifiedMinutes), 'timed'],
    [fmt(S.streak.best), 'best streak'],
    [`${st.contestsWon}/${CONTESTS.length}`, 'contests'],
    [fmt(st.xpEarned), 'lifetime xp'],
  ];

  return h`
    <div class="hero-head">
      <div class="hero-rank">${rank.icon}</div>
      <div class="h1" style="margin-top:10px">${S.profile.name || 'Engineer'}</div>
      <div class="h3">${rank.name} · Level ${p.level}</div>
      <div style="margin-top:14px">${raw(bar(p.pct))}</div>
      <div class="between tiny" style="margin-top:6px">
        <span>${fmt(p.into)} / ${fmt(p.need)} XP</span>
        ${raw(next ? `<span>${next.icon} ${next.name} @ ${next.at}</span>` : '<span>max rank</span>')}
      </div>
      <button class="btn ghost sm" style="margin-top:14px" data-act="edit">Edit profile</button>
    </div>

    ${raw(saveHealthy() ? '' : `
      <div class="card rail" style="--rail:var(--bad);margin-top:16px">
        <div class="h3">Your last save did not write</div>
        <div class="sub" style="margin-top:6px">Storage is full or blocked, so changes are
          being lost. Export a backup now.</div>
        <button class="btn hot block sm" style="margin-top:10px" data-act="backup">Export now</button>
      </div>`)}

    <div class="section">
      <div class="label">Connected accounts</div>
      <div class="stack s2">
        <button class="card tap pad-s ${cf.handle ? 'rail' : ''}" ${cf.handle ? 'style="--rail:var(--good)"' : ''}
                data-act="cf">
          <div class="between">
            <div class="grow truncate">
              <div class="h3">Codeforces</div>
              <div class="tiny truncate">${cf.handle
                ? `${esc(cf.handle)}${cf.rating ? ` · rating ${cf.rating}` : ''} · ${(cf.solved || []).length} solved`
                : 'Not connected — nothing can be verified'}</div>
              ${raw(cf.error ? `<div class="tiny" style="color:var(--bad)">${esc(cf.error)}</div>` : '')}
            </div>
            <span class="badge ${cf.handle ? 'good' : 'warn'}">${cf.handle ? 'linked' : 'connect'}</span>
          </div>
        </button>

        <button class="card tap pad-s ${gh.user ? 'rail' : ''}" ${gh.user ? 'style="--rail:var(--info)"' : ''}
                data-act="gh">
          <div class="between">
            <div class="grow truncate">
              <div class="h3">GitHub</div>
              <div class="tiny truncate">${gh.user
                ? `${esc(gh.user)} · ${fmt(st.commits)} commits counted`
                : 'Optional — credits your public pushes'}</div>
              ${raw(gh.error ? `<div class="tiny" style="color:var(--bad)">${esc(gh.error)}</div>` : '')}
            </div>
            <span class="badge ${gh.user ? 'info' : ''}">${gh.user ? 'linked' : 'connect'}</span>
          </div>
        </button>

        <button class="btn block" data-act="sync">Sync now</button>
        ${raw(lastSync() ? `<div class="tiny center">Last synced ${
          new Date(lastSync()).toLocaleString()}</div>` : '')}
      </div>
    </div>

    <div class="section">
      <div class="label">Lifetime</div>
      <div class="grid3">
        ${raw(tiles.map(([v, k]) =>
          `<div class="tile"><div class="v">${v}</div><div class="k">${k}</div></div>`).join(''))}
      </div>
    </div>

    <div class="section">
      <div class="between">
        <div class="label">Gear</div>
        <div class="tiny">${owned}/${LOOT.length} · ×${bonus.toFixed(2)} (cap ×${(1 + MAX_BONUS).toFixed(2)})</div>
      </div>
      <div class="gear-grid">
        ${raw(LOOT.map(l => {
          const have = (S.loot[l.id] || 0) > 0;
          const r = RARITY[l.rarity];
          return `<button class="gear ${have ? 'have' : ''}" data-loot="${l.id}"
            style="--rc:${r.color}" ${have ? '' : 'disabled'}>
            <span class="g-ico">${have ? l.icon : '?'}</span>
            <span class="tiny">${have ? esc(l.name) : '—'}</span></button>`;
        }).join(''))}
      </div>
    </div>

    <div class="section">
      <div class="between">
        <div class="label">Achievements</div>
        <div class="tiny">${Object.keys(S.earned).length}/${ACHIEVEMENTS.length}</div>
      </div>
      <div class="stack s2">
        ${raw(ACHIEVEMENTS.map(a => {
          const got = S.earned[a.id];
          return `<div class="card pad-s ach ${got ? 'got' : ''}">
            <div class="between">
              <div class="row" style="gap:10px">
                <span class="ach-ico">${got ? a.icon : '·'}</span>
                <div><div class="h3">${esc(a.name)}</div><div class="tiny">${esc(a.desc)}</div></div>
              </div>
              <span class="badge ${got ? 'good' : ''}">${got ? `+${a.xp}` : `${a.xp} XP`}</span>
            </div>
          </div>`;
        }).join(''))}
      </div>
    </div>

    <div class="section">
      <div class="between">
        <div class="label">Accents</div>
        <div class="chip-stat">${raw(icon('coin', 13).value)} ${fmt(S.coins)}</div>
      </div>
      <div class="theme-grid">
        ${raw(THEMES.map(t => {
          const owns = ownsTheme(t.id), on = S.profile.theme === t.id;
          return `<button class="theme ${on ? 'on' : ''} ${owns ? '' : 'locked'}" data-theme="${t.id}">
            <span class="sw" style="background:${t.accent}"></span>
            <span class="tiny">${esc(t.name)}</span>
            <span class="tiny state">${owns ? (on ? 'active' : 'owned') : `${t.cost}c`}</span>
          </button>`;
        }).join(''))}
      </div>
    </div>

    <div class="section">
      <div class="label">Streak</div>
      <div class="card">
        <div class="between">
          <div><div class="num h1">${S.streak.current}</div><div class="tiny">current</div></div>
          <div class="right"><div class="num h3">${S.streak.freezes}</div><div class="tiny">freezes</div></div>
        </div>
        <div class="sub" style="margin-top:10px">
          A day counts when the judge accepted something, you pushed a commit, or you
          ran the timer for twenty minutes. A freeze covers one missed day.
        </div>
        <button class="btn block sm" style="margin-top:12px" data-act="freeze"
          ${S.coins < 200 ? 'disabled' : ''}>Buy a freeze · 200c</button>
      </div>
    </div>

    <div class="section">
      <div class="label">Your data</div>
      <div class="stack s2">
        <button class="card tap pad-s" data-act="backup">
          <div class="between"><div><div class="h3">Backup &amp; restore</div>
            <div class="tiny">Everything is in this browser. This is the only copy.</div></div>
            <span>›</span></div>
        </button>
        ${raw(isInstalled() ? '' : `
        <button class="card tap pad-s" data-act="install">
          <div class="between"><div><div class="h3">Install app</div>
            <div class="tiny">Fullscreen, and the shell works offline.</div></div><span>›</span></div>
        </button>`)}
        <button class="card tap pad-s" data-act="sound">
          <div class="between"><div class="h3">Sound</div>
            <span class="badge">${S.settings.sound ? 'on' : 'off'}</span></div>
        </button>
        <button class="card tap pad-s" data-act="motion">
          <div class="between"><div class="h3">Reduce motion</div>
            <span class="badge">${S.settings.reduceMotion ? 'on' : 'off'}</span></div>
        </button>
        <button class="card tap pad-s" data-act="reset">
          <div class="between"><div><div class="h3" style="color:var(--bad)">Reset everything</div>
            <div class="tiny">Deletes every level and record on this device.</div></div></div>
        </button>
      </div>
    </div>

    <div class="center tiny" style="margin-top:28px">
      Codify ${APP_VERSION} · all data local · since ${esc(S.profile.created || '?')}
    </div>`;
}

/* ------------------------------ linking flows ----------------------------- */

function openCodeforces(rerender) {
  const cf = S.platforms.cf;
  sheet('Codeforces', `
    <p class="sub">Your handle only. No password and no token — this reads the same
      public API anyone can, and it is where every point in the game comes from.</p>

    ${cf.handle ? `
      <div class="card" style="margin-top:14px">
        <div class="between">
          <div><div class="h3">${esc(cf.handle)}</div>
            <div class="tiny">${cf.rating ? `rating ${cf.rating} · ` : ''}${(cf.solved || []).length} problems read</div></div>
          <span class="badge good">linked</span>
        </div>
      </div>
      <button class="btn ghost block sm" style="margin-top:12px" data-unlink>Disconnect</button>
    ` : `
      <div class="field" style="margin-top:16px">
        <label>Handle</label>
        <input class="input" id="cf-handle" placeholder="tourist" autocapitalize="none" spellcheck="false">
        <div class="tiny" id="cf-status" style="min-height:18px"></div>
      </div>
      <button class="btn primary block" style="margin-top:12px" data-link>Connect</button>
    `}
  `, (el, close) => {
    $('[data-unlink]', el)?.addEventListener('click', () => {
      dialog(`<div class="h2">Disconnect Codeforces?</div>
        <p class="sub" style="margin:12px 0 16px">Your solved list is cleared from this device.
          XP and levels already earned are kept.</p>
        <button class="btn hot block" data-yes>Disconnect</button>
        <button class="btn ghost block sm" style="margin-top:8px" data-no>Cancel</button>`,
        (d, closeD) => {
          d.querySelector('[data-no]').onclick = closeD;
          d.querySelector('[data-yes]').onclick = () => { unlinkCodeforces(); closeD(); close(); rerender(); };
        });
    });

    $('[data-link]', el)?.addEventListener('click', async (e) => {
      const status = $('#cf-status', el);
      const handle = $('#cf-handle', el).value.trim();
      if (!handle) { status.textContent = 'Enter a handle.'; return; }
      e.target.disabled = true;
      status.textContent = 'Checking…';
      try {
        const user = await checkHandle(handle);
        linkCodeforces(user);
        status.textContent = `Found ${user.handle}. Syncing…`;
        const r = await syncAll({ force: true });
        close();
        toast(describeSync(r), 3600);
        rerender();
      } catch (err) {
        status.textContent = err.message;
        e.target.disabled = false;
      }
    });
  });
}

function openGithub(rerender) {
  const gh = S.platforms.gh;
  sheet('GitHub', `
    <p class="sub">Public username only. Credits the commits in your public push events —
      GitHub keeps roughly ninety days of those, so this is a rolling window, not a
      full history.</p>

    ${gh.user ? `
      <div class="card" style="margin-top:14px">
        <div class="between">
          <div><div class="h3">${esc(gh.user)}</div>
            <div class="tiny">${(gh.pushes || []).length} pushes read</div></div>
          <span class="badge info">linked</span>
        </div>
      </div>
      <button class="btn ghost block sm" style="margin-top:12px" data-unlink>Disconnect</button>
    ` : `
      <div class="field" style="margin-top:16px">
        <label>Username</label>
        <input class="input" id="gh-user" placeholder="octocat" autocapitalize="none" spellcheck="false">
        <div class="tiny" id="gh-status" style="min-height:18px"></div>
      </div>
      <button class="btn primary block" style="margin-top:12px" data-link>Connect</button>
      <div class="tiny" style="margin-top:10px">Unauthenticated requests are limited to
        sixty an hour per network, which is plenty for a few syncs a day.</div>
    `}
  `, (el, close) => {
    $('[data-unlink]', el)?.addEventListener('click', () => { unlinkGithub(); close(); rerender(); });
    $('[data-link]', el)?.addEventListener('click', async (e) => {
      const status = $('#gh-status', el);
      const user = $('#gh-user', el).value.trim();
      if (!user) { status.textContent = 'Enter a username.'; return; }
      e.target.disabled = true;
      status.textContent = 'Checking…';
      try {
        const u = await checkGithub(user);
        linkGithub(u);
        const r = await syncAll({ force: true });
        close(); toast(describeSync(r), 3400); rerender();
      } catch (err) {
        status.textContent = err.message;
        e.target.disabled = false;
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
  toast('Backup downloaded');
}

function openBackup(rerender) {
  const me = describeSave(JSON.parse(exportSave()));
  const prior = priorSave();

  sheet('Backup & restore', `
    <div class="card">
      <div class="label">This device</div>
      <div class="h3" style="margin-top:6px">${esc(me.name)} · level ${me.level}</div>
      <div class="tiny" style="margin-top:4px">
        ${esc(me.handle)} · ${me.solved} solved · ${me.commits} commits · ${me.days} days
      </div>
    </div>
    <div class="card sunk" style="margin-top:12px">
      <div class="tiny">Your solved list can be pulled again from Codeforces, but levels,
        gear and contest records live only here.</div>
    </div>
    <button class="btn primary block" style="margin-top:16px" data-download>Download backup</button>
    <button class="btn block sm" style="margin-top:8px" data-copy>Copy as text</button>
    <hr class="rule">
    <div class="label">Restore</div>
    <div class="sub" style="margin-top:6px">You confirm against a summary before anything
      is replaced, and there is one undo afterwards.</div>
    <input type="file" id="bk-file" accept="application/json,.json" class="input" style="margin-top:12px">
    <textarea class="input" id="bk-text" style="margin-top:8px" placeholder="…or paste the JSON"></textarea>
    <button class="btn block" style="margin-top:8px" data-paste>Restore from text</button>
    ${prior ? `<hr class="rule"><div class="label">Undo</div>
      <div class="sub" style="margin-top:6px">A save from before your last restore is still
        here — ${esc(prior.name)}, level ${prior.level}.</div>
      <button class="btn block sm" style="margin-top:10px" data-undo>Put that one back</button>` : ''}
  `, (el, close) => {
    $('[data-download]', el).onclick = downloadBackup;
    $('[data-copy]', el).onclick = async () => {
      try { await navigator.clipboard.writeText(exportSave()); toast('Copied'); }
      catch { toast('Could not copy — download instead.'); }
    };
    $('#bk-file', el).addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if (f) confirmRestore(await f.text(), close, rerender);
    });
    $('[data-paste]', el).onclick = () => {
      const text = $('#bk-text', el).value.trim();
      if (!text) { toast('Nothing pasted.'); return; }
      confirmRestore(text, close, rerender);
    };
    $('[data-undo]', el)?.addEventListener('click', () => {
      if (undoImport()) { close(); toast('Previous save restored'); rerender(); }
    });
  });
}

function confirmRestore(text, closeParent, rerender) {
  let incoming;
  try { incoming = describeSave(JSON.parse(text)); }
  catch { toast('That file is not valid JSON.'); return; }
  const me = describeSave(JSON.parse(exportSave()));
  const row = (k, a, b) => `<div class="between tiny" style="padding:4px 0">
    <span>${k}</span><span><span class="num">${a}</span> → <span class="num">${b}</span></span></div>`;

  dialog(`<div class="h2">Replace everything?</div>
    <div class="card sunk" style="margin-top:14px;text-align:left">
      ${row('name', esc(me.name), esc(incoming.name))}
      ${row('level', me.level, incoming.level)}
      ${row('handle', esc(me.handle), esc(incoming.handle))}
      ${row('solved', me.solved, incoming.solved)}
      ${row('days', me.days, incoming.days)}
    </div>
    <p class="tiny" style="margin:12px 0 16px">The save being replaced is kept, so this is undoable once.</p>
    <button class="btn primary block" data-yes>Restore it</button>
    <button class="btn ghost block sm" style="margin-top:8px" data-no>Cancel</button>`,
    (d, close) => {
      d.querySelector('[data-no]').onclick = close;
      d.querySelector('[data-yes]').onclick = () => {
        const r = importSave(text);
        close();
        if (!r.ok) { toast(r.error); return; }
        closeParent?.(); toast('Restored'); rerender();
      };
    });
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  bind(root, {
    edit:    () => openProfileEditor(rerender),
    cf:      () => openCodeforces(rerender),
    gh:      () => openGithub(rerender),
    sync:    async (el) => {
      el.textContent = 'Syncing…';
      const r = await syncAll({ force: true });
      toast(describeSync(r), 3400);
      rerender();
    },
    backup:  () => openBackup(rerender),
    install: async () => {
      if (canInstall()) { await promptInstall(); return; }
      sheet('Install Codify', `
        <p class="sub">This browser gives no install button, so here is the manual route.</p>
        <div class="stack s2" style="margin-top:14px">
          <div class="card pad-s"><div class="h3">iPhone — Safari</div>
            <div class="tiny">Share → Add to Home Screen.</div></div>
          <div class="card pad-s"><div class="h3">Android — Chrome</div>
            <div class="tiny">Menu → Install app.</div></div>
          <div class="card pad-s"><div class="h3">Desktop — Chrome / Edge</div>
            <div class="tiny">The install icon in the address bar.</div></div>
        </div>`);
    },
    sound:  () => { S.settings.sound = !S.settings.sound; sfx('tick'); rerender(); },
    motion: () => { S.settings.reduceMotion = !S.settings.reduceMotion; rerender(); },
    freeze: () => { if (buyFreeze()) { sfx('reward'); toast('Freeze bought'); rerender(); }
                    else toast('Not enough credits.'); },
    reset:  () => {
      dialog(`<div class="h2">Reset everything?</div>
        <p class="sub" style="margin:12px 0 8px">Every level, tier, contest and record on this
          device is deleted. Your Codeforces history is untouched and can be pulled again,
          but everything this app built on top of it is gone.</p>
        <p class="tiny" style="margin-bottom:20px">Export a backup first if you are unsure.</p>
        <button class="btn hot block" data-yes>Delete everything</button>
        <button class="btn ghost block sm" style="margin-top:8px" data-no>Keep it</button>`,
        (d, close) => {
          d.querySelector('[data-no]').onclick = close;
          d.querySelector('[data-yes]').onclick = () => { close(); resetSave(); location.reload(); };
        });
    },
  });

  $$('[data-loot]', root).forEach(b => b.onclick = () => {
    const l = LOOT_BY_ID[b.dataset.loot], r = RARITY[l.rarity];
    dialog(`<div style="font-size:38px">${l.icon}</div>
      <div class="h2" style="margin-top:10px">${esc(l.name)}</div>
      <div class="badge" style="margin-top:8px">${r.name} · +${pct(r.bonus * 100)} XP</div>
      <p class="sub" style="margin-top:14px">${esc(l.flavour)}</p>
      <button class="btn primary block" style="margin-top:18px" data-ok>Close</button>`,
      (d, close) => { d.querySelector('[data-ok]').onclick = close; });
  });

  $$('[data-theme]', root).forEach(b => b.onclick = () => {
    const id = b.dataset.theme, t = themeFor(id);
    if (ownsTheme(id)) { selectTheme(id); sfx('tick'); rerender(); return; }
    if (S.coins < t.cost) { toast(`${t.cost - S.coins} more credits needed.`); return; }
    dialog(`<div class="h2">Buy ${esc(t.name)}?</div>
      <div class="sw-big" style="background:${t.accent};margin:16px auto"></div>
      <p class="sub">${t.cost} credits. You have ${fmt(S.coins)}.</p>
      <button class="btn primary block" style="margin-top:16px" data-yes>Buy it</button>
      <button class="btn ghost block sm" style="margin-top:8px" data-no>Not now</button>`,
      (d, close) => {
        d.querySelector('[data-no]').onclick = close;
        d.querySelector('[data-yes]').onclick = () => { buyTheme(id); close(); sfx('reward'); confetti(50); rerender(); };
      });
  });
}
