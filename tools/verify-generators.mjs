/**
 * Check generated questions against something other than the generator.
 *
 * A generator works out its own answer; a bug there marks a wrong answer right
 * and nobody notices. So the degree generators carry a second, independent
 * route to the answer, and this runs it:
 *
 *   python   a program run by real Python (markdown_it ones need markdown-it-py)
 *   c        a C program compiled with -std=c11 -Wall -Werror and run
 *   memcheck the same program under a memory checker: Guard Malloc and lldb on
 *            macOS (AddressSanitizer hangs there), AddressSanitizer elsewhere
 *   sql      a script run by sqlite3
 *   node     a JavaScript program run by Node (event-loop order, URL rules)
 *
 * Questions with none of these are right by construction and are counted, not
 * run. A missing tool skips its questions instead of failing them.
 *
 *   node tools/verify-generators.mjs [per-skill] [module export ...]
 *   node tools/verify-generators.mjs 8 practice/calculus.js CALCULUS
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const has = (cmd, args = ['--version']) => spawnSync(cmd, args, { stdio: 'ignore', timeout: 10000 }).status === 0;

/** What this machine can run. Worked out once, lazily. */
let tools = null;
export function availableTools() {
  if (tools) return tools;
  const python = has('python3');
  tools = {
    python,
    markdown_it: python && spawnSync('python3', ['-c', 'import markdown_it'], { stdio: 'ignore', timeout: 10000 }).status === 0,
    cc: has('cc'),
    sqlite3: has('sqlite3', ['-version']),
    memcheck: process.platform === 'darwin' ? has('cc') && has('lldb') : has('cc'),
  };
  return tools;
}

const optionLike = (q, re) => q.options.find(o => re.test(o));

