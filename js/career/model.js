/**
 * Career: flagship projects and how ready you are for a first internship.
 *
 * A flagship moves through milestones you tick (your word, as with degree
 * weeks), then a GitHub check against its bar (the app's word, as with
 * builds), then a public post. Only the GitHub check pays: the game pays for
 * what it can check.
 *
 * Readiness is a short list per field of what gets a student an internship
 * offer, each item either checked by the app (verified projects, a merged
 * pull request to someone else's repo, a Codeforces rating) or ticked by you
 * with a link (a resume, posts, mock interviews, applications sent).
 */
import { S, emit, award, today, touchStreak, trackOn } from '../state.js';
import { FLAGSHIPS, flagshipById, flagshipsFor, flagshipAt } from './flagships.js';
import { verifyBuild, parseRepo, targetKey, targetUrl, API } from '../github.js';
import { degreeData } from '../degrees/load.js';
import { currentTerm } from '../degrees/model.js';
import { isDegree } from '../state.js';
import { buildById as roboBuild } from '../tracks/robotics/roadmap.js';
import { buildById as aiBuild } from '../tracks/ai/plan.js';

export { FLAGSHIPS, flagshipById, flagshipsFor, flagshipAt };

export const freshCareer = () => ({ projects: {}, ready: {}, oss: null });
const career = () => (S.career ||= freshCareer());
const rec = id => (career().projects[id] ||= { started: today(), milestones: {}, option: null, repo: null, checks: null, verified: null, posted: null });
export const recordOf = id => career().projects[id] || null;

export const flagshipXp = f => 1200 + f.term * 300;
export const flagshipCoins = f => 300 + f.term * 60;

/* --------------------------------- reading -------------------------------- */

export function progressOf(f) {
  const r = recordOf(f.id);
  const done = f.milestones.filter((_, i) => r?.milestones?.[i]).length;
  return { done, total: f.milestones.length, verified: !!r?.verified, posted: r?.posted || null, started: !!r, option: r?.option || null };
}

/** The flagship you should be on now in a track: the current degree term's, or the current Programming month's. */
export function currentFlagship(track, currentMonth = null) {
  if (isDegree(track)) {
    const D = degreeData(track);
    if (!D) return flagshipAt(track, 0);
    return flagshipAt(track, Math.min(currentTerm(D, S.tracks[track]), 5));
  }
  if (track === 'cp') return flagshipAt('cp', Math.max(1, Math.min(4, currentMonth || 1)));
  return null;
}

/** The chosen capstone route, or the one matching your concentration. */
export function optionOf(f) {
  if (!f.options) return null;
  const r = recordOf(f.id);
  const key = r?.option || S.tracks[f.track]?.concentration;
  return f.options.find(o => o.concentration === key) || null;
}

/** What the GitHub check will look for, in words, before you run it. */
export function proofList(f) {
  const p = f.proof || {}, out = ['A public repo you own, with a README', `At least ${p.words ?? 120} words of write-up`, 'A photo or video in the README', 'A "What broke" section', '3+ commits by you'];
  if (p.video) out.push(p.video > 1 ? `${p.video} videos` : 'A video (GIF, MP4 or YouTube link)');
  if (p.ci) out.push('Tests passing on GitHub Actions');
  for (const x of p.files || []) out.push(x.label);
  for (const x of p.readme || []) out.push(`README: ${x.label.toLowerCase()}`);
  return out;
}

/* --------------------------------- actions -------------------------------- */

export function startFlagship(id) {
  if (!flagshipById(id)) return null;
  rec(id);
  emit('career', { id, what: 'start' });
  return recordOf(id);
}

export function toggleMilestone(id, i, on = null) {
  const f = flagshipById(id);
  if (!f || !f.milestones[i]) return null;
  const r = rec(id), was = !!r.milestones[i], want = on == null ? !was : !!on;
  if (want) r.milestones[i] = r.milestones[i] || today(); else delete r.milestones[i];
  if (want !== was) emit('career', { id, what: 'milestone' });
  return !!r.milestones[i];
}

