/**
 * Mechanical Engineering: graphics, CAD and design (2.007, Engineering
 * Graphics and Design; FE Mechanical topics 6.E, 7.G, 14.H and 14.J).
 *
 * Checks take another route: solids built from voxels and projected, centroids
 * by Green's theorem around the boundary, linkages swept through a full turn,
 * tolerance stacks by trying every extreme or convolving the distributions,
 * fits by trying every size in the zones, concept rankings by bisection, and
 * gear trains by pitch-line speed and power.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, rtol: 0.003, dp: 4, explain, python, ...extra });
const r4 = x => Number(x.toPrecision(4));
const EXACT = { rtol: 0, tol: 0, dp: 0 };
const deg = x => x * 180 / Math.PI;

export const MEDESIGN = [
  SKILL('des.ortho', 'Orthographic views of a block model', 'A front view shows the tallest stack in each column, a side view the tallest in each row, and a top view every occupied cell; the surface counts every face with no neighbour.', t => {
    const cols = t.int(3, 4), rows = 3;
    let h;
    do { h = Array.from({ length: rows }, () => Array.from({ length: cols }, () => t.pick([0, 1, 1, 2, 2, 3]))); } while (h.flat().filter(v => v > 0).length < 5);
    const ask = t.pick(['front', 'side', 'top', 'surface']);
    const front = [...Array(cols).keys()].reduce((s, c) => s + Math.max(...h.map(r => r[c])), 0);
    const side = h.reduce((s, r) => s + Math.max(...r), 0), top = h.flat().filter(v => v > 0).length;
    const at = (r, c) => (r < 0 || r >= rows || c < 0 || c >= cols ? 0 : h[r][c]);
    let surface = 2 * top;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) surface += Math.max(0, h[r][c] - at(r + dr, c + dc));
    const what = { front: 'how many unit squares the front view covers (looking from the front row toward the back)', side: 'how many unit squares the right-side view covers', top: 'how many unit squares the top view covers', surface: 'the total exposed surface area of the solid, in unit squares, counting the bottom' }[ask];
    const names = ['Back', 'Middle', 'Front'];
    return num(`Unit cubes are stacked on a ${rows} × ${cols} grid. Stack heights, left to right: ${h.map((r, i) => `${names[i]} row ${r.join(' ')}`).join('; ')}. What is ${what}?`, { front, side, top, surface }[ask],
      `Front view: the tallest stack in each column, summed (${front}). Side view: the tallest in each row (${side}). Top view: occupied cells (${top}). Surface: top and bottom (2 × ${top}) plus every step down to a lower neighbour or the edge = ${surface}.`,
      `# build the solid from voxels, project it, and count faces with no neighbour\nh = ${JSON.stringify(h)}\nvox = {(r, c, z) for r, row in enumerate(h) for c, v in enumerate(row) for z in range(v)}\nfront = len({(c, z) for r, c, z in vox}); side = len({(r, z) for r, c, z in vox}); top = len({(r, c) for r, c, z in vox})\nsurface = sum((r + dr, c + dc, z + dz) not in vox for r, c, z in vox for dr, dc, dz in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)])\nprint(${ask})`, EXACT);
  }),

  SKILL('des.centroid', 'Centroid of a plate with cut-outs', 'Composite areas: x̄ = Σ Aᵢx̄ᵢ / Σ Aᵢ, with holes counted as negative area.', t => {
    const W = t.pick([120, 150, 200]), H = t.pick([80, 100, 120]), Dh = t.pick([20, 30, 40]);
    const xc = t.int(Dh / 2 + 10, W / 2 - Dh / 2 - 5), yc = t.int(Dh / 2 + 10, H - Dh / 2 - 10);
    const w = t.pick([20, 30, 40]), hh = t.pick([20, 30]), x1 = t.int(W / 2 + 5, W - w - 10), y1 = t.int(10, H - hh - 10), ask = t.pick(['x', 'y']);
    const Ap = W * H, Ac = Math.PI * Dh * Dh / 4, Ar = w * hh, A = Ap - Ac - Ar;
    const xb = (Ap * W / 2 - Ac * xc - Ar * (x1 + w / 2)) / A, yb = (Ap * H / 2 - Ac * yc - Ar * (y1 + hh / 2)) / A;
    return num(`A ${W} × ${H} mm plate has a ${Dh} mm hole centred at (${xc}, ${yc}) and a ${w} × ${hh} mm rectangular cut-out with its lower-left corner at (${x1}, ${y1}), all measured from the plate's lower-left corner. Where is the centroid's ${ask} coordinate, in mm? (4 significant figures)`, r4(ask === 'x' ? xb : yb),
      `Plate ${Ap} mm² at (${W / 2}, ${H / 2}), hole −${r4(Ac)} mm² at (${xc}, ${yc}), cut-out −${Ar} mm² at (${x1 + w / 2}, ${y1 + hh / 2}). x̄ = ${r4(xb)} mm, ȳ = ${r4(yb)} mm.`,
      `import math\n# Green's theorem around each boundary: outer edge anticlockwise, holes clockwise (the circle as a 200 000-gon)\ndef loop(pts):\n    A = Qx = Qy = 0.0\n    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):\n        cr = x0 * y1 - x1 * y0\n        A += cr / 2; Qy += (x0 + x1) * cr / 6; Qx += (y0 + y1) * cr / 6\n    return A, Qy, Qx\nW, H, D, xc, yc, w, h, x1, y1 = ${W}, ${H}, ${Dh}, ${xc}, ${yc}, ${w}, ${hh}, ${x1}, ${y1}\nN = 200000\nparts = [loop([(0, 0), (W, 0), (W, H), (0, H)]),\n         loop([(xc + D / 2 * math.cos(-2 * math.pi * k / N), yc + D / 2 * math.sin(-2 * math.pi * k / N)) for k in range(N)]),\n         loop([(x1, y1), (x1, y1 + h), (x1 + w, y1 + h), (x1 + w, y1)])]\nA = sum(p[0] for p in parts)\nprint(sum(p[${ask === 'x' ? 1 : 2}] for p in parts) / A)`);
  }),

  SKILL('des.grashof', 'Four-bar linkages', 'Grashof: if s + l ≤ p + q, the shortest link can turn fully; with it as the crank you get a crank-rocker. The transmission angle is extreme where the crank lines up with the ground link.', t => {
    let a, b, c, d;
    do { a = t.int(20, 40); b = t.int(60, 120); c = t.int(60, 120); d = t.int(60, 120); } while (a + Math.max(b, c, d) > b + c + d - Math.max(b, c, d) - 5);
    const fold = mu => (mu > 90 ? 180 - mu : mu);
    const mu = s => deg(Math.acos((b * b + c * c - s * s) / (2 * b * c)));
    const mumin = Math.min(fold(mu(d - a)), fold(mu(d + a)));
    const phi = s => deg(Math.acos((c * c + d * d - s * s) / (2 * c * d))), swing = Math.abs(phi(b + a) - phi(b - a)), ask = t.pick(['mu', 'swing']);
    return num(`A four-bar linkage has ground link ${d} mm, crank ${a} mm, coupler ${b} mm and rocker ${c} mm. The crank turns fully. What is ${ask === 'mu' ? 'the smallest transmission angle over a turn (the coupler–rocker angle, folded to 90° or less), in degrees' : 'the angle through which the rocker swings, in degrees'}? (4 significant figures)`, r4(ask === 'mu' ? mumin : swing),
      `${a} + ${Math.max(b, c, d)} ≤ the other two, so the crank turns fully. With the crank along the ground link the crank-pin is ${d - a} or ${d + a} mm from the rocker pivot, giving transmission angles ${r4(mu(d - a))}° and ${r4(mu(d + a))}°: the smallest (folded) is ${r4(mumin)}°. The rocker's extremes are where crank and coupler line up (${b + a} and ${b - a} mm): swing ${r4(swing)}°.`,
      `import math\n# sweep the crank through a full turn, solving the loop for the coupler-rocker pin, then refine the extreme\na, b, c, d = ${a}, ${b}, ${c}, ${d}\ndef state(th):\n    ax, ay = a * math.cos(th), a * math.sin(th)\n    dx, dy = d - ax, ay * -1; L = math.hypot(dx, dy)\n    k = (b * b - c * c + L * L) / (2 * L); hgt = math.sqrt(b * b - k * k)\n    ux, uy = dx / L, dy / L\n    bx, by = ax + k * ux - hgt * uy, ay + k * uy + hgt * ux\n    mu = math.degrees(math.acos(((ax - bx) * (d - bx) + (ay - by) * (0 - by)) / (b * c)))\n    return min(mu, 180 - mu), math.degrees(math.atan2(by, bx - d))\nref = state(0)[1]\nrel = lambda th: (state(th)[1] - ref + 180) % 360 - 180   # rocker angle relative to its start, so it never wraps\ndef extreme(f, sign):\n    grid = [i * 2 * math.pi / 36000 for i in range(36000)]\n    best = min(grid, key=lambda th: sign * f(th))\n    lo, hi = best - 2 * math.pi / 36000, best + 2 * math.pi / 36000\n    for _ in range(100):\n        m1, m2 = lo + (hi - lo) / 3, hi - (hi - lo) / 3\n        lo, hi = (lo, m2) if sign * f(m1) < sign * f(m2) else (m1, hi)\n    return f(lo)\n${ask === 'mu' ? 'print(extreme(lambda th: state(th)[0], 1))' : 'print(extreme(rel, -1) - extreme(rel, 1))'}`);
  }),

  SKILL('des.stack', 'Tolerance stack-up', 'Worst case adds every tolerance; the statistical (RSS) stack treats each ±t as ±3σ, so the gap varies by ±√(Σt²) — much less when there are many parts.', t => {
    const n = 3, p = Array.from({ length: n }, () => t.int(10, 40)), tp = Array.from({ length: n }, () => t.pick([0.05, 0.1, 0.15, 0.2, 0.25]));
    const g = t.pick([0.3, 0.4, 0.5, 0.6, 0.8, 1.0]), H = p.reduce((s, v) => s + v, 0) + g, tH = t.pick([0.05, 0.1, 0.15, 0.2]), ask = t.pick(['wcmin', 'wcmax', 'rss']);
    const sumT = tH + tp.reduce((s, v) => s + v, 0), rss = Math.sqrt(tH * tH + tp.reduce((s, v) => s + v * v, 0));
    const ans = { wcmin: g - sumT, wcmax: g + sumT, rss: g - rss }[ask];
    const what = { wcmin: 'the worst-case minimum gap', wcmax: 'the worst-case maximum gap', rss: 'the statistical (RSS) minimum gap, treating each tolerance as ±3σ of a normal distribution' }[ask];
    return num(`Three parts of ${p.map((v, i) => `${v} ± ${tp[i]}`).join(', ')} mm sit end to end in a housing whose inside length is ${H.toFixed(1)} ± ${tH} mm. What is ${what}, in mm? (4 significant figures; negative means interference)`, r4(ans),
      `Nominal gap ${r4(g)} mm. Worst case: ± (${tH} + ${tp.join(' + ')}) = ±${r4(sumT)} mm. RSS: ±√(${[tH, ...tp].map(v => `${v}²`).join(' + ')}) = ±${r4(rss)} mm.`,
      ask === 'rss'
        ? `import math\n# convolve the parts' normal distributions on a fine grid and take 3 standard deviations of the result\ntols = ${JSON.stringify([tH, ...tp])}\nsig = [v / 3 for v in tols]; h = min(sig) / 4\ndist = [1.0]\nfor s in sig:\n    K = math.ceil(8 * s / h)\n    pdf = [math.exp(-(k * h) ** 2 / (2 * s * s)) for k in range(-K, K + 1)]; tot = sum(pdf); pdf = [v / tot for v in pdf]\n    out = [0.0] * (len(dist) + len(pdf) - 1)\n    for i, u in enumerate(dist):\n        for j, v in enumerate(pdf): out[i + j] += u * v\n    dist = out\nmid = (len(dist) - 1) / 2\nvar = sum(p * ((i - mid) * h) ** 2 for i, p in enumerate(dist))\nprint(${g} - 3 * math.sqrt(var))`
        : `import itertools\n# try every combination of extreme sizes\nH, tH, p, tp = ${H}, ${tH}, ${JSON.stringify(p)}, ${JSON.stringify(tp)}\ngaps = [H + sH * tH - sum(v + s * t for v, s, t in zip(p, signs, tp)) for sH in (-1, 1) for signs in itertools.product((-1, 1), repeat=len(p))]\nprint(${ask === 'wcmin' ? 'min' : 'max'}(gaps))`);
  }),

  SKILL('des.fit', 'Limits and fits', 'Maximum clearance = largest hole − smallest shaft; minimum clearance = smallest hole − largest shaft. Negative clearance is interference.', t => {
    const D = t.pick([20, 22, 25, 28, 30]);
    const [fit, EI, ES, ei, es] = t.pick([['H7/f7', 0, 21, -41, -20], ['H7/g6', 0, 21, -20, -7], ['H7/h6', 0, 21, -13, 0], ['H7/k6', 0, 21, 2, 15], ['H7/n6', 0, 21, 15, 28], ['H7/p6', 0, 21, 22, 35], ['H7/s6', 0, 21, 35, 48], ['H8/f7', 0, 33, -41, -20]]);
    const ask = t.pick(['max', 'min']), cmax = ES - ei, cmin = EI - es, mm = v => (D + v / 1000).toFixed(3);
    return num(`A Ø${D} ${fit} fit: the hole is ${mm(EI)} to ${mm(ES)} mm and the shaft ${mm(ei)} to ${mm(es)} mm. What is the ${ask === 'max' ? 'maximum' : 'minimum'} clearance, in µm? (negative means interference)`, ask === 'max' ? cmax : cmin,
      `Maximum clearance = largest hole − smallest shaft = ${ES} − (${ei}) = ${cmax} µm. Minimum clearance = smallest hole − largest shaft = ${EI} − (${es}) = ${cmin} µm. ${cmin >= 0 ? 'Always clearance.' : cmax <= 0 ? 'Always interference.' : 'A transition fit: either can occur.'}`,
      `# try every hole and shaft size in the tolerance zones, in 1 um steps\nhole = range(${D * 1000 + EI}, ${D * 1000 + ES} + 1); shaft = range(${D * 1000 + ei}, ${D * 1000 + es} + 1)\nprint(${ask}(H - s for H in hole for s in shaft))`, EXACT);
  }),

  SKILL('des.pugh', 'Weighted decision matrices', 'Each concept\'s score is Σ wᵢsᵢ. Before trusting the winner, ask how far a weight must move to change it.', t => {
    const all = ['cost', 'mass', 'safety', 'manufacturability', 'durability', 'ease of use'];
    let crit, w, s, tot, order, k;
    do {
      crit = [...all].sort(() => t.rng() - 0.5).slice(0, t.int(4, 5));
      w = crit.map(() => t.int(1, 5)); s = [0, 1, 2].map(() => crit.map(() => t.int(1, 5)));
      tot = s.map(r => r.reduce((acc, v, i) => acc + v * w[i], 0)); order = [0, 1, 2].sort((x, y) => tot[y] - tot[x]);
      k = crit.findIndex((_, i) => s[order[1]][i] > s[order[0]][i]);
    } while (tot[order[0]] === tot[order[1]] || k < 0);
    const W = order[0], Rn = order[1], L = 'ABC';
    const wstar = w[k] + (tot[W] - tot[Rn]) / (s[Rn][k] - s[W][k]);
    const table = crit.map((c, i) => `${c} (weight ${w[i]}): A ${s[0][i]}, B ${s[1][i]}, C ${s[2][i]}`).join('; ');
    return num(`Three concepts are scored 1–5 against weighted criteria — ${table}. Concept ${L[W]} leads. If only the weight on ${crit[k]} changes, at what weight does concept ${L[Rn]} tie with ${L[W]}? (4 significant figures)`, r4(wstar),
      `Totals: A ${tot[0]}, B ${tot[1]}, C ${tot[2]}. ${L[Rn]} gains ${s[Rn][k] - s[W][k]} per unit of weight on ${crit[k]}, and trails by ${tot[W] - tot[Rn]}, so the tie comes at ${w[k]} + ${tot[W] - tot[Rn]}/${s[Rn][k] - s[W][k]} = ${r4(wstar)}.`,
      `# bisect on the weight until the two totals meet\nw, s, k, W, R = ${JSON.stringify(w)}, ${JSON.stringify(s)}, ${k}, ${W}, ${Rn}\ndef gap(x):\n    ww = list(w); ww[k] = x\n    return sum(a * b for a, b in zip(s[W], ww)) - sum(a * b for a, b in zip(s[R], ww))\nlo, hi = w[k], w[k] + 100.0\nfor _ in range(200):\n    m = (lo + hi) / 2\n    lo, hi = (m, hi) if gap(m) > 0 else (lo, m)\nprint(lo)`);
  }),

  SKILL('des.gears', 'Gear trains', 'Each mesh divides speed by z_driven/z_driver and multiplies torque by the same ratio times the mesh efficiency.', t => {
    const nin = t.pick([1500, 1750, 3000]), Tin = t.pick([0.5, 1, 2, 5]), k = t.int(2, 3), eta = t.pick([0.95, 0.97, 0.98]);
    const st = Array.from({ length: k }, () => [t.pick([12, 15, 16, 18, 20]), t.pick([36, 40, 45, 48, 60]), t.pick([1, 1.5, 2])]);
    const ratio = st.reduce((p, [z1, z2]) => p * z2 / z1, 1), nout = nin / ratio, Tout = Tin * ratio * eta ** k, ask = t.pick(['n', 'T']);
    return num(`A motor turning at ${nin} rpm with ${Tin} N·m drives a compound gear train of ${k} stages: ${st.map(([z1, z2, m], i) => `stage ${i + 1} a ${z1}-tooth pinion driving a ${z2}-tooth gear (module ${m} mm)`).join(', ')}. Each mesh is ${Math.round(eta * 100)}% efficient. What is the output ${ask === 'n' ? 'speed, in rpm' : 'torque, in N·m'}? (4 significant figures)`, r4(ask === 'n' ? nout : Tout),
      `Overall ratio = ${st.map(([z1, z2]) => `${z2}/${z1}`).join(' × ')} = ${r4(ratio)}. Speed ${nin}/${r4(ratio)} = ${r4(nout)} rpm. Torque ${Tin} × ${r4(ratio)} × ${eta}^${k} = ${r4(Tout)} N·m.`,
      `import math\n# pass pitch-line speed across each mesh and power along the train\nstages, eta = ${JSON.stringify(st)}, ${eta}\nw = ${nin} * 2 * math.pi / 60; P = ${Tin} * w\nfor z1, z2, m in stages:\n    v = w * m * z1 / 2000          # pitch-line speed, m/s\n    w = v / (m * z2 / 2000); P *= eta\nprint(${ask === 'n' ? 'w * 60 / (2 * math.pi)' : 'P / w'})`);
  }),
];
