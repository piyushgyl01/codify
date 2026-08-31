/**
 * The session runner: timers, combos, gauntlet health, and the results screen.
 *
 * Time is measured, not assumed. The focus entry a finished session writes uses
 * the seconds that actually elapsed, so a drill you rushed and a drill you sat
 * through properly are not the same row in the log afterwards.
 */
import { S, finishSession } from '../state.js';
import { getSession } from '../data/drills.js';
import { pathFor } from '../data/skilltree.js';
import { modeFor } from '../data/practice.js';
import {
  h, raw, esc, $, $$, hm, mmss, fmt, pct, fullscreen, dialog, toast,
  sfx, haptic, confetti, rewardToast, bar,
} from '../ui.js';
import { icon } from '../icons.js';

/** Chained steps build a multiplier. Capped so it stays earnable, not silly. */
const COMBO_STEP = 0.08;
const COMBO_CAP = 1.6;
const comboMult = chain => Math.min(COMBO_CAP, 1 + COMBO_STEP * chain);

/** Flatten a session into work steps with rests between them. */
function buildSteps(session) {
  const out = [];
  session.steps.forEach((s, i) => {
    out.push({ ...s, kind: 'work', index: i });
    if (i < session.steps.length - 1 && session.rest > 0) {
      out.push({ label: 'Rest', minutes: session.rest, kind: 'rest' });
    }
  });
  return out;
}