export function chooseOption(id, concentration) {
  const f = flagshipById(id);
  if (!f?.options?.some(o => o.concentration === concentration)) return false;
  rec(id).option = concentration;
  emit('career', { id, what: 'option' });
  return true;
}

export function setPosted(id, url) {
  if (!flagshipById(id)) return false;
  const v = String(url || '').trim();
  if (v && !/^https:\/\/\S+\.\S+/.test(v)) return false;
  rec(id).posted = v || null;
  emit('career', { id, what: 'posted' });
  return true;
}

/** Repo folders already claimed by another flagship: each needs its own. */
const claimedBy = exceptId => Object.entries(career().projects).filter(([id, r]) => id !== exceptId && r.repo).map(([, r]) => r.repo);

/**
 * Check a flagship's repo against its bar. Resolves like verifyBuild:
 * { ok:false, error } when GitHub could not be asked, otherwise { ok:true,
 * verified, checks, reward? }. A first pass pays.
 */
export async function checkFlagship(id, input, { fetchImpl } = {}) {
  const f = flagshipById(id);
  if (!f) return { ok: false, error: 'No such project.' };
  if (!S.github.user) return { ok: false, error: 'Link your GitHub username in Hero → Accounts first — the repo has to be yours.' };
  const target = parseRepo(input);
  if (!target) return { ok: false, error: 'Use owner/repo or owner/repo/folder, or paste the GitHub link.' };
  const res = await verifyBuild(f, target, { user: S.github.user, usedBy: claimedBy(id), fetchImpl });
  if (!res.ok) return res;
  const r = rec(id), first = res.verified && !r.verified;
  r.repo = targetKey(target);
  r.url = targetUrl(target);
  r.checks = { day: today(), passed: res.checks.filter(c => c.pass).length, total: res.checks.length };
  let reward = null;
  if (first) {
    r.verified = today();
    reward = award(flagshipXp(f), flagshipCoins(f), f.title);
    touchStreak();
  }
  emit('career', { id, what: 'check', verified: res.verified });
  return { ...res, reward, first };
}

/* ------------------------------- open source ------------------------------ */

/**
 * Merged pull requests you made to public repos you don't own, from GitHub's
 * search API (unauthenticated: a few calls a minute is plenty).
 */
export async function checkOss({ fetchImpl = globalThis.fetch } = {}) {
  const user = S.github.user;
  if (!user) return { ok: false, error: 'Link your GitHub username in Hero → Accounts first.' };
  const q = encodeURIComponent(`is:pr is:merged author:${user} -user:${user}`);
  let res;
  try { res = await fetchImpl(`${API}/search/issues?q=${q}&per_page=30`, { headers: { Accept: 'application/vnd.github+json' } }); }
  catch { return { ok: false, error: 'Could not reach GitHub.' }; }
  if (!res.ok) return { ok: false, error: res.status === 403 ? 'GitHub\'s search limit is used up for a minute — try again shortly.' : `GitHub answered ${res.status}.` };
  const body = await res.json();
  const prs = (body.items || []).map(i => ({ title: i.title, url: i.html_url, repo: String(i.repository_url || '').replace(`${API}/repos/`, ''), merged: (i.pull_request?.merged_at || i.closed_at || '').slice(0, 10) }));
  career().oss = { count: body.total_count || 0, prs, checkedAt: Date.now() };
  emit('career', { what: 'oss' });
  return { ok: true, ...career().oss };
}

/* -------------------------------- readiness ------------------------------- */

const verifiedIn = tracks => FLAGSHIPS.filter(f => tracks.includes(f.track) && recordOf(f.id)?.verified);
const verifiedBuilds = track => Object.entries(S.tracks[track]?.builds || {}).filter(([, b]) => b.verified).map(([id]) => id);
const postedCount = () => Object.values(career().projects).filter(r => r.posted).length;
const ossCount = () => career().oss?.count || 0;

const auto = (id, label, how, test) => ({ id, label, how, kind: 'auto', test });
const manual = (id, label, how) => ({ id, label, how, kind: 'manual' });

