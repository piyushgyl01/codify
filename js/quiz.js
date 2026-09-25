/**
 * Generating and grading questions.
 *
 * Grading happens here, in code, against a number the generator computed. That
 * is the whole reason mission XP is allowed to exist: you cannot tell this app
 * you got it right, you have to actually get it right.
 */
import { skillById } from './skillbook.js';

/** Deterministic PRNG for tests; the app passes Math.random. */
export function seeded(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function toolkit(rng = Math.random) {
  const int = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const shuffle = arr => {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };
  const pickN = (arr, k) => shuffle(arr).slice(0, k);
  const mc = bank => {
    const item = pick(bank);
    return { kind:'mc', q:item.q, options:[item.a, ...item.w], correct:0, explain:item.why };
  };
  return { int, pick, pickN, shuffle, mc, rng };
}

let counter = 0;

/** One fresh question for a skill. Multiple-choice options arrive shuffled. */
export function generate(skillId, rng = Math.random) {
  const skill = skillById(skillId);
  if (!skill) throw new Error(`Unknown skill: ${skillId}`);
  const t = toolkit(rng);
  const q = skill.gen(t);

  if (q.kind === 'mc') {
    const order = t.shuffle(q.options.map((_, i) => i));
    q.options = order.map(i => q.options[i]);
    q.correct = order.indexOf(0);
  }
  counter = (counter + 1) % 1e6;
  return { id: `${skillId}-${Date.now().toString(36)}-${counter}`, skill: skillId, ...q };
}

/* ------------------------------ reading input ------------------------------ */

/**
 * Parse a number the way people type one.
 *
 *   "4.7k", "4k7", "10 kΩ", "1M"  → multipliers (k and M only — "m" is too
 *                                   ambiguous between milli and metres)
 *   "4,700" → 4700,  "2,5" → 2.5  → a comma before exactly three digits is a
 *                                   thousands separator, otherwise a decimal
 *   "5.3 mm", "12 V"              → trailing units are ignored; the question
 *                                   already said which unit it wants
 */
export function parseNumber(input) {
  if (typeof input === 'number') return input;
  let s = String(input ?? '').trim().replace(/[−–]/g, '-');
  if (!s) return NaN;

  const rkm = s.match(/^([-+]?\d+)([kKM])(\d+)\s*(?:Ω|[oO]hms?)?$/);
  if (rkm) return parseFloat(`${rkm[1]}.${rkm[3]}`) * (rkm[2] === 'M' ? 1e6 : 1e3);

  if (/^[-+]?\d{1,3}(?:,\d{3})+(?!\d)/.test(s)) s = s.replace(/,(?=\d{3}(?!\d))/g, '');
  else if (!s.includes('.') && /^[-+]?\d+,\d+/.test(s)) s = s.replace(',', '.');

  const m = s.match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)(.*)$/);
  if (!m) return NaN;
  let v = parseFloat(m[1]);
  const mult = m[2].trim().match(/^([kKM])(?:\s*(?:Ω|[oO]hms?))?$/);
  if (mult) v *= mult[1] === 'M' ? 1e6 : 1e3;
  return v;
}

/* --------------------------------- grading -------------------------------- */

const show = (v, dp = 2) =>
  Number(v.toFixed(dp)).toLocaleString('en-US', { maximumFractionDigits: dp });

export function expected(q) {
  if (q.kind === 'mc') return q.options[q.correct];
  return `${show(q.answer, q.dp ?? 2)}${q.unit ? ' ' + q.unit : ''}`;
}

/**
 * Grade an answer. `input` is an option index for multiple choice, or the raw
 * text for a numeric question. Returns { correct, expected, given, note }.
 */
export function grade(q, input) {
  if (q.kind === 'mc') {
    const idx = typeof input === 'number' ? input : parseInt(input, 10);
    return { correct: idx === q.correct, expected: expected(q), given: q.options[idx] ?? '—' };
  }

  const v = parseNumber(input);
  if (!Number.isFinite(v)) {
    return { correct:false, expected: expected(q), given: String(input ?? ''), note:'That is not a number.' };
  }

  const err = Math.abs(v - q.answer);
  const allowed = Math.max(
    q.tol != null ? q.tol : Math.abs(q.answer) * (q.rtol ?? 0.02),
    // Never demand more precision than the explanation shows. 0.1435 V is shown
    // as 0.14, so 0.14 has to be right — 2% of a small number is tighter than that.
    q.dp != null ? 0.5 * 10 ** -q.dp : 0,
  );
  const correct = err <= allowed + 1e-9;

  // A near miss by a power of 1000 is almost always the unit, not the maths.
  let note;
  if (!correct && q.answer !== 0) {
    const ratio = v / q.answer;
    if ([1000, 0.001].some(x => Math.abs(ratio / x - 1) < 0.03)) note = 'Right number, wrong unit — check what it asked for.';
  }
  return { correct, expected: expected(q), given: String(input), note };
}
