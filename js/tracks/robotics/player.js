/** The session runner: the daily drill, practice sets and boss fights. */
import { S } from '../../state.js';
import {
  currentQuestion, answer, sessionOver, finishSession, abandonSession,
  startDrill, startPractice, startBoss, bossReady,
} from './actions.js';
import { skillById } from './skills.js';
import { monthByN } from './roadmap.js';
import { bossFor, BOSS_HP, BOSS_HEARTS, BOSS_QUESTIONS, BOSS_SECS } from './bosses.js';
import { RARITY } from '../../data/loot.js';
import { drillCombo, bossCombo } from '../../game.js';
import { fullscreen, esc, toast, rewardToast, confetti, sfx, haptic, fmt, dialog } from '../../ui.js';
import { icon } from '../../icons.js';

/* ---------------------------------- entry --------------------------------- */

export function openDrill(rerender) {
  if (S.active && S.active.mode !== 'drill') { toast('Finish the session you already started first.'); return run(rerender); }
  if (!startDrill()) { toast('Today\'s drill is done. Practise any skill from the Skills tab.'); return; }
  sfx('start'); run(rerender);
}

export function openPractice(skillId, rerender) {
  if (S.active && (S.active.mode !== 'practice' || S.active.skill !== skillId)) {
    toast('Finish the session you already started first.'); return run(rerender);
  }
  if (!startPractice(skillId)) { toast('That skill is not open yet.'); return; }
  sfx('start'); run(rerender);
}

export function openBoss(month, rerender) {
  if (S.active && S.active.mode !== 'boss') { toast('Finish the session you already started first.'); return run(rerender); }
  if (!S.active) {
    const ready = bossReady(month);
    if (!ready.ok) { toast(esc(ready.why)); return; }
    startBoss(month);
  }
  sfx('start'); run(rerender);
}

export function resumeSession(rerender) { if (S.active) run(rerender); }

/* ---------------------------------- runner -------------------------------- */

