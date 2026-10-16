/**
 * Imports the five Course Atlas degrees from model_uni into Codify.
 *
 * model_uni publishes each degree as a versioned catalog bundle. This reads the
 * newest version of each from a `npm run catalog:export` directory and writes a
 * compact copy Codify loads on demand: the terms, the requirements and
 * concentrations, and for every course its units, weekly assignments,
 * assessments, rubrics and free resources.
 *
 *   (in model_uni)  npm run catalog:export -- /tmp/atlas
 *   (in codify)     node tools/import-atlas.mjs /tmp/atlas
 *
 * Unit ids are kept as model_uni has them, so progress exported from Course
 * Atlas can be read back; units of older published versions are mapped onto
 * the newest by course and position.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { LINK_FIXES, placeFix } from '../js/degrees/curriculum/corrections.js';

const src = process.argv[2];
if (!src) { console.error('Usage: node tools/import-atlas.mjs <catalog-export-directory>'); process.exit(1); }
const OUT = resolve(new URL('..', import.meta.url).pathname, 'data/degrees');
mkdirSync(OUT, { recursive: true });

/** How each degree appears in Codify. Order is the order on the Tracks tab. */
const META = {
  'computer-science':       { id: 'cs',   icon: '💻', color: 'var(--blue)' },
  'electrical-engineering': { id: 'ee',   icon: '⚡', color: 'var(--yellow)' },
  'mechanical-engineering': { id: 'me',   icon: '⚙️', color: 'var(--orange)' },
  'physics':                { id: 'phys', icon: '🔭', color: 'var(--violet)' },
  'mathematics':            { id: 'math', icon: '∑',  color: 'var(--pink)' },
};

const bundles = readdirSync(src).filter(f => f.endsWith('.catalog.json')).map(f => JSON.parse(readFileSync(join(src, f), 'utf8')));
const semver = v => v.split('.').map(Number).reduce((n, x) => n * 1000 + x, 0);
const bySlug = new Map();
for (const b of bundles) (bySlug.get(b.program.canonicalSlug) || bySlug.set(b.program.canonicalSlug, []).get(b.program.canonicalSlug)).push(b);

const URL_RE = /https?:\/\/[^\s|)]+/;
/** Links found broken in the October 2026 audit are replaced wherever they appear. */
const fixLinks = s => (s ? s.replace(/https?:\/\/[^\s|)]+/g, u => LINK_FIXES[u] || u) : s);
const clean = s => fixLinks((s || '').replace(/\s+/g, ' ').trim());
const index = [];

