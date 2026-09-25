/** The session runner, shared by every track: the daily check, testing out of a week, practice and boss fights. */
import { S } from '../state.js';
import * as E from '../learn/session.js';
import { startBoss, bossReady } from '../tracks/robotics/actions.js';
import { skillById } from '../skillbook.js';
import { monthByN as roboMonth } from '../tracks/robotics/roadmap.js';
import { monthByN as codeMonth } from '../tracks/cp/plan.js';
import { bossFor, BOSS_HP, BOSS_HEARTS } from '../tracks/robotics/bosses.js';
import { RARITY } from '../data/loot.js';
import { drillCombo, bossCombo, roundFor, daysBetween } from '../game.js';
import { fullscreen, esc, toast, rewardToast, confetti, sfx, haptic, fmt, dialog, relDays } from '../ui.js';
import { icon } from '../icons.js';

const { currentQuestion, answer, sessionOver, finishSession, abandonSession, timeLimit, markShown } = E;
const monthOf = (track, n) => (track === 'cp' ? codeMonth(n) : roboMonth(n));
const busy = rerender => { toast('Finish the session you already started first.'); run(rerender); };

/* ---------------------------------- entry --------------------------------- */

export function openMission(track, rerender) {
  const a = S.active;
  if (a && !(a.track === track && (a.mode === 'mission' || a.mission))) return busy(rerender);
  if (!E.startMission(track)) {
    const m = E.mission(track);
    toast(m.check && !m.done ? 'The check is done — finish the rest of the mission.' : 'Today\'s mission is done. The next one opens tomorrow.');
    return;
  }
  sfx('start'); run(rerender);
}

export function openTestOut(track, week, rerender) {
  const a = S.active;
  if (a && !(a.track === track && a.mode === 'testout' && a.week === week)) return busy(rerender);
  if (!E.startTestOut(track, week)) { toast('You can try that once a day.'); return; }
  sfx('start'); run(rerender);
}

export function openPractice(track, skillId, rerender) {
  const a = S.active;
  if (a && !(a.mode === 'practice' && a.skill === skillId)) return busy(rerender);
  if (!E.startPractice(track, skillId)) { toast('That skill is not open yet.'); return; }
  sfx('start'); run(rerender);
}

export function openBoss(month, rerender) {
  if (S.active && S.active.mode !== 'boss') return busy(rerender);
  if (!S.active) {
    const ready = bossReady(month);
    if (!ready.ok) { toast(esc(ready.why)); return; }
    startBoss(month);
  }
  sfx('start'); run(rerender);
}

export function resumeSession(rerender) { if (S.active) run(rerender); }

export const clock = s => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;

/** A skill's round against the last time it was played. */
export function versus(g) {
  const p = g.prev;
  if (!p) return 'First round';
  const was = `last time ${p.right}/${p.asked} in ${clock(p.secs)}`;
  if (g.level > p.level) return `A level harder than before · ${was}`;
  if (g.right == null) return `Last time: ${p.right}/${p.asked} in ${clock(p.secs)} at level ${p.level}`;
  const now = g.right / g.n, then = p.right / p.asked;
  const pace = g.secs / g.n - p.secs / p.asked;
  const edge = now > then ? 'more right than last time' : now < then ? 'fewer right than last time'
    : Math.abs(pace) < 1 ? 'same as last time' : pace < 0 ? `${Math.round(-pace)}s a question faster` : `${Math.round(pace)}s a question slower`;
  return `${edge} · ${was}`;
}

const moveLine = g => (g.move > 0 ? `Level ${g.level} → ${g.to} ▲` : g.move < 0 ? `Level ${g.level} → ${g.to} ▼` : `Stays at level ${g.to}`);

