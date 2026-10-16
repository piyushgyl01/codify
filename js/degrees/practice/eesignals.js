/**
 * Electrical Engineering: signals and systems (6.003, Stanford EE261). FE
 * Electrical and Computer: Linear Systems, Signal Processing.
 *
 * Checks take another route: convolution by DFT multiplication, Fourier
 * coefficients by numerical integration, and impulse responses by running the
 * difference equation rather than from its poles.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));

export const EESIGNALS = [
  SKILL('sig.conv', 'Discrete convolution', 'y[n] = Σ x[k] h[n − k]: flip h, slide it along x, multiply and add.', t => {
    const x = Array.from({ length: t.int(3, 5) }, () => t.int(-3, 3)), h = Array.from({ length: t.int(2, 4) }, () => t.int(-2, 3));
    const N = x.length + h.length - 1, n = t.int(0, N - 1);
    let y = 0;
    for (let k = 0; k < x.length; k++) if (n - k >= 0 && n - k < h.length) y += x[k] * h[n - k];
    return num(`x[n] = [${x.join(', ')}] and h[n] = [${h.join(', ')}], both starting at n = 0. What is y[${n}] for y = x * h?`, y,
      `y[${n}] = Σₖ x[k]·h[${n} − k] = ${y}. The output has ${N} samples.`,
      `import cmath\n# multiply the zero-padded DFTs and invert: circular convolution of length >= N equals linear convolution\nx, h, n = ${JSON.stringify(x)}, ${JSON.stringify(h)}, ${n}\nN = len(x) + len(h) - 1\nX = [sum(x[k] * cmath.exp(-2j * cmath.pi * f * k / N) for k in range(len(x))) for f in range(N)]\nH = [sum(h[k] * cmath.exp(-2j * cmath.pi * f * k / N) for k in range(len(h))) for f in range(N)]\ny = sum(X[f] * H[f] * cmath.exp(2j * cmath.pi * f * n / N) for f in range(N)) / N\nprint(round(y.real))`, { rtol: 0, tol: 0, dp: 0 });
  }),

  SKILL('sig.fseries', 'Fourier series of a pulse train', 'A pulse train of height A and duty d has exponential Fourier coefficients cₙ = A·d·sinc(nd): its spectrum is a sampled sinc.', t => {
    const A = t.pick([1, 2, 5]), d = t.pick([0.1, 0.2, 0.25, 0.5]), n = t.int(1, 7);
    const x = Math.PI * n * d, c = Math.abs(A * d * (Math.sin(x) / x));
    return num(`A periodic rectangular pulse train has height ${A}, duty cycle ${d} and is centred on t = 0. What is the magnitude of its exponential Fourier coefficient c_${n}? (4 significant figures)`, r4(c),
      `cₙ = A·d·sin(πnd)/(πnd) = ${r4(c)}.${Math.abs(Math.sin(x)) < 1e-9 ? ' This harmonic is missing: nd is a whole number.' : ''}`,
      `import cmath, math\n# integrate x(t) e^(-j 2 pi n t / T) over one period numerically (T = 1)\nA, d, n = ${A}, ${d}, ${n}\nN = 200000; s = 0j\nfor i in range(N):\n    t = -0.5 + (i + .5) / N\n    if abs(t) < d / 2: s += A * cmath.exp(-2j * math.pi * n * t) / N\nprint(abs(s))`, { tol: 1e-4 });
  }),

  SKILL('sig.iir', 'Second-order recursive filters', 'y[n] = a₁y[n−1] + a₂y[n−2] + x[n] with poles re^(±jθ) has impulse response h[n] = rⁿ sin((n+1)θ)/sin θ.', t => {
    const r = t.pick([0.5, 0.8, 0.9, 0.95]), deg = t.pick([30, 45, 60, 90, 120]), th = (deg * Math.PI) / 180, k = t.int(2, 12);
    const a1 = 2 * r * Math.cos(th), a2 = -r * r, h = (r ** k * Math.sin((k + 1) * th)) / Math.sin(th);
    return num(`A filter obeys y[n] = ${r4(a1)}·y[n−1] − ${r4(r * r)}·y[n−2] + x[n] (poles at radius ${r}, angle ±${deg}°). What is its impulse response h[${k}]? (4 significant figures)`, r4(h),
      `With poles re^(±jθ), h[n] = rⁿ sin((n+1)θ)/sin θ, so h[${k}] = ${r4(h)}. Because r < 1 it decays: the filter is stable.`,
      `import math\n# run the recursion on a unit impulse\nr, th = ${r}, math.radians(${deg})\na1, a2 = 2 * r * math.cos(th), -r * r\ny1 = y2 = 0.0\nfor n in range(${k} + 1):\n    x = 1.0 if n == 0 else 0.0\n    y = a1 * y1 + a2 * y2 + x\n    y2, y1 = y1, y\nprint(y)`, { tol: 1e-4 });
  }),
];
