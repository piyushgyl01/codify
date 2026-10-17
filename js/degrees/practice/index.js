/**
 * Practice for the degrees: which skills each course checks.
 *
 * Programming I has its own eighteen Python skills, one or more per unit. The
 * other courses borrow the skills Codify already has where a course teaches
 * the same thing — linear algebra checks dot products and eigenvalues, circuit
 * analysis checks Ohm's law and dividers, algorithms checks Dijkstra — so a
 * degree course has questions the app can mark itself. Courses with nothing
 * that fits yet have no practice; their work is the course's own.
 */
import { PYTHON_FUNDAMENTALS } from './python-source.js';
import { PYTHON_EXTRA } from './python-extra.js';
import { DISCRETE } from './discrete.js';
import { CALCULUS } from './calculus.js';
import { CSYSTEMS } from './csystems.js';
import { WRITING } from './writing.js';
import { DATASTRUCTS } from './datastructs.js';
import { ARCH } from './arch.js';
import { LINALG } from './linalg.js';
import { PROB } from './prob.js';
import { WEB } from './web.js';
import { ALGOS } from './algos.js';
import { OS } from './os.js';
import { DB } from './db.js';
import { NET } from './net.js';
import { PL } from './pl.js';
import { SE } from './se.js';
import { THEORY } from './theory.js';
import { COMPILERS } from './compilers.js';
import { SECURITY } from './security.js';
import { HCI } from './hci.js';
import { AIPLAN } from './aiplan.js';
import { DISTSYS } from './distsys.js';
import { INFERENCE } from './inference.js';
import { GRAPHICS } from './graphics.js';
import { SYSTEMS6 } from './systems6.js';
import { MATHFOUND } from './mathfound.js';
import { MATHCALC } from './mathcalc.js';
import { MATHALG } from './mathalg.js';
import { MATHCOMB } from './mathcomb.js';
import { MATHANALYSIS } from './mathanalysis.js';
import { MATHAPPLIED } from './mathapplied.js';
import { PHYSMECH } from './physmech.js';
import { PHYSLAB } from './physlab.js';
import { PHYSEM } from './physem.js';
import { PHYSADV } from './physadv.js';
import { PHYSFRONT } from './physfront.js';
import { PHYSSENIOR } from './physsenior.js';
import { EECIRCUITS } from './eecircuits.js';
import { EEDIGITAL } from './eedigital.js';
import { EEDEVICES } from './eedevices.js';
import { EESIGNALS } from './eesignals.js';
import { EESYSTEMS } from './eesystems.js';
import { EECOMMS } from './eecomms.js';
import { EECONTROL } from './eecontrol.js';
import { EEVLSI } from './eevlsi.js';
import { auditedCourses } from '../curriculum/index.js';

/** A Course Atlas question, in Codify's shape. Multiple choice puts the right answer first. */
function adapt(skill) {
  return {
    id: skill.id, name: skill.title, summary: skill.summary, track: 'degrees',
    gen: t => {
      const q = skill.generate(t.rng);
      if (q.kind === 'number') {
        return { kind: 'num', q: q.prompt, code: q.code, answer: q.answer, explain: q.explain, python: q.python,
          ...(q.tolerance ? { rtol: q.tolerance } : { tol: 0, dp: 6 }) };
      }
      const right = q.options[q.correctIndex];
      return { kind: 'mc', q: q.prompt, code: q.code, options: [right, ...q.options.filter((_, i) => i !== q.correctIndex)],
        correct: 0, explain: q.explain, python: q.python };
    },
  };
}

export const PYTHON_SKILLS = PYTHON_FUNDAMENTALS.map(adapt);
const PY = PYTHON_SKILLS.map(s => s.id);

