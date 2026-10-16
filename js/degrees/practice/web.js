/**
 * CS220 Web Engineering — the parts of the platform with exact rules: the
 * JavaScript event loop, URL resolution, CSS specificity, WCAG contrast,
 * HTTP freshness, CORS preflights, SQL injection and a page-weight budget.
 * CS2023 SPD-Web 1–5, HCI-Accessibility 2, SEC-Coding.
 *
 * Checks are independent: `node` runs the real JavaScript (the event loop and
 * the URL parser are Node's own), `python` re-implements a spec (WCAG,
 * selector specificity, the CORS safelist), and `sql` runs the injected query
 * in sqlite3.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;

/* A snippet, and the order its lines print in under the real event loop. */
function eventLoop(t) {
  const parts = t.shuffle([
    { code: "setTimeout(() => console.log('T'), 0);", task: 'T' },
    { code: "Promise.resolve().then(() => console.log('P'));", micro: 'P' },
    { code: "queueMicrotask(() => console.log('Q'));", micro: 'Q' },
    { code: "console.log('S');", sync: 'S' },
  ]);
  const extra = t.rng() < 0.5 ? { code: "(async () => { console.log('A1'); await null; console.log('A2'); })();", sync: 'A1', micro: 'A2' } : null;
  const all = extra ? [...parts.slice(0, 2), extra, ...parts.slice(2)] : parts;
  const order = [...all.filter(x => x.sync).map(x => x.sync), ...all.filter(x => x.micro).map(x => x.micro), ...all.filter(x => x.task).map(x => x.task)];
  return { code: all.map(x => x.code).join('\n'), order };
}

