/**
 * Mechanical Engineering: sensors and data acquisition (6.002, Lessons in
 * Electric Circuits; FE Mechanical topic 13.A).
 *
 * Checks take another route: bridges solved as two dividers (and strains
 * bisected), resistance–temperature curves inverted by bisection, loaded
 * dividers solved by bisecting on KCL at the node, and Butterworth responses
 * computed from their poles instead of the magnitude formula.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));

export const MESENSORS = [
  SKILL('daq.bridge', 'Strain-gauge bridges', 'A strain gauge changes resistance by ΔR/R = GF·ε. In a quarter bridge V_o = V_ex·x/(4 + 2x) with x = GF·ε (≈ V_ex·GF·ε/4); a half bridge with gauges in tension and compression doubles it and is linear.', t => {
    const GF = t.pick([2.0, 2.05, 2.1, 2.14]), Vex = t.pick([2.5, 5, 10]), R = t.pick([120, 350]), mode = t.pick(['qout', 'qstrain', 'hout']);
    const ue = t.pick([200, 500, 1000, 1500, 2000, 3000]), x = GF * ue * 1e-6;
    const qout = Vex * x / (4 + 2 * x) * 1000, hout = Vex * x / 2 * 1000, Vo = Number(qout.toPrecision(3)), xs = 4 * Vo / 1000 / (Vex - 2 * Vo / 1000), ueBack = xs / GF * 1e6;
    if (mode === 'qstrain') return num(`A ${R} Ω strain gauge (gauge factor ${GF}) is the only active arm of a Wheatstone bridge whose other arms are fixed ${R} Ω resistors, excited at ${Vex} V and balanced at zero strain. The bridge now reads ${Vo} mV. What is the strain, in microstrain? (Use the exact bridge equation; 4 significant figures)`, r4(ueBack),
      `V_o/V_ex = x/(4 + 2x) inverts to x = 4(V_o/V_ex)/(1 − 2V_o/V_ex) = ${r4(xs)}; ε = x/GF = ${r4(ueBack)} µε (the linear estimate 4V_o/(V_ex·GF) gives ${r4(4 * Vo / 1000 / (Vex * GF) * 1e6)}).`,
      `# bisect on the strain until the bridge, solved as two dividers, gives the reading\nR, GF, Vex, Vo = ${R}, ${GF}, ${Vex}, ${Vo} / 1000\nout = lambda e: Vex * (R * (1 + GF * e) / (R * (1 + GF * e) + R) - R / (R + R))\nlo, hi = 0.0, 0.05\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if out(m) < Vo else (lo, m)\nprint(lo * 1e6)`);
    return num(`A ${R} Ω strain gauge (gauge factor ${GF}) ${mode === 'qout' ? 'forms one arm of a Wheatstone bridge whose other arms are fixed' : 'on the top of a beam and an identical gauge on the bottom form two adjacent arms of a Wheatstone bridge, completed by fixed'} ${R} Ω resistors, excited at ${Vex} V and balanced at zero strain. At ${ue} µε${mode === 'hout' ? ' (tension on top, equal compression below)' : ''}, what is the bridge output, in mV? (4 significant figures)`, r4(mode === 'qout' ? qout : hout),
      `x = GF·ε = ${r4(x)}. ${mode === 'qout' ? `Quarter bridge: V_o = V_ex·x/(4 + 2x) = ${r4(qout)} mV` : `Half bridge: V_o = V_ex·x/2 = ${r4(hout)} mV`}.`,
      `# solve the bridge as two voltage dividers and take the difference\nR, GF, Vex, e = ${R}, ${GF}, ${Vex}, ${ue} * 1e-6\n${mode === 'qout' ? 'R1, R2 = R * (1 + GF * e), R' : 'R1, R2 = R * (1 + GF * e), R * (1 - GF * e)'}\nprint(Vex * (R1 / (R1 + R2) - R / (R + R)) * 1000)`);
  }),

  SKILL('daq.rtd', 'Temperature from resistance', 'A platinum RTD follows R = R₀(1 + AT + BT²) above 0 °C; a thermistor falls steeply, R = R₂₅e^(β(1/T − 1/298.15)). Either way, the reading is inverted to give temperature.', t => {
    if (t.rng() < 0.5) {
      const R0 = t.pick([100, 1000]), A = 3.9083e-3, B = -5.775e-7, R = Number((R0 * t.pick([1.05, 1.1, 1.2, 1.3, 1.5, 1.8, 2.2])).toPrecision(4));
      const T = (-A + Math.sqrt(A * A - 4 * B * (1 - R / R0))) / (2 * B);
      return num(`A Pt${R0} RTD (R₀ = ${R0} Ω, A = 3.9083 × 10⁻³, B = −5.775 × 10⁻⁷, R = R₀(1 + AT + BT²) for T ≥ 0 °C) reads ${R} Ω. What is the temperature, in °C? (4 significant figures)`, r4(T),
        `Solve BT² + AT + (1 − R/R₀) = 0 for the root near R/R₀ − 1 over A: T = ${r4(T)} °C (the linear estimate (R/R₀ − 1)/A gives ${r4((R / R0 - 1) / A)} °C).`,
        `# bisect on temperature along the RTD curve\nR0, A, B, R = ${R0}, 3.9083e-3, -5.775e-7, ${R}\nlo, hi = 0.0, 850.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if R0 * (1 + A * m + B * m * m) < R else (lo, m)\nprint(lo)`);
    }
    const R25 = t.pick([2000, 5000, 10000]), beta = t.pick([3380, 3435, 3950, 4100]), R = Number((R25 * t.pick([0.2, 0.35, 0.5, 0.8, 1.5, 2.5, 4])).toPrecision(4));
    const T = 1 / (1 / 298.15 + Math.log(R / R25) / beta) - 273.15;
    return num(`An NTC thermistor has R₂₅ = ${R25} Ω at 25 °C and β = ${beta} K. It reads ${R} Ω. What is its temperature, in °C? (4 significant figures)`, r4(T),
      `1/T = 1/298.15 + ln(R/R₂₅)/β gives T = ${r4(T + 273.15)} K = ${r4(T)} °C.`,
      `import math\n# bisect on temperature along the beta curve (resistance falls as temperature rises)\nR25, beta, R = ${R25}, ${beta}, ${R}\nres = lambda T: R25 * math.exp(beta * (1 / T - 1 / 298.15))\nlo, hi = 150.0, 600.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if res(m) > R else (lo, m)\nprint(lo - 273.15)`);
  }),

  SKILL('daq.loading', 'Instrument loading', 'Connecting a meter or ADC with finite input resistance to a sensor\'s output puts that resistance in parallel with the circuit: the reading sags, worst for high source resistance.', t => {
    const Vs = t.pick([5, 10, 12]), R1 = t.pick([10e3, 47e3, 100e3, 470e3, 1e6]), R2 = t.pick([10e3, 22e3, 100e3, 220e3, 1e6]), Rin = t.pick([1e6, 2e6, 10e6]), ask = t.pick(['V', 'err']);
    const Vtrue = Vs * R2 / (R1 + R2), Rp = R2 * Rin / (R2 + Rin), Vm = Vs * Rp / (R1 + Rp), err = (Vtrue - Vm) / Vtrue * 100;
    const k = v => (v >= 1e6 ? `${v / 1e6} MΩ` : `${v / 1e3} kΩ`);
    return num(`A ${Vs} V source drives a divider: ${k(R1)} on top, ${k(R2)} on the bottom. A meter with ${k(Rin)} input resistance reads the voltage across the bottom resistor. What is ${ask === 'V' ? 'the reading, in V' : 'the loading error, as a percentage of the unloaded voltage'}? (4 significant figures)`, r4(ask === 'V' ? Vm : err),
      `Unloaded: ${r4(Vtrue)} V. The meter puts ${k(Rin)} in parallel with ${k(R2)}: ${r4(Rp / 1e3)} kΩ, so it reads ${r4(Vm)} V — ${r4(err)}% low.`,
      `# bisect on the node voltage until the currents into it balance (KCL)\nVs, R1, R2, Rin = ${Vs}, ${R1}, ${R2}, ${Rin}\nkcl = lambda v: (Vs - v) / R1 - v / R2 - v / Rin\nlo, hi = 0.0, Vs\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if kcl(m) > 0 else (lo, m)\ntrue = Vs * R2 / (R1 + R2)\nprint(${ask === 'V' ? 'lo' : '(true - lo) / true * 100'})`);
  }),

  SKILL('daq.filter', 'Anti-aliasing filters', 'Anything above fs/2 folds into the band. An nth-order Butterworth low-pass attenuates by 10 log₁₀(1 + (f/fc)^(2n)) dB, so the order needed grows as the guard band shrinks.', t => {
    const fs = t.pick([1000, 2000, 5000, 10000]), fc = fs * t.pick([0.1, 0.15, 0.2, 0.25]), ask = t.pick(['att', 'order']);
    const fa = fs - fc, n = t.pick([2, 3, 4, 5, 6]), att = 10 * Math.log10(1 + (fa / fc) ** (2 * n)), A = t.pick([30, 40, 50, 60]);
    let need = 1;
    while (10 * Math.log10(1 + (fa / fc) ** (2 * need)) < A) need++;
    return num(ask === 'att' ? `A data-acquisition channel samples at ${fs} Hz behind an order-${n} Butterworth low-pass filter with cutoff ${fc} Hz. Signals at ${fa} Hz alias onto ${fc} Hz. By how many dB does the filter attenuate them? (4 significant figures)` : `A channel sampling at ${fs} Hz must keep signals up to ${fc} Hz and attenuate anything that would alias onto them (from ${fa} Hz up) by at least ${A} dB, using a Butterworth low-pass with cutoff ${fc} Hz. What is the lowest filter order that does it?`, ask === 'att' ? r4(att) : need,
      `Attenuation at f: 10 log₁₀(1 + (f/fc)^(2n)). At ${fa} Hz, order ${n} gives ${r4(att)} dB. For ${A} dB you need n ≥ log₁₀(10^(A/10) − 1)/(2 log₁₀(${r4(fa / fc)})), so order ${need}.`,
      `import cmath, math\n# build the Butterworth from its poles and evaluate |H(j w)| directly\nfc, fa = ${fc}, ${fa}\ndef att(n):\n    wc = 2 * math.pi * fc; s = 1j * 2 * math.pi * fa\n    poles = [wc * cmath.exp(1j * math.pi * (2 * k + n + 1) / (2 * n)) for k in range(n)]\n    H = 1.0\n    for p in poles: H *= -p / (s - p)\n    return -20 * math.log10(abs(H))\n${ask === 'att' ? `print(att(${n}))` : `n = 1\nwhile att(n) < ${A}: n += 1\nprint(n)`}`, ask === 'order' ? { rtol: 0, tol: 0, dp: 0 } : {});
  }),
];