/** Every skill written for the degrees, beyond the ones they borrow from Codify's tracks. */
export const DEGREE_SKILLS = [...PYTHON_SKILLS, ...PYTHON_EXTRA, ...DISCRETE, ...CALCULUS, ...CSYSTEMS, ...WRITING, ...DATASTRUCTS, ...ARCH, ...LINALG, ...PROB, ...WEB, ...ALGOS, ...OS, ...DB, ...NET, ...PL, ...SE, ...THEORY, ...COMPILERS, ...SECURITY, ...HCI, ...AIPLAN, ...DISTSYS, ...INFERENCE, ...GRAPHICS, ...SYSTEMS6, ...MATHFOUND, ...MATHCALC, ...MATHALG, ...MATHCOMB, ...MATHANALYSIS, ...MATHAPPLIED, ...PHYSMECH, ...PHYSLAB, ...PHYSEM, ...PHYSADV, ...PHYSFRONT, ...PHYSSENIOR, ...EECIRCUITS, ...EEDIGITAL, ...EEDEVICES, ...EESIGNALS, ...EESYSTEMS, ...EECOMMS, ...EECONTROL, ...EEVLSI];

/** Programming I (CS 1.2), unit by unit, as Course Atlas mapped it. */
export const UNIT_PRACTICE = {
  'unt_01a00129-87d9-7de3-8f38-7fa74c321ad5': ['py.arith', 'py.binding', 'py.strings'],
  'unt_01a00129-87d9-72ba-ad7b-b1bea12727cf': ['py.bool', 'py.branch'],
  'unt_01a00129-87d9-7555-9d0b-c20688b17ed8': ['py.loopcount', 'py.accum'],
  'unt_01a00129-87d9-70b0-b007-7f5432342b92': ['py.except', 'py.tryflow'],
  'unt_01a00129-87d9-7527-8cbd-88d4cacb962d': ['py.http', 'py.json', 'py.semver'],
  'unt_01a00129-87d9-7768-9a42-e693569a267e': ['py.boundary', 'py.mutation'],
  'unt_01a00129-87d9-73bc-ac3e-d226388147e0': ['py.regex', 'py.csv'],
  'unt_01a00129-87d9-787d-a8bb-0fb77228638f': ['py.oop', 'py.alias'],
};

const PY_BASICS = ['py.arith', 'py.branch', 'py.loopcount', 'py.accum', 'py.strings'];