export const WEB = [
  SKILL('web.eventloop', 'The event loop', 'Synchronous code, then every microtask, then the next task: predict the order.', t => {
    const { code, order } = eventLoop(t), right = order.join(' ');
    const wrong = new Set();
    for (let i = 0; wrong.size < 3 && i < 50; i++) { const s = t.shuffle(order).join(' '); if (s !== right) wrong.add(s); }
    return { kind: 'mc', q: 'In what order does this print (in a browser or Node)?', code, options: [right, ...wrong], correct: 0,
      explain: `Synchronous code runs first; then the microtask queue drains completely (promise callbacks, queueMicrotask, the rest of an async function after await), in the order they were queued; only then does the next task (setTimeout) run: ${right}.`,
      node: `const out = []; const log = console.log; console.log = x => out.push(x);\n${code}\nsetTimeout(() => { setTimeout(() => log(out.join(' ')), 0); }, 0);` };
  }),

  SKILL('web.url', 'URLs and resolution', 'How relative links resolve against a page, the way the browser does it.', t => {
    const base = t.pick(['https://example.com/docs/guide/intro.html', 'https://shop.test/a/b/c/', 'https://site.dev/blog/2026/post?x=1']);
    const rel = t.pick(['../img/logo.png', './next.html', '/about', '?page=2', '#top', '../../index.html', 'other.html?q=1', '//cdn.example.net/app.js']);
    const right = new URL(rel, base).href;
    const b = new URL(base), wrong = new Set([`${b.origin}/${rel.replace(/^(\.\.\/|\.\/)+/, '')}`, base.replace(/[^/]*$/, '') + rel, `${b.origin}${b.pathname}${rel}`].filter(w => w !== right));
    for (const w of [`${b.origin}/${rel}`, `${base}/${rel}`]) if (wrong.size < 3 && w !== right) wrong.add(w);
    return { kind: 'mc', q: `A page at ${base} contains <a href="${rel}">. What URL does the link go to?`, options: [right, ...[...wrong].slice(0, 3)], correct: 0,
      explain: `Resolve against the base the way the URL standard does: ${rel.startsWith('//') ? 'a scheme-relative URL keeps only the scheme' : rel.startsWith('/') ? 'a path starting with / replaces the whole path' : rel.startsWith('?') ? 'a query alone keeps the path and replaces the query' : rel.startsWith('#') ? 'a fragment alone keeps everything else' : 'a relative path is resolved against the base\'s directory, each .. climbing one level'}: ${right}.`,
      node: `console.log(new URL(${PY(rel)}, ${PY(base)}).href)` };
  }),

  SKILL('web.specificity', 'CSS specificity', 'Which rule wins: count IDs, then classes, attributes and pseudo-classes, then elements.', t => {
    const pieces = { id: ['#nav', '#main', '#cart'], cls: ['.item', '.active', '.btn', '[type="text"]', ':hover', ':first-child'], el: ['a', 'li', 'ul', 'div', 'button', '::before'] };
    const make = () => { const parts = []; if (t.rng() < 0.4) parts.push(t.pick(pieces.id)); for (let i = t.int(0, 2); i > 0; i--) parts.push(t.pick(pieces.cls)); for (let i = t.int(0, 2); i > 0; i--) parts.push(t.pick(pieces.el)); return parts.length ? parts : ['div']; };
    const parts = make(), sel = parts.join(' ').replace(/ ([:[])/g, '$1').replace(/ (::)/g, '$1');
    const a = parts.filter(p => p.startsWith('#')).length, b = parts.filter(p => /^[.[]|^:(?!:)/.test(p)).length, c = parts.filter(p => /^[a-z]|^::/.test(p)).length;
    return num(`What is the specificity of the selector ${sel}? Write (a, b, c) as one number: 100a + 10b + c.`, 100 * a + 10 * b + c,
      `a counts IDs (${a}), b counts classes, attribute selectors and pseudo-classes (${b}), c counts elements and pseudo-elements (${c}): (${a}, ${b}, ${c}). Compare a first, then b, then c; the number only works because each part is under 10 here.`,
      `import re\nsel = ${PY(sel)}\nids = len(re.findall(r'#[\\w-]+', sel))\npe = len(re.findall(r'::[\\w-]+', sel))\nbs = len(re.findall(r'\\.[\\w-]+', sel)) + len(re.findall(r'\\[[^\\]]*\\]', sel)) + len(re.findall(r'(?<!:):[\\w-]+', sel))\ncs = len(re.findall(r'(?:^|\\s)([a-z][\\w-]*)', sel)) + pe\nprint(100 * ids + 10 * bs + cs)`);
  }),

  SKILL('web.contrast', 'Colour contrast (WCAG)', 'Compute a contrast ratio and check it against WCAG AA.', t => {
    const hx = () => `#${[0, 0, 0].map(() => t.pick(['00', '33', '55', '66', '77', '88', '99', 'AA', 'CC', 'EE', 'FF'])).join('')}`;
    let fg, bg; do { fg = hx(); bg = hx(); } while (fg === bg);
    const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x), ratio = (l1 + 0.05) / (l2 + 0.05);
    return num(`Text colour ${fg} on background ${bg}: what is the WCAG contrast ratio? (2 decimal places; AA for body text needs 4.5)`, Math.round(ratio * 100) / 100,
      `Relative luminance of each colour (linearised sRGB, weighted 0.2126 R + 0.7152 G + 0.0722 B); ratio = (L_lighter + 0.05) / (L_darker + 0.05) = ${ratio.toFixed(2)}. ${ratio >= 4.5 ? 'It passes AA.' : 'It fails AA for body text.'}`,
      `def lum(h):\n    out = []\n    for i in (1, 3, 5):\n        v = int(h[i:i + 2], 16) / 255\n        out.append(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)\n    return 0.2126 * out[0] + 0.7152 * out[1] + 0.0722 * out[2]\na, b = sorted([lum(${PY(fg)}), lum(${PY(bg)})], reverse=True)\nprint((a + 0.05) / (b + 0.05))`, { tol: 0.006, dp: 2 });
  }),

  SKILL('web.cache', 'HTTP caching', 'Freshness from Cache-Control and Age: how long a cached response may still be served.', t => {
    const maxAge = t.pick([60, 300, 600, 3600, 86400]), age = t.int(0, Math.round(maxAge * 1.3)), sMax = t.rng() < 0.3 ? t.pick([30, 120, 7200]) : null, shared = sMax != null && t.rng() < 0.6;
    const life = shared ? sMax : maxAge, left = Math.max(0, life - age);
    return num(`A response carries Cache-Control: max-age=${maxAge}${sMax != null ? `, s-maxage=${sMax}` : ''} and Age: ${age}. For how many more seconds may a ${shared ? 'shared cache (a CDN)' : 'browser\'s private cache'} serve it without revalidating? (0 if it is already stale)`, left,
      `Freshness lifetime is ${shared ? 's-maxage for shared caches' : 'max-age for a private cache (s-maxage only applies to shared caches)'}: ${life} s. It is already ${age} s old, so ${life} − ${age} = ${left > 0 ? left : 'negative — stale'}${left > 0 ? ' s left' : ''}.`,
      `max_age, age, s_max, shared = ${maxAge}, ${age}, ${sMax == null ? 'None' : sMax}, ${shared ? 'True' : 'False'}\nlife = s_max if (shared and s_max is not None) else max_age\nprint(max(0, life - age))`);
  }),

  SKILL('web.cors', 'CORS preflights', 'Which cross-origin requests the browser checks with an OPTIONS preflight first.', t => {
    const method = t.pick(['GET', 'POST', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']);
    const ctype = method === 'GET' || method === 'HEAD' ? null : t.pick(['application/json', 'text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data']);
    const header = t.rng() < 0.35 ? t.pick(['Authorization', 'X-Request-Id', 'Accept-Language']) : null;
    const simpleMethod = ['GET', 'HEAD', 'POST'].includes(method);
    const simpleType = !ctype || ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data'].includes(ctype);
    const simpleHeader = !header || header === 'Accept-Language';
    const pre = !(simpleMethod && simpleType && simpleHeader);
    return { kind: 'mc', q: `From a page on https://app.example, fetch() sends a ${method} to https://api.example${ctype ? ` with Content-Type: ${ctype}` : ''}${header ? ` and a ${header} header` : ''}. Does the browser send a preflight OPTIONS request first?`,
      options: pre ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0,
      explain: `A request skips the preflight only if its method is GET, HEAD or POST, its Content-Type (if any) is text/plain, application/x-www-form-urlencoded or multipart/form-data, and it adds only safelisted headers. ${pre ? `Here ${!simpleMethod ? `${method} is not a simple method` : !simpleType ? `${ctype} is not a simple content type` : `${header} is not safelisted`}, so it is preflighted.` : 'All three hold, so it goes straight out.'}`,
      python: `method, ctype, header = ${PY(method)}, ${ctype ? PY(ctype) : 'None'}, ${header ? PY(header) : 'None'}\nok = method in ('GET', 'HEAD', 'POST') and (ctype is None or ctype in ('text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data')) and (header is None or header.lower() in ('accept', 'accept-language', 'content-language', 'content-type'))\nprint('No' if ok else 'Yes')` };
  }),

  SKILL('web.injection', 'SQL injection', 'What a string-concatenated query really runs — and why parameters fix it.', t => {
    const users = ['alice', 'bob', 'carol', 'dave', 'erin', 'frank'].slice(0, t.int(4, 6));
    const payload = t.pick([`' OR '1'='1`, `x' OR 1=1 --`, `bob' --`, `' OR name LIKE '%a%`, 'alice']);
    const injected = `SELECT name FROM users WHERE name = '${payload}'`;
    const schema = `CREATE TABLE users (name TEXT);\nINSERT INTO users VALUES ${users.map(u => `('${u}')`).join(', ')};`;
    const rows = payload === 'alice' ? 1 : payload.startsWith('bob') ? (users.includes('bob') ? 1 : 0) : payload.includes('LIKE') ? users.filter(u => u.includes('a')).length : users.length;
    return num(`users holds ${users.join(', ')}. A login endpoint builds its query as "SELECT name FROM users WHERE name = '" + input + "'". With input ${payload}, how many rows come back?`, rows,
      `The query that runs is: ${injected}. ${payload === 'alice' ? 'A plain name matches one row.' : 'The input closed the quote and rewrote the condition'} — ${rows} row${rows === 1 ? '' : 's'}. A parameterised query would have treated the whole input as one string.`,
      undefined, { sql: `${schema}\nSELECT count(*) FROM (${injected}\n);`, code: `query = "SELECT name FROM users WHERE name = '" + input + "'"` });
  }),

  SKILL('web.budget', 'Performance budgets', 'Estimate a page\'s load time from bytes, bandwidth and round trips.', t => {
    const kb = t.pick([400, 800, 1200, 1600, 2400]), mbps = t.pick([1.6, 5, 10, 20]), rtts = t.int(3, 8), rtt = t.pick([40, 80, 150, 300]);
    const secs = (kb * 1024 * 8) / (mbps * 1e6) + (rtts * rtt) / 1000;
    return num(`A page needs ${kb} KiB of resources over a ${mbps} Mbit/s connection, with ${rtts} unavoidable round trips of ${rtt} ms. Ignoring parallelism and processing, roughly how many seconds does it take? (2 decimal places)`, Math.round(secs * 100) / 100,
      `Transfer: ${kb} × 1024 × 8 bits / ${mbps} × 10⁶ bit/s = ${((kb * 1024 * 8) / (mbps * 1e6)).toFixed(2)} s. Latency: ${rtts} × ${rtt} ms = ${((rtts * rtt) / 1000).toFixed(2)} s. Total ≈ ${secs.toFixed(2)} s. On slow links the bytes dominate; on fast ones the round trips do.`,
      `print(${kb} * 1024 * 8 / (${mbps} * 1e6) + ${rtts} * ${rtt} / 1000)`, { tol: 0.006, dp: 2 });
  }),
];