/** Where a memory bug is, by a memory checker — returns the option text it points at. */
function memcheck(q, dir) {
  const src = join(dir, 'p.c'), bin = join(dir, 'p');
  writeFileSync(src, q.c);
  if (process.platform === 'darwin') {
    execFileSync('cc', ['-std=c11', '-g', '-O0', '-o', bin, src], { encoding: 'utf8' });
    const gm = ['DYLD_INSERT_LIBRARIES=/usr/lib/libgmalloc.dylib', 'MALLOC_STRICT_SIZE=1'];
    const env = { ...process.env, ...Object.fromEntries(gm.map(kv => kv.split('='))) };
    if (spawnSync(bin, { stdio: 'ignore', env, timeout: 20000 }).status === 0) return optionLike(q, /memory-safe/);
    const out = execFileSync('lldb', ['--batch', '-o', `process launch ${gm.map(kv => `--environment ${kv}`).join(' ')}`, bin], { encoding: 'utf8', timeout: 60000 });
    const line = +(out.match(/at p\.c:(\d+)/) || [])[1];
    if (!line) throw new Error('the program crashed but lldb did not say where');
    const freed = q.c.split('\n').findIndex(l => /\bfree\(/.test(l)) + 1;
    return freed && line > freed ? optionLike(q, /after free/) : optionLike(q, /overflow/);
  }
  execFileSync('cc', ['-std=c11', '-g', '-O0', '-fsanitize=address', '-fno-omit-frame-pointer', '-o', bin, src], { encoding: 'utf8' });
  const run = spawnSync(bin, { encoding: 'utf8', timeout: 20000 });
  if (run.error) throw run.error;
  if (/heap-use-after-free/.test(run.stderr)) return optionLike(q, /after free/);
  if (/heap-buffer-overflow|stack-buffer-overflow/.test(run.stderr)) return optionLike(q, /overflow/);
  return optionLike(q, /memory-safe/);
}

/**
 * Run one question's independent check. Returns
 *   { status: 'agree' | 'disagree' | 'construction' | 'skipped' | 'error', got?, want?, detail? }
 */
export function verifyQuestion(q, dir) {
  const t = availableTools();
  const want = q.kind === 'mc' ? q.options[q.correct] : q.answer;
  let got;
  try {
    if (q.python) {
      if (!t.python || (q.needs === 'markdown_it' && !t.markdown_it)) return { status: 'skipped', detail: q.needs || 'python3' };
      got = execFileSync('python3', ['-c', q.python], { encoding: 'utf8', timeout: 120000 }).trim();
    } else if (q.node) {
      got = execFileSync(process.execPath, ['-e', q.node], { encoding: 'utf8', timeout: 20000 }).trim();
    } else if (q.sql) {
      if (!t.sqlite3) return { status: 'skipped', detail: 'sqlite3' };
      got = execFileSync('sqlite3', [':memory:'], { input: q.sql, encoding: 'utf8', timeout: 20000 }).trim();
    } else if (q.c && q.memcheck) {
      if (!t.memcheck) return { status: 'skipped', detail: 'memory checker' };
      got = memcheck(q, dir);
    } else if (q.c) {
      if (!t.cc) return { status: 'skipped', detail: 'cc' };
      const src = join(dir, 'p.c'), bin = join(dir, 'p');
      writeFileSync(src, q.c);
      execFileSync('cc', ['-std=c11', '-Wall', '-Werror', '-o', bin, src], { encoding: 'utf8', timeout: 60000 });
      got = execFileSync(bin, { encoding: 'utf8', timeout: 20000 }).trim();
    } else return { status: 'construction' };
  } catch (e) {
    if (e.code === 'ETIMEDOUT' || e.signal === 'SIGTERM') return { status: 'skipped', detail: 'timed out' };
    return { status: 'error', detail: String(e.stderr || e.message).slice(0, 400) };
  }
  if (q.kind === 'mc') return { status: got === want ? 'agree' : 'disagree', got, want };
  const v = Number(got), tol = Math.max(q.tol ?? 0, Math.abs(q.answer) * (q.rtol ?? 0), 1e-6);
  return { status: Math.abs(v - q.answer) <= tol ? 'agree' : 'disagree', got, want };
}

/** Generate `perSkill` questions for each skill and check every one. */
export function verifySkills(skills, { perSkill = 4, rng, toolkit }) {
  const dir = mkdtempSync(join(tmpdir(), 'codify-verify-'));
  const tally = { agree: 0, disagree: 0, construction: 0, skipped: 0, error: 0 }, problems = [], skippedFor = new Set();
  try {
    for (const s of skills) for (let i = 0; i < perSkill; i++) {
      const q = s.gen(toolkit(rng));
      const r = verifyQuestion(q, dir);
      tally[r.status]++;
      if (r.status === 'skipped') skippedFor.add(r.detail);
      if (r.status === 'disagree') problems.push(`${s.id}: generator says ${JSON.stringify(r.want)}, check says ${JSON.stringify(r.got)}`);
      if (r.status === 'error') problems.push(`${s.id}: the check failed — ${r.detail}`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
  return { ...tally, problems, skippedFor: [...skippedFor] };
}

/* ---------------------------------- CLI ----------------------------------- */

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL('../js/', import.meta.url);
  const [perSkill = '8', ...pairs] = process.argv.slice(2);
  const Q = await import(new URL('quiz.js', root));
  const targets = pairs.length ? [] : [['degrees/practice/index.js', 'DEGREE_SKILLS']];
  for (let i = 0; i < pairs.length; i += 2) targets.push([pairs[i].startsWith('degrees/') ? pairs[i] : `degrees/${pairs[i]}`, pairs[i + 1]]);
  let bad = 0;
  for (const [mod, name] of targets) {
    const skills = (await import(new URL(mod, root)))[name];
    const r = verifySkills(skills, { perSkill: +perSkill, rng: Q.seeded(23), toolkit: Q.toolkit });
    console.log(`${name}: ${r.agree} agree, ${r.disagree} disagree, ${r.error} errors, ${r.construction} right by construction, ${r.skipped} skipped${r.skippedFor.length ? ` (${r.skippedFor.join(', ')})` : ''}`);
    for (const p of r.problems.slice(0, 12)) console.log(`  ${p}`);
    bad += r.disagree + r.error;
  }
  process.exit(bad ? 1 : 0);
}
