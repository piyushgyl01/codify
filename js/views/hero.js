/** Hero — profile, lifetime stats, gear, achievements, the shop, and your data. */
import {
  S, THEMES, themeFor, ownsTheme, buyTheme, selectTheme, buyFreeze,
  progress, statsSnapshot, gearBonus, resetSave, exportSave, importSave,
  describeSave, priorSave, undoImport, backupFilename, saveHealthy,
  targets, pathHours, dueRetests,
} from '../state.js';
import { rankFor, nextRank, RANKS, TRACKS, GOALS, xpToNext } from '../game.js';
import { LOOT, RARITY, LOOT_BY_ID, MAX_BONUS } from '../data/loot.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { NODES } from '../data/skilltree.js';
import { GAUNTLETS } from '../data/drills.js';
import { retentionBands, calibration } from '../analytics.js';
import { openProfileEditor } from './onboarding.js';
import { canInstall, isInstalled, promptInstall } from '../pwa.js';
import { APP_VERSION } from '../version.js';
import {
  h, raw, esc, $, $$, bind, bar, ring, hm, fmt, pct, splitBar,
  sheet, dialog, toast, sfx, haptic, confetti,
} from '../ui.js';
import { icon } from '../icons.js';

export function render() {
  const p = progress();
  const rank = rankFor(p.level);
  const next = nextRank(p.level);
  const st = statsSnapshot();
  const t = targets();
  const bonus = gearBonus();
  const owned = Object.keys(S.loot).filter(id => LOOT_BY_ID[id]).length;
  const bands = retentionBands();

  const tiles = [
    [hm(st.minutes), 'logged'],
    [hm(st.effMinutes), 'effective'],
    [fmt(st.solved), 'solved'],
    [fmt(st.ships), 'shipped'],
    [`${st.skills}/${NODES.length}`, 'nodes'],
    [fmt(st.retestsPassed), 'retests held'],
    [fmt(st.drills), 'drills'],
    [`${st.gauntlets}/${GAUNTLETS.length}`, 'gauntlets'],
    [fmt(S.streak.best), 'best streak'],
    [fmt(st.quests), 'quests'],
    [fmt(st.deliberateDays), 'deliberate days'],
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
      <div class="wrap" style="justify-content:center;margin-top:14px">
        <span class="badge">${esc(TRACKS.find(x => x.id === S.profile.track)?.name || 'Generalist')}</span>
        <span class="badge">${esc(GOALS.find(g => g.id === S.profile.goal)?.name || '')}</span>
        <span class="badge">${hm(t.focus)}/day</span>
        ${raw(bonus > 1 ? `<span class="badge good">gear ×${bonus.toFixed(2)}</span>` : '')}
      </div>
      <button class="btn ghost sm" style="margin-top:14px" data-act="edit">Edit profile</button>
    </div>

    ${raw(saveHealthy() ? '' : `
      <div class="card rail" style="--rail:var(--bad);margin-top:16px">
        <div class="h3" style="color:var(--bad)">Your last save did not write</div>
        <div class="sub" style="margin-top:6px">
          Browser storage is full or blocked, so changes are being lost. Export a backup
          now, then clear space for this site.
        </div>
        <button class="btn hot block sm" style="margin-top:10px" data-act="backup">Export now</button>
      </div>`)}

    <div class="section">
      <div class="label">Lifetime</div>
      <div class="grid3">
        ${raw(tiles.map(([v, k]) =>
          `<div class="tile"><div class="v">${v}</div><div class="k">${k}</div></div>`).join(''))}
      </div>
    </div>

    ${raw(bands.total ? `
      <div class="section">
        <div class="between"><div class="label">What you still hold</div>
          <span class="badge">${pct(bands.held * 100)}</span></div>
        <div style="margin-top:8px">${splitBar([
          { pct:(bands.bands.fresh / bands.total) * 100, color:'var(--good)', name:'Fresh' },
          { pct:(bands.bands.warm  / bands.total) * 100, color:'var(--info)', name:'Warm' },
          { pct:(bands.bands.rusty / bands.total) * 100, color:'var(--warn)', name:'Rusty' },
          { pct:(bands.bands.cold  / bands.total) * 100, color:'var(--bad)',  name:'Cold' },
        ])}</div>
      </div>` : '')}

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
            <span class="tiny truncate">${have ? esc(l.name) : '—'}</span>
          </button>`;
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
                <div><div class="h3">${esc(a.name)}</div>
                  <div class="tiny">${esc(a.desc)}</div></div>
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
        ${raw(THEMES.map(t2 => {
          const owns = ownsTheme(t2.id);
          const on = S.profile.theme === t2.id;
          return `<button class="theme ${on ? 'on' : ''} ${owns ? '' : 'locked'}" data-theme="${t2.id}">
            <span class="sw" style="background:${t2.accent}"></span>
            <span class="tiny">${esc(t2.name)}</span>
            <span class="tiny state">${owns ? (on ? 'active' : 'owned') : `${t2.cost}c`}</span>
          </button>`;
        }).join(''))}
      </div>
    </div>

    <div class="section">
      <div class="label">Streak</div>
      <div class="card">
        <div class="between">
          <div><div class="num h1">${S.streak.current}</div><div class="tiny">current streak</div></div>
          <div class="right">
            <div class="num h3">${S.streak.freezes}</div>
            <div class="tiny">freezes held</div>
          </div>
        </div>
        <div class="sub" style="margin-top:10px">
          A day counts once you log 20 minutes, solve a problem, ship something, or clear
          a retest. A freeze covers one missed day automatically — you earn one every five
          levels.
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
            <div class="tiny">Everything lives in this browser. This is the only copy.</div></div>
            <span style="color:var(--dim)">›</span></div>
        </button>
        ${raw(isInstalled() ? '' : `
        <button class="card tap pad-s" data-act="install">
          <div class="between"><div><div class="h3">Install app</div>
            <div class="tiny">Runs fullscreen and works with no connection.</div></div>
            <span style="color:var(--dim)">›</span></div>
        </button>`)}
        <button class="card tap pad-s" data-act="sound">
          <div class="between"><div class="h3">Sound</div>
            <span class="badge">${S.settings.sound ? 'on' : 'off'}</span></div>
        </button>
        <button class="card tap pad-s" data-act="motion">
          <div class="between"><div class="h3">Reduce motion</div>
            <span class="badge">${S.settings.reduceMotion ? 'on' : 'off'}</span></div>
        </button>
        <button class="card tap pad-s" data-act="reset" style="border-color:color-mix(in srgb, var(--bad) 40%, transparent)">
          <div class="between"><div><div class="h3" style="color:var(--bad)">Reset everything</div>
            <div class="tiny">Deletes every log, node and level on this device.</div></div>
          </div>
        </button>
      </div>
    </div>

    <div class="center tiny" style="margin-top:28px;color:var(--faint)">
      Codify ${APP_VERSION} · all data local · since ${esc(S.profile.created || '?')}
    </div>`;
}

/* ---------------------------------- mount --------------------------------- */

export function mount(root, rerender) {
  bind(root, {
    edit:   () => openProfileEditor(rerender),
    backup: () => openBackup(rerender),
    install: () => doInstall(),
    sound:  () => { S.settings.sound = !S.settings.sound; sfx('tick'); rerender(); },
    motion: () => { S.settings.reduceMotion = !S.settings.reduceMotion; rerender(); },
    freeze: () => {
      if (buyFreeze()) { sfx('reward'); toast('Freeze bought'); rerender(); }
      else toast('Not enough credits.');
    },
    reset:  () => confirmReset(rerender),
  });

  $$('[data-loot]', root).forEach(b => b.onclick = () => {
    const l = LOOT_BY_ID[b.dataset.loot];
    const r = RARITY[l.rarity];
    dialog(`<div style="font-size:38px">${l.icon}</div>
      <div class="h2" style="margin-top:10px">${esc(l.name)}</div>
      <div class="badge" style="color:${r.color};margin-top:8px">${r.name} · +${pct(r.bonus * 100)} XP</div>
      <p class="sub" style="margin-top:14px">${esc(l.flavour)}</p>
      <button class="btn primary block" style="margin-top:18px" data-ok>Close</button>`,
      (d, close) => { d.querySelector('[data-ok]').onclick = close; });
  });

  $$('[data-theme]', root).forEach(b => b.onclick = () => {
    const id = b.dataset.theme;
    const t = themeFor(id);
    if (ownsTheme(id)) { selectTheme(id); sfx('tick'); rerender(); return; }
    if (S.coins < t.cost) { toast(`${t.cost - S.coins} more credits needed.`); return; }
    dialog(`<div class="h2">Buy ${esc(t.name)}?</div>
      <div class="sw-big" style="background:${t.accent};margin:16px auto"></div>
      <p class="sub">${t.cost} credits. You have ${fmt(S.coins)}.</p>
      <button class="btn primary block" style="margin-top:16px" data-yes>Buy it</button>
      <button class="btn ghost block sm" style="margin-top:8px" data-no>Not now</button>`,
      (d, close) => {
        d.querySelector('[data-no]').onclick = close;
        d.querySelector('[data-yes]').onclick = () => {
          buyTheme(id); close(); sfx('reward'); confetti(50); rerender();
        };
      });
  });
}

/* --------------------------------- install -------------------------------- */

async function doInstall() {
  if (canInstall()) {
    const outcome = await promptInstall();
    if (outcome === 'accepted') return;
  }
  sheet('Install Codify', `
    <p class="sub">This browser gives no install button to press, so here is the manual route.</p>
    <div class="stack s2" style="margin-top:14px">
      <div class="card pad-s"><div class="h3">iPhone / iPad — Safari</div>
        <div class="tiny" style="margin-top:4px">Share → Add to Home Screen.</div></div>
      <div class="card pad-s"><div class="h3">Android — Chrome</div>
        <div class="tiny" style="margin-top:4px">Menu → Install app, or Add to Home screen.</div></div>
      <div class="card pad-s"><div class="h3">Desktop — Chrome / Edge</div>
        <div class="tiny" style="margin-top:4px">The install icon at the right of the address bar.</div></div>
    </div>
    <div class="card sunk" style="margin-top:14px">
      <div class="tiny">Installing needs HTTPS. Everything is precached, so once it is on
        your home screen it opens and works with no connection at all.</div>
    </div>`);
}

/* ----------------------------- backup & restore --------------------------- */

function downloadBackup() {
  const text = exportSave();
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
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
        ${me.days} days · ${me.sessions} sessions · ${me.problems} problems ·
        ${me.hours}h · ${me.skills} nodes
      </div>
    </div>

    <div class="card sunk" style="margin-top:12px">
      <div class="sub">Everything is in this browser and nowhere else. Clearing site data
        wipes it, and on most platforms so does uninstalling the app. A dated file on
        disk is the only thing between you and starting over.</div>
    </div>

    <button class="btn primary block" style="margin-top:16px" data-download>Download backup</button>
    <button class="btn block sm" style="margin-top:8px" data-copy>Copy as text</button>

    <hr class="rule">

    <div class="label">Restore</div>
    <div class="sub" style="margin-top:6px">A file or pasted text. You get a summary to
      confirm against before anything is replaced, and one undo afterwards.</div>
    <input type="file" id="bk-file" accept="application/json,.json" class="input" style="margin-top:12px">
    <textarea class="input" id="bk-text" style="margin-top:8px" placeholder="…or paste the JSON here"></textarea>
    <button class="btn block" style="margin-top:8px" data-paste>Restore from text</button>

    ${prior ? `
      <hr class="rule">
      <div class="label">Undo</div>
      <div class="sub" style="margin-top:6px">
        A save from before your last restore is still here — ${esc(prior.name)},
        level ${prior.level}, ${prior.days} days.
      </div>
      <button class="btn block sm" style="margin-top:10px" data-undo>Put that one back</button>` : ''}
  `, (el, close) => {
    $('[data-download]', el).onclick = downloadBackup;

    $('[data-copy]', el).onclick = async () => {
      try { await navigator.clipboard.writeText(exportSave()); toast('Copied to clipboard'); }
      catch { toast('Could not copy — download the file instead.'); }
    };

    $('#bk-file', el).addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      confirmRestore(await file.text(), close, rerender);
    });

    $('[data-paste]', el).onclick = () => {
      const text = $('#bk-text', el).value.trim();
      if (!text) { toast('Nothing pasted.'); return; }
      confirmRestore(text, close, rerender);
    };

    $('[data-undo]', el)?.addEventListener('click', () => {
      if (undoImport()) { close(); toast('Previous save restored'); rerender(); }
      else toast('Nothing to undo.');
    });
  });
}

/**
 * Confirm against a summary before overwriting. Restoring the wrong file is
 * otherwise silent and total, and the summary is the only chance to catch it.
 */
function confirmRestore(text, closeParent, rerender) {
  let incoming;
  try { incoming = describeSave(JSON.parse(text)); }
  catch { toast('That file is not valid JSON.'); return; }

  const me = describeSave(JSON.parse(exportSave()));
  const row = (label, a, b) => `<div class="between tiny" style="padding:4px 0">
    <span style="color:var(--faint)">${label}</span>
    <span><span class="num">${a}</span> → <span class="num" style="color:var(--accent)">${b}</span></span>
  </div>`;

  dialog(`
    <div class="h2">Replace everything?</div>
    <div class="card sunk" style="margin-top:14px;text-align:left">
      ${row('name', esc(me.name), esc(incoming.name))}
      ${row('level', me.level, incoming.level)}
      ${row('days', me.days, incoming.days)}
      ${row('sessions', me.sessions, incoming.sessions)}
      ${row('problems', me.problems, incoming.problems)}
      ${row('nodes', me.skills, incoming.skills)}
      <div class="tiny" style="margin-top:8px;color:var(--faint)">
        covering ${esc(incoming.firstDay || '?')} → ${esc(incoming.lastDay || '?')}
      </div>
    </div>
    <p class="tiny" style="margin:12px 0 16px">The save being replaced is kept, so you can undo this once.</p>
    <button class="btn primary block" data-yes>Restore it</button>
    <button class="btn ghost block sm" style="margin-top:8px" data-no>Cancel</button>`,
    (d, close) => {
      d.querySelector('[data-no]').onclick = close;
      d.querySelector('[data-yes]').onclick = () => {
        const result = importSave(text);
        close();
        if (!result.ok) { toast(result.error); return; }
        closeParent?.();
        toast('Restored');
        rerender();
      };
    });
}

/* ---------------------------------- reset --------------------------------- */

function confirmReset(rerender) {
  dialog(`<div class="h2">Reset everything?</div>
    <p class="sub" style="margin:12px 0 8px">
      Every session, problem, ship, node and level on this device is deleted.
      This cannot be undone.</p>
    <p class="tiny" style="margin-bottom:20px">
      If you have not exported a backup, cancel and do that first.</p>
    <button class="btn hot block" data-yes>Delete everything</button>
    <button class="btn ghost block sm" style="margin-top:8px" data-no>Keep it</button>`,
    (d, close) => {
      d.querySelector('[data-no]').onclick = close;
      d.querySelector('[data-yes]').onclick = () => {
        close(); resetSave(); location.reload();
      };
    });
}
