/**
 * Codify, headless: the app's own modules running on a server against the
 * save on GitHub, and the tools an AI agent calls to read and change it.
 *
 * Nothing here re-implements the game. Every tool loads the save from GitHub,
 * calls the same functions the app's buttons call, and writes the save back
 * with the sha it read — so a change from an agent is exactly the change the
 * app would have made, and a newer write from the app is never overwritten
 * (the call is re-run on the newer save instead).
 */
import { readFileSync } from 'node:fs';

// The app keeps its save in localStorage; here it is a map that each call refills.
const memory = new Map();
globalThis.localStorage ??= {
  getItem: k => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
  removeItem: k => memory.delete(k),
};

const St = await import('../js/state.js');
const E = await import('../js/learn/session.js');
const Cloud = await import('../js/cloud.js');
const CA = await import('../js/tracks/cp/actions.js');
const RA = await import('../js/tracks/robotics/actions.js');
const AA = await import('../js/tracks/ai/actions.js');
const RoadR = await import('../js/tracks/robotics/roadmap.js');
const PlanA = await import('../js/tracks/ai/plan.js');
const GH = await import('../js/github.js');
const Sync = await import('../js/sync.js');
const DL = await import('../js/degrees/load.js');
const DM = await import('../js/degrees/model.js');
const DA = await import('../js/degrees/actions.js');
const DP = await import('../js/degrees/practice/index.js');
const CT = await import('../js/degrees/curriculum/cs-term1.js');
const SB = await import('../js/skillbook.js');
const CR = await import('../js/career/model.js');
await import('../js/degrees/engine.js');

for (const d of DL.DEGREES) DL.setDegreeData(d.id, JSON.parse(readFileSync(new URL(`../data/degrees/${d.slug}.json`, import.meta.url), 'utf8')));

const S = St.S;
const CORE = { cp: 'Programming', robotics: 'Robotics', ai: 'AI' };
const trackName = id => CORE[id] || DL.degreeMeta(id)?.title || id;

/* --------------------------------- errors --------------------------------- */

/** A mistake in the request — said back to the agent, not thrown as a server fault. */
export class ToolError extends Error {}
const fail = msg => { throw new ToolError(msg); };
const need = (v, msg) => (v === undefined || v === null || v === '' ? fail(msg) : v);

function trackOf(args, { degree = null } = {}) {
  const t = need(args.track ?? args.degree, `Say which track: ${St.TRACK_IDS.join(', ')}.`);
  if (!St.TRACK_IDS.includes(t)) fail(`No track "${t}". Tracks: ${St.TRACK_IDS.join(', ')}.`);
  if (degree === true && !St.isDegree(t)) fail(`"${t}" is not a degree. Degrees: ${DL.DEGREE_IDS.join(', ')}.`);
  if (degree === false && St.isDegree(t)) fail(`"${t}" is a degree — use the degree tools for it.`);
  return t;
}
function courseOf(id, key) {
  const D = DL.degreeData(id), c = DM.courseByKey(D, need(key, 'Say which course (its key, e.g. programming-1).'));
  return c || fail(`No course "${key}" in ${trackName(id)}. Keys: ${D.courses.slice(0, 12).map(x => x.key).join(', ')}…`);
}

/* --------------------------------- views ---------------------------------- */

const brief = c => ({ key: c.key, code: c.code, title: c.title, term: c.term });

function questionView() {
  const a = S.active, q = E.currentQuestion();
  if (!a || !q) return null;
  E.markShown();
  const no = a.mode === 'boss' ? a.asked + 1 : a.i + 1;
  return {
    track: a.track, mode: a.mode, label: a.label || null, number: no, of: a.mode === 'boss' ? a.questions : a.qs.length,
    skill: q.skill, skillName: SB.skillById(q.skill)?.name || q.skill, kind: q.kind, question: q.q,
    ...(q.code ? { code: q.code } : {}),
    ...(q.kind === 'mc' ? { options: q.options.map((text, i) => ({ index: i, text })) } : { answerAs: `a number${q.unit ? ` in ${q.unit}` : ''}` }),
    ...(q.outcomeText ? { outcome: q.outcomeText } : {}),
    secondsAllowed: E.timeLimit() || null,
    ...(a.mode === 'boss' ? { boss: { hp: a.hp, maxHp: a.maxHp, hearts: a.hearts } } : {}),
  };
}

function coreSummary(t) {
  const m = E.mission(t);
  return {
    track: t, name: trackName(t),
    mission: { n: m.n, learn: m.learn, skills: m.skills, doneToday: E.missionDoneToday(t), finished: !!m.finished, boss: !!m.boss },
    missionsDone: E.missionsDone(t), reviewDue: E.reviewSkills(t).length, reviewDoneToday: E.reviewDoneToday(t), pace: E.paceInfo(t),
  };
}

