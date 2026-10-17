/**
 * Mechanical Engineering: engineering thermodynamics with ideal gases,
 * incompressible liquids, moist air and combustion (MIT Unified
 * Thermodynamics notes, Yan's Introduction to Engineering Thermodynamics;
 * FE Mechanical topic 11).
 *
 * No steam tables are needed: every property comes from an ideal-gas,
 * constant-specific-heat or given-saturation-pressure model, stated in the
 * question. Checks take another route: boundary work integrated along the
 * path, isentropic states bisected on zero entropy change, entropy integrated
 * as ∫dQ/T, cycles stepped through their processes numerically, reversible
 * work bisected on zero entropy generation, humidity from mole fractions,
 * and combustion products from an atom balance solved as a linear system.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const AIR = { R: 0.287, cp: 1.005, cv: 0.718, k: 1.4 };
const AIRTXT = 'air as an ideal gas with R = 0.287, cp = 1.005 and cv = 0.718 kJ/(kg·K)';

export const METHERMO = [
  SKILL('th.polytropic', 'Polytropic processes', 'Along PVⁿ = constant, the boundary work is (P₂V₂ − P₁V₁)/(1 − n) = mR(T₂ − T₁)/(1 − n), and the first law gives the heat: Q = ΔU + W.', t => {
    const m = t.pick([0.5, 1, 2]), P1 = 100, T1 = t.pick([290, 300, 310]), n = t.pick([1.2, 1.25, 1.3, 1.35]), rp = t.pick([4, 6, 8, 10]), ask = t.pick(['T2', 'W', 'Q']);
    const P2 = P1 * rp, T2 = T1 * rp ** ((n - 1) / n), Wby = m * AIR.R * (T2 - T1) / (1 - n), Q = m * AIR.cv * (T2 - T1) + Wby;
    const what = { T2: 'the final temperature, in K', W: 'the work done on the gas, in kJ', Q: 'the heat transfer, in kJ (negative means heat leaves the gas)' }[ask];
    return num(`${m} kg of air at ${P1} kPa and ${T1} K is compressed in a piston–cylinder along PV^${n} = constant to ${P2} kPa. Take ${AIRTXT}. What is ${what}? (4 significant figures)`, r4({ T2, W: -Wby, Q }[ask]),
      `T₂ = T₁(P₂/P₁)^((n−1)/n) = ${r4(T2)} K. Work on the gas = mR(T₂ − T₁)/(n − 1) = ${r4(-Wby)} kJ. ΔU = mc_v(T₂ − T₁) = ${r4(m * AIR.cv * (T2 - T1))} kJ, so Q = ΔU + W_by = ${r4(Q)} kJ.`,
      `import math\n# integrate P dV along the path (Simpson), with T from the ideal-gas law at the end\nm, R, cv, P1, T1, n, P2 = ${m}, 0.287, 0.718, ${P1}, ${T1}, ${n}, ${P2}\nV1 = m * R * T1 / P1; V2 = V1 * (P1 / P2) ** (1 / n); C = P1 * V1 ** n\nN = 20000; h = (V2 - V1) / N; P = lambda V: C / V ** n\nWby = (P(V1) + P(V2) + sum((4 if i % 2 else 2) * P(V1 + i * h) for i in range(1, N))) * h / 3\nT2 = P2 * V2 / (m * R)\nprint(${{ T2: 'T2', W: '-Wby', Q: 'm * cv * (T2 - T1) + Wby' }[ask]})`);
  }),

  SKILL('th.turbine', 'Turbines, compressors and nozzles', 'Steady flow: ẇ = ṁ(h₁ − h₂) for a turbine. Real machines fall short of the isentropic ideal: η_t = (h₁ − h₂)/(h₁ − h₂s), η_c = (h₂s − h₁)/(h₂ − h₁).', t => {
    const dev = t.pick(['turbine', 'compressor', 'nozzle']), eta = t.pick([0.8, 0.85, 0.88, 0.9, 0.95]), mdot = t.pick([1, 2, 5, 10]);
    let T1, P1, P2, T2s, T2, ans, what;
    if (dev === 'compressor') { T1 = t.pick([290, 300]); P1 = 100; P2 = P1 * t.pick([4, 6, 8, 10]); T2s = T1 * (P2 / P1) ** (AIR.R / AIR.cp); T2 = T1 + (T2s - T1) / eta; }
    else { T1 = t.pick([900, 1000, 1100, 1200]); P1 = t.pick([800, 1000, 1200]); P2 = dev === 'nozzle' ? t.pick([400, 500, 600]) : 100; T2s = T1 * (P2 / P1) ** (AIR.R / AIR.cp); T2 = T1 - eta * (T1 - T2s); }
    const ask = t.pick(['T2', 'out']);
    if (dev === 'nozzle') { ans = ask === 'T2' ? T2 : Math.sqrt(2 * AIR.cp * 1000 * (T1 - T2)); what = ask === 'T2' ? 'the exit temperature, in K' : 'the exit velocity, in m/s (inlet velocity negligible)'; }
    else { ans = ask === 'T2' ? T2 : mdot * AIR.cp * Math.abs(T2 - T1); what = ask === 'T2' ? 'the exit temperature, in K' : `the ${dev === 'turbine' ? 'power produced' : 'power required'}, in kW`; }
    return num(`Air flows steadily through an adiabatic ${dev}${dev === 'nozzle' ? '' : ` at ${mdot} kg/s`}, from ${P1} kPa and ${T1} K to ${P2} kPa. Its isentropic efficiency is ${eta}. Take ${AIRTXT}. What is ${what}? (4 significant figures)`, r4(ans),
      `Isentropic exit: T₂s = T₁(P₂/P₁)^(R/cp) = ${r4(T2s)} K. Actual: T₂ = ${r4(T2)} K. ${dev === 'nozzle' ? `V₂ = √(2cp(T₁ − T₂)) = ${r4(Math.sqrt(2 * AIR.cp * 1000 * (T1 - T2)))} m/s` : `Power = ṁcp|T₂ − T₁| = ${r4(mdot * AIR.cp * Math.abs(T2 - T1))} kW`}.`,
      `import math\n# find the isentropic exit temperature by bisecting on zero entropy change: cp ln(T/T1) - R ln(P2/P1) = 0\ncp, R, T1, P1, P2, eta, mdot = 1.005, 0.287, ${T1}, ${P1}, ${P2}, ${eta}, ${mdot}\nds = lambda T: cp * math.log(T / T1) - R * math.log(P2 / P1)\nlo, hi = 1.0, 5000.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if ds(m) < 0 else (lo, m)\nT2s = lo\nT2 = ${dev === 'compressor' ? 'T1 + (T2s - T1) / eta' : 'T1 - eta * (T1 - T2s)'}\n# energy balance per kg: h1 = h2 + work (or + V^2/2 for the nozzle)\nprint(${ask === 'T2' ? 'T2' : dev === 'nozzle' ? 'math.sqrt(2 * cp * 1000 * (T1 - T2))' : 'mdot * cp * abs(T2 - T1)'})`);
  }),

  SKILL('th.sgen', 'Entropy generation and lost work', 'Irreversible processes create entropy: S_gen ≥ 0. Multiplying by the surroundings\' temperature gives the work lost for ever: X_destroyed = T₀S_gen.', t => {
    const mode = t.pick(['mix', 'throttle']), T0 = t.pick([293, 298, 300]), ask = t.pick(['S', 'X']);
    if (mode === 'mix') {
      const m1 = t.pick([1, 2, 3]), T1 = t.pick([20, 25, 30]) + 273.15, m2 = t.pick([1, 2]), T2 = t.pick([70, 80, 90]) + 273.15, c = 4.18;
      const Tf = (m1 * T1 + m2 * T2) / (m1 + m2), S = m1 * c * Math.log(Tf / T1) + m2 * c * Math.log(Tf / T2);
      return num(`In an insulated tank, ${m1} kg of water at ${r4(T1 - 273.15)} °C is mixed with ${m2} kg at ${r4(T2 - 273.15)} °C (c = 4.18 kJ/(kg·K)). With surroundings at ${T0} K, what is ${ask === 'S' ? 'the entropy generated, in kJ/K' : 'the exergy destroyed, in kJ'}? (4 significant figures)`, r4(ask === 'S' ? S : T0 * S),
        `T_f = ${r4(Tf)} K. S_gen = Σ mc ln(T_f/T_i) = ${r4(S)} kJ/K; exergy destroyed = T₀S_gen = ${r4(T0 * S)} kJ.`,
        `import math\n# integrate dQ/T for each mass as it moves to the final temperature\nc, m1, T1, m2, T2, T0 = 4.18, ${m1}, ${T1}, ${m2}, ${T2}, ${T0}\nTf = (m1 * T1 + m2 * T2) / (m1 + m2)\ndef dS(m, Ta, Tb, n=20000):\n    h = (Tb - Ta) / n\n    return sum(m * c * h / (Ta + (i + 0.5) * h) for i in range(n))\nS = dS(m1, T1, Tf) + dS(m2, T2, Tf)\nprint(${ask === 'S' ? 'S' : 'T0 * S'})`);
    }
    const mdot = t.pick([0.5, 1, 2]), P1 = t.pick([500, 800, 1000]), P2 = t.pick([100, 150, 200]), s = mdot * AIR.R * Math.log(P1 / P2);
    return num(`Air (an ideal gas, R = 0.287 kJ/(kg·K)) at ${mdot} kg/s is throttled through an insulated valve from ${P1} kPa to ${P2} kPa; its temperature does not change. With surroundings at ${T0} K, what is ${ask === 'S' ? 'the rate of entropy generation, in kW/K' : 'the rate of exergy destruction, in kW'}? (4 significant figures)`, r4(ask === 'S' ? s : T0 * s),
      `At constant temperature, Δs = −R ln(P₂/P₁), so Ṡ_gen = ṁR ln(P₁/P₂) = ${r4(s)} kW/K; exergy destroyed = T₀Ṡ_gen = ${r4(T0 * s)} kW.`,
      `# integrate ds = -R dP/P from the inlet to the outlet pressure\nmdot, R, P1, P2, T0 = ${mdot}, 0.287, ${P1}, ${P2}, ${T0}\nn = 200000; h = (P2 - P1) / n\ns = -sum(R * h / (P1 + (i + 0.5) * h) for i in range(n))\nprint(${ask === 'S' ? 'mdot * s' : 'T0 * mdot * s'})`);
  }),

  SKILL('th.otto', 'The Otto cycle', 'An air-standard Otto cycle: isentropic compression, heat added at constant volume, isentropic expansion. Efficiency 1 − r^(1−k) depends only on the compression ratio.', t => {
    const r = t.pick([7, 8, 9, 10, 11]), T1 = t.pick([290, 300, 310]), P1 = t.pick([95, 100]), q = t.pick([1200, 1500, 1800, 2000]), ask = t.pick(['T3', 'MEP', 'wnet']);
    const k = AIR.k, T2 = T1 * r ** (k - 1), T3 = T2 + q / AIR.cv, T4 = T3 / r ** (k - 1), w = q - AIR.cv * (T4 - T1);
    const v1 = AIR.R * T1 / P1, mep = w / (v1 - v1 / r);
    const what = { T3: 'the peak temperature, in K', MEP: 'the mean effective pressure, in kPa', wnet: 'the net work per cycle, in kJ/kg' }[ask];
    return num(`An air-standard Otto cycle has compression ratio ${r}. At the start of compression the air is at ${P1} kPa and ${T1} K; ${q} kJ/kg of heat is added at constant volume. Take ${AIRTXT} and k = 1.4. What is ${what}? (4 significant figures)`, r4({ T3, MEP: mep, wnet: w }[ask]),
      `T₂ = T₁r^(k−1) = ${r4(T2)} K; T₃ = T₂ + q/cv = ${r4(T3)} K; T₄ = T₃/r^(k−1) = ${r4(T4)} K. w_net = q − cv(T₄ − T₁) = ${r4(w)} kJ/kg (η = ${r4(w / q)}). MEP = w_net/(v₁ − v₂) = ${r4(mep)} kPa.`,
      `import math\n# step through the cycle: integrate dT/dv = -(k - 1) T / v for each isentrope (RK4), add heat at constant volume\nR, cv, k, r, T1, P1, q = 0.287, 0.718, 1.4, ${r}, ${T1}, ${P1}, ${q}\ndef isentrope(T, v0, v1, n=20000):\n    h = (v1 - v0) / n; v = v0\n    f = lambda v, T: -(k - 1) * T / v\n    for _ in range(n):\n        a = f(v, T); b = f(v + h / 2, T + h / 2 * a); c = f(v + h / 2, T + h / 2 * b); d = f(v + h, T + h * c)\n        T += h / 6 * (a + 2 * b + 2 * c + d); v += h\n    return T\nv1 = R * T1 / P1; v2 = v1 / r\nT2 = isentrope(T1, v1, v2); T3 = T2 + q / cv; T4 = isentrope(T3, v2, v1)\nw = q - cv * (T4 - T1)\nprint(${{ T3: 'T3', MEP: 'w / (v1 - v2)', wnet: 'w' }[ask]})`);
  }),

  SKILL('th.brayton', 'The Brayton cycle', 'A gas-turbine cycle: compress, heat at constant pressure, expand. Real compressors and turbines cut the net work hard, because the compressor eats much of the turbine\'s output (the back-work ratio).', t => {
    const rp = t.pick([6, 8, 10, 12, 15]), T1 = t.pick([290, 300]), T3 = t.pick([1100, 1200, 1300, 1400]), ec = t.pick([0.8, 0.85, 0.9]), et = t.pick([0.85, 0.88, 0.9]), ask = t.pick(['eta', 'bwr', 'wnet']);
    const e = AIR.R / AIR.cp, T2 = T1 + (T1 * rp ** e - T1) / ec, T4 = T3 - et * (T3 - T3 / rp ** e);
    const wc = AIR.cp * (T2 - T1), wt = AIR.cp * (T3 - T4), qin = AIR.cp * (T3 - T2), wnet = wt - wc;
    const what = { eta: 'the thermal efficiency', bwr: 'the back-work ratio (compressor work over turbine work)', wnet: 'the net work, in kJ/kg' }[ask];
    return num(`A Brayton cycle with pressure ratio ${rp} takes in air at ${T1} K, and the turbine inlet is ${T3} K. The compressor is ${Math.round(ec * 100)}% and the turbine ${Math.round(et * 100)}% isentropically efficient. Take ${AIRTXT}. What is ${what}? (4 significant figures)`, r4({ eta: wnet / qin, bwr: wc / wt, wnet }[ask]),
      `T₂ = T₁ + T₁(r_p^(R/cp) − 1)/η_c = ${r4(T2)} K; T₄ = T₃ − η_t T₃(1 − r_p^(−R/cp)) = ${r4(T4)} K. w_c = ${r4(wc)}, w_t = ${r4(wt)}, w_net = ${r4(wnet)} kJ/kg; q_in = cp(T₃ − T₂) = ${r4(qin)}. η = ${r4(wnet / qin)}, back-work ratio ${r4(wc / wt)}.`,
      `import math\n# isentropic temperatures by bisecting on zero entropy change, then the energy balance of each component\ncp, R, rp, T1, T3, ec, et = 1.005, 0.287, ${rp}, ${T1}, ${T3}, ${ec}, ${et}\ndef iso(Ta, pr):\n    lo, hi = 1.0, 5000.0\n    for _ in range(200):\n        m = (lo + hi) / 2\n        lo, hi = (m, hi) if cp * math.log(m / Ta) - R * math.log(pr) < 0 else (lo, m)\n    return lo\nT2 = T1 + (iso(T1, rp) - T1) / ec; T4 = T3 - et * (T3 - iso(T3, 1 / rp))\nwc, wt, qin = cp * (T2 - T1), cp * (T3 - T4), cp * (T3 - T2)\nprint(${{ eta: '(wt - wc) / qin', bwr: 'wc / wt', wnet: 'wt - wc' }[ask]})`);
  }),

  SKILL('th.cop', 'Refrigerators and heat pumps', 'No refrigerator beats the Carnot COP T_L/(T_H − T_L); a heat pump\'s best is T_H/(T_H − T_L). Real machines reach a fraction of it.', t => {
    const dev = t.pick(['refrigerator', 'heat pump']), TL = t.pick([-20, -10, 0, 5]) + 273.15, TH = t.pick([25, 30, 35, 40]) + 273.15, f = t.pick([0.4, 0.5, 0.6]), Q = t.pick([2, 5, 10, 20]);
    const cop = (dev === 'refrigerator' ? TL : TH) / (TH - TL) * f, W = Q / cop;
    return num(`A ${dev} works between ${r4(TL - 273.15)} °C and ${r4(TH - 273.15)} °C and achieves ${Math.round(f * 100)}% of the Carnot COP. To ${dev === 'refrigerator' ? `remove ${Q} kW from the cold space` : `deliver ${Q} kW to the warm space`}, how much power does it draw, in kW? (4 significant figures)`, r4(W),
      `Carnot COP = ${dev === 'refrigerator' ? 'T_L' : 'T_H'}/(T_H − T_L) = ${r4(cop / f)}; actual ${r4(cop)}. Power = ${Q}/${r4(cop)} = ${r4(W)} kW.`,
      `# the reversible machine generates no entropy: bisect on its power, then scale by the fraction of Carnot achieved\nTL, TH, Q, f = ${TL}, ${TH}, ${Q}, ${f}\ndef sgen(W):\n    ${dev === 'refrigerator' ? 'QL, QH = Q, Q + W' : 'QH, QL = Q, Q - W'}\n    return QH / TH - QL / TL\nlo, hi = 0.0, Q\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if sgen(m) < 0 else (lo, m)\nprint(lo / f)`);
  }),

  SKILL('th.psych', 'Moist air', 'The humidity ratio ω = 0.622 p_v/(P − p_v), with p_v = φ p_sat. Cooling air below its dew point condenses out the difference in ω.', t => {
    const PS = { 10: 1.2282, 12: 1.4028, 14: 1.5990, 15: 1.7057, 25: 3.1698, 28: 3.7831, 30: 4.2469, 32: 4.7546, 35: 5.6291 };
    const T = t.pick([25, 28, 30, 32, 35]), phi = t.pick([0.4, 0.5, 0.6, 0.7, 0.8]), P = 101.325, ask = t.pick(['w', 'h', 'water']);
    const pv = phi * PS[T], w = 0.622 * pv / (P - pv), h = 1.005 * T + w * (2501 + 1.82 * T);
    const T2 = t.pick([10, 12, 14, 15]), w2 = 0.622 * PS[T2] / (P - PS[T2]), ma = t.pick([0.5, 1, 2]), water = Math.max(0, w - w2) * ma * 3600;
    if (ask === 'water' && w <= w2) return num(`Air at ${T} °C and ${Math.round(phi * 100)}% relative humidity is at ${P} kPa (p_sat = ${PS[T]} kPa at ${T} °C). What is its humidity ratio, in g of water per kg of dry air? (4 significant figures)`, r4(w * 1000), `p_v = φp_sat = ${r4(pv)} kPa; ω = 0.622p_v/(P − p_v) = ${r4(w * 1000)} g/kg.`, `Mw, Ma = 18.015, 28.965\npv = ${phi} * ${PS[T]}; y = pv / ${P}\nprint(Mw / Ma * y / (1 - y) * 1000)`);
    const what = { w: 'its humidity ratio, in g of water per kg of dry air', h: 'its enthalpy, in kJ per kg of dry air (h = 1.005T + ω(2501 + 1.82T), T in °C)', water: `the rate at which water condenses when ${ma} kg/s of dry air is cooled to saturation at ${T2} °C (p_sat = ${PS[T2]} kPa), in kg/h` }[ask];
    return num(`Air at ${T} °C and ${Math.round(phi * 100)}% relative humidity is at ${P} kPa (p_sat = ${PS[T]} kPa at ${T} °C). What is ${what}? (4 significant figures)`, r4({ w: w * 1000, h, water }[ask]),
      `p_v = φp_sat = ${r4(pv)} kPa; ω = 0.622p_v/(P − p_v) = ${r4(w * 1000)} g/kg; h = ${r4(h)} kJ/kg. Saturated at ${T2} °C, ω₂ = ${r4(w2 * 1000)} g/kg, so ${ma} kg/s sheds ${r4(water)} kg/h.`,
      `# humidity from mole fractions: kg of water per kg of dry air = (Mw/Ma) y/(1 - y)\nMw, Ma, P = 18.015, 28.965, ${P}\nratio = lambda pv: Mw / Ma * (pv / P) / (1 - pv / P)\nw = ratio(${phi} * ${PS[T]}); w2 = ratio(${PS[T2]})\nT = ${T}\nprint(${{ w: 'w * 1000', h: '1.005 * T + w * (2501 + 1.82 * T)', water: `max(0.0, w - w2) * ${ma} * 3600` }[ask]})`);
  }),

  SKILL('th.afr', 'Combustion: air–fuel ratio', 'Burning CₓHᵧ completely takes x + y/4 moles of O₂; air brings 3.76 moles of N₂ with each. Excess air leaves as O₂ in the products.', t => {
    const [fuel, x, y] = t.pick([['methane, CH₄', 1, 4], ['propane, C₃H₈', 3, 8], ['octane, C₈H₁₈', 8, 18], ['dodecane, C₁₂H₂₆', 12, 26]]), ex = t.pick([0, 10, 20, 25, 50]), ask = t.pick(['afr', 'o2', 'co2']);
    const ast = x + y / 4, a = ast * (1 + ex / 100), Mf = 12.011 * x + 1.008 * y, afr = a * (31.998 + 3.76 * 28.014) / Mf;
    const nCO2 = x, nH2O = y / 2, nO2 = a - ast, nN2 = 3.76 * a, wet = nCO2 + nH2O + nO2 + nN2, dry = wet - nH2O;
    if (ask === 'o2' && ex === 0) return num(`${fuel[0].toUpperCase() + fuel.slice(1)} burns completely in theoretical air (O₂ + 3.76 N₂). What is the air–fuel ratio by mass? (Molar masses: C 12.011, H 1.008, O₂ 31.998, N₂ 28.014.) (4 significant figures)`, r4(afr), `O₂ needed = x + y/4 = ${ast} mol per mol of fuel; AFR = ${ast}·(31.998 + 3.76·28.014)/${r4(Mf)} = ${r4(afr)}.`, `# atom balance for the oxygen needed\nx, y = ${x}, ${y}\nO2 = (2 * x + y / 2) / 2\nprint(O2 * (31.998 + 3.76 * 28.014) / (12.011 * x + 1.008 * y))`);
    const what = { afr: 'the air–fuel ratio by mass', o2: 'the mole fraction of O₂ in the wet products', co2: 'the percentage of CO₂ in the dry products, by volume' }[ask];
    return num(`${fuel[0].toUpperCase() + fuel.slice(1)} burns completely with ${ex}% excess air (air is O₂ + 3.76 N₂). What is ${what}? (Molar masses: C 12.011, H 1.008, O₂ 31.998, N₂ 28.014.) (4 significant figures)`, r4({ afr, o2: nO2 / wet, co2: 100 * nCO2 / dry }[ask]),
      `Theoretical O₂ = x + y/4 = ${ast}; with ${ex}% excess, ${r4(a)} mol O₂ and ${r4(nN2)} mol N₂. Products: ${x} CO₂, ${y / 2} H₂O, ${r4(nO2)} O₂, ${r4(nN2)} N₂. AFR = ${r4(afr)}; O₂ is ${r4(nO2 / wet)} of the wet products; CO₂ is ${r4(100 * nCO2 / dry)}% of the dry.`,
      `# solve the atom balance (C, H, O, N) for the product moles as a linear system\nx, y, ex = ${x}, ${y}, ${ex}\na = (x + y / 4) * (1 + ex / 100)\n# unknowns: CO2, H2O, O2, N2\nA = [[1, 0, 0, 0], [0, 2, 0, 0], [2, 1, 2, 0], [0, 0, 0, 2]]; b = [x, y, 2 * a, 2 * 3.76 * a]\nM = [row + [v] for row, v in zip(A, b)]\nfor c in range(4):\n    p = max(range(c, 4), key=lambda r: abs(M[r][c])); M[c], M[p] = M[p], M[c]\n    for r in range(4):\n        if r != c: f = M[r][c] / M[c][c]; M[r] = [u - f * v for u, v in zip(M[r], M[c])]\nCO2, H2O, O2, N2 = (M[i][4] / M[i][i] for i in range(4))\nprint(${{ afr: '(a * 31.998 + 3.76 * a * 28.014) / (12.011 * x + 1.008 * y)', o2: 'O2 / (CO2 + H2O + O2 + N2)', co2: '100 * CO2 / (CO2 + O2 + N2)' }[ask]})`);
  }),
];