const RESUME = manual('resume', 'A one-page resume, reviewed', 'Every line a result with a number. Have someone working in the field mark it up, then fix it. Link the PDF.');
const POSTS = auto('posts', 'Three projects posted publicly', 'LinkedIn, X or a blog: the post kit on each project gives you a draft. Paste the link back into the project.', () => ({ done: postedCount() >= 3, detail: `${postedCount()} of 3 posted` }));
const OSS = auto('oss', 'A merged pull request to someone else\'s project', 'A real fix or feature accepted by an open-source project. goodfirstissue.dev is a place to start. Checked on GitHub.', () => ({ done: ossCount() >= 1, detail: career().oss ? `${ossCount()} merged` : 'not checked yet' }));
const MOCK = manual('mock', 'Three mock interviews', 'With a friend in the field, a senior student, or a peer platform. Write down what you got wrong each time.');
const APPLY = manual('apply', 'Thirty applications sent', 'Internships, research programmes, startups. Track them in a sheet: date, role, status, contact. Link the sheet.');

export const LANES = [
  { id: 'software', name: 'Software engineering', tracks: ['cs', 'cp'], items: [
    auto('projects', 'Three verified flagship projects', 'From Computer Science and Programming: built, checked on GitHub.', () => { const n = verifiedIn(['cs', 'cp']).length; return { done: n >= 3, detail: `${n} of 3` }; }),
    auto('live', 'A product with real users', 'The "web product with real users" project, verified.', () => ({ done: !!recordOf('cs-product')?.verified, detail: recordOf('cs-product')?.verified ? 'verified' : 'not yet' })),
    auto('dsa', 'Interview-ready problem solving', 'A Codeforces rating of 1400+, or 150 problems solved. Linked under Code.', () => { const c = S.tracks.cp; const n = (c.solved || []).length; return { done: (c.rating || 0) >= 1400 || n >= 150, detail: `${c.rating ?? 'unrated'} · ${n} solved` }; }),
    OSS, POSTS, RESUME, MOCK, APPLY,
  ] },
  { id: 'ml', name: 'Machine learning', tracks: ['ai'], items: [
    auto('builds', 'Four verified AI builds, one a reproduction', 'From the AI track. A reproduction is one of the "Reproduce:" builds.', () => { const b = verifiedBuilds('ai'); return { done: b.length >= 4 && b.some(id => id.startsWith('c')), detail: `${b.length} verified${b.some(id => id.startsWith('c')) ? ', reproduction ✓' : ''}` }; }),
    auto('hf', 'A model or dataset on Hugging Face', 'Linked under Hero → Accounts; one of the Hugging Face builds verified.', () => ({ done: !!S.tracks.ai?.hf?.user && verifiedBuilds('ai').length > 0, detail: S.tracks.ai?.hf?.user ? `@${S.tracks.ai.hf.user}` : 'not linked' })),
    OSS, POSTS, RESUME, MOCK, APPLY,
  ] },
  { id: 'robotics', name: 'Robotics', tracks: ['robotics'], items: [
    auto('builds', 'Five verified robot builds', 'From the Robotics track, each with a video of it moving.', () => { const n = verifiedBuilds('robotics').length; return { done: n >= 5, detail: `${n} of 5` }; }),
    auto('ros', 'A ROS 2 robot that navigates', 'The "Map it, then navigate it" build, verified.', () => ({ done: verifiedBuilds('robotics').includes('b19'), detail: verifiedBuilds('robotics').includes('b19') ? 'verified' : 'not yet' })),
    OSS, POSTS, RESUME, MOCK, APPLY,
  ] },
  { id: 'ee', name: 'Electrical and hardware', tracks: ['ee'], items: [
    auto('board', 'A board you designed, fabricated and measured', 'The "first PCB" project, verified.', () => ({ done: !!recordOf('ee-pcb')?.verified, detail: recordOf('ee-pcb')?.verified ? 'verified' : 'not yet' })),
    auto('projects', 'Three verified hardware projects', 'From Electrical Engineering.', () => { const n = verifiedIn(['ee']).length; return { done: n >= 3, detail: `${n} of 3` }; }),
    POSTS, RESUME, MOCK, APPLY,
  ] },
  { id: 'me', name: 'Mechanical and design', tracks: ['me'], items: [
    auto('projects', 'Three verified build-and-test projects', 'From Mechanical Engineering, each with test data.', () => { const n = verifiedIn(['me']).length; return { done: n >= 3, detail: `${n} of 3` }; }),
    manual('cad', 'A CAD certification', 'SOLIDWORKS CSWA or Autodesk Fusion Certified User: an outside, timed exam employers recognise. Link the certificate.'),
    manual('portfolio', 'A design portfolio', 'Five projects, each a page: the problem, the CAD, the calculation, the test, the result. Link it.'),
    POSTS, RESUME, MOCK, APPLY,
  ] },
  { id: 'physics', name: 'Physics and research', tracks: ['phys'], items: [
    auto('projects', 'Three verified physics projects', 'From Physics.', () => { const n = verifiedIn(['phys']).length; return { done: n >= 3, detail: `${n} of 3` }; }),
    auto('code', 'Research-grade computation', 'The quantum-engine or phase-transition project, verified.', () => ({ done: !!(recordOf('phys-qm')?.verified || recordOf('phys-ising')?.verified), detail: recordOf('phys-qm')?.verified || recordOf('phys-ising')?.verified ? 'verified' : 'not yet' })),
    manual('present', 'A poster or talk', 'At a student conference, a department seminar or a recorded journal club. Link it.'),
    POSTS, RESUME, APPLY,
  ] },
  { id: 'math', name: 'Mathematics and quant', tracks: ['math'], items: [
    auto('projects', 'Three verified mathematics projects', 'From Mathematics.', () => { const n = verifiedIn(['math']).length; return { done: n >= 3, detail: `${n} of 3` }; }),
    auto('formal', 'Machine-checked proofs', 'The Lean project, verified.', () => ({ done: !!recordOf('math-lean')?.verified, detail: recordOf('math-lean')?.verified ? 'verified' : 'not yet' })),
    manual('problems', 'Quant-interview problem solving', 'Work through a probability-puzzle collection and a timed mental-maths test; or sit the Putnam. Note your score.'),
    POSTS, RESUME, MOCK, APPLY,
  ] },
];