for (const [slug, all] of bySlug) {
  const meta = META[slug];
  if (!meta) { console.warn(`skipping unknown degree ${slug}`); continue; }
  all.sort((a, b) => semver(b.programVersion.version) - semver(a.programVersion.version));
  const d = all[0], pv = d.programVersion;

  const courseOf = new Map(d.courses.map(c => [c.id, c]));
  const keyOfVersion = new Map(d.courseVersions.map(cv => [cv.id, courseOf.get(cv.courseId).canonicalSlug]));
  const periods = [...d.calendars[0].periods].sort((a, b) => a.order - b.order);
  const termOf = new Map(d.schedules[0].placements.map(p => [p.subject.id, { term: periods.findIndex(x => x.id === p.periodId), order: p.order }]));
  const rv = new Map(d.resourceVersions.map(r => [r.id, r]));
  const res = new Map(d.resources.map(r => [r.id, r]));
  const rights = new Map(d.rights.map(r => [r.resourceVersionId, r]));
  const access = new Map(d.accessOffers.map(a => [a.resourceVersionId, a]));
  const assessmentsOf = cvId => d.assessmentVersions.filter(a => a.courseVersionId === cvId);

  const courses = d.courseVersions.map(cv => {
    const c = courseOf.get(cv.courseId), placed = termOf.get(cv.id) || { term: -1, order: 99 };
    const weights = new Map((cv.gradingPolicy?.contributions || []).map(x => [x.assessmentVersionId, x]));
    // A fix for one place (a unit or a week of this course) beats the general link fixes.
    const at = (where, field, value) => placeFix(slug, c.canonicalSlug, where)?.[field] ?? value;
    const units = d.learningUnits.filter(u => u.courseVersionId === cv.id).sort((a, b) => a.order - b.order).map(u => ({
      id: u.id, order: u.order, label: u.label, kind: u.kindLabel || u.kind, title: clean(u.title), topic: clean(u.topic),
      activity: clean(u.activity), evidence: clean(u.evidence), hours: u.nominalHours,
      where: clean(u.resourceLocator), url: at(`U${u.order}`, 'url', fixLinks((u.resourceLocator || '').match(URL_RE)?.[0] || null)),
      ...(u.weeklyAssignments?.length ? { weeks: u.weeklyAssignments.map(w => ({
        week: w.week, title: at(`W${w.week}`, 'title', clean(w.title)), activity: clean(w.activity), deliverable: clean(w.deliverable), hours: w.estimatedHours,
        url: at(`W${w.week}`, 'url', fixLinks(w.sourceEvidence?.resolvedUrl || w.sourceEvidence?.url || (w.resourceLocator || '').match(URL_RE)?.[0] || null)),
      })) } : {}),
    }));
    return {
      key: c.canonicalSlug, code: c.codes?.[0]?.value || '', title: clean(cv.title), summary: clean(cv.summary),
      first: clean(cv.firstAction), format: cv.format, hours: cv.nominalHours, outcomes: cv.outcomes.map(clean), setup: (cv.setup || []).map(clean),
      term: placed.term, order: placed.order,
      prereqs: (cv.prerequisites || []).filter(p => p.kind === 'required').map(p => keyOfVersion.get(p.courseVersionId)).filter(Boolean),
      recommended: (cv.prerequisites || []).filter(p => p.kind !== 'required').map(p => keyOfVersion.get(p.courseVersionId)).filter(Boolean),
      passing: cv.gradingPolicy?.passingPercentage ?? 60,
      resources: (cv.resourceReferences || []).map(ref => {
        const v = rv.get(ref.resourceVersionId), r = v && res.get(v.resourceId), g = rights.get(ref.resourceVersionId), a = access.get(ref.resourceVersionId);
        return v && { title: clean(v.title), url: fixLinks(v.canonicalUrl), provider: r?.provider || '', role: ref.role, license: g?.licenseIdentifier || '',
          licenseUrl: g?.licenseUrl || '', free: a ? a.type === 'free' && !a.loginRequired : true };
      }).filter(Boolean),
      units,
      assessments: assessmentsOf(cv.id).map(a => {
        const w = weights.get(a.id);
        return {
          id: a.id, title: clean(a.title), unit: a.unitId, stage: a.stage || '', instructions: clean(a.instructions),
          evidence: (a.submissionEvidence || []).map(clean), hours: a.estimatedHours, max: a.maximumScore || 100,
          pass: a.passingScore ?? null, weight: w?.weight ?? 0, required: !!w?.requiredToPass,
          rubric: (a.rubric || []).map(x => ({ criterion: clean(x.criterion), description: clean(x.description), points: x.points })),
        };
      }),
    };
  }).sort((a, b) => a.term - b.term || a.order - b.order);

  const concentrations = d.concentrations.map(c => ({
    key: c.canonicalSlug, title: c.title, description: clean(c.description),
    courses: c.courseVersionIds.map(id => keyOfVersion.get(id)), capstones: (c.capstoneIdeas || []).map(clean),
  }));
  const concentrationCourses = new Set(concentrations.flatMap(c => c.courses));
  const requirements = [...pv.requirements].sort((a, b) => a.order - b.order).map(r => ({
    id: r.id, title: r.title, description: clean(r.description), min: r.rule.minSelections, max: r.rule.maxSelections,
    concentration: r.rule.selectionConstraint === 'same concentration',
    credits: r.rule.minCredits?.value ?? null, creditSystem: r.rule.minCredits?.system || '',
    options: r.options.map(o => ({ course: keyOfVersion.get(o.courseVersionId), credits: o.credits?.value ?? 0 })),
  }));

  // Older versions' ids, mapped onto this version: units by course and position,
  // assessments by course and order, concentrations by slug, course versions by course.
  const aliases = {};
  for (const old of all.slice(1)) {
    const oc = new Map(old.courses.map(c => [c.id, c.canonicalSlug]));
    const ok = new Map(old.courseVersions.map(cv => [cv.id, oc.get(cv.courseId)]));
    for (const u of old.learningUnits) {
      const course = courses.find(c => c.key === ok.get(u.courseVersionId));
      const match = course?.units.find(x => x.order === u.order);
      if (match && match.id !== u.id) aliases[u.id] = match.id;
    }
    for (const cv of old.courseVersions) {
      const course = courses.find(c => c.key === ok.get(cv.id));
      if (!course) continue;
      old.assessmentVersions.filter(x => x.courseVersionId === cv.id).forEach((x, i) => {
        const match = course.assessments[i];
        if (match && match.id !== x.id) aliases[x.id] = match.id;
      });
    }
    for (const c of old.concentrations) aliases[c.id] = c.canonicalSlug;
  }
  for (const c of d.concentrations) aliases[c.id] = c.canonicalSlug;
  // Every published course version id, so imported progress finds its course.
  const courseIds = {};
  for (const b of all) {
    const bc = new Map(b.courses.map(c => [c.id, c.canonicalSlug]));
    for (const cv of b.courseVersions) courseIds[cv.id] = bc.get(cv.courseId);
  }

  const degree = {
    slug, ...meta, version: pv.version, title: pv.title, short: d.program.shortTitle, school: d.program.school,
    summary: clean(pv.summary), credential: pv.credentialLabel, notice: clean(pv.recognitionNotice), duration: pv.nominalDuration,
    workload: clean(pv.workloadPolicy), outcomes: pv.outcomes.map(clean), terms: periods.map(p => p.label),
    requirements, concentrations, courses, aliases, courseIds,
    programIds: all.map(b => b.programVersion.id),
  };
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(degree));
  const units = courses.reduce((n, c) => n + c.units.length, 0);
  index.push({ slug, ...meta, version: pv.version, title: pv.title, short: d.program.shortTitle, summary: degree.summary,
    duration: pv.nominalDuration, courses: courses.length, units, terms: periods.length,
    concentrations: concentrations.map(c => c.title), concentrationCourses: concentrationCourses.size });
  console.log(`${slug.padEnd(24)} v${pv.version}  ${courses.length} courses  ${units} units  ${Object.keys(aliases).length} aliases  ${(JSON.stringify(degree).length / 1024).toFixed(0)} KB`);
}

index.sort((a, b) => Object.keys(META).indexOf(a.slug) - Object.keys(META).indexOf(b.slug));
writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 1));
// The list itself ships as a module, so the app can show every degree before loading any.
const metaFile = resolve(new URL('..', import.meta.url).pathname, 'js/degrees/meta.js');
mkdirSync(resolve(metaFile, '..'), { recursive: true });
writeFileSync(metaFile, `/** Generated by tools/import-atlas.mjs from the Course Atlas catalog — do not edit by hand. */\nexport const DEGREE_META = ${JSON.stringify(index, null, 1)};\n`);
console.log(`wrote ${index.length} degrees to ${OUT}`);
