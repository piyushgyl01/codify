/**
 * CS210 Computer Architecture — the calculations an architect does on paper:
 * Boolean functions and a sequence detector, IEEE 754 floats, tracing and
 * encoding RISC-V, a single-cycle datapath's critical path, pipeline stalls,
 * cache address fields and hit counts, AMAT, virtual-to-physical translation
 * and Amdahl's law. CS2023 AR-Logic, AR-Representation, AR-Assembly,
 * AR-Organization, AR-Memory and AR-Performance-Energy.
 *
 * Each question carries `python`: a separate implementation (a tiny RISC-V
 * interpreter, a cache simulator, struct for floats) that prints the answer.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const csv = a => a.join(', ');
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const hex = (n, w = 8) => `0x${(n >>> 0).toString(16).toUpperCase().padStart(w, '0')}`;

/* A random Boolean function of A, B, C, D, written two ways: for the reader and for Python. */
function boolExpr(t, vars) {
  const leaf = () => { const v = t.pick(vars), neg = t.rng() < 0.35; return { s: neg ? `${v}'` : v, py: neg ? `(not ${v})` : v, f: e => (neg ? !e[v] : e[v]) }; };
  const join = (a, b, op) => ({
    and: { s: `${a.s}·${b.s}`, py: `(${a.py} and ${b.py})`, f: e => a.f(e) && b.f(e) },
    or: { s: `(${a.s} + ${b.s})`, py: `(${a.py} or ${b.py})`, f: e => a.f(e) || b.f(e) },
    xor: { s: `(${a.s} ⊕ ${b.s})`, py: `(${a.py} != ${b.py})`, f: e => a.f(e) !== b.f(e) },
  })[op];
  const term = () => join(leaf(), leaf(), t.pick(['and', 'and', 'xor']));
  return join(term(), term(), t.pick(['or', 'or', 'xor']));
}

