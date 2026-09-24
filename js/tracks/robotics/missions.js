/**
 * The roadmap, cut into 180 missions — one a day, thirty a month.
 *
 * Nothing here is new content: it is the article's own topics, focus points,
 * skills and practice builds, laid out in order so each day has one small,
 * definite job. Within a month:
 *
 *   days 1–29   one focus point to learn (spread evenly — some days have none,
 *               and are for going deeper), the skills that go with it, and a
 *               step of whichever build that part of the month is for
 *   day 30      the month's boss
 *
 * A build gets a run of days: plan it, make it (the article's task, one piece
 * a day), measure and break it, then ship it and have the app verify it.
 *
 * Missions go by the ones you have done, not the calendar: miss a day and
 * tomorrow is still the next mission. One a day, so six months is 180 days of
 * showing up.
 */
import { MONTHS, TOPICS, BUILDS, MONTH_DAYS, PLAN_DAYS } from './roadmap.js';
import { SKILLS } from './skills.js';

const CONTENT_DAYS = MONTH_DAYS - 1;     // the last day of each month is the boss

/** How many questions a mission's check may use, by month — it grows with you. */
export const checkBudget = month => 8 + 2 * month;

const sentences = text => text.split(/(?<=[.!?])\s+(?=[A-Z])/).map(s => s.trim()).filter(Boolean);

/** A task's stages: the article writes them as "Do this. Then do that." */
export function stages(task) {
  const out = [];
  for (const s of sentences(task)) {
    if (!out.length || /^Then\b/.test(s)) out.push(s); else out[out.length - 1] += ` ${s}`;
  }
  return out.map(s => s.replace(/^Then,?\s+(\w)/, (_, c) => c.toUpperCase()));
}

/** The steps of a build laid over `len` days: plan, make (its stages, in order), test, ship. */
export function buildSteps(build, len) {
  if (len <= 1) return [{ kind: 'ship' }];
  const parts = stages(build.task);
  const makeDays = len - (len >= 4 ? 3 : 2);
  const steps = [{ kind: 'plan' }];
  let prev = -1;
  for (let i = 0; i < makeDays; i++) {
    const a = Math.floor((i * parts.length) / makeDays);
    const b = Math.max(a + 1, Math.floor(((i + 1) * parts.length) / makeDays));
    steps.push({ kind: 'make', text: parts.slice(a, b).join(' '), repeat: a === prev });
    prev = a;
  }
  if (len >= 4) steps.push({ kind: 'test' });
  steps.push({ kind: 'ship' });
  return steps;
}

function monthMissions(m) {
  const n = m.n, base = MONTH_DAYS * (n - 1);
  const days = Array.from({ length: MONTH_DAYS }, (_, i) => ({
    n: base + i + 1, month: n, day: i + 1, learn: null, topic: null, skills: [], build: null, boss: i === MONTH_DAYS - 1,
  }));

  // Focus points, in the article's order, spread over the content days.
  const topics = TOPICS.filter(t => t.month === n);
  const focus = topics.flatMap(t => t.focus.map((text, j) => ({ topic: t.id, text, j })));
  const focusDay = focus.map((_, j) => Math.floor((j * CONTENT_DAYS) / focus.length));
  focus.forEach((f, j) => { days[focusDay[j]].learn = f; });

  // Days with nothing new to read carry on with the topic before them.
  let topic = focus[0]?.topic || null;
  for (const d of days.slice(0, CONTENT_DAYS)) { if (d.learn) topic = d.learn.topic; d.topic = topic; }

  // A topic's skills arrive on that topic's focus days, spread across them.
  for (const t of topics) {
    const tDays = focus.map((f, j) => (f.topic === t.id ? focusDay[j] : -1)).filter(d => d >= 0);
    const skills = SKILLS.filter(s => s.topic === t.id);
    skills.forEach((s, i) => { days[tDays[Math.floor((i * tDays.length) / skills.length)]].skills.push(s.id); });
  }

  // Each build gets a run of consecutive content days.
  const builds = BUILDS.filter(b => b.month === n);
  builds.forEach((b, i) => {
    const from = Math.floor((i * CONTENT_DAYS) / builds.length), to = Math.floor(((i + 1) * CONTENT_DAYS) / builds.length);
    const steps = buildSteps(b, to - from);
    steps.forEach((st, k) => { days[from + k].build = { id: b.id, step: k + 1, of: steps.length, ...st }; });
  });
  return days;
}

export const MISSIONS = MONTHS.flatMap(monthMissions);
export const TOTAL_MISSIONS = MISSIONS.length;
export const missionAt = n => MISSIONS[Math.max(1, Math.min(PLAN_DAYS, n)) - 1];

/** What a build step asks of you, in a line. */
export function stepLine(step) {
  if (!step) return '';
  if (step.kind === 'plan') return 'Plan it: read the task, write down what you need, and start its folder in a public repo with a README that says what it will do. Push.';
  if (step.kind === 'make') return step.text;
  if (step.kind === 'test') return 'Measure it and break it on purpose. Put the numbers and a “What broke” section in the README. Push.';
  return 'Ship it: photo or video in the README, push, then press Verify.';
}

export const STEP_NAMES = { plan: 'Plan', make: 'Make', test: 'Test', ship: 'Ship' };
export const stepName = step => (step.repeat ? 'Finish' : STEP_NAMES[step.kind]);
