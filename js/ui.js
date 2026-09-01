/** Templating, overlays, toasts, the reward theatre, and small formatters. */
import { S } from './state.js';

/* ------------------------------- templating ------------------------------- */

export const esc = v => String(v ?? '').replace(/[&<>"']/g,
  c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

/**
 * Tagged template. Interpolations are escaped unless wrapped in raw().
 * Everything that reaches the DOM in this app goes through here, so a topic name
 * or a repo name someone typed cannot become markup.
 */
export function h(strings, ...vals) {
  return strings.reduce((out, str, i) => {
    if (i === 0) return str;
    const v = vals[i - 1];
    const piece = v && typeof v === 'object' && v.__raw ? v.value : esc(v);
    return out + piece + str;
  }, '');
}

export const raw = value => ({ __raw: true, value });

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Bind clicks by [data-act] within a root, delegated once. */
export function bind(root, map) {
  root.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || !root.contains(el)) return;
    const fn = map[el.dataset.act];
    if (fn) fn(el, e);
  });
}

/* -------------------------------- formatters ------------------------------ */

export const fmt = n => Math.round(n).toLocaleString();

/** 95 -> "1h 35m". The unit people actually think in. */
export function hm(minutes) {
  const m = Math.max(0, Math.round(minutes || 0));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

export const mmss = s =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const pct = n => `${Math.round(n)}%`;

/** "3d ago" / "in 5d" / "today". Short enough to sit inside a badge. */
export function relDays(n) {
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n}d` : `${Math.abs(n)}d ago`;
}

export function timeOf(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const shortDate = key => {
  const d = new Date(key + 'T00:00:00');
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

/* ---------------------------------- bars ---------------------------------- */

/**
 * A progress bar, optionally with a target notch.
 * The fill keeps square inner corners until it is nearly full, so a 4% bar reads
 * as a sliver rather than a lozenge that looks like more than it is.
 */
export function bar(percent, { color = 'var(--accent)', tick = null, tall = false } = {}) {
  const p = Math.max(0, Math.min(100, percent || 0));
  const notch = tick == null ? '' :
    `<span class="tick" style="left:${Math.max(0, Math.min(100, tick))}%"></span>`;
  return `<div class="bar${tall ? ' tall' : ''}">
    <i style="width:${p}%;background:${color}"></i>${notch}</div>`;
}

/** Proportional multi-segment bar. `parts` is [{ pct, color, name }]. */
export function splitBar(parts) {
  const segs = parts.filter(p => p.pct > 0).map(p =>
    `<i style="width:${p.pct}%;background:${p.color}" title="${esc(p.name || '')}"></i>`).join('');
  return `<div class="split">${segs}</div>`;
}

/* ---------------------------------- ring ---------------------------------- */

export function ring({ pct: percent = 0, size = 132, stroke = 12,
                       color = 'var(--accent)', track = 'var(--sunk)',
                       value = '', label = '' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, percent)) / 100 * c;
  const mid = size / 2;
  // Outer and inner hairlines fake a black outline around a thick stroked ring,
  // which SVG cannot draw directly on a stroke.
  const edge = off => `<circle cx="${mid}" cy="${mid}" r="${r + off}" fill="none"
      stroke="var(--ink)" stroke-width="2.5"/>`;
  return `<div class="ring-wrap" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${mid}" cy="${mid}" r="${r}" fill="none"
              stroke="${track}" stroke-width="${stroke}"/>
      <circle cx="${mid}" cy="${mid}" r="${r}" fill="none"
              stroke="${color}" stroke-width="${stroke}"
              stroke-dasharray="${filled} ${c}"
              transform="rotate(-90 ${mid} ${mid})"/>
      ${edge(stroke / 2)}${edge(-stroke / 2)}
    </svg>
    <div class="mid">${value ? `<div class="v">${value}</div>` : ''}
      ${label ? `<div class="k">${label}</div>` : ''}</div>
  </div>`;
}

/* --------------------------------- layers --------------------------------- */

const layer = () => $('#layers');

export function closeTop() {
  const l = layer();
  const top = l?.lastElementChild;
  if (top) { top.remove(); return true; }
  return false;
}

export const anyLayerOpen = () => !!layer()?.childElementCount;

/**
 * A bottom sheet. `body` is an HTML string; `onMount(el, close)` wires it up.
 * Returns `close` so a caller can dismiss it from elsewhere.
 */
export function sheet(title, body, onMount, { dismissable = true } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'scrim bottom';
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sheet-hd">
        <div class="h2">${esc(title)}</div>
        ${dismissable ? '<button class="x" data-close aria-label="Close">✕</button>' : ''}
      </div>
      <div class="sheet-bd">${body}</div>
    </div>`;

  const close = () => wrap.remove();
  if (dismissable) {
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('[data-close]')) close();
    });
  }
  layer().appendChild(wrap);
  onMount?.($('.sheet-bd', wrap), close);
  return close;
}

export function dialog(body, onMount, { dismissable = true } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'scrim centre';
  wrap.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">${body}</div>`;
  const close = () => wrap.remove();
  if (dismissable) wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  layer().appendChild(wrap);
  onMount?.($('.dialog', wrap), close);
  return close;
}

/** Full-bleed layer for the session runner — no scrim, no dismissal by tap. */
export function fullscreen(html, onMount) {
  const wrap = document.createElement('div');
  wrap.className = 'scrim';
  wrap.style.background = 'var(--paper)';
  wrap.innerHTML = html;
  const close = () => wrap.remove();
  layer().appendChild(wrap);
  onMount?.(wrap, close);
  return close;
}

