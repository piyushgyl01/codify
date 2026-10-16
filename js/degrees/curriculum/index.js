/**
 * Every audited course, by degree. A course listed here has outcomes mapped
 * to a standard, practice that checks them, marking anchors, answer checks,
 * benchmarks and the gaps the audit found; one that is not still has Course
 * Atlas's own design.
 */
import { CS_TERM1 } from './cs-term1.js';
import { CS_TERM2 } from './cs-term2.js';
import { CS_TERM3 } from './cs-term3.js';
import { CS_TERM4 } from './cs-term4.js';
import { CS_TERM5 } from './cs-term5.js';
import { CS_TERM6 } from './cs-term6.js';
import { MATH_TERM0 } from './math-term0.js';
import { MATH_TERM1 } from './math-term1.js';
import { MATH_TERM2 } from './math-term2.js';
import { MATH_TERM3 } from './math-term3.js';
import { MATH_TERM4 } from './math-term4.js';
import { MATH_TERM5 } from './math-term5.js';
import { PHYS_TERM0 } from './phys-term0.js';
import { PHYS_TERM1 } from './phys-term1.js';
import { PHYS_TERM2 } from './phys-term2.js';
import { PHYS_TERM3 } from './phys-term3.js';
import { PHYS_TERM4 } from './phys-term4.js';

/**
 * Courses outside CS have no rubric in the catalog, so their design carries one
 * (rubrics[stage] = [{ criterion, points, partial, full, part, none }]); the
 * importer writes it into the catalog and its anchors are read from here.
 */
const anchored = courses => Object.fromEntries(Object.entries(courses).map(([key, c]) => [key, !c.rubrics ? c : {
  ...c, anchors: { ...Object.fromEntries(Object.entries(c.rubrics).flatMap(([stage, lines]) => lines.map(x => [`${stage}/${x.criterion}`, { full: x.full, part: x.part, none: x.none }]))), ...c.anchors },
}]));

export const CURRICULUM = {
  cs: { ...CS_TERM1, ...CS_TERM2, ...CS_TERM3, ...CS_TERM4, ...CS_TERM5, ...CS_TERM6 },
  math: anchored({ ...MATH_TERM0, ...MATH_TERM1, ...MATH_TERM2, ...MATH_TERM3, ...MATH_TERM4, ...MATH_TERM5 }),
  phys: anchored({ ...PHYS_TERM0, ...PHYS_TERM1, ...PHYS_TERM2, ...PHYS_TERM3, ...PHYS_TERM4 }),
};

export const curriculumFor = (degreeId, courseKey) => CURRICULUM[degreeId]?.[courseKey] || null;

/** Every audited course as [degreeId, courseKey, design]. */
export const auditedCourses = () => Object.entries(CURRICULUM).flatMap(([id, courses]) => Object.entries(courses).map(([key, c]) => [id, key, c]));

export const benchmarkById = id => auditedCourses().flatMap(([, , c]) => c.benchmarks || []).find(b => b.id === id) || null;
export const keyCheckById = id => auditedCourses().flatMap(([, , c]) => Object.values(c.keyChecks || {}).flat()).find(k => k.id === id) || null;