function degreeSummary(id) {
  const D = DL.degreeData(id), r = S.tracks[id];
  const p = DM.degreeProgress(D, r);
  return {
    track: id, name: trackName(id), term: D.terms[p.term] || 'finished', ...p, hoursPerWeek: r.hours, concentration: r.concentration,
    next: DM.nextTasks(D, r).map(t => ({ kind: t.kind, course: brief(t.course), unit: t.unit?.id, week: t.week?.week, assessment: t.assessment?.id, title: t.title, task: t.text, produce: t.produce, hours: t.hours, url: t.url })),
  };
}

/* ---------------------------------- tools ---------------------------------- */

const str = (description, extra = {}) => ({ type: 'string', description, ...extra });
const num = (description, extra = {}) => ({ type: 'number', description, ...extra });
const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const TRACK = str(`Track id: ${St.TRACK_IDS.join(', ')} (the last five are degrees).`, { enum: St.TRACK_IDS });
const DEGREE = str(`Degree id: ${DL.DEGREE_IDS.join(', ')}.`, { enum: DL.DEGREE_IDS });

export const TOOLS = [
  {
    name: 'get_overview',
    description: 'Start here. The learner\'s character (level, XP, credits, streak), every track they have switched on with today\'s mission or next degree work, focus minutes, today\'s quests, and any quiz in progress.',
    inputSchema: obj({}), readOnly: true,
    run() {
      return {
        name: S.profile.name, today: St.today(), level: St.progress(), xp: S.xp, credits: S.coins, streak: S.streak,
        tracks: St.enabledTracks().map(t => (St.isDegree(t) ? degreeSummary(t) : coreSummary(t))),
        tracksOff: St.TRACK_IDS.filter(t => !St.trackOn(t)),
        focus: { minutesToday: St.getDay().timerMin, goalMinutes: S.profile.focusGoal, running: S.timer ? { since: new Date(S.timer.start).toISOString(), minutes: St.timerMinutes(), tag: S.timer.tag } : null },
        quests: St.quests().map(q => ({ id: q.id, name: q.name, desc: q.desc, value: q.value, goal: q.goal, done: q.done, claimed: q.claimed, xp: q.xp, credits: q.coins })),
        quizInProgress: questionView(),
      };
    },
  },
  {
    name: 'get_mission',
    description: 'A core track\'s mission (Programming, Robotics or AI): what to learn, the links to learn it from, the skills its check covers, the build step, and whether it is done. Today\'s by default.',
    inputSchema: obj({ track: str('cp, robotics or ai.', { enum: Object.keys(CORE) }) }, ['track']), readOnly: true,
    run(args) {
      const t = trackOf(args, { degree: false }), m = E.mission(t);
      return { ...m, skillNames: m.skills.map(s => SB.skillById(s)?.name || s), doneToday: E.missionDoneToday(t), pace: E.paceInfo(t),
        ...(t === 'cp' ? { solves: CA.solveStatus(m), codeforces: S.tracks.cp.handle || null } : {}) };
    },
  },
  {
    name: 'get_skills',
    description: 'Every skill in a track with its level (0–10), when it is next due for review, and its right/wrong history counts.',
    inputSchema: obj({ track: TRACK }, ['track']), readOnly: true,
    run(args) {
      const t = trackOf(args), r = S.tracks[t];
      return E.trackCfg(t).skills.map(s => {
        const e = r.skills?.[s.id];
        return { id: s.id, name: s.name, level: E.skillLevel(t, s.id), due: e?.due || null, right: e?.right || 0, wrong: e?.wrong || 0 };
      });
    },
  },
  {
    name: 'get_degree',
    description: 'A degree: progress, pace, concentration, and every course on the path with its term, state (locked, not started, studying, assessments, passed) and what still blocks it.',
    inputSchema: obj({ degree: DEGREE }, ['degree']), readOnly: true,
    run(args) {
      const id = trackOf(args, { degree: true }), D = DL.degreeData(id), r = S.tracks[id];
      return {
        ...degreeSummary(id), start: r.start, terms: D.terms, projection: DM.projection(D, r, St.today()),
        concentrations: D.concentrations.map(c => ({ key: c.key, title: c.title, courses: c.courses })),
        courses: DM.pathCourses(D, r).map(c => { const s = DM.courseStatus(D, r, c); return { ...brief(c), hours: c.hours, prereqs: c.prereqs, state: s.state, gradePct: Math.round(s.pct), unitsDone: s.unitsDone, units: s.units, blockers: s.blockers, waived: !!r.waived?.[c.key] }; }),
      };
    },
  },
  {
    name: 'get_course',
    description: 'One degree course in full: units and their weekly assignments (with what is ticked), assessments with rubrics and marks, free resources, outcomes, practice skills with levels, course tests, benchmarks and notes.',
    inputSchema: obj({ degree: DEGREE, course: str('Course key, e.g. programming-1 (from get_degree).') }, ['degree', 'course']), readOnly: true,
    run(args) {
      const id = trackOf(args, { degree: true }), D = DL.degreeData(id), r = S.tracks[id], c = courseOf(id, args.course);
      const cur = CT.curriculumFor(id, c.key);
      return {
        ...brief(c), summary: c.summary, hours: c.hours, passing: c.passing, status: DM.courseStatus(D, r, c), resources: c.resources,
        units: c.units.map(u => ({
          id: u.id, order: u.order, title: u.title, hours: u.hours, url: u.url, done: DM.unitDone(r, u), note: r.notes?.[u.id] || null,
          weeks: (u.weeks || []).map(w => ({ week: w.week, title: w.title, task: w.activity, produce: w.deliverable, hours: w.hours, url: w.url, done: DM.weekDone(r, u, w) })),
          problemSets: cur?.problemSets?.[u.order] || undefined,
        })),
        assessments: c.assessments.map(a => ({ id: a.id, stage: a.stage, title: a.title, instructions: a.instructions, evidence: a.evidence, weight: a.weight, required: a.required, passMark: a.passing, max: a.max,
          rubric: a.rubric.map(x => ({ criterion: x.criterion, points: x.points, description: x.description, anchors: cur?.anchors?.[`${a.stage}/${x.criterion}`] })),
          answerChecks: (cur?.keyChecks?.[a.stage] || []).map(k => ({ id: k.id, question: k.q, yours: r.keys?.[k.id] || null })),
          record: DM.assessmentRecord(r, a) })),
        practice: DP.coursePractice(id, c.key).map(s => ({ id: s, name: SB.skillById(s)?.name || s, level: E.skillLevel(id, s) })),
        outcomes: cur?.outcomes || c.outcomes, tests: E.courseTestsOf(id, c.key),
        benchmarks: (cur?.benchmarks || []).map(b => ({ ...b, scores: r.benchmarks?.[b.id] || [] })),
      };
    },
  },
  {
    name: 'quiz',
    description: [
      'Take the app\'s marked questions: a mission check, a review, free practice, a degree course check, a placement or end-of-course test, a test-out, or a boss.',
      'start → returns the first question; answer → marks it and returns the next, or the results when the round is over; question → the current one.',
      'Missions, reviews, checks, tests and bosses are timed from when a question is returned (secondsAllowed); practice is not.',
      'This is the learner\'s own record: ask them each question and pass on their answer — do not answer for them unless they ask you to.',
    ].join(' '),
    inputSchema: obj({
      action: str('start, answer or question.', { enum: ['start', 'answer', 'question'] }),
      track: TRACK,
      mode: str('For start.', { enum: ['mission', 'review', 'practice', 'check', 'test_out', 'course_test', 'boss'] }),
      skill: str('practice: the skill id (from get_skills).'),
      week: num('test_out: the week to test out of.'),
      course: str('check and course_test: the degree course key.'),
      test: str('course_test: placement or final.', { enum: ['placement', 'final'] }),
      boss: num('boss: the month (robotics) or part (ai).'),
      answer: { description: 'answer: the option index (from 0) or its text for multiple choice, or the number.', type: ['string', 'number'] },
    }, ['action']),
    run(args) {
      if (args.action === 'question') return questionView() || { quiz: null, note: 'No quiz in progress.' };
      if (args.action === 'answer') {
        if (!S.active) fail('No quiz in progress — start one.');
        const q = E.currentQuestion();
        let input = need(args.answer, 'Give an answer.');
        if (q.kind === 'mc' && typeof input === 'string' && !/^\d+$/.test(input.trim())) {
          const i = q.options.findIndex(o => o.trim().toLowerCase() === input.trim().toLowerCase());
          if (i < 0) fail(`That is not one of the options. Answer with an index 0–${q.options.length - 1}.`);
          input = i;
        }
        E.markShown();
        const res = E.answer(typeof input === 'number' ? input : String(input));
        const marked = { correct: res.correct, expected: res.expected, given: res.given, note: res.note || null, explanation: q.explain || null, xp: res.xp, ...(res.round ? { levelNow: res.round.to, levelMove: res.round.move } : {}) };
        if (!E.sessionOver()) return { marked, next: questionView() };
        const sum = E.finishSession();
        return { marked, finished: true, results: { ...sum, groups: undefined, results: undefined } };
      }
      if (args.action !== 'start') fail('action is start, answer or question.');
      if (S.active) fail(`A ${S.active.mode} on ${trackName(S.active.track)} is in progress — finish it first (quiz question / answer).`);
      const t = trackOf(args), mode = need(args.mode, 'Say which mode to start.');
      let a = null;
      if (mode === 'mission') a = E.startMission(t);
      else if (mode === 'review') a = E.startReview(t);
      else if (mode === 'practice') a = E.startPractice(t, need(args.skill, 'Say which skill to practise.'));
      else if (mode === 'test_out') a = E.startTestOut(t, need(args.week, 'Say which week.'));
      else if (mode === 'boss') {
        if (t === 'robotics') a = RA.startBoss(need(args.boss, 'Say which month.'));
        else if (t === 'ai') a = AA.startBoss(need(args.boss, 'Say which part.'));
        else fail('Bosses are in Robotics and AI.');
      } else if (mode === 'check' || mode === 'course_test') {
        if (!St.isDegree(t)) fail(`${mode} is for degree courses.`);
        const c = courseOf(t, args.course);
        if (mode === 'check') {
          const ids = E.pickCheck(t, DP.coursePractice(t, c.key));
          a = ids.length ? E.startCheck(t, ids, { key: `course:${c.key}`, label: `${c.code} check` }) : null;
        } else {
          const cur = CT.curriculumFor(t, c.key) || fail(`${c.code} has no placement or end-of-course test yet.`);
          const kind = need(args.test, 'Say placement or final.');
          const items = cur.outcomes.filter(o => o.skills.length).map(o => ({ outcome: o.id, text: o.text, skill: o.skills[Math.floor(Math.random() * o.skills.length)] }));
          a = E.startCourseTest(t, c.key, kind, items, { label: `${c.code} ${kind === 'placement' ? 'placement' : 'end-of-course'} test` });
        }
      } else fail(`Unknown mode "${mode}".`);
      if (!a) fail(`That ${mode} cannot start now — it may be done for today, not unlocked yet, or have nothing to ask.`);
      return questionView();
    },
  },
  {
    name: 'update_degree',
    description: [
      'Change a degree the way its buttons do.',
      'week {unit, week, done} · unit {unit, done} · mark {assessment, score} or {assessment, points: {criterion: points}} · unmark {assessment}',
      '· note {unit, text} · concentration {key|null} · hours {hours per week} · start {date YYYY-MM-DD} · waive {course, on}',
      '· benchmark {benchmark, score} · answer_check {check, value} · import_atlas {backup: the Course Atlas backup file text}.',
    ].join(' '),
    inputSchema: obj({
      degree: DEGREE, action: str('What to do.', { enum: ['week', 'unit', 'mark', 'unmark', 'note', 'concentration', 'hours', 'start', 'waive', 'benchmark', 'answer_check', 'import_atlas'] }),
      unit: str('Unit id (from get_course).'), week: num('Week number within the unit.'), done: { type: 'boolean', description: 'week/unit: true to tick, false to untick (default true).' },
      assessment: str('Assessment id.'), score: num('A score.'), points: { type: 'object', description: 'Points per rubric criterion.', additionalProperties: { type: 'number' } },
      text: str('note: the text (empty clears it).'), key: { type: ['string', 'null'], description: 'concentration key, or null for none.' },
      hours: num('Hours of study a week (1–80).'), date: str('YYYY-MM-DD.'), course: str('Course key.'), on: { type: 'boolean', description: 'waive: true to waive, false to undo.' },
      benchmark: str('Benchmark id (from get_course).'), check: str('Answer-check id (from get_course).'), value: { type: ['string', 'number'], description: 'answer_check: your number.' },
      backup: str('import_atlas: the whole backup file as text.'),
    }, ['degree', 'action']),
    run(args) {
      const id = trackOf(args, { degree: true }), D = DL.degreeData(id), r = S.tracks[id];
      const unitHit = () => DM.unitById(D, need(args.unit, 'Say which unit.')) || fail(`No unit "${args.unit}".`);
      const want = args.done !== false;
      switch (args.action) {
        case 'week': {
          const { unit } = unitHit(), w = unit.weeks?.find(x => x.week === Number(args.week)) || fail(`Unit ${unit.id} has no week ${args.week}.`);
          if (DM.weekDone(r, unit, w) !== want) DA.toggleWeek(id, unit.id, w.week);
          return { unit: unit.id, week: w.week, done: DM.weekDone(r, unit, w) };
        }
        case 'unit': {
          const { unit } = unitHit();
          if (DM.unitDone(r, unit) !== want) DA.toggleUnit(id, unit.id);
          return { unit: unit.id, done: DM.unitDone(r, unit) };
        }
        case 'mark': return DA.markAssessment(id, need(args.assessment, 'Say which assessment.'), args.points ? { points: args.points } : { score: need(args.score, 'Give a score or points.') }) || fail('That mark could not be saved — check the assessment id and the numbers.');
        case 'unmark': DA.clearAssessment(id, need(args.assessment, 'Say which assessment.')); return { cleared: args.assessment };
        case 'note': unitHit(); DA.setNote(id, args.unit, args.text || ''); return { unit: args.unit, note: r.notes?.[args.unit] || null };
        case 'concentration': return DA.setConcentration(id, args.key || null) ? { concentration: r.concentration } : fail(`No concentration "${args.key}".`);
        case 'hours': DA.setHours(id, need(args.hours, 'Give hours a week.')); return { hours: r.hours };
        case 'start': return DA.setStart(id, args.date) ? { start: r.start } : fail('Give the date as YYYY-MM-DD.');
        case 'waive': { const c = courseOf(id, args.course); DA.waive(id, c.key, args.on !== false); return { course: c.key, waived: !!r.waived?.[c.key] }; }
        case 'benchmark': {
          const b = Object.values(CT.CS_TERM1).flatMap(c => c.benchmarks || []).find(x => x.id === args.benchmark) || fail(`No benchmark "${args.benchmark}".`);
          return DA.recordBenchmark(id, b.id, args.score, b.max) || fail(`Give a score from 0 to ${b.max}.`);
        }
        case 'answer_check': {
          const k = Object.values(CT.CS_TERM1).flatMap(c => Object.values(c.keyChecks || {}).flat()).find(x => x.id === args.check) || fail(`No answer check "${args.check}".`);
          return DA.answerKeyCheck(id, k, args.value) || fail('Give a number.');
        }
        case 'import_atlas': { const res = DA.importAtlas(need(args.backup, 'Give the backup file text.')); return res.ok ? res : fail(res.error); }
        default: fail(`Unknown action "${args.action}".`);
      }
    },
  },
  {
    name: 'update_track',
    description: [
      'Change a core track (or a degree\'s pace) the way its buttons do.',
      'Any: pace {months} · sync {} pulls Codeforces solves and GitHub pushes.',
      'cp: link_codeforces {handle} · unlink_codeforces · daily_solves {n} · lower_target {tag} · start_contest {id} · finish_contest · abandon_contest.',
      'robotics: verify_build {build, repo} · toggle_read {url} · direction {id} · start {date}.',
      'ai: verify_build {build, repo} · link_hf {user} · unlink_hf · frontier_pick {n, item} · frontier_repo {repo} · verify_frontier {n}.',
    ].join(' '),
    inputSchema: obj({
      track: TRACK, action: str('What to do.', { enum: ['pace', 'sync', 'link_codeforces', 'unlink_codeforces', 'daily_solves', 'lower_target', 'start_contest', 'finish_contest', 'abandon_contest', 'verify_build', 'toggle_read', 'direction', 'start', 'link_hf', 'unlink_hf', 'frontier_pick', 'frontier_repo', 'verify_frontier'] }),
      months: num('pace: 4, 6, 8 or 12 (the track lists its own).'), handle: str('Codeforces handle.'), n: num('A count, or a mission/part number.'),
      tag: str('Codeforces tag.'), id: str('Contest or direction id.'), build: str('Build id.'), repo: str('owner/repo or owner/repo/folder on GitHub.'),
      url: str('Reading URL.'), date: str('YYYY-MM-DD.'), user: str('Hugging Face user.'), item: str('Frontier item.'),
    }, ['track', 'action']),
    async run(args) {
      const t = trackOf(args);
      const only = (...ids) => { if (!ids.includes(t)) fail(`${args.action} is for ${ids.join(' or ')}.`); };
      switch (args.action) {
        case 'pace': return E.setPace(t, Number(args.months)) ? E.paceInfo(t) : fail(`Paces for ${trackName(t)}: ${E.pacesOf(t).map(p => p.months).join(', ')} months.`);
        case 'sync': return Sync.syncAll({ force: true });
        case 'link_codeforces': only('cp'); CA.linkCodeforces({ handle: need(args.handle, 'Give the handle.') }); return Sync.syncAll({ force: true });
        case 'unlink_codeforces': only('cp'); CA.unlinkCodeforces(); return { linked: false };
        case 'daily_solves': only('cp'); CA.setDailySolves(Number(args.n)); return { dailySolves: S.tracks.cp.dailySolves };
        case 'lower_target': only('cp'); return CA.lowerTarget(need(args.tag, 'Give the tag.')) || fail('That target cannot go lower.');
        case 'start_contest': only('cp'); return CA.startContest(need(args.id, 'Give the contest id.')) || fail('That contest cannot start (one may be running).');
        case 'finish_contest': only('cp'); return CA.finishContest() || fail('No contest is running.');
        case 'abandon_contest': only('cp'); return CA.abandonContest() ?? { abandoned: true };
        case 'verify_build': {
          only('robotics', 'ai');
          const A = t === 'robotics' ? RA : AA, b = (t === 'robotics' ? RoadR : PlanA).buildById(need(args.build, 'Say which build.')) || fail(`No build "${args.build}".`);
          const portfolio = b.verify === 'portfolio';
          const target = portfolio ? null : (t === 'ai' ? AA.parseTarget(b, args.repo) : GH.parseRepo(args.repo)) || fail('Give the repo as owner/repo or owner/repo/folder.');
          const result = t === 'ai' ? await AA.checkBuild(b, target)
            : portfolio ? GH.verifyPortfolio(b, S.tracks.robotics.builds) : await GH.verifyBuild(b, target, { user: S.github.user, usedBy: RA.claimedTargets(b.id) });
          if (!result.ok) fail(result.error);
          return { result, applied: A.applyVerification(b.id, target, result) };
        }
        case 'toggle_read': only('robotics'); RA.toggleRead(need(args.url, 'Give the URL.')); return { read: S.tracks.robotics.read };
        case 'direction': only('robotics'); RA.setDirection(need(args.id, 'Give the direction id.')); return { direction: S.tracks.robotics.direction };
        case 'start': only('robotics'); RA.setStart(need(args.date, 'Give the date.')); return { start: S.tracks.robotics.start };
        case 'link_hf': only('ai'); AA.linkHf({ user: need(args.user, 'Give the Hugging Face user.') }); return { hf: S.tracks.ai.hf };
        case 'unlink_hf': only('ai'); AA.unlinkHf(); return { hf: null };
        case 'frontier_pick': only('ai'); return AA.pickFrontier(Number(args.n), need(args.item, 'Give the item.')) ?? { picked: AA.frontierFor(Number(args.n)) };
        case 'frontier_repo': only('ai'); return AA.setFrontierRepo(need(args.repo, 'Give the repo.')) ?? { repo: AA.frontierRepo() };
        case 'verify_frontier': only('ai'); return AA.verifyFrontier(Number(args.n));
        default: fail(`Unknown action "${args.action}".`);
      }
    },
  },
  {
    name: 'update_profile',
    description: 'Change the character: name, theme, daily focus goal, which tracks are on, claim a finished quest, buy a theme, start or stop the focus timer, link a GitHub user for commit credit, or dismiss a notice.',
    inputSchema: obj({
      name: str('Display name.'), theme: str('Theme id (must be owned; buy_theme first).'), focus_goal: num('Daily focus goal in minutes.'),
      tracks: { type: 'object', description: 'Track id → true (on) or false (off).', additionalProperties: { type: 'boolean' } },
      claim_quest: str('Quest id to claim (from get_overview).'), buy_theme: str('Theme id to buy with credits.'),
      timer: str('start or stop the focus timer.', { enum: ['start', 'stop'] }), timer_tag: str('start: what the time is for, as "track:item".'),
      timer_keep_minutes: num('stop: keep only this many minutes (never more than ran).'), github_user: { type: ['string', 'null'], description: 'GitHub login to credit commits from, or null to unlink.' },
      dismiss_notice: { type: 'boolean' },
    }),
    run(args) {
      const out = {};
      const patch = {};
      if (args.name != null) patch.name = String(args.name).slice(0, 40);
      if (args.focus_goal != null) patch.focusGoal = Math.max(10, Math.min(600, Math.round(args.focus_goal)));
      if (args.theme != null) { if (!St.ownsTheme(args.theme)) fail(`Theme "${args.theme}" is not owned.`); patch.theme = args.theme; }
      if (Object.keys(patch).length) { St.saveProfile(patch); out.profile = { name: S.profile.name, theme: S.profile.theme, focusGoal: S.profile.focusGoal }; }
      for (const [id, onOff] of Object.entries(args.tracks || {})) if (!St.setTrack(id, onOff)) fail(`Could not switch ${id} ${onOff ? 'on' : 'off'} (unknown, or it is the last track on).`);
      if (args.tracks) out.tracks = S.profile.tracks;
      if (args.buy_theme) out.bought = St.buyTheme(args.buy_theme) || fail('Could not buy that theme (unknown, owned, or not enough credits).');
      if (args.claim_quest) out.quest = St.claimQuest(args.claim_quest) || fail('That quest is not done yet, or already claimed.');
      if (args.timer === 'start') out.timer = St.timerStart(args.timer_tag || null);
      if (args.timer === 'stop') out.timer = St.timerStop(args.timer_keep_minutes ?? null) || fail('The timer is not running.');
      if (args.github_user === null) { St.unlinkGithub(); out.github = null; }
      else if (args.github_user) { St.linkGithub({ login: args.github_user }); out.github = args.github_user; }
      if (args.dismiss_notice) { St.dismissNotice(); out.notice = null; }
      return Object.keys(out).length ? out : fail('Nothing to change.');
    },
  },
  {
    name: 'get_projects',
    description: 'Flagship projects — one hard, public, measured project per degree term and per Programming month — with progress, plus internship readiness for each field and every verified project. Without track: the projects you are on now and readiness. With track: that track\'s projects in full. With id: one project in full (milestones, bar, routes, what the GitHub check looks for, the post and resume line).',
    inputSchema: obj({ track: TRACK, id: str('A project id (from a list).') }), readOnly: true,
    run(args) {
      const full = f => ({ ...f, proof: CR.proofList(f), progress: CR.progressOf(f), record: CR.recordOf(f.id), route: CR.optionOf(f) });
      if (args.id) return full(CR.flagshipById(args.id) || fail(`No project "${args.id}".`));
      if (args.track) return CR.flagshipsFor(trackOf(args)).map(full);
      return {
        current: St.enabledTracks().map(t => CR.currentFlagship(t, t === 'cp' ? CA.currentMonth() : null)).filter(Boolean)
          .map(f => ({ id: f.id, track: f.track, title: f.title, hook: f.hook, progress: CR.progressOf(f), next: f.milestones.find((_, i) => !CR.recordOf(f.id)?.milestones?.[i])?.title || 'check it on GitHub' })),
        readiness: CR.lanesOn().map(CR.laneStatus).map(s => ({ field: s.lane.name, id: s.lane.id, done: s.done, total: s.total, items: s.items.map(i => ({ id: i.id, label: i.label, how: i.how, kind: i.kind, done: i.done, detail: i.detail || null })) })),
        portfolio: CR.portfolio(), openSource: S.career?.oss || null,
      };
    },
  },
  {
    name: 'update_project',
    description: [
      'Work on a flagship project the way its screen does.',
      'milestone {id, index, done} · route {id, concentration} (capstones) · check {id, repo} runs the GitHub check (pays XP the first time it passes)',
      '· posted {id, url} · ready {field, item, done, link} ticks a readiness item you did yourself · oss {} re-reads merged pull requests from GitHub.',
      'Tick milestones only when the learner says they are done.',
    ].join(' '),
    inputSchema: obj({
      action: str('What to do.', { enum: ['milestone', 'route', 'check', 'posted', 'ready', 'oss'] }),
      id: str('Project id.'), index: num('Milestone index, from 0.'), done: { type: 'boolean' }, concentration: str('Route: the concentration key.'),
      repo: str('owner/repo or owner/repo/folder.'), url: str('Link to the post.'), field: str('Readiness field id (software, ml, robotics, ee, me, physics, math).'), item: str('Readiness item id.'), link: str('A link for a readiness item.'),
    }, ['action']),
    async run(args) {
      const f = () => CR.flagshipById(need(args.id, 'Say which project.')) || fail(`No project "${args.id}".`);
      switch (args.action) {
        case 'milestone': { const p = f(); if (!p.milestones[args.index]) fail(`${p.title} has milestones 0–${p.milestones.length - 1}.`); CR.toggleMilestone(p.id, args.index, args.done !== false); return CR.progressOf(p); }
        case 'route': return CR.chooseOption(f().id, args.concentration) ? { route: CR.optionOf(f()) } : fail('That route is not one of this project\'s.');
        case 'check': { const res = await CR.checkFlagship(f().id, need(args.repo, 'Give the repo.')); if (!res.ok) fail(res.error); return { verified: res.verified, checks: res.checks.map(c => ({ check: c.label, pass: c.pass, detail: c.detail || null })), reward: res.reward }; }
        case 'posted': return CR.setPosted(f().id, args.url) ? { posted: CR.recordOf(args.id).posted } : fail('Give the full https:// link.');
        case 'ready': return CR.tickReady(need(args.field, 'Say which field.'), need(args.item, 'Say which item.'), args.done !== false, args.link) ? CR.laneStatus(CR.LANES.find(l => l.id === args.field)).items.find(i => i.id === args.item) : fail('That is not a readiness item you tick yourself, or the link is not https://.');
        case 'oss': { const res = await CR.checkOss(); return res.ok ? res : fail(res.error); }
        default: fail(`Unknown action "${args.action}".`);
      }
    },
  },
  {
    name: 'read_save',
    description: 'The raw save — everything the app stores — or one part of it by dotted path (e.g. "tracks.cs.assessments", "profile"). The attempt log is left out of the whole save unless include_log is true; get_log filters it.',
    inputSchema: obj({ path: str('Dotted path, e.g. tracks.cp.solved. Empty for the whole save.'), include_log: { type: 'boolean' } }), readOnly: true,
    run(args) {
      if (args.path) return getPath(S, args.path);
      const { log, ...rest } = S;
      return args.include_log ? S : { ...rest, log: `${(log || []).length} entries — use get_log` };
    },
  },
  {
    name: 'get_log',
    description: 'The attempt log: every answer the app marked — time, day, track, mode, skill, level, right (1) or wrong (0), seconds, course and outcome. Newest last.',
    inputSchema: obj({ track: TRACK, skill: str('Skill id.'), mode: str('mission, review, check, ctest, practice, testout or boss.'), since: str('YYYY-MM-DD.'), limit: num('At most this many, newest (default 200).') }), readOnly: true,
    run(args) {
      const rows = (S.log || []).filter(e => (!args.track || e.tr === args.track) && (!args.skill || e.s === args.skill) && (!args.mode || e.m === args.mode) && (!args.since || e.d >= args.since));
      return { total: rows.length, entries: rows.slice(-Math.max(1, Math.min(4000, args.limit || 200))) };
    },
  },
  {
    name: 'write_save',
    description: 'Write the raw save directly — for anything no other tool covers. Either set one value at a dotted path, or replace the whole save. The result is checked by the app\'s own loader; a save it cannot read is refused. Prefer the other tools: they keep the game\'s rules.',
    inputSchema: obj({ path: str('Dotted path to set, e.g. profile.name.'), value: { description: 'The value to set at path (any JSON).' }, save: { type: 'object', description: 'A whole save to replace everything with.' } }),
    run(args) {
      let next;
      if (args.save) next = args.save;
      else {
        need(args.path, 'Give a path and a value, or a whole save.');
        if (!('value' in args)) fail('Give the value to set.');
        next = JSON.parse(JSON.stringify(S));
        setPath(next, args.path, args.value);
      }
      const res = St.importSave(JSON.stringify(next));
      if (!res.ok) fail(res.error);
      return args.save ? { replaced: true, summary: res.summary } : { path: args.path, value: getPath(S, args.path) };
    },
  },
];