/** The fields for the tracks you have switched on. */
export const lanesOn = () => LANES.filter(l => l.tracks.some(t => trackOn(t)));

export function laneStatus(lane) {
  const items = lane.items.map(it => {
    if (it.kind === 'auto') return { ...it, ...it.test() };
    const r = career().ready[`${lane.id}:${it.id}`];
    return { ...it, done: !!r, detail: r ? `done ${r.day}` : '', link: r?.link || null };
  });
  return { lane, items, done: items.filter(i => i.done).length, total: items.length };
}

export function tickReady(laneId, itemId, on = true, link = null) {
  const lane = LANES.find(l => l.id === laneId), it = lane?.items.find(i => i.id === itemId);
  if (!it || it.kind !== 'manual') return false;
  const v = String(link || '').trim();
  if (v && !/^https:\/\/\S+\.\S+/.test(v)) return false;
  if (on) career().ready[`${laneId}:${itemId}`] = { day: today(), link: v || null };
  else delete career().ready[`${laneId}:${itemId}`];
  emit('career', { what: 'ready' });
  return true;
}

/** Every verified project, for the portfolio: flagships and builds, newest first. */
export function portfolio() {
  const out = FLAGSHIPS.filter(f => recordOf(f.id)?.verified).map(f => ({ kind: 'flagship', track: f.track, id: f.id, title: f.title, day: recordOf(f.id).verified, url: recordOf(f.id).url || null, bullet: f.bullet, posted: recordOf(f.id).posted }));
  for (const t of ['robotics', 'ai']) {
    for (const [id, b] of Object.entries(S.tracks[t]?.builds || {})) {
      if (!b.verified) continue;
      const spec = (t === 'robotics' ? roboBuild : aiBuild)(id);
      out.push({ kind: 'build', track: t, id, title: spec?.name || id, day: b.verifiedAt || '', url: b.meta?.url || null, bullet: spec ? `${spec.name}: ${spec.task.split('. ')[0]}.` : null });
    }
  }
  return out.sort((a, b) => String(b.day).localeCompare(String(a.day)));
}
