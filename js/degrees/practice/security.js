/**
 * CS430 Computer Security — the parts of web and systems security with
 * exact answers: password entropy and cracking time, textbook RSA with small
 * numbers, path traversal, SameSite cookies, Content-Security-Policy, and
 * what a JWT does (and does not) hide. CS2023 SEC-Foundations, SEC-Crypto,
 * SEC-Coding, SEC-Engineering.
 *
 * Checks: Python's pow() for modular inverses, posixpath for path
 * normalisation, separate rule implementations for cookies and CSP, and Node
 * itself to decode the JWT.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const num = (q, answer, explain, python, extra = {}) => ({ kind: 'num', q, answer, tol: 0, dp: 0, explain, python, ...extra });
const PY = JSON.stringify;
const yesNo = (q, yes, explain, python) => ({ kind: 'mc', q, options: yes ? ['Yes', 'No'] : ['No', 'Yes'], correct: 0, explain, python });

export const SECURITY = [
  SKILL('sec.entropy', 'Password strength', 'Entropy in bits from the size of the search space, and what it means against a GPU.', t => {
    const sets = { 'lower-case letters': 26, 'letters (both cases)': 52, 'letters and digits': 62, 'the 95 printable ASCII characters': 95, 'digits only (a PIN)': 10 };
    const name = t.pick(Object.keys(sets)), N = sets[name], L = t.int(4, 14);
    if (t.rng() < 0.5) {
      const bits = L * Math.log2(N);
      return num(`A password is ${L} characters chosen uniformly at random from ${name}. How many bits of entropy does it have? (2 decimal places)`, Math.round(bits * 100) / 100,
        `log₂(${N}^${L}) = ${L} × log₂ ${N} = ${bits.toFixed(2)} bits. This only holds for random choices; human-chosen passwords have far less.`,
        `import math\nprint(math.log(${N} ** ${L}, 2))`, { tol: 0.006, dp: 2 });
    }
    const rate = t.pick([1e9, 1e10, 1e11]), secs = N ** L / rate / 2;
    return num(`An attacker tries ${rate.toExponential(0)} guesses per second against a fast hash. On average, how many seconds to crack a random ${L}-character password from ${name}? Give log₁₀ of the seconds (2 decimal places).`, Math.round(Math.log10(secs) * 100) / 100,
      `The space is ${N}^${L}; on average half of it is searched: ${N}^${L} / 2 / ${rate.toExponential(0)} s, so log₁₀ ≈ ${Math.log10(secs).toFixed(2)}. A slow hash (bcrypt, Argon2) cuts the guess rate by orders of magnitude.`,
      `import math\nprint(math.log10(${N} ** ${L} / 2 / ${rate}))`, { tol: 0.006, dp: 2 });
  }),

  SKILL('sec.rsa', 'RSA, by hand', 'Key generation, encryption and decryption with small primes — and why textbook RSA is only a start.', t => {
    const P = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43], p = t.pick(P), q = t.pick(P.filter(x => x !== p)), n = p * q, phi = (p - 1) * (q - 1);
    const gcd = (a, b) => (b ? gcd(b, a % b) : a), e = t.pick([3, 5, 7, 11, 13, 17].filter(x => gcd(x, phi) === 1));
    const inv = (a, m) => { let [r0, r1, s0, s1] = [a, m, 1, 0]; while (r1) { const k = Math.floor(r0 / r1); [r0, r1] = [r1, r0 - k * r1]; [s0, s1] = [s1, s0 - k * s1]; } return ((s0 % m) + m) % m; };
    const d = inv(e, phi), m = t.int(2, n - 1);
    const pw = (b, x, mod) => { let r = 1n, B = BigInt(b) % BigInt(mod), X = BigInt(x); while (X > 0n) { if (X & 1n) r = (r * B) % BigInt(mod); B = (B * B) % BigInt(mod); X >>= 1n; } return Number(r); };
    if (t.rng() < 0.5) return num(`RSA with p = ${p}, q = ${q} and public exponent e = ${e}. What is the private exponent d?`, d,
      `n = ${n}, φ(n) = (${p} − 1)(${q} − 1) = ${phi}. d is the inverse of e modulo φ(n): ${e} · ${d} ≡ 1 (mod ${phi}), found by the extended Euclidean algorithm.`,
      `print(pow(${e}, -1, (${p} - 1) * (${q} - 1)))`);
    const c = pw(m, e, n);
    return num(`RSA public key (n = ${n}, e = ${e}). Encrypt the message m = ${m}: what is c = m^e mod n?`, c,
      `c = ${m}^${e} mod ${n} = ${c}, by square-and-multiply. Real RSA adds randomized padding (OAEP); textbook RSA is deterministic, so equal messages give equal ciphertexts.`,
      `print(pow(${m}, ${e}, ${n}))`);
  }),

  SKILL('sec.path', 'Path traversal', 'Does a requested path escape the directory it is supposed to stay in?', t => {
    const base = '/srv/app/uploads';
    const req = t.pick(['report.pdf', '../config.yml', 'a/../../secret', 'img/../img/cat.png', '..%2F..%2Fetc/passwd', 'a/b/../../c.txt', './././x', '../uploads/ok.txt', 'a/../../uploads/b']);
    const decoded = decodeURIComponent(req);
    const parts = []; for (const seg of `${base}/${decoded}`.split('/')) { if (!seg || seg === '.') continue; if (seg === '..') parts.pop(); else parts.push(seg); }
    const full = `/${parts.join('/')}`, escapes = !(full === base || full.startsWith(`${base}/`));
    return yesNo(`A server serves files from ${base} and builds the path as ${base}/ + the URL-decoded request. For the request ${req}, does the resolved path escape ${base}?`, escapes,
      `Decode first (${decoded}), then normalise: ${full}. ${escapes ? 'It is outside the base — the check must happen after decoding and normalising, then compare against the base directory.' : 'It stays inside the base.'}`,
      `import posixpath, urllib.parse\nbase = ${PY(base)}\nfull = posixpath.normpath(posixpath.join(base, urllib.parse.unquote(${PY(req)})))\nprint('No' if posixpath.commonpath([base, full]) == base else 'Yes')`);
  }),

  SKILL('sec.cookie', 'Cookies and SameSite', 'Which cross-site requests carry a session cookie under Strict, Lax and None.', t => {
    const ss = t.pick(['Strict', 'Lax', 'None']), kind = t.pick(['top-level GET link', 'top-level POST form', 'fetch() from another site', 'image embedded on another site', 'same-site request']);
    const sameSite = kind === 'same-site request';
    const sent = sameSite || ss === 'None' || (ss === 'Lax' && kind === 'top-level GET link');
    return yesNo(`A session cookie is set with SameSite=${ss}${ss === 'None' ? '; Secure' : ''}. A request arrives from a ${kind === 'same-site request' ? 'page on the same site' : `${kind} on evil.example`}. Does the browser attach the cookie?`, sent,
      `${sameSite ? 'Same-site requests always carry it.' : ss === 'Strict' ? 'Strict never sends it on cross-site requests, not even links.' : ss === 'Lax' ? 'Lax sends it only on top-level GET navigations — which is why state-changing actions must never be GETs.' : 'None (with Secure) sends it everywhere, so CSRF tokens are needed.'}`,
      `ss, kind = ${PY(ss)}, ${PY(kind)}\nif kind == 'same-site request': ok = True\nelif ss == 'None': ok = True\nelif ss == 'Lax': ok = kind == 'top-level GET link'\nelse: ok = False\nprint('Yes' if ok else 'No')`);
  }),

  SKILL('sec.csp', 'Content Security Policy', 'Read a script-src directive the way the browser does.', t => {
    const nonce = 'r4nd0m';
    const policy = t.pick([`script-src 'self'`, `script-src 'self' https://cdn.example.com`, `script-src 'nonce-${nonce}'`, `script-src 'self' 'unsafe-inline'`, `script-src https:`]);
    const script = t.pick(['<script src="/app.js">', '<script src="https://cdn.example.com/lib.js">', '<script src="http://cdn.example.com/lib.js">', '<script>alert(1)</script>', `<script nonce="${nonce}">init()</script>`, '<script src="https://evil.example/x.js">']);
    const inline = !script.includes('src='), src = (script.match(/src="([^"]+)"/) || [])[1] || null;
    const toks = policy.replace('script-src ', '').split(' ');
    let ok = false;
    if (inline) ok = toks.includes("'unsafe-inline'") || toks.some(tk => tk === `'nonce-${nonce}'` && script.includes(`nonce="${nonce}"`));
    else {
      const u = src.startsWith('/') ? { proto: 'https:', host: 'app.example.com', path: src } : (() => { const m = src.match(/^(\w+:)\/\/([^/]+)(.*)$/); return { proto: m[1], host: m[2], path: m[3] }; })();
      ok = toks.some(tk => (tk === "'self'" && u.host === 'app.example.com' && u.proto === 'https:') || (tk === 'https:' && u.proto === 'https:') || (/^https:\/\//.test(tk) && `${u.proto}//${u.host}` === tk));
    }
    return yesNo(`The page at https://app.example.com sends Content-Security-Policy: ${policy}. Does the browser run ${script}?`, ok,
      `${inline ? 'Inline scripts run only with \'unsafe-inline\' or a matching nonce/hash.' : `The source must match an allowed source: ${src.startsWith('/') ? "'self' covers the page's own origin" : 'scheme and host must match exactly'}.`} ${ok ? 'It is allowed.' : 'It is blocked.'}`,
      `policy, script, nonce = ${PY(policy)}, ${PY(script)}, ${PY(nonce)}\nimport re\nsrcs = policy.split()[1:]\nm = re.search(r'src="([^"]+)"', script)\nif not m:\n    ok = "'unsafe-inline'" in srcs or (f"'nonce-{nonce}'" in srcs and f'nonce="{nonce}"' in script)\nelse:\n    from urllib.parse import urljoin, urlparse\n    u = urlparse(urljoin('https://app.example.com/', m.group(1)))\n    ok = any((s == "'self'" and u.scheme == 'https' and u.netloc == 'app.example.com') or (s == 'https:' and u.scheme == 'https') or (s.startswith('https://') and f'{u.scheme}://{u.netloc}' == s) for s in srcs)\nprint('Yes' if ok else 'No')`);
  }),

  SKILL('sec.jwt', 'JWTs', 'A JWT is signed, not encrypted: anyone can read its claims.', t => {
    const sub = t.pick(['alice', 'bob', 'u_4821', 'admin']), role = t.pick(['user', 'editor', 'admin']), exp = t.int(1700000000, 1900000000);
    const b64 = o => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub, role, exp })}.c2lnbmF0dXJl`;
    const right = role, wrong = ['user', 'editor', 'admin', 'none'].filter(r => r !== role).slice(0, 3);
    return { kind: 'mc', q: `What is the "role" claim in this JWT? ${token}`, options: [right, ...wrong], correct: 0,
      explain: 'The middle part is base64url-encoded JSON that anyone can decode — no key needed. The signature only stops tampering. Never put secrets in a JWT, and always verify the signature (and reject alg: none) before trusting a claim.',
      node: `const p = ${PY(token)}.split('.')[1];\nconsole.log(JSON.parse(Buffer.from(p, 'base64url').toString()).role);` };
  }),
];
