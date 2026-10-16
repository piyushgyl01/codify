/**
 * CS340 Computer Networks — CS144-style calculations with exact answers:
 * end-to-end delay, CIDR blocks, longest-prefix match, TCP sequence and
 * acknowledgement numbers, Reno's congestion window, the Internet checksum,
 * the bandwidth-delay product and IP fragmentation. CS2023 NC-Fundamentals,
 * NC-Networked-Applications, NC-Reliability, NC-Routing-And-Forwarding.
 *
 * Addressing is checked with Python's own ipaddress module; the rest by
 * separate simulations in Python.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const ip = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
const r3 = x => Math.round(x * 1000) / 1000;

export const NET = [
  SKILL('net.delay', 'Delay', 'Transmission, propagation and store-and-forward: how long a packet takes end to end.', t => {
    const L = t.pick([1000, 1500, 12000]), R = t.pick([1, 10, 100]), hops = t.int(1, 4), km = t.pick([100, 1000, 4000]), v = 2e8;
    const trans = (L * 8) / (R * 1e6), prop = (km * 1000) / v, total = hops * trans + prop;
    return num(`A ${L}-byte packet crosses ${hops} link${hops > 1 ? 's' : ''} of ${R} Mbit/s each (store and forward at every hop) over ${km} km of fibre in total (signals travel at 2×10⁸ m/s). Ignoring queuing and processing, how many milliseconds from the first bit sent to the last bit received? (3 decimal places)`, r3(total * 1000),
      `Transmission per hop: ${L}×8 / ${R}×10⁶ = ${r3(trans * 1000)} ms, paid ${hops} times because each router waits for the whole packet. Propagation: ${km} km / 2×10⁸ m/s = ${r3(prop * 1000)} ms. Total ${r3(total * 1000)} ms.`,
      `L, R, hops, km = ${L}, ${R}, ${hops}, ${km}\nprint((hops * L * 8 / (R * 1e6) + km * 1000 / 2e8) * 1000)`, { tol: 0.0006, dp: 3 });
  }),

  SKILL('net.cidr', 'Addressing and CIDR', 'Network address, broadcast address and usable hosts of a CIDR block.', t => {
    const prefix = t.int(20, 29), addr = (t.int(10, 223) << 24 | t.int(0, 255) << 16 | t.int(0, 255) << 8 | t.int(1, 254)) >>> 0;
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0, net = (addr & mask) >>> 0, bc = (net | ~mask) >>> 0;
    const field = t.pick(['hosts', 'network', 'broadcast']);
    if (field === 'hosts') return num(`How many usable host addresses does ${ip(addr)}/${prefix} have?`, 2 ** (32 - prefix) - 2,
      `${32 - prefix} host bits give 2^${32 - prefix} = ${2 ** (32 - prefix)} addresses, minus the network and broadcast addresses: ${2 ** (32 - prefix) - 2}.`,
      `import ipaddress\nprint(ipaddress.ip_network('${ip(addr)}/${prefix}', strict=False).num_addresses - 2)`);
    const right = field === 'network' ? ip(net) : ip(bc);
    const wrong = [...new Set([ip(addr), field === 'network' ? ip(bc) : ip(net), ip((net + 2 ** (32 - prefix)) >>> 0), ip((addr & ((0xFFFFFFFF << (32 - prefix + 1)) >>> 0)) >>> 0)])].filter(w => w !== right).slice(0, 3);
    return { kind: 'mc', q: `What is the ${field} address of ${ip(addr)}/${prefix}?`, options: [right, ...wrong], correct: 0,
      explain: `/${prefix} keeps the first ${prefix} bits. The network address zeroes the other ${32 - prefix}: ${ip(net)}; the broadcast address sets them all: ${ip(bc)}.`,
      python: `import ipaddress\nn = ipaddress.ip_network('${ip(addr)}/${prefix}', strict=False)\nprint(n.${field === 'network' ? 'network_address' : 'broadcast_address'})` };
  }),

  SKILL('net.lpm', 'Longest-prefix match', 'A router forwards on the most specific matching route.', t => {
    const base = (t.int(10, 200) << 24 | t.int(0, 255) << 16) >>> 0;
    const routes = [[0, 0, 'eth0'], [base, 8, 'eth1'], [(base | t.int(0, 255) << 8) >>> 0, 16, 'eth2'], [(base | t.int(0, 255) << 8) >>> 0, 20, 'eth3'], [(base | t.int(0, 255) << 8 | t.int(0, 255)) >>> 0, 24, 'eth4']]
      .map(([a, p, i]) => [p ? (a & ((0xFFFFFFFF << (32 - p)) >>> 0)) >>> 0 : 0, p, i]);
    const pick = t.pick(routes.slice(1)), dst = ((pick[0] | t.int(0, 2 ** (32 - pick[1]) - 1)) >>> 0) ^ (t.rng() < 0.3 ? 1 << t.int(8, 20) : 0);
    let best = routes[0];
    for (const r of routes) { const m = r[1] ? (0xFFFFFFFF << (32 - r[1])) >>> 0 : 0; if (((dst & m) >>> 0) === r[0] && r[1] >= best[1]) best = r; }
    return { kind: 'mc', q: `Forwarding table: ${routes.map(([a, p, i]) => `${ip(a)}/${p} → ${i}`).join('; ')}. Which interface does a packet for ${ip(dst)} leave on?`, options: [best[2], ...routes.map(r => r[2]).filter(i => i !== best[2]).slice(0, 3)], correct: 0,
      explain: `Check every route whose prefix matches ${ip(dst)}; the longest such prefix wins: ${ip(best[0])}/${best[1]} → ${best[2]}. 0.0.0.0/0 matches everything, so it is the default.`,
      python: `import ipaddress\nd = ipaddress.ip_address('${ip(dst)}')\nR = ${PY(routes.map(([a, p, i]) => [`${ip(a)}/${p}`, i]))}\nprint(max((r for r in R if d in ipaddress.ip_network(r[0])), key=lambda r: ipaddress.ip_network(r[0]).prefixlen)[1])` };
  }),

  SKILL('net.tcpseq', 'TCP sequence numbers', 'Sequence numbers count bytes; an ACK names the next byte expected.', t => {
    const isn = t.int(1000, 90000), sizes = Array.from({ length: t.int(3, 5) }, () => t.pick([100, 500, 1000, 1460])), lost = t.int(0, sizes.length - 1);
    const seqs = sizes.map((_, i) => isn + 1 + sizes.slice(0, i).reduce((a, b) => a + b, 0));
    const form = t.int(0, 1);
    if (form === 0) {
      const k = t.int(1, sizes.length);
      return num(`A connection's initial sequence number is ${isn}. After the handshake the client sends segments of ${sizes.join(', ')} bytes. What sequence number does segment ${k} carry?`, seqs[k - 1],
        `The SYN uses up one number, so data starts at ${isn + 1}; each segment's number is that plus the bytes before it: ${seqs[k - 1]}.`,
        `isn, sizes = ${isn}, ${PY(sizes)}\nprint(isn + 1 + sum(sizes[:${k - 1}]))`);
    }
    const ack = seqs[lost];
    return num(`Data starts at sequence number ${isn + 1}. Segments of ${sizes.join(', ')} bytes are sent; segment ${lost + 1} is lost and all the others arrive. What acknowledgement number does the receiver send after the last segment arrives?`, ack,
      `Cumulative ACKs name the first missing byte: everything before segment ${lost + 1} arrived, so the ACK is ${ack} — repeated for each later segment (duplicate ACKs), which is what triggers fast retransmit.`,
      `isn, sizes, lost = ${isn}, ${PY(sizes)}, ${lost}\ngot, nxt = set(), isn + 1\nstart = isn + 1\nfor i, s in enumerate(sizes):\n    if i != lost: got.add(start)\n    start += s\nstarts = [isn + 1 + sum(sizes[:i]) for i in range(len(sizes))]\nfor st, s in zip(starts, sizes):\n    if st in got and st == nxt: nxt = st + s\nprint(nxt)`);
  }),

  SKILL('net.cwnd', 'Congestion control', 'TCP Reno: slow start, congestion avoidance, and halving on loss.', t => {
    const ssthresh = t.pick([8, 16, 32]), rounds = t.int(4, 10), lossAt = t.rng() < 0.5 ? t.int(2, rounds - 1) : null;
    let cwnd = 1, th = ssthresh;
    for (let r = 1; r <= rounds; r++) {
      if (lossAt === r) { th = Math.max(Math.floor(cwnd / 2), 2); cwnd = th; continue; }
      cwnd = cwnd < th ? Math.min(cwnd * 2, th) : cwnd + 1;
    }
    return num(`TCP Reno starts with cwnd = 1 segment and ssthresh = ${ssthresh}. Each round trip, cwnd doubles while below ssthresh (stopping at it), then grows by 1.${lossAt ? ` In round ${lossAt} three duplicate ACKs arrive instead: ssthresh becomes ⌊cwnd/2⌋ (at least 2) and cwnd drops to it (fast recovery).` : ''} What is cwnd after ${rounds} round trips?`, cwnd,
      `Slow start doubles to ${ssthresh}, then additive increase adds 1 per round${lossAt ? `, and the loss in round ${lossAt} halves the window` : ''}: cwnd = ${cwnd}. That sawtooth is AIMD.`,
      `cw, th = 1, ${ssthresh}\nfor r in range(1, ${rounds} + 1):\n    if r == ${lossAt ?? -1}:\n        th = max(cw // 2, 2); cw = th; continue\n    cw = min(cw * 2, th) if cw < th else cw + 1\nprint(cw)`);
  }),

  SKILL('net.checksum', 'The Internet checksum', 'Ones\'-complement sum of 16-bit words, folded and inverted.', t => {
    const words = Array.from({ length: t.int(3, 4) }, () => t.int(0, 0xFFFF));
    let s = 0; for (const w of words) { s += w; s = (s & 0xFFFF) + (s >> 16); }
    const ck = (~s) & 0xFFFF, hx = n => `0x${n.toString(16).toUpperCase().padStart(4, '0')}`;
    const right = hx(ck), wrong = [hx(s), hx((ck + 1) & 0xFFFF), hx(words.reduce((a, b) => (a + b) & 0xFFFF, 0) ^ 0xFFFF)].filter(w => w !== right);
    return { kind: 'mc', q: `What is the Internet checksum of the 16-bit words ${words.map(hx).join(', ')}?`, options: [right, ...[...new Set(wrong)].slice(0, 3)], correct: 0,
      explain: `Add the words, folding any carry out of bit 16 back into the low bits (ones'-complement addition): ${hx(s)}. The checksum is its complement: ${right}. A receiver adding everything including the checksum gets 0xFFFF.`,
      python: `ws = ${PY(words)}\ns = sum(ws)\nwhile s >> 16:\n    s = (s & 0xFFFF) + (s >> 16)\nprint('0x%04X' % (~s & 0xFFFF))` };
  }),

  SKILL('net.bdp', 'Bandwidth-delay product', 'How much data must be in flight to fill a pipe, and what a small window caps throughput at.', t => {
    const mbps = t.pick([10, 100, 1000]), rtt = t.pick([20, 50, 100, 200]);
    if (t.rng() < 0.5) {
      const kb = (mbps * 1e6 * rtt / 1000) / 8 / 1024;
      return num(`A ${mbps} Mbit/s path has a ${rtt} ms round-trip time. How many KiB must be in flight to keep it full? (2 decimal places)`, Math.round(kb * 100) / 100,
        `Bandwidth × RTT = ${mbps}×10⁶ bit/s × ${rtt / 1000} s = ${mbps * 1e6 * rtt / 1000} bits = ${Math.round(kb * 100) / 100} KiB. A smaller window leaves the link idle.`,
        `print(${mbps} * 10 ** 6 * ${rtt} / 1000 / 8 / 1024)`, { tol: 0.006, dp: 2 });
    }
    const win = t.pick([16, 64, 256]), cap = Math.min((win * 1024 * 8) / (rtt / 1000) / 1e6, mbps);
    return num(`A sender's window is ${win} KiB on a ${mbps} Mbit/s path with ${rtt} ms RTT. What is the most throughput it can reach, in Mbit/s? (2 decimal places)`, Math.round(cap * 100) / 100,
      `At most one window per round trip: ${win} KiB × 8 / ${rtt / 1000} s = ${Math.round(((win * 1024 * 8) / (rtt / 1000) / 1e6) * 100) / 100} Mbit/s, capped by the link's ${mbps}. Result ${Math.round(cap * 100) / 100}.`,
      `print(min(${win} * 1024 * 8 / (${rtt} / 1000) / 1e6, ${mbps}))`, { tol: 0.006, dp: 2 });
  }),

  SKILL('net.frag', 'IP fragmentation', 'Split a datagram for a smaller MTU: fragment count and offsets in 8-byte units.', t => {
    const total = t.pick([3000, 4000, 4500, 6000]), mtu = t.pick([576, 1000, 1500]), hdr = 20;
    const per = Math.floor((mtu - hdr) / 8) * 8, data = total - hdr, n = Math.ceil(data / per);
    const k = t.int(1, n), offset = ((k - 1) * per) / 8;
    if (t.rng() < 0.5) return num(`An IPv4 datagram of ${total} bytes (20-byte header) meets a link with MTU ${mtu}. Into how many fragments is it split?`, n,
      `Each fragment carries at most ${mtu} − 20 = ${mtu - hdr} data bytes, rounded down to a multiple of 8: ${per}. ${data} data bytes / ${per} → ${n} fragments.`,
      `total, mtu = ${total}, ${mtu}\nper = (mtu - 20) // 8 * 8\nd, n = total - 20, 0\nwhile d > 0:\n    d -= per; n += 1\nprint(n)`);
    return num(`An IPv4 datagram of ${total} bytes (20-byte header) is fragmented for an MTU of ${mtu}. What is the fragment-offset field of fragment ${k}? (Offsets count 8-byte units.)`, offset,
      `Each full fragment carries ${per} data bytes, so fragment ${k} starts at byte ${(k - 1) * per} of the data: offset ${(k - 1) * per} / 8 = ${offset}.`,
      `per = (${mtu} - 20) // 8 * 8\nprint((${k} - 1) * per // 8)`);
  }),
];
