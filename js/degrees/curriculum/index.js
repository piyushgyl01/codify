/**
 * Every audited course, by degree. A course listed here has outcomes mapped
 * to a standard, practice that checks them, marking anchors, answer checks,
 * benchmarks and the gaps the audit found; one that is not still has Course
 * Atlas's own design.
 */
import { CS_TERM1 } from './cs-term1.js';
import { CS_TERM2 } from './cs-term2.js';
import { CS_TERM3 } from './cs-term3.js';

export const CURRICULUM = {
  cs: { ...CS_TERM1, ...CS_TERM2, ...CS_TERM3 },
};

export const curriculumFor = (degreeId, courseKey) => CURRICULUM[degreeId]?.[courseKey] || null;

/** Every audited course as [degreeId, courseKey, design]. */
export const auditedCourses = () => Object.entries(CURRICULUM).flatMap(([id, courses]) => Object.entries(courses).map(([key, c]) => [id, key, c]));

export const benchmarkById = id => auditedCourses().flatMap(([, , c]) => c.benchmarks || []).find(b => b.id === id) || null;
export const keyCheckById = id => auditedCourses().flatMap(([, , c]) => Object.values(c.keyChecks || {}).flat()).find(k => k.id === id) || null;