function run(rerender) {
  let phase = sessionOver() ? 'over' : 'ask';
  let last = null, summary = null, tick = null, el = null;

  const close = fullscreen('<div class="player" role="dialog" aria-modal="true"></div>', wrap => {
    el = wrap.querySelector('.player');
  });
  const exit = () => { clearInterval(tick); close(); rerender(); };

  if (phase === 'over') { summary = finishSession(); phase = 'done'; }
  paint();

  function paint() {
    clearInterval(tick);
    if (phase === 'done') { el.innerHTML = results(summary); wireResults(); return; }
    const a = S.active;
    el.innerHTML = top(a) + progressStrip(a) + `<div class="pl-body">${body(a)}</div>` + foot(a);
    wire(a);
    if (a.mode === 'boss' && phase === 'ask') countdown(a);
  }

  /* -------------------------------- pieces -------------------------------- */

  function top(a) {
    const title = a.mode === 'drill' ? 'Daily drill'
      : a.mode === 'practice' ? skillById(a.skill)?.name || 'Practice'
      : bossFor(a.month).name;
    const label = a.mode === 'drill' ? 'Five questions, graded'
      : a.mode === 'practice' ? 'Practice' : `Month ${a.month} boss`;
    const count = a.mode === 'boss' ? `${a.asked + (phase === 'ask' ? 1 : 0)}/${BOSS_QUESTIONS}`
      : `${Math.min(a.i + (phase === 'ask' ? 1 : 0), a.qs.length)}/${a.qs.length}`;
    return `<div class="pl-top">
      <button class="x" data-x aria-label="${a.mode === 'boss' ? 'Leave the fight' : 'Pause'}">${a.mode === 'boss' ? '✕' : '❚❚'}</button>
      <div class="grow"><div class="label">${esc(label)}</div><div class="h3 truncate">${esc(title)}</div></div>
      <div class="h3 num">${count}</div>
    </div>`;
  }

  function progressStrip(a) {
    const combo = a.run >= 2
      ? `<div class="combo-wrap"><span class="combo">×${(a.mode === 'boss' ? bossCombo(a.run) : drillCombo(a.run)).toFixed(2)}<span>${a.run} in a row</span></span></div>` : '';
    if (a.mode !== 'boss') {
      const segs = a.qs.map((_, i) => {
        const r = a.results[i];
        const cls = r ? (r.correct ? 'ok' : 'miss') : i === a.i && phase === 'ask' ? 'now' : '';
        return `<i class="${cls}"></i>`;
      }).join('');
      return `<div class="pl-segs">${segs}</div>${combo}`;
    }
    const boss = bossFor(a.month);
    const hearts = Array.from({ length: BOSS_HEARTS }, (_, i) =>
      `<span class="heart ${i < a.hearts ? 'on' : ''}">${icon('heart', 18).value}</span>`).join('');
    const taunt = a.taunt === 'intro' ? boss.intro : a.taunt === 'half' ? boss.half : '';
    return `<div class="pl-boss">
      <div class="row">
        <div class="boss-ico">${boss.icon}</div>
        <div class="grow">
          <div class="between"><span class="tiny">HP</span><span class="tiny num">${a.hp} / ${BOSS_HP}</span></div>
          <div class="pl-hp"><i style="width:${(a.hp / BOSS_HP) * 100}%"></i></div>
        </div>
        <div class="hearts" aria-label="${a.hearts} hearts left">${hearts}</div>
      </div>
      ${taunt ? `<div class="pl-taunt">“${esc(taunt)}”</div>` : ''}
      ${phase === 'ask' ? '<div class="pl-clock"><i data-clock></i></div>' : ''}
    </div>${combo}`;
  }

  function questionHead(a, q) {
    const skill = skillById(q.skill), month = monthByN(skill.month);
    const review = a.mode === 'drill' && q.wasDue ? '<span class="badge warn">review</span>' : '';
    return `<div class="row" style="gap:8px;flex-wrap:wrap">
        <span class="badge" style="background:${month.color}">M${month.n}</span>
        <span class="tiny">${esc(skill.name)}</span>${review}
      </div>
      <div class="pl-question">${esc(q.q)}</div>`;
  }

  function body(a) {
    const q = phase === 'ask' ? currentQuestion() : last.q;
    let out = `<div class="pl-q">${questionHead(a, q)}`;

    if (q.kind === 'mc') {
      out += `<div class="stack s2" style="margin-top:18px">${q.options.map((o, i) => {
        let cls = '';
        if (phase === 'feedback') {
          if (i === q.correct) cls = 'right';
          else if (i === last.pick) cls = 'wrong';
        }
        return `<button class="opt-btn ${cls}" data-opt="${i}" ${phase === 'feedback' ? 'disabled' : ''}>
          <span class="opt-key">${'ABCD'[i]}</span><span class="grow">${esc(o)}</span></button>`;
      }).join('')}</div>`;
    } else if (phase === 'ask') {
      out += `<div class="pl-input">
        <button class="btn sm" data-sign aria-label="Flip the sign">±</button>
        <input class="input num" id="pl-in" inputmode="decimal" autocomplete="off" autocapitalize="off"
               spellcheck="false" placeholder="Your answer" aria-label="Your answer">
        ${q.unit ? `<span class="pl-unit">${esc(q.unit)}</span>` : ''}
      </div>`;
    }

    if (phase === 'feedback') out += feedback(a, last);
    return out + '</div>';
  }

  function feedback(a, r) {
    const good = r.correct;
    const gain = a.mode === 'boss'
      ? (good ? `${r.dmg} damage` : r.given === '—' ? 'Out of time · −1 heart' : '−1 heart')
      : good ? (r.xp ? `+${r.xp} XP` : 'Right — practice cap reached') : 'No XP';
    return `<div class="pl-feedback ${good ? 'good' : 'bad'}">
      <div class="between"><div class="h2">${good ? '✓ Right' : '✗ Not quite'}</div><span class="badge">${esc(gain)}</span></div>
      ${!good ? `<div class="sub" style="margin-top:6px"><b>Answer:</b> ${esc(r.expected)}${r.q.kind === 'num' && r.given !== '—' ? ` · you said ${esc(r.given)}` : ''}</div>` : ''}
      ${r.note ? `<div class="sub" style="margin-top:4px">${esc(r.note)}</div>` : ''}
      <div class="sub" style="margin-top:8px">${esc(r.q.explain || '')}</div>
    </div>`;
  }

  function foot(a) {
    if (phase === 'feedback') {
      const over = sessionOver();
      return `<div class="pl-foot"><button class="btn primary block" data-next>${over ? 'See results' : 'Next'}</button></div>`;
    }
    const q = currentQuestion();
    return q.kind === 'num'
      ? `<div class="pl-foot"><button class="btn primary block" data-check>Check</button></div>`
      : `<div class="pl-foot"><div class="tiny center">Tap an answer</div></div>`;
  }

  /* -------------------------------- actions ------------------------------- */

  function submit(input, pick = null) {
    const q = currentQuestion();
    const r = answer(input);
    last = { ...r, q, pick };
    phase = 'feedback';
    if (r.correct) { sfx('done'); haptic(10); } else { sfx('fail'); haptic([20, 40, 20]); }
    paint();
  }

  function next() {
    if (sessionOver()) {
      summary = finishSession();
      phase = 'done';
      celebrate(summary);
    } else phase = 'ask';
    paint();
  }

  function countdown(a) {
    const secs = BOSS_SECS[a.q.kind] || 60;
    const bar = el.querySelector('[data-clock]');
    const step = () => {
      const left = secs - (Date.now() - a.qStartedAt) / 1000;
      if (bar) {
        bar.style.width = `${Math.max(0, (left / secs) * 100)}%`;
        bar.classList.toggle('low', left < 10);
      }
      if (left <= 0) { clearInterval(tick); submit(null); }
    };
    step();
    tick = setInterval(step, 250);
  }

  function wire(a) {
    el.querySelector('[data-x]').onclick = () => {
      if (a.mode !== 'boss') { clearInterval(tick); close(); rerender(); toast('Paused — pick it up from Today or Robotics.'); return; }
      dialog(`<div class="h2">Leave the fight?</div>
        <p class="sub" style="margin:10px 0 18px">Walking away counts as a loss, and you can try again tomorrow.</p>
        <button class="btn hot block" data-yes>Leave</button>
        <button class="btn ghost block sm" style="margin-top:8px" data-no>Keep fighting</button>`,
        (d, closeD) => {
          d.querySelector('[data-no]').onclick = closeD;
          d.querySelector('[data-yes]').onclick = () => {
            closeD(); clearInterval(tick);
            summary = abandonSession(); phase = 'done'; celebrate(summary); paint();
          };
        });
    };

    el.querySelectorAll('[data-opt]').forEach(b => {
      b.onclick = () => { if (phase === 'ask') submit(+b.dataset.opt, +b.dataset.opt); };
    });

    const input = el.querySelector('#pl-in');
    if (input) {
      setTimeout(() => input.focus(), 60);
      const go = () => {
        if (!input.value.trim()) { input.focus(); toast('Type a number first.'); return; }
        submit(input.value.trim());
      };
      el.querySelector('[data-check]').onclick = go;
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      el.querySelector('[data-sign]').onclick = () => {
        const v = input.value.trim();
        input.value = v.startsWith('-') ? v.slice(1) : `-${v}`;
        input.focus();
      };
    }

    const nx = el.querySelector('[data-next]');
    if (nx) {
      nx.onclick = next;
      setTimeout(() => nx.focus(), 30);
    }
  }

  /* -------------------------------- results ------------------------------- */

  function celebrate(s) {
    if (!s) return;
    const big = (s.mode === 'drill' && s.perfect) || (s.mode === 'boss' && s.won);
    if (big) { confetti(s.mode === 'boss' ? 160 : 100); sfx('reward'); }
    rewardToast(s.reward);
  }

  function results(s) {
    if (!s) return `<div class="pl-result"><div class="h2">Nothing to show.</div>
      <button class="btn primary block" style="margin-top:20px" data-done>Done</button></div>`;
    let glyph, title, line, cls = '';
    if (s.mode === 'boss') {
      const boss = bossFor(s.month);
      glyph = s.won ? boss.icon : '✕'; cls = s.won ? '' : 'lost';
      title = s.won ? `${boss.name} is down` : `${boss.name} survived`;
      line = s.won ? boss.won : boss.lost;
    } else {
      glyph = s.mode === 'drill' && s.perfect ? '💯' : '✓';
      title = `${s.score} / ${s.total}`;
      line = s.mode === 'drill'
        ? (s.perfect ? 'A clean sheet.' : 'Drill done — the streak is safe for today.')
        : s.capped ? 'Practice XP is capped for today. The reps still count.' : 'Practice set done.';
    }
    const drop = s.drop ? `<div class="card drop" style="--rc:${RARITY[s.drop.rarity].color}">
        <div class="row"><div class="g-ico">${s.drop.icon}</div>
        <div class="grow"><div class="label">${esc(RARITY[s.drop.rarity].name)} drop</div>
          <div class="h3">${esc(s.drop.name)}</div>
          <div class="tiny">${s.drop.dupe ? `Already owned — converted to ${s.drop.credit} credits` : `+${Math.round(s.drop.bonus * 100)}% XP, permanently`}</div></div></div></div>` : '';
    const rows = (s.results || []).map(r => `<div class="between res-row">
        <span class="${r.correct ? 'ok' : 'miss'}">${r.correct ? '✓' : '✗'}</span>
        <span class="grow sub truncate">${esc(skillById(r.skill)?.name || r.skill)}</span>
        <span class="tiny num">${s.mode === 'boss' ? (r.dmg ? `${r.dmg} dmg` : '') : r.xp ? `+${r.xp}` : ''}</span></div>`).join('');

    return `<div class="pl-body"><div class="pl-result">
      <div class="pl-result-glyph ${cls}">${glyph}</div>
      <div class="h1" style="margin-top:16px">${esc(title)}</div>
      <div class="sub" style="margin-top:6px">${esc(line)}</div>
      <div class="grid3" style="margin-top:20px">
        <div class="tile"><div class="v">+${fmt(s.reward?.xp || 0)}</div><div class="k">XP</div></div>
        <div class="tile"><div class="v">+${fmt(s.reward?.coins || 0)}</div><div class="k">credits</div></div>
        <div class="tile"><div class="v">${s.best || 0}</div><div class="k">best run</div></div>
      </div>
      ${drop ? `<div style="margin-top:14px">${drop}</div>` : ''}
      ${rows ? `<div class="card" style="margin-top:14px;text-align:left">${rows}</div>` : ''}
    </div></div>
    <div class="pl-foot"><button class="btn primary block" data-done>Done</button></div>`;
  }

  function wireResults() {
    const b = el.querySelector('[data-done]');
    b.onclick = exit;
    setTimeout(() => b.focus(), 30);
  }
}