function getPath(o, path) {
  let cur = o;
  for (const k of String(path).split('.').filter(Boolean)) {
    if (cur == null || typeof cur !== 'object' || !(k in cur)) fail(`Nothing at "${path}".`);
    cur = cur[k];
  }
  return cur;
}
function setPath(o, path, value) {
  const keys = String(path).split('.').filter(Boolean);
  if (!keys.length) fail('Give a path.');
  let cur = o;
  for (const k of keys.slice(0, -1)) { if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k]; }
  cur[keys.at(-1)] = value;
}

/* --------------------------------- running --------------------------------- */

let queue = Promise.resolve();
/** One call at a time: the app's modules share one save in memory. */
const serial = fn => { const run = queue.then(fn, fn); queue = run.catch(() => {}); return run; };

/**
 * Run a tool against the save in `repo`: read it, load it, call the tool, and
 * write it back if it changed. If the app wrote in between, the call is run
 * again on the newer save rather than overwriting it.
 */
export function callTool(name, args, { token, repo, client = 'an AI app', fetchImpl } = {}) {
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) return Promise.reject(new ToolError(`No tool "${name}".`));
  return serial(async () => {
    for (let attempt = 0; ; attempt++) {
      const remote = await Cloud.cloudRead({ token, repo, fetchImpl });
      if (remote.status !== 'ok') fail('There is no save on GitHub yet. Open Codify, go to Hero → AI & sync, and connect this repo first.');
      process.env.TZ = remote.file.tz || 'UTC';
      const loaded = St.importSave(JSON.stringify(remote.file.save));
      if (!loaded.ok) fail(`The save on GitHub could not be loaded: ${loaded.error}`);
      St.auditStreak();
      const before = JSON.stringify(S);
      const result = await tool.run(args || {});
      // Reading can fill in an empty day record; that is not a change worth a commit.
      if (tool.readOnly || JSON.stringify(S) === before) return result;
      try {
        await Cloud.cloudWrite({ token, repo, file: Cloud.wrapSave(JSON.parse(JSON.stringify(S)), `agent: ${client}`, remote.file.tz), sha: remote.sha, message: `Codify: ${name} from ${client}`, fetchImpl });
        return result;
      } catch (e) {
        if (!e.conflict || attempt >= 2) throw e;
      }
    }
  });
}

/** The repo a token's save lives in: the one named, or the token owner's codify-save. */
const repoCache = new Map();
export async function repoFor(token, named, fetchImpl) {
  if (named) return Cloud.cloudRepo(named) || fail('repo must be owner/name.');
  if (!repoCache.has(token)) repoCache.set(token, Cloud.cloudRepo('', await Cloud.cloudWho(token, fetchImpl)));
  return repoCache.get(token);
}