/** Course by course: `degree id/course key` → skill ids. */
export const COURSE_PRACTICE = {
  /* Computer Science */
  'cs/programming-1': PY,
  'cs/discrete-mathematics-for-computing': ['gcd', 'primes', 'modpow', 'ncr', 'inclexcl', 'bits', 'subsets'],
  'cs/calculus-for-computing': ['deriv', 'grad'],
  'cs/computer-systems-foundations': ['bits', 'cli'],
  'cs/data-structures': ['bigo', 'heap', 'dsu', 'freq', 'nextgreater', 'prefix', 'fenwick'],
  'cs/computer-architecture': ['bits', 'flops', 'mem'],
  'cs/linear-algebra': ['dot', 'matmul', 'eigen'],
  'cs/probability-for-computing': ['expvar', 'bayes', 'expect', 'entropy'],
  'cs/web-engineering': ['py.http', 'py.json'],
  'cs/algorithm-design-and-analysis': ['bigo', 'ops', 'bsearch', 'twoptr', 'intervals', 'dfs', 'bfs', 'topo', 'dijkstra', 'mst', 'knapsack', 'lis', 'lcs'],
  'cs/software-engineering': ['py.boundary', 'py.mutation', 'py.semver', 'cli'],
  'cs/computer-security': ['modpow', 'modinv', 'strhash'],
  'cs/artificial-intelligence': ['bfs', 'dijkstra', 'bayes', 'entropy', 'returns'],
  'cs/machine-learning': ['linreg', 'logit', 'metrics', 'auc', 'gini', 'kmeans', 'backprop', 'softmax', 'init', 'adam'],
  'cs/distributed-systems': ['latency'],
  'cs/data-science': ['stats', 'judge', 'metrics', 'forecast', 'expvar', 'bayes'],
  'cs/computer-graphics': ['cross', 'rot', 'pinhole', 'matmul'],
  'cs/computer-vision': ['convout', 'iou', 'patches', 'infonce', 'params'],
  'cs/natural-language-processing': ['bpe', 'attn', 'perplexity', 'sampling', 'llmparams', 'kvcache'],
  'cs/parallel-computing': ['flops', 'latency', 'mem'],
  'cs/applied-cryptography': ['gcd', 'primes', 'modpow', 'modinv', 'strhash'],

  /* Electrical Engineering */
  'ee/calculus-i-models-and-change': ['deriv'],
  'ee/physics-i-mechanics-and-waves': ['torque', 'gears'],
  'ee/programming-for-engineers': PY_BASICS,
  'ee/electrical-engineering-studio-i': ['ohm', 'led', 'bands', 'meter', 'solder', 'symbols'],
  'ee/calculus-ii-multivariable-systems': ['grad', 'deriv'],
  'ee/physics-ii-electricity-and-magnetism': ['ohm', 'divider'],
  'ee/data-structures-and-systems-programming': ['bigo', 'heap', 'dsu', 'freq', 'bits'],
  'ee/circuit-analysis-i': ['ohm', 'divider', 'led', 'symbols', 'bands'],
  'ee/linear-algebra-and-differential-equations': ['dot', 'matmul', 'eigen'],
  'ee/circuit-analysis-ii': ['decouple', 'pullup', 'divider', 'stall'],
  'ee/digital-logic-and-hardware-description': ['bits', 'pullup'],
  'ee/electronics-and-instrumentation-lab-i': ['meter', 'solder', 'decouple', 'symbols'],
  'ee/probability-and-random-processes': ['expvar', 'bayes', 'entropy'],
  'ee/signals-and-systems': ['spectro', 'pwm'],
  'ee/computer-architecture-and-embedded-systems': ['mcu', 'pwm', 'timing', 'buses'],
  'ee/feedback-and-real-time-embedded-control': ['pid', 'pidmath', 'compfilter', 'control', 'timing'],
  'ee/digital-signal-processing': ['spectro', 'compfilter'],
  'ee/fpga-systems-and-hardware-acceleration': ['bits', 'flops'],
  'ee/statistical-signal-processing-and-machine-learning': ['linreg', 'bayes', 'expvar', 'metrics'],
  'ee/state-estimation-and-sensor-fusion': ['compfilter', 'sensors', 'encoder', 'nav'],
  'ee/power-electronics-and-electric-drives': ['drivers', 'pwm', 'actuators', 'lipo', 'stall'],
  'ee/energy-power-electronics-and-power-systems': ['lipo', 'stall', 'drivers'],
  'ee/integrated-systems-verification-lab': ['meter', 'buses', 'py.boundary'],
  'ee/computer-architecture-and-accelerator-design': ['flops', 'mem', 'quant'],
  'ee/wireless-systems-and-information-theory': ['entropy'],
  'ee/robot-kinematics-planning-and-control': ['rot', 'fk', 'jacobian', 'diffdrive', 'control', 'moveit'],

  /* Mechanical Engineering */
  'me/engineering-calculus-1': ['deriv'],
  'me/university-physics-1-mechanics-waves': ['torque', 'gears'],
  'me/programming-engineering-computation': PY_BASICS,
  'me/engineering-graphics-cad-design-studio': ['cad', 'tolerance', 'orient'],
  'me/multivariable-calculus-vector-analysis': ['grad'],
  'me/linear-algebra-differential-equations-numerical-methods': ['matmul', 'eigen'],
  'me/university-physics-2-electricity-magnetism-circuits': ['ohm', 'divider'],
  'me/materials-manufacturing-metrology': ['materials', 'orient', 'tolerance'],
  'me/electronics-sensors-data-acquisition': ['ohm', 'divider', 'sensors', 'meter', 'buses'],
  'me/machine-elements-mechanical-design': ['gears', 'backlash', 'torque'],
  'me/system-dynamics-feedback-control': ['pid', 'pidmath', 'control'],
  'me/engineering-probability-measurement-experimental-methods': ['expvar', 'stats'],
  'me/advanced-manufacturing-product-realization': ['materials', 'orient', 'tolerance', 'cad'],
  'me/mechatronics-embedded-control': ['pwm', 'drivers', 'encoder', 'mcu', 'timing'],
  'me/robot-mechanics-kinematics-motion-planning': ['rot', 'fk', 'jacobian', 'diffdrive'],
  'me/autonomous-machines-perception-estimation-control': ['compfilter', 'nav', 'pinhole', 'stereo', 'control'],

  /* Physics */
  'phys/calculus-1-physical-modeling': ['deriv'],
  'phys/scientific-programming': PY_BASICS,
  'phys/measurement-and-experimental-foundations': ['meter', 'stats'],
  'phys/multivariable-and-vector-calculus': ['grad'],
  'phys/linear-algebra-and-differential-equations': ['dot', 'matmul', 'eigen'],
  'phys/electricity-magnetism-and-circuits': ['ohm', 'divider'],
  'phys/probability-data-and-experimental-methods': ['expvar', 'bayes', 'stats'],
  'phys/thermal-physics': ['entropy'],
  'phys/statistical-mechanics': ['entropy', 'expvar'],
  'phys/computational-physics': ['py.accum', 'py.loopcount', 'flops'],
  'phys/advanced-experimental-physics-1-electronics-optics': ['ohm', 'divider', 'decouple', 'meter'],
  'phys/data-intensive-and-bayesian-physics': ['bayes', 'stats', 'judge'],

  /* Mathematics */
  'math/calculus-1': ['deriv'],
  'math/linear-algebra-1': ['dot', 'matmul'],
  'math/discrete-mathematics': ['gcd', 'primes', 'modpow', 'ncr', 'inclexcl'],
  'math/mathematical-programming': PY_BASICS,
  'math/multivariable-calculus': ['grad'],
  'math/linear-algebra-2': ['eigen', 'matmul'],
  'math/probability-1': ['expvar', 'bayes', 'expect', 'ncr'],
  'math/combinatorics-and-graph-theory': ['ncr', 'inclexcl', 'dfs', 'bfs', 'topo', 'mst'],
  'math/numerical-analysis': ['grad', 'bsearch'],
  'math/mathematical-modeling': ['forecast', 'linreg'],
  'math/optimization': ['grad', 'adam', 'knapsack'],
  'math/stochastic-processes-and-statistical-inference': ['expvar', 'bayes', 'stats'],
  'math/computational-mathematics': ['py.accum', 'flops'],
  'math/algebraic-number-theory': ['gcd', 'modpow', 'modinv', 'primes'],
  'math/combinatorial-optimization': ['mst', 'dijkstra', 'knapsack', 'intervals'],
  'math/advanced-probability-and-statistics': ['stats', 'expect', 'bayes'],
  'math/algorithms-complexity-and-coding': ['bigo', 'ops', 'entropy', 'strhash'],
};

/*
 * An audited course's practice is whatever its outcomes are checked by
 * (js/degrees/curriculum/), course by course and unit by unit.
 */
const AUDITED_UNITS = {};
for (const [id, key, c] of auditedCourses()) {
  COURSE_PRACTICE[`${id}/${key}`] = [...new Set(c.outcomes.flatMap(o => o.skills))];
  AUDITED_UNITS[`${id}/${key}`] = c.outcomes;
}

export const coursePractice = (degreeId, courseKey) => COURSE_PRACTICE[`${degreeId}/${courseKey}`] || [];

/** A unit's practice: the audited outcomes that unit teaches, else Course Atlas's own mapping. */
export function unitPractice(unitId, courseKey = null, order = null, degreeId = 'cs') {
  const outcomes = courseKey && AUDITED_UNITS[`${degreeId}/${courseKey}`];
  if (outcomes && order != null) {
    const ids = [...new Set(outcomes.filter(o => o.units.includes(order)).flatMap(o => o.skills))];
    if (ids.length) return ids;
  }
  return UNIT_PRACTICE[unitId] || [];
}