export const ARCH = [
  SKILL('ar.bool', 'Boolean functions and sequential logic', 'Truth tables from expressions, and a finite-state sequence detector.', t => {
    if (t.rng() < 0.6) {
      const vars = t.rng() < 0.5 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'], e = boolExpr(t, vars);
      let ones = 0;
      for (let m = 0; m < 1 << vars.length; m++) { const env = Object.fromEntries(vars.map((v, i) => [v, !!(m >> i & 1)])); if (e.f(env)) ones++; }
      return num(`F = ${e.s}, where · is AND, + is OR, ⊕ is XOR and ' is NOT. For how many of the ${1 << vars.length} input combinations of ${vars.join(', ')} is F = 1?`, ones,
        `Fill in the truth table row by row: F is 1 in ${ones} rows. That count is the number of minterms in F's sum-of-products form.`,
        `from itertools import product\nprint(sum(1 for ${vars.join(', ')} in product([False, True], repeat=${vars.length}) if ${e.py}))`);
    }
    const pat = t.pick(['101', '110', '011', '1001', '0110']);
    const bits = Array.from({ length: 16 }, () => (t.rng() < 0.5 ? '1' : '0')).join('');
    let hits = 0;
    for (let i = pat.length; i <= bits.length; i++) if (bits.slice(i - pat.length, i) === pat) hits++;
    return num(`A Moore machine outputs 1 whenever the last ${pat.length} input bits were ${pat} (overlaps count). The input stream is ${bits}. How many times does it output 1?`, hits,
      `Slide a ${pat.length}-bit window along the stream and count the matches: ${hits}. The machine needs ${pat.length + 1} states to remember how much of ${pat} it has seen.`,
      `s = ${PY(bits)}\nprint(sum(1 for i in range(len(s) - ${pat.length} + 1) if s[i:i + ${pat.length}] == ${PY(pat)}))`);
  }),

  SKILL('ar.float', 'IEEE 754 floating point', 'Decode a 32-bit float: sign, biased exponent and the hidden 1.', t => {
    const sign = t.rng() < 0.3 ? 1 : 0, e = t.int(-4, 8), frac = t.int(0, 15);           // value = ±(1 + frac/16) · 2^e
    const bits = (sign << 31) | ((e + 127) << 23) | (frac << 19);
    const value = (sign ? -1 : 1) * (1 + frac / 16) * 2 ** e;
    return num(`What decimal value does the IEEE 754 single-precision bit pattern ${hex(bits)} represent?`, value,
      `Sign ${sign}; exponent field ${e + 127}, so 2^(${e + 127} − 127) = 2^${e}; fraction ${frac}/16, so the significand is 1 + ${frac}/16 = ${1 + frac / 16}. Value: ${sign ? '−' : ''}${1 + frac / 16} × 2^${e} = ${value}.`,
      `import struct\nprint(struct.unpack('>f', bytes.fromhex('${hex(bits).slice(2)}'))[0])`, { tol: 1e-9, dp: 6 });
  }),

  SKILL('ar.riscv', 'Tracing RISC-V', 'Run a short RV32I program in your head: registers, a loop and a branch.', t => {
    const a = t.int(2, 9), b = t.int(2, 6), k = t.int(1, 3), form = t.int(0, 2);
    const prog = form === 0
      ? [`addi x5, x0, ${a}`, `addi x6, x0, ${b}`, `addi x7, x0, 0`, 'loop:', 'add  x7, x7, x5', 'addi x6, x6, -1', 'bne  x6, x0, loop']
      : form === 1
        ? [`addi x5, x0, ${a}`, `slli x6, x5, ${k}`, `sub  x7, x6, x5`, `addi x7, x7, ${b}`]
        : [`addi x5, x0, ${a * 8 + b}`, `andi x6, x5, ${7}`, `srli x7, x5, 3`, `add  x7, x7, x6`];
    const ans = form === 0 ? a * b : form === 1 ? (a << k) - a + b : (a * 8 + b >> 3) + ((a * 8 + b) & 7);
    const py = `prog = ${PY(prog)}
labels, code = {}, []
for line in prog:
    if line.endswith(':'):
        labels[line[:-1]] = len(code)
    else:
        op, rest = line.split(None, 1)
        code.append((op, [x.strip() for x in rest.split(',')]))
R = [0] * 32
def r(x): return R[int(x[1:])]
def w(x, v):
    if x != 'x0': R[int(x[1:])] = ((v + 2**31) % 2**32) - 2**31
pc = 0
while pc < len(code):
    op, a = code[pc]; pc += 1
    if op == 'addi': w(a[0], r(a[1]) + int(a[2]))
    elif op == 'add': w(a[0], r(a[1]) + r(a[2]))
    elif op == 'sub': w(a[0], r(a[1]) - r(a[2]))
    elif op == 'slli': w(a[0], r(a[1]) << int(a[2]))
    elif op == 'srli': w(a[0], (r(a[1]) % 2**32) >> int(a[2]))
    elif op == 'andi': w(a[0], r(a[1]) & int(a[2]))
    elif op == 'bne' and r(a[0]) != r(a[1]): pc = labels[a[2]]
print(R[7])`;
    return num('What is in x7 when this RV32I program finishes?', ans,
      form === 0 ? `The loop adds x5 = ${a} to x7 once per iteration and counts x6 down from ${b}: x7 = ${a} × ${b} = ${a * b}.`
        : form === 1 ? `x6 = ${a} << ${k} = ${a << k}; x7 = ${a << k} − ${a} + ${b} = ${ans}. Shifting left by ${k} multiplies by ${2 ** k}.`
          : `x5 = ${a * 8 + b}; andi with 7 keeps the low 3 bits (${(a * 8 + b) & 7}); srli by 3 divides by 8 (${a * 8 + b >> 3}); their sum is ${ans}.`,
      py, { code: prog.map(l => (l.endsWith(':') ? l : `  ${l}`)).join('\n') });
  }),

  SKILL('ar.encode', 'Encoding RISC-V instructions', 'Assemble an R-type instruction into its 32 bits: funct7, rs2, rs1, funct3, rd, opcode.', t => {
    const OPS = { add: [0x00, 0x0], sub: [0x20, 0x0], sll: [0x00, 0x1], xor: [0x00, 0x4], or: [0x00, 0x6], and: [0x00, 0x7] };
    const op = t.pick(Object.keys(OPS)), [rd, rs1, rs2] = [t.int(1, 31), t.int(1, 31), t.int(1, 31)];
    const enc = (f7, f3, d, s1, s2) => (((f7 << 25) | (s2 << 20) | (s1 << 15) | (f3 << 12) | (d << 7) | 0x33) >>> 0);
    const [f7, f3] = OPS[op], right = hex(enc(f7, f3, rd, rs1, rs2));
    const wrong = [hex(enc(f7, f3, rd, rs2, rs1)), hex(enc(f7 ^ 0x20, f3, rd, rs1, rs2)), hex(enc(f7, f3, rs1, rd, rs2))].filter(w => w !== right);
    while (wrong.length < 3) wrong.push(hex(enc(f7, (f3 + wrong.length + 1) & 7, rd, rs1, rs2)));
    return { kind: 'mc', q: `Encode the RV32I instruction ${op} x${rd}, x${rs1}, x${rs2} (opcode 0x33, funct7 ${hex(f7, 2)}, funct3 ${f3}).`, options: [right, ...wrong.slice(0, 3)], correct: 0,
      explain: `R-type is funct7 | rs2 | rs1 | funct3 | rd | opcode: ${hex(f7, 2)} | ${rs2} | ${rs1} | ${f3} | ${rd} | 0x33 = ${right}. Mixing up rs1 and rs2 is the usual slip.`,
      python: `v = (${f7} << 25) | (${rs2} << 20) | (${rs1} << 15) | (${f3} << 12) | (${rd} << 7) | 0x33\nprint('0x%08X' % v)` };
  }),

  SKILL('ar.critical', 'Critical paths', 'The clock of a single-cycle datapath is set by its slowest instruction.', t => {
    const d = { imem: t.int(150, 250), reg: t.int(80, 150), mux: t.int(20, 40), alu: t.int(120, 220), dmem: t.int(150, 300), setup: t.int(20, 40) };
    const paths = {
      'R-type': d.imem + d.reg + d.mux + d.alu + d.mux + d.setup,
      lw: d.imem + d.reg + d.alu + d.dmem + d.mux + d.setup,
      sw: d.imem + d.reg + d.alu + d.dmem,
      beq: d.imem + d.reg + d.mux + d.alu + d.mux,
    };
    const form = t.rng() < 0.6 ? 'clock' : t.pick(['R-type', 'beq']);
    const ans = form === 'clock' ? Math.max(...Object.values(paths)) : paths[form];
    const py = `d = ${PY(d)}\np = {'R-type': d['imem'] + d['reg'] + d['mux'] + d['alu'] + d['mux'] + d['setup'], 'lw': d['imem'] + d['reg'] + d['alu'] + d['dmem'] + d['mux'] + d['setup'], 'sw': d['imem'] + d['reg'] + d['alu'] + d['dmem'], 'beq': d['imem'] + d['reg'] + d['mux'] + d['alu'] + d['mux']}\nprint(${form === 'clock' ? 'max(p.values())' : `p[${PY(form)}]`})`;
    return num(`Single-cycle datapath delays (ps): instruction memory ${d.imem}, register read ${d.reg}, mux ${d.mux}, ALU ${d.alu}, data memory ${d.dmem}, register-write setup ${d.setup}. R-type: I-mem → reg → mux → ALU → mux → setup. lw: I-mem → reg → ALU → D-mem → mux → setup. sw: I-mem → reg → ALU → D-mem. beq: I-mem → reg → mux → ALU → mux. ${form === 'clock' ? 'What is the minimum clock period, in ps?' : `How long is the ${form} path, in ps?`}`, ans,
      form === 'clock' ? `Every instruction must finish in one cycle, so the clock is the slowest path: ${Object.entries(paths).map(([k, v]) => `${k} ${v}`).join(', ')} → ${ans} ps. Pipelining exists to stop the slowest instruction setting everyone's pace.`
        : `Add the components on the ${form} path: ${ans} ps.`, py);
  }),

  SKILL('ar.pipeline', 'Pipeline hazards', 'Count stall cycles in a five-stage pipeline, with and without forwarding.', t => {
    const n = t.int(4, 6), regs = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6'], ins = [];
    for (let i = 0; i < n; i++) {
      const lw = t.rng() < 0.35, rd = t.pick(regs), rs = t.pickN(regs, 2);
      if (i > 0 && t.rng() < 0.6) rs[0] = ins[i - 1].rd;          // plenty of dependences
      ins.push(lw ? { op: 'lw', rd, rs: [rs[0]], text: `lw   ${rd}, 0(${rs[0]})` } : { op: t.pick(['add', 'sub']), rd, rs, text: `${t.pick(['add', 'sub'])}  ${rd}, ${rs[0]}, ${rs[1]}` });
    }
    const fwd = t.rng() < 0.6;
    // Distance rule: with forwarding only a load followed at distance 1 by a reader stalls 1; without, the register file
    // writes in the first half and reads in the second, so a reader needs distance ≥ 3.
    const issue = []; let stalls = 0;
    for (let i = 0; i < n; i++) {
      let at = i === 0 ? 1 : issue[i - 1] + 1;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (!ins[i].rs.includes(ins[j].rd)) continue;
        const need = fwd ? (ins[j].op === 'lw' ? issue[j] + 2 : issue[j] + 1) : issue[j] + 3;
        at = Math.max(at, need);
      }
      stalls += at - (i === 0 ? 1 : issue[i - 1] + 1);
      issue.push(at);
    }
    const total = issue[n - 1] + 4;
    const py = `ins = ${PY(ins.map(x => [x.op, x.rd, x.rs]))}
fwd = ${fwd ? 'True' : 'False'}
# Cycle-by-cycle: an instruction may leave ID only once each source value can reach EX in time.
ID, EX, MEM, WB = [], [], [], []
for i, (op, rd, rs) in enumerate(ins):
    d = (ID[i - 1] + 1) if i else 2
    for j in range(i):
        if ins[j][1] not in rs: continue
        if fwd:
            ready = MEM[j] if ins[j][0] == 'lw' else EX[j]   # value exists at the end of this stage
            d = max(d, ready)                                 # EX of i must start after it
        else:
            d = max(d, WB[j])                                 # read in the second half of WB's cycle
    ID.append(d); EX.append(d + 1); MEM.append(d + 2); WB.append(d + 3)
print(WB[-1])`;
    return num(`A classic five-stage pipeline (IF ID EX MEM WB), one instruction issued per cycle, no branches. ${fwd ? 'Full forwarding to EX; a load\'s value is available after MEM.' : 'No forwarding; the register file is written in the first half of a cycle and read in the second.'} The first instruction is fetched in cycle 1. In which cycle does the last instruction finish WB?`, total,
      `${fwd ? 'With forwarding, only a load followed immediately by a reader of its result stalls (one cycle).' : 'Without forwarding, a reader must be at least three instructions behind its producer.'} Stalls: ${stalls}. With no stalls ${n} instructions finish in cycle ${n + 4}; so the answer is ${n + 4} + ${stalls} = ${total}.`,
      py, { code: ins.map(x => x.text).join('\n') });
  }),

  SKILL('ar.cache', 'Caches', 'Split an address into tag, index and offset, and simulate hits and misses.', t => {
    if (t.rng() < 0.45) {
      const size = 2 ** t.int(12, 16), block = 2 ** t.int(4, 7), ways = t.pick([1, 2, 4, 8]);
      const off = Math.log2(block), idx = Math.log2(size / (block * ways)), tag = 32 - idx - off, field = t.pick(['tag', 'index', 'offset']);
      const ans = { tag, index: idx, offset: off }[field];
      return num(`A ${size / 1024} KiB, ${ways === 1 ? 'direct-mapped' : `${ways}-way set-associative`} cache with ${block}-byte blocks, 32-bit byte addresses. How many ${field} bits?`, ans,
        `Offset: log₂ ${block} = ${off}. Sets: ${size} / (${block} × ${ways}) = ${size / (block * ways)}, so index = ${idx}. Tag: 32 − ${idx} − ${off} = ${tag}.`,
        `from math import log2\nsize, block, ways = ${size}, ${block}, ${ways}\noff = int(log2(block)); idx = int(log2(size // (block * ways)))\nprint({'tag': 32 - idx - off, 'index': idx, 'offset': off}[${PY(field)}])`);
    }
    const sets = t.pick([2, 4]), ways = t.pick([1, 2]), block = 16;
    const addrs = Array.from({ length: 10 }, () => t.int(0, 15) * block + (t.rng() < 0.3 ? 4 : 0));   // a few land mid-block
    const cache = Array.from({ length: sets }, () => []);
    let hits = 0;
    for (const a of addrs) {
      const blk = Math.floor(a / block), s = blk % sets, line = cache[s], at = line.indexOf(blk);
      if (at >= 0) { hits++; line.splice(at, 1); line.push(blk); } else { if (line.length === ways) line.shift(); line.push(blk); }
    }
    return num(`A cache with ${sets} sets, ${ways === 1 ? 'direct-mapped' : `${ways}-way with LRU replacement`}, ${block}-byte blocks, starts empty. Byte addresses accessed in order: ${csv(addrs)}. How many hits?`, hits,
      `Block = ⌊address / ${block}⌋, set = block mod ${sets}. Track each set's ${ways === 1 ? 'one block' : 'blocks in LRU order'}: ${hits} hits, ${addrs.length - hits} misses.`,
      `from collections import OrderedDict\nsets = [OrderedDict() for _ in range(${sets})]\nhits = 0\nfor a in ${PY(addrs)}:\n    b = a // ${block}; s = sets[b % ${sets}]\n    if b in s:\n        hits += 1; s.move_to_end(b)\n    else:\n        if len(s) == ${ways}: s.popitem(last=False)\n        s[b] = True\nprint(hits)`);
  }),

  SKILL('ar.amat', 'Average memory access time', 'AMAT through two levels of cache, and what misses do to CPI.', t => {
    const h1 = t.pick([1, 1, 2]), m1 = t.pick([0.02, 0.04, 0.05, 0.08, 0.1]), h2 = t.pick([8, 10, 12, 15]), m2 = t.pick([0.1, 0.2, 0.25, 0.4]), p = t.pick([80, 100, 150, 200]);
    const amat = h1 + m1 * (h2 + m2 * p);
    return num(`L1: hit time ${h1} cycle${h1 > 1 ? 's' : ''}, miss rate ${m1}. L2: hit time ${h2} cycles, local miss rate ${m2}. Main memory: ${p} cycles. What is the average memory access time, in cycles?`, Math.round(amat * 1000) / 1000,
      `AMAT = h₁ + m₁ × (h₂ + m₂ × penalty) = ${h1} + ${m1} × (${h2} + ${m2} × ${p}) = ${Math.round(amat * 1000) / 1000} cycles.`,
      `print(${h1} + ${m1} * (${h2} + ${m2} * ${p}))`, { tol: 0.005, dp: 3 });
  }),

  SKILL('ar.vm', 'Virtual memory', 'Translate a virtual address through a page table.', t => {
    const pageBits = t.pick([12, 12, 10]), vpn = t.int(0, 7), off = t.int(0, 2 ** pageBits - 1);
    const table = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i, t.int(16, 255)]));
    const va = (vpn << pageBits) | off, pa = (table[vpn] << pageBits) | off;
    const right = hex(pa, 6), wrong = [hex((table[(vpn + 1) % 8] << pageBits) | off, 6), hex((table[vpn] << pageBits), 6), hex((vpn << pageBits) | off, 6)].filter(w => w !== right);
    return { kind: 'mc', q: `Pages are ${2 ** pageBits} bytes. The page table maps VPN → PPN as ${Object.entries(table).map(([v, p]) => `${v}→${p}`).join(', ')}. What physical address does virtual address ${hex(va, 6)} translate to?`,
      options: [right, ...[...new Set(wrong)].slice(0, 3)], correct: 0,
      explain: `The low ${pageBits} bits are the offset (${off}); the rest is the VPN (${vpn}). VPN ${vpn} maps to PPN ${table[vpn]}, so the physical address is ${table[vpn]} × ${2 ** pageBits} + ${off} = ${right}.`,
      python: `table = ${PY(table)}\nva = ${va}\nvpn, off = va >> ${pageBits}, va & ${2 ** pageBits - 1}\nprint('0x%06X' % ((table[str(vpn)] << ${pageBits}) | off))` };
  }),

  SKILL('ar.amdahl', "Amdahl's law", 'How much parallel hardware buys you when part of the work stays serial.', t => {
    const f = t.pick([0.5, 0.6, 0.75, 0.8, 0.9, 0.95]), n = t.pick([2, 4, 8, 16, 64]);
    if (t.rng() < 0.6) {
      const s = 1 / ((1 - f) + f / n);
      return num(`${Math.round(f * 100)}% of a program's run time parallelises perfectly; the rest is serial. What is the speed-up on ${n} cores?`, Math.round(s * 1000) / 1000,
        `Speed-up = 1 / ((1 − f) + f / n) = 1 / (${(1 - f).toFixed(2)} + ${f} / ${n}) = ${s.toFixed(3)}. Even with infinite cores it can never pass 1 / ${(1 - f).toFixed(2)} = ${(1 / (1 - f)).toFixed(1)}.`,
        `print(1 / ((1 - ${f}) + ${f} / ${n}))`, { tol: 0.005, dp: 3 });
    }
    const target = Math.round(((1 / ((1 - f) + f / n)) * 10)) / 10, need = (1 - 1 / target) / (1 - 1 / n);
    return num(`On ${n} cores you want a speed-up of ${target}. What fraction of the run time must parallelise? Answer as a decimal.`, Math.round(need * 1000) / 1000,
      `Solve 1 / ((1 − f) + f / ${n}) = ${target}: f = (1 − 1/${target}) / (1 − 1/${n}) = ${need.toFixed(3)}.`,
      `S, n = ${target}, ${n}\nprint((1 - 1 / S) / (1 - 1 / n))`, { tol: 0.002, dp: 3 });
  }),
];