/** What the skill's next round will ask, and when. */
function nextLine(g, a) {
  const e = S.tracks[a.track].skills?.[g.skill], n = roundFor(g.to).n, when = relDays(daysBetween(a.day, e?.due || a.day));
  return g.move > 0 ? `Next time ${when}: ${n} questions, less time on each`
    : g.move < 0 ? `Back ${when} with an easier round of ${n}` : `Same round again ${when}`;
}

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
    if (phase === 'ask') markShown();
    el.innerHTML = top(a) + progressStrip(a) + `<div class="pl-body">${body(a)}</div>` + foot(a);
    wire(a);
    if (phase === 'ask' && timeLimit()) countdown(a);
  }

  /* -------------------------------- pieces -------------------------------- */

  function top(a) {
    const title = a.mode === 'mission' ? `Mission ${a.n}`
      : a.mode === 'testout' ? `Test out of week ${a.week}`
      : a.mode === 'practice' ? skillById(a.skill)?.name || 'Practice'
      : bossFor(a.month).name;
    const label = a.mode === 'mission' ? 'Prove it'
      : a.mode === 'testout' ? `${E.TEST_OUT.pass} of ${a.qs.length} right skips the week`
      : a.mode === 'practice' ? 'Practice · no clock, no levels' : a.mission ? `Mission ${a.mission} · month ${a.month} boss` : `Month ${a.month} boss`;
    const count = a.mode === 'boss' ? `${a.asked + (phase === 'ask' ? 1 : 0)}/${a.questions}`
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
      const segs = a.qs.map((q, i) => {
        const r = a.results[i];
        const cls = r ? (r.correct ? 'ok' : 'miss') : i === a.i && phase === 'ask' ? 'now' : '';
        const gap = a.mode === 'mission' && i && q.grp !== a.qs[i - 1].grp ? ' gap' : '';
        return `<i class="${cls}${gap}"></i>`;
      }).join('');
      const timed = a.mode === 'mission' || a.mode === 'testout';
      const clockBar = timed && phase === 'ask'
        ? `<div class="pl-timebox"><div class="pl-clock"><i data-clock></i></div><div class="tiny num" data-left></div></div>` : '';
      return `<div class="pl-segs">${segs}</div>${timed ? clockBar : combo}`;
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
    const skill = skillById(q.skill), month = monthOf(a.track, skill.month);
    const g = a.mode === 'mission' ? a.groups[q.grp] : null;
    const lvl = g ? `<span class="badge solid">${g.isNew ? 'New' : `Level ${g.level}`}</span>` : '';
    return `<div class="row" style="gap:8px;flex-wrap:wrap">
        <span class="badge" style="background:${month.color}">M${month.n}</span>
        <span class="tiny">${esc(skill.name)}</span>${lvl}
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
      : good ? (r.xp ? `+${r.xp} XP` : 'Right — practice cap reached') : r.given === '—' ? 'Out of time' : 'No XP';
    const round = r.round ? `<div class="round-res ${r.round.move > 0 ? 'up' : r.round.move < 0 ? 'down' : ''}">
        <div class="between"><span class="h3">${esc(skillById(r.round.skill).name)}</span><span class="badge solid">${r.round.right}/${r.round.n}</span></div>
        <div class="h2" style="margin-top:4px">${esc(moveLine(r.round))}</div>
        <div class="tiny" style="margin-top:2px">${esc(versus(r.round))}</div>
        <div class="tiny" style="margin-top:2px">${esc(nextLine(r.round, a))}</div></div>` : '';
    return `<div class="pl-feedback ${good ? 'good' : 'bad'}">
      <div class="between"><div class="h2">${good ? '✓ Right' : '✗ Not quite'}</div><span class="badge">${esc(gain)}</span></div>
      ${!good ? `<div class="sub" style="margin-top:6px"><b>Answer:</b> ${esc(r.expected)}${r.q.kind === 'num' && r.given !== '—' ? ` · you said ${esc(r.given)}` : ''}</div>` : ''}
      ${r.note ? `<div class="sub" style="margin-top:4px">${esc(r.note)}</div>` : ''}
      <div class="sub" style="margin-top:8px">${esc(r.q.explain || '')}</div>
    </div>${round}`;
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
    const secs = timeLimit();
    const bar = el.querySelector('[data-clock]'), label = el.querySelector('[data-left]');
    const step = () => {
      const left = secs - (Date.now() - a.qStartedAt) / 1000;
      if (bar) {
        bar.style.width = `${Math.max(0, (left / secs) * 100)}%`;
        bar.classList.toggle('low', left < 10);
      }
      if (label) label.textContent = `${clock(Math.max(0, Math.ceil(left)))} left`;
      if (left <= 0) { clearInterval(tick); submit(null); }
    };
    step();
    tick = setInterval(step, 250);
  }

  function wire(a) {
    el.querySelector('[data-x]').onclick = () => {
      if (a.mode === 'practice') { clearInterval(tick); close(); rerender(); toast('Paused — pick it up from Today.'); return; }
      if (a.mode === 'mission' || a.mode === 'testout') {
        dialog(`<div class="h2">Pause?</div>
          <p class="sub" style="margin:10px 0 18px">This question's clock keeps running while you are away.</p>
          <button class="btn primary block" data-no>Keep going</button>
          <button class="btn ghost block sm" style="margin-top:8px" data-yes>Pause</button>`,
          (d, closeD) => {
            d.querySelector('[data-no]').onclick = closeD;
            d.querySelector('[data-yes]').onclick = () => { closeD(); clearInterval(tick); close(); rerender(); };
          });
        return;
      }
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
    const big = (s.mode === 'mission' && (s.perfect || s.groups.some(g => g.move > 0))) || (s.mode === 'boss' && s.won) || (s.mode === 'testout' && s.passed);
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
    } else if (s.mode === 'mission') {
      const ups = s.groups.filter(g => g.move > 0).length;
      glyph = s.perfect ? '💯' : ups ? '📈' : '✓';
      title = s.completed ? `Mission ${s.n} done` : 'Check done';
      line = `${s.score}/${s.total} right · ${ups ? `${ups} skill${ups === 1 ? '' : 's'} levelled up` : 'no level-ups today — they come back tomorrow'}`
        + (s.completed ? '' : '. Now the Solve step: the mission finishes when Codeforces accepts them.');
    } else if (s.mode === 'testout') {
      glyph = s.passed ? '⏭️' : '✕'; cls = s.passed ? '' : 'lost';
      title = s.passed ? `Week ${s.week} skipped` : `${s.score} / ${s.total}`;
      line = s.passed ? `${s.score}/${s.total} right. ${s.skipped} mission${s.skipped === 1 ? '' : 's'} skipped, and the week's skills start at level 3.`
        : `${E.TEST_OUT.pass} right is a pass. Do the week as planned, or try again tomorrow.`;
    } else {
      glyph = '✓';
      title = `${s.score} / ${s.total}`;
      line = s.capped ? 'Practice XP is capped for today. The answers still count.' : 'Practice set done.';
    }
    const drop = s.drop ? `<div class="card drop" style="--rc:${RARITY[s.drop.rarity].color}">
        <div class="row"><div class="g-ico">${s.drop.icon}</div>
        <div class="grow"><div class="label">${esc(RARITY[s.drop.rarity].name)} drop</div>
          <div class="h3">${esc(s.drop.name)}</div>
          <div class="tiny">${s.drop.dupe ? `Already owned — converted to ${s.drop.credit} credits` : `+${Math.round(s.drop.bonus * 100)}% XP, permanently`}</div></div></div></div>` : '';
    const rows = s.mode === 'mission' ? s.groups.map(g => `<div class="res-row">
        <div class="between"><span class="h3 truncate">${esc(skillById(g.skill).name)}</span>
          <span class="badge ${g.move > 0 ? 'good' : g.move < 0 ? 'warn' : ''}">${g.move > 0 ? `▲ ${g.to}` : g.move < 0 ? `▼ ${g.to}` : `= ${g.to}`}</span></div>
        <div class="tiny">${g.right}/${g.n} in ${clock(g.secs)} · ${esc(versus(g))}</div></div>`).join('')
      : (s.results || []).map(r => `<div class="between res-row">
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
        ${s.mode === 'mission'
          ? `<div class="tile"><div class="v">${s.scoreTo}</div><div class="k">skill score${s.scoreTo > s.scoreFrom ? ` +${s.scoreTo - s.scoreFrom}` : ''}</div></div>`
          : `<div class="tile"><div class="v">${s.best || 0}</div><div class="k">best run</div></div>`}
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