export function startSession(id, onDone) {
  const session = getSession(id);
  if (!session) return;

  const steps = buildSteps(session);
  const workCount = session.steps.length;
  const path = pathFor(session.path);
  const mode = modeFor(session.mode);

  /* ------------------------------- run state ------------------------------ */
  let idx = 0;
  let remaining = steps[0].minutes * 60;
  let elapsedWork = 0;         // real seconds spent on work steps
  let paused = false;
  let chain = 0;
  let bestChain = 0;
  const results = [];          // one per work step: { ...step, done }

  // gauntlet state
  const isG = !!session.isGauntlet;
  let hp = isG ? session.hp : 0;
  let focus = isG ? session.focus : 0;
  const baseDamage = isG ? session.hp / workCount : 0;
  let lastTaunt = 100;

  sfx('start'); haptic(14);

  const close = fullscreen(shell(), (el, dismiss) => {
    const els = {
      timer: $('#pl-timer', el),
      label: $('#pl-label', el),
      note: $('#pl-note', el),
      step: $('#pl-step', el),
      segs: $('#pl-segs', el),
      combo: $('#pl-combo', el),
      hp: $('#pl-hp', el),
      hpbar: $('#pl-hpbar', el),
      focus: $('#pl-focus', el),
      taunt: $('#pl-taunt', el),
      body: $('#pl-body', el),
      foot: $('#pl-foot', el),
    };

    /* ------------------------------- painting ----------------------------- */

    const paintSegs = () => {
      els.segs.innerHTML = session.steps.map((_, i) => {
        const r = results[i];
        const cls = r ? (r.done ? 'ok' : 'skip') : (steps[idx]?.index === i ? 'now' : '');
        return `<i class="${cls}"></i>`;
      }).join('');
    };

    const paintCombo = () => {
      if (chain < 2) { els.combo.innerHTML = ''; return; }
      els.combo.innerHTML =
        `<div class="combo">×${comboMult(chain).toFixed(2)} <span>${chain} chained</span></div>`;
    };

    const paintGauntlet = () => {
      if (!isG) return;
      const ratio = Math.max(0, hp / session.hp);
      els.hp.textContent = `${Math.max(0, Math.ceil(hp))} HP`;
      els.hpbar.style.width = `${ratio * 100}%`;
      els.focus.innerHTML = Array.from({ length: session.focus }, (_, i) =>
        `<i class="${i < focus ? 'on' : ''}"></i>`).join('');
    };

    const taunt = () => {
      if (!isG) return;
      const at = (hp / session.hp) * 100;
      for (const mark of [75, 50, 25, 0]) {
        if (lastTaunt > mark && at <= mark) {
          lastTaunt = mark;
          els.taunt.textContent = session.taunts[mark] || '';
          els.taunt.classList.remove('show');
          void els.taunt.offsetWidth;         // restart the animation
          els.taunt.classList.add('show');
          break;
        }
      }
    };

    const paintStep = () => {
      const s = steps[idx];
      if (!s) return;
      const workIndex = s.kind === 'work' ? s.index + 1 : null;
      els.label.textContent = s.label;
      els.note.textContent = s.note || (s.kind === 'rest' ? 'Stand up. Look at something far away.' : '');
      els.step.textContent = s.kind === 'rest'
        ? 'Rest'
        : `Step ${workIndex} of ${workCount}`;
      el.querySelector('.pl-stage').classList.toggle('resting', s.kind === 'rest');
      els.foot.innerHTML = s.kind === 'rest'
        ? `<button class="btn primary block" data-act="next">Skip the rest</button>`
        : `<div class="row">
             <button class="btn ghost" data-act="skip">Skip</button>
             <button class="btn grow" data-act="pause">${paused ? 'Resume' : 'Pause'}</button>
             <button class="btn ghost" data-act="add">+5m</button>
           </div>
           <button class="btn primary block" style="margin-top:10px" data-act="done">Done</button>`;
      wireFoot();
      paintSegs();
      paintTimer();
    };

    const paintTimer = () => {
      const over = remaining < 0;
      els.timer.textContent = mmss(Math.abs(remaining));
      els.timer.classList.toggle('over', over);
      els.timer.classList.toggle('paused', paused);
      const s = steps[idx];
      const total = (s?.minutes || 1) * 60;
      const done = Math.min(1, Math.max(0, (total - remaining) / total));
      $('#pl-prog', el).style.width = `${done * 100}%`;
    };

    /* ------------------------------ advancing ----------------------------- */

    const recordWork = done => {
      const s = steps[idx];
      results[s.index] = { ...s, done };

      if (done) {
        chain += 1;
        bestChain = Math.max(bestChain, chain);
        if (isG) { hp -= baseDamage * comboMult(chain); taunt(); }
        sfx('done'); haptic(12);
      } else {
        chain = 0;
        if (isG) {
          focus -= 1;
          sfx('fail'); haptic(30);
        }
      }
      paintCombo();
      paintGauntlet();
    };

    const advance = () => {
      // A gauntlet ends the moment you are out of focus, win or lose.
      if (isG && focus <= 0) return end(false);
      if (isG && hp <= 0) return end(true);

      idx += 1;
      if (idx >= steps.length) return end(isG ? hp <= 0 : true);

      remaining = steps[idx].minutes * 60;
      paused = false;
      paintStep();
    };

    const wireFoot = () => {
      const act = name => els.foot.querySelector(`[data-act="${name}"]`);
      act('done')?.addEventListener('click', () => { recordWork(true); advance(); });
      act('skip')?.addEventListener('click', () => { recordWork(false); advance(); });
      act('next')?.addEventListener('click', advance);
      act('pause')?.addEventListener('click', () => { paused = !paused; paintStep(); });
      act('add')?.addEventListener('click', () => { remaining += 300; paintTimer(); haptic(8); });
    };

    /* -------------------------------- ticking ----------------------------- */

    const timer = setInterval(() => {
      if (paused) return;
      const s = steps[idx];
      if (!s) return;
      remaining -= 1;
      if (s.kind === 'work') elapsedWork += 1;
      // A rest ends itself; a work step runs into overtime and waits for you.
      if (s.kind === 'rest' && remaining <= 0) { advance(); return; }
      paintTimer();
    }, 1000);

    /* --------------------------------- end -------------------------------- */

    function end(passed) {
      clearInterval(timer);

      // Steps never reached count as not done.
      for (let i = 0; i < workCount; i++) if (!results[i]) results[i] = { ...session.steps[i], done: false };

      const seconds = Math.max(60, elapsedWork);
      const reward = finishSession(session, {
        steps: results,
        seconds,
        comboMult: comboMult(bestChain),
        bestCombo: bestChain,
        passed: isG ? passed : true,
      });

      const doneCount = results.filter(r => r.done).length;
      const won = isG ? passed : true;

      if (won) { sfx('reward'); confetti(isG ? 160 : 70); } else { sfx('fail'); }

      els.body.innerHTML = `
        <div class="pl-result">
          <div class="pl-result-glyph" style="color:${won ? 'var(--accent)' : 'var(--bad)'}">
            ${isG ? (won ? session.icon : '✕') : '✓'}</div>
          <div class="h1" style="margin-top:12px">
            ${isG ? (won ? 'Gauntlet cleared' : 'It survived') : 'Session complete'}</div>
          <div class="sub" style="margin-top:6px">
            ${doneCount}/${workCount} steps · ${hm(Math.round(seconds / 60))} of work
            ${bestChain >= 2 ? ` · ×${comboMult(bestChain).toFixed(2)} combo` : ''}
          </div>

          <div class="grid2" style="margin-top:20px">
            <div class="tile"><div class="v">+${fmt(reward.xp)}</div><div class="k">xp</div></div>
            <div class="tile"><div class="v">+${fmt(reward.coins)}</div><div class="k">credits</div></div>
          </div>

          ${reward.drop ? `
            <div class="card rail" style="--rail:var(--warn);margin-top:14px;text-align:left">
              <div class="label">Gear found</div>
              <div class="row" style="margin-top:8px">
                <span style="font-size:24px">${reward.drop.icon}</span>
                <div class="grow"><div class="h3">${esc(reward.drop.name)}</div>
                <div class="tiny">${esc(reward.drop.flavour)}</div></div>
              </div>
            </div>` : ''}

          ${isG && !won ? `
            <div class="card sunk" style="margin-top:14px;text-align:left">
              <div class="sub">You ran out of focus with ${Math.ceil(hp)} HP left.
                Partial XP is yours. Come back when the steps you skipped are the
                ones you can do.</div>
            </div>` : ''}
        </div>`;

      els.foot.innerHTML = `<button class="btn primary block" data-act="close">Done</button>`;
      els.foot.querySelector('[data-act="close"]').onclick = () => {
        dismiss();
        rewardToast(reward);
        onDone?.();
      };
    }

    /* ------------------------------- quitting ----------------------------- */

    $('#pl-quit', el).onclick = () => {
      dialog(`<div class="h2">Leave the session?</div>
        <p class="sub" style="margin:12px 0 20px">
          Steps you finished still count and you keep partial XP.
          ${isG ? 'The gauntlet records the attempt.' : ''}</p>
        <button class="btn hot block" data-yes>Leave</button>
        <button class="btn ghost block sm" style="margin-top:8px" data-no>Keep going</button>`,
        (d, closeDialog) => {
          d.querySelector('[data-no]').onclick = closeDialog;
          d.querySelector('[data-yes]').onclick = () => { closeDialog(); end(false); };
        });
    };

    paintStep();
    paintCombo();
    paintGauntlet();
  });

  /* -------------------------------- markup -------------------------------- */

  function shell() {
    return `
    <div class="player">
      <div class="pl-top">
        <button class="x" id="pl-quit" aria-label="Leave">✕</button>
        <div class="grow center">
          <div class="h3 truncate">${esc(session.name)}</div>
          <div class="tiny" id="pl-step"></div>
        </div>
        <span class="badge" style="color:${path.color}">${path.short}</span>
      </div>

      <div class="pl-segs" id="pl-segs"></div>

      ${isG ? `
        <div class="pl-gauntlet">
          <div class="between">
            <span class="num h3" id="pl-hp">${session.hp} HP</span>
            <span class="pl-focus" id="pl-focus"></span>
          </div>
          <div class="pl-hpbar"><i id="pl-hpbar" style="width:100%"></i></div>
          <div class="pl-taunt" id="pl-taunt"></div>
        </div>` : ''}

      <div class="pl-body" id="pl-body">
        <div class="pl-stage">
          <div class="pl-timer num" id="pl-timer">00:00</div>
          <div class="pl-progress"><i id="pl-prog"></i></div>
          <div class="h2" id="pl-label" style="margin-top:22px"></div>
          <div class="sub" id="pl-note" style="margin-top:8px"></div>
          <div id="pl-combo" style="margin-top:16px"></div>
        </div>
      </div>

      <div class="pl-foot" id="pl-foot"></div>
    </div>`;
  }
}