/* --------------------------------- toasts --------------------------------- */

export function toast(html, ms = 2600) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  $('#toasts').appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 260);
  }, ms);
  return el;
}

/** The standard reward announcement: XP, coins, gear, achievements, level-ups. */
export function rewardToast(r) {
  if (!r) return;
  const bits = [];
  if (r.xp) bits.push(`<b>+${fmt(r.xp)} XP</b>`);
  if (r.coins) bits.push(`+${fmt(r.coins)}c`);
  if (bits.length) toast(bits.join(' &nbsp;·&nbsp; ') + (r.reason ? ` &nbsp;<span style="color:var(--dim)">${esc(r.reason)}</span>` : ''));

  if (r.gearBonus) {
    toast(`⚙ gear bonus <b>×${r.gearBonus.toFixed(2)}</b>`, 2000);
  }
  for (const a of r.achievements || []) {
    setTimeout(() => {
      toast(`${a.icon} <b>${esc(a.name)}</b> — ${esc(a.desc)}`, 3600);
      sfx('achieve');
    }, 400);
  }
  for (const lvl of r.levelUps || []) {
    setTimeout(() => levelUpDialog(lvl), 500);
  }
}

export function floater(text, x, y) {
  const el = document.createElement('div');
  el.className = 'floater';
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  $('#layers').appendChild(el);
  setTimeout(() => el.remove(), 950);
}

/* -------------------------------- level up -------------------------------- */

export function levelUpDialog(level) {
  import('./game.js').then(({ rankFor, nextRank }) => {
    const rank = rankFor(level);
    const next = nextRank(level);
    const isNewRank = rank.at === level;
    sfx('levelup');
    confetti(isNewRank ? 140 : 70);
    dialog(`
      <div style="font-size:44px;line-height:1;color:${rank.color}">${rank.icon}</div>
      <div class="label" style="margin-top:12px">${isNewRank ? 'New rank' : 'Level up'}</div>
      <div class="h1 num" style="margin-top:4px">LEVEL ${level}</div>
      <div class="h3" style="color:${rank.color};margin-top:6px">${esc(rank.name)}</div>
      ${next ? `<div class="sub" style="margin-top:10px">Next: ${esc(next.name)} at level ${next.at}</div>` : ''}
      <button class="btn primary block" style="margin-top:20px" data-ok>Keep going</button>`,
      (d, close) => { d.querySelector('[data-ok]').onclick = close; });
  });
}

/* -------------------------------- confetti -------------------------------- */

/**
 * Canvas confetti. Squares only — round particles read as a different app, and
 * the whole visual language here is rectangles.
 */
export function confetti(count = 90) {
  if (S.settings?.reduceMotion) return;
  const canvas = $('#fx');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  const w = canvas.width = canvas.clientWidth;
  const hgt = canvas.height = canvas.clientHeight;
  const colors = ['#2F6BFF', '#FFD93D', '#FF3D8B', '#22D3A7', '#7C4DFF', '#FF7A2C'];

  const bits = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: -20 - Math.random() * hgt * 0.4,
    s: 3 + Math.random() * 5,
    vy: 2 + Math.random() * 3.4,
    vx: -1.2 + Math.random() * 2.4,
    rot: Math.random() * Math.PI,
    vr: -0.12 + Math.random() * 0.24,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));

  let frames = 0;
  const tick = () => {
    ctx.clearRect(0, 0, w, hgt);
    let alive = false;
    for (const b of bits) {
      b.x += b.vx; b.y += b.vy; b.rot += b.vr; b.vy += 0.045;
      if (b.y < hgt + 20) alive = true;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#14120F';
      ctx.strokeRect(-b.s / 2, -b.s / 2, b.s, b.s);
      ctx.restore();
    }
    frames++;
    if (alive && frames < 340) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, w, hgt);
  };
  requestAnimationFrame(tick);
}

/* ---------------------------------- sound --------------------------------- */

let audioCtx = null;

/**
 * Tiny synthesised blips — no audio files to ship, nothing to fail offline.
 * Created lazily because a context built before a user gesture starts suspended.
 */
export function sfx(name) {
  if (!S.settings?.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const notes = {
      tick:    [[440, 0.04, 0.03]],
      done:    [[660, 0.07, 0.06], [880, 0.07, 0.06]],
      reward:  [[523, 0.07, 0.05], [659, 0.07, 0.05], [784, 0.10, 0.07]],
      achieve: [[659, 0.06, 0.05], [784, 0.06, 0.05], [988, 0.12, 0.08]],
      levelup: [[523, 0.08, 0.06], [659, 0.08, 0.06], [784, 0.08, 0.06], [1046, 0.16, 0.09]],
      fail:    [[220, 0.14, 0.06], [165, 0.18, 0.06]],
      start:   [[330, 0.05, 0.04], [494, 0.08, 0.05]],
    }[name] || [[440, 0.05, 0.04]];

    let at = audioCtx.currentTime;
    for (const [freq, dur, vol] of notes) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(vol, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(at);
      osc.stop(at + dur);
      at += dur * 0.85;
    }
  } catch { /* audio is a nicety; never let it break an interaction */ }
}

export const haptic = (ms = 12) => { try { navigator.vibrate?.(ms); } catch { /* unsupported */ } };
