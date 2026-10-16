/**
 * Physics, Term 0 — audited as the Mathematics degree was: readings for every
 * unit (tools/readings/phys.mjs), outcomes mapped to ETS's GRE Physics content
 * areas and, for laboratory work, the AAPT's Recommendations for the
 * Undergraduate Physics Laboratory Curriculum (2014); rubrics with marking
 * anchors; verified practice; outside graders.
 *
 * Outside graders: MIT 18.01SC, 8.012 and 5.111SC exams with solutions;
 * 6.100L problem sets with their provided tests; the PTB's gravity service as
 * the reference for a measured g. Evidence in docs/phys-term0-audit.md.
 */

const OCW = 'https://ocw.mit.edu/courses';

const o = (id, text, std, skills, units, assessed = []) => ({ id, text, cs2023: std, skills, units, assessed });
const crit = (criterion, full, part, none) => ({ criterion, points: 25, partial: 15, full, part, none });
const examFinal = (source, linked, check) => [
  crit('Cumulative correctness', `At least 85% on a cumulative exam (${source}), marked against the official solutions.`, '60–84%.', 'Below 60%.'),
  crit('Linked solution', linked, 'Correct, with one step unjustified.', 'Disconnected calculations.'),
  crit('Limiting cases and units', check, 'Units checked, limiting cases not.', 'Neither.'),
  crit('Correction and defense', 'Every lost mark corrected, and the linked solution defended under questions.', 'Partial corrections.', 'None.'),
];

export const PHYS_TERM0 = {
  'calculus-1-physical-modeling': {
    doc: 'docs/phys-term0-audit.md',
    outcomes: [
      o('phm101.limits', 'Use limits, continuity and dimensions to reason about physical functions.', ['QAA-MSOR 3.8', 'GRE-P Laboratory Methods'], ['calc.limit'], [1], ['final']),
      o('phm101.derivative', 'Differentiate and linearise to model rates.', ['QAA-MSOR 3.8'], ['calc.deriv', 'calc.linapprox'], [2], ['final']),
      o('phm101.optimize', 'Optimise, scale and test sensitivity.', ['QAA-MSOR 3.8'], ['calc.optimize', 'calc.related', 'm.newton'], [3], ['final']),
      o('phm101.motion', 'Infer a motion law from measured data with its uncertainty.', ['AAPT Modeling', 'AAPT Data Analysis and Visualization'], ['lab.fit', 'pm.projectile'], [4], ['applied']),
      o('phm101.integral', 'Integrate to accumulate quantities such as work.', ['QAA-MSOR 3.8', 'GRE-P Classical Mechanics'], ['calc.ftc', 'pm.work'], [5], ['applied', 'final']),
      o('phm101.quadrature', 'Integrate by method and numerically, with error estimates.', ['QAA-MSOR 3.16'], ['calc.integral', 'calc.trapezoid', 'na.simpson'], [6], ['applied']),
      o('phm101.taylor', 'Approximate with Taylor series and bound the error.', ['QAA-MSOR 3.8'], ['calc.taylor', 'm.series'], [7], ['final']),
    ],
    gaps: [
      { what: 'Units had no links', why: 'Every unit pointed at the 18.01SC front page.', fix: 'Each unit now links the 18.01SC session group that covers it.' },
      { what: 'One practice skill', why: 'Only differentiation.', fix: 'Practice now spans limits to Taylor series, plus fitting a motion law and the work done by a varying force.' },
    ],
    benchmarks: [
      { id: 'phm101.exams', name: 'MIT 18.01SC unit exams, against the solutions', how: 'Sit each after its unit; record your average.', max: 100, url: `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages/1.-differentiation/exam-1/` },
      { id: 'phm101.final', name: 'MIT 18.01SC final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/18-01sc-single-variable-calculus-fall-2010/pages/final-exam/` },
    ],
    rubrics: {
      applied: [
        crit('Motion law inferred', 'A law (polynomial, exponential, damped) chosen for a physical reason and fitted to the measured data with uncertainties on its parameters.', 'Fitted without parameter uncertainty.', 'Guessed.'),
        crit('Two estimates', 'Derivatives and integrals estimated both from the fitted law and directly from the data (finite differences, trapezoid), and compared.', 'One route only.', 'No estimates.'),
        crit('Units and residuals', 'Every quantity has units; residuals plotted and shown to be structureless, or the structure explained.', 'Units right, residuals not examined.', 'Units wrong.'),
        crit('Uncertainty reported', 'Final quantities reported with propagated uncertainty and an honest error log.', 'Uncertainty asserted, not propagated.', 'None.'),
      ],
      final: examFinal('the 18.01SC final will do', 'One physical model that uses differentiation, integration and approximation together.', 'Limiting cases (small time, small amplitude, large time) and units checked for the model.'),
    },
  },

  'introductory-mechanics-special-relativity': {
    doc: 'docs/phys-term0-audit.md',
    outcomes: [
      o('ph101.kinematics', 'Describe motion with vectors in different frames, and estimate.', ['GRE-P Classical Mechanics'], ['pm.projectile', 'dot'], [1], ['final']),
      o('ph101.newton', 'Apply Newton\'s laws to constrained systems with friction.', ['GRE-P Classical Mechanics'], ['pm.incline'], [2], ['final']),
      o('ph101.energy', 'Use work, energy and potentials, and judge stability.', ['GRE-P Classical Mechanics'], ['pm.work', 'pm.orbit'], [3], ['final']),
      o('ph101.momentum', 'Use momentum conservation in collisions and the centre of mass.', ['GRE-P Classical Mechanics'], ['pm.collision'], [4], ['applied', 'final']),
      o('ph101.rotation', 'Analyse rotation, torque, angular momentum and rolling.', ['GRE-P Classical Mechanics'], ['pm.rolling'], [5], ['final']),
      o('ph101.oscillation', 'Model oscillation and resonance.', ['GRE-P Classical Mechanics'], ['pm.oscillator', 'de.oscillator'], [6], ['final']),
      o('ph101.relativity', 'Apply Lorentz transformations and four-momentum.', ['GRE-P Special Relativity'], ['pm.lorentz', 'pm.invariant'], [7], ['final']),
    ],
    gaps: [
      { what: 'No free notes', why: '8.012 (Fall 2008) publishes problem sets and exams but no notes, and its text (Kleppner & Kolenkow) is not free.', fix: 'Units read 8.01SC (Fall 2016), which has full notes, with 8.03SC for oscillations and 8.20 for relativity; 8.012\'s exams stay as the benchmark.', url: `${OCW}/8-01sc-classical-mechanics-fall-2016/` },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers projectiles, friction on inclines, collisions, rolling, oscillators, orbits, work, Lorentz transformations and invariant mass — every answer checked by simulating the motion.' },
    ],
    benchmarks: [
      { id: 'ph101.exams', name: 'MIT 8.012 (Fall 2008) exams 1–3, against the solutions', how: 'Sit each in 90 minutes; record your average.', max: 100, url: `${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/` },
      { id: 'ph101.final', name: 'MIT 8.012 final exam, against the solutions', how: 'Three hours; record your percentage.', max: 100, url: `${OCW}/8-012-physics-i-classical-mechanics-fall-2008/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Data extraction', 'Positions read from video (Tracker) or simulation with calibration and timing uncertainty stated.', 'Positions read, calibration unstated.', 'No data.'),
        crit('Momentum and energy accounts', 'Momentum and kinetic energy computed before and after, each with uncertainty.', 'Computed without uncertainty.', 'One account only.'),
        crit('Reconciliation', 'Momentum conserved within uncertainty, and the energy lost explained (restitution coefficient computed).', 'Discrepancy shown, not explained.', 'Not reconciled.'),
        crit('Dominant non-ideal effect', 'The largest departure from the ideal model (friction, rotation, deformation) identified and estimated in size.', 'Named, not estimated.', 'Ignored.'),
      ],
      final: examFinal('8.012\'s final will do', 'One problem spanning constrained motion, rotation, oscillation and conservation, plus a relativistic consistency check.', 'Limiting cases (massless pulley, no friction, v ≪ c) and units checked.'),
    },
  },

  'chemistry-for-physical-sciences': {
    doc: 'docs/phys-term0-audit.md',
    outcomes: [
      o('ch101.atoms', 'Explain spectra, orbitals and periodic structure.', ['GRE-P Atomic Physics'], ['ch.hydrogen'], [1], ['final']),
      o('ch101.bonding', 'Predict bonding, geometry and intermolecular forces.', ['GRE-P Atomic Physics'], [], [2], ['final']),
      o('ch101.stoich', 'Do stoichiometry, gas and solution calculations with dimensions.', ['GRE-P Laboratory Methods'], ['ch.stoich'], [3], ['final']),
      o('ch101.calorimetry', 'Measure heat in reactions and propagate the uncertainty.', ['AAPT Technical and Practical Laboratory Skills', 'AAPT Data Analysis and Visualization'], ['ch.calorimetry', 'lab.propagate'], [4], ['applied']),
      o('ch101.equilibrium', 'Use entropy, free energy and equilibrium.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['ch.gibbs', 'ch.ph'], [5], ['final']),
      o('ch101.kinetics', 'Model reaction rates and mechanisms.', ['GRE-P Thermodynamics and Statistical Mechanics'], ['ch.kinetics'], [6], ['final']),
      o('ch101.materials', 'Explain electrochemistry and solid-state properties.', ['GRE-P Specialized Topics'], [], [7], ['final']),
    ],
    gaps: [
      { what: 'The resource skips two units', why: '5.111SC covers atoms, bonding, thermodynamics, equilibrium, redox and kinetics, but not stoichiometry, gases or calorimetry (Units 3–4).', fix: 'Those units read OpenStax Chemistry 2e (free).', url: 'https://openstax.org/books/chemistry-2e/pages/4-introduction' },
      { what: 'No practice', why: 'Nothing to drill.', fix: 'Practice now covers stoichiometry, pH, hydrogen spectra, Gibbs energy, kinetics and calorimetry — checked by a formula parser, charge-balance bisection, physical constants and simulated rate laws and heat flow.' },
    ],
    benchmarks: [
      { id: 'ch101.exams', name: 'MIT 5.111SC exams, against the solutions', how: 'Sit them under time; record your average.', max: 100, url: `${OCW}/5-111sc-principles-of-chemical-science-fall-2014/pages/exams/` },
    ],
    rubrics: {
      applied: [
        crit('Apparatus model calibrated', 'The calorimeter\'s heat capacity measured with a known process before the experiment.', 'Assumed, not measured.', 'Ignored.'),
        crit('Measurement and safety', 'A household-safe procedure (or a cited open dataset) followed, with repeated runs and raw data kept.', 'One run.', 'Unsafe or no data.'),
        crit('Uncertainty propagated', 'The enthalpy reported with an uncertainty propagated from temperature, mass and heat-capacity uncertainties.', 'Uncertainty estimated loosely.', 'None.'),
        crit('Comparison with reference', 'Result compared with a tabulated value, and the discrepancy explained (heat loss, incomplete reaction).', 'Compared, not explained.', 'Not compared.'),
      ],
      final: examFinal('a 5.111SC exam will do', 'One material or reaction followed from electronic structure, through thermodynamics and kinetics, to an observable property.', 'Units checked and the result compared with a tabulated value.'),
    },
  },

  'scientific-programming': {
    doc: 'docs/phys-term0-audit.md',
    outcomes: [
      o('cp101.basics', 'Write functions with units and clear control flow.', ['GRE-P Laboratory Methods'], ['py.arith', 'py.branch', 'py.loopcount'], [1], ['applied']),
      o('cp101.arrays', 'Work with arrays and tables, and plot them.', ['AAPT Data Analysis and Visualization'], ['py.accum', 'py.strings'], [2], ['applied']),
      o('cp101.algorithms', 'Decompose problems and reason about complexity.', ['GRE-P Laboratory Methods'], ['bigo'], [3]),
      o('cp101.simulate', 'Simulate a physical process with tests and convergence checks.', ['AAPT Modeling'], ['de.euler', 'na.order', 'pm.projectile'], [4], ['applied']),
      o('cp101.numerics', 'Find roots and integrate numerically, knowing the error.', ['QAA-MSOR 3.16'], ['na.bisect', 'm.newton', 'na.simpson', 'm.float'], [5], ['applied']),
      o('cp101.fitting', 'Clean data, fit models and analyse residuals.', ['AAPT Data Analysis and Visualization'], ['lab.fit', 'linreg'], [6], ['final']),
      o('cp101.reproduce', 'Version, package and release reproducible scientific code.', ['AAPT Communication'], ['py.boundary', 'py.mutation'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'The resource skips data fitting', why: '6.100L teaches programming but not fitting data (Unit 6).', fix: 'Unit 6 reads 6.0002 Lecture 9 on experimental data.', url: `${OCW}/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/resources/mit6_0002f16_lec9/` },
      { what: 'Practice was programming only', why: 'Arithmetic, loops and strings.', fix: 'Practice now adds simulation, root finding, quadrature, floating point and weighted fits.' },
    ],
    benchmarks: [
      { id: 'cp101.psets', name: '6.100L problem sets passing their provided tests', how: 'Run each problem set\'s test file; count the sets where every test passes.', max: 5, url: `${OCW}/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/lists/problem-sets/` },
    ],
    rubrics: {
      applied: [
        crit('Units and parameters', 'Every input and output carries units, and the model\'s parameters are arguments rather than constants buried in code.', 'Units mostly tracked.', 'Unit errors.'),
        crit('Convergence', 'Results shown to converge as the step shrinks, at the method\'s expected order.', 'Converges, order not measured.', 'Not checked.'),
        crit('Tests', 'Automated tests compare against an exact solution and check conserved quantities.', 'Some tests.', 'None.'),
        crit('Fault log', 'Every bug found is logged with its symptom, cause and fix.', 'A log without causes.', 'No log.'),
      ],
      final: [
        crit('Package quality', 'An installable package with documented functions and examples.', 'Usable with effort.', 'Not installable.'),
        crit('Validation evidence', 'Validated against analytic solutions and real data, with the comparison included.', 'Validated one way.', 'Not validated.'),
        crit('Reproducible environment', 'Pinned dependencies; a fresh machine reproduces every figure from one command.', 'Manual steps remain.', 'Not reproducible.'),
        crit('Validity limits and defense', 'The parameter ranges where results can be trusted stated, and defended under questions.', 'Limits vague.', 'Not stated.'),
      ],
    },
  },

  'measurement-and-experimental-foundations': {
    doc: 'docs/phys-term0-audit.md',
    outcomes: [
      o('lb101.question', 'Turn a question into observables with operational definitions.', ['AAPT Constructing Knowledge', 'AAPT Design'], [], [1], ['final']),
      o('lb101.units', 'Use SI units and calibrate against traceable standards.', ['AAPT Technical and Practical Laboratory Skills'], ['lab.adc'], [2], ['applied']),
      o('lb101.uncertainty', 'Separate random from systematic uncertainty and propagate both.', ['AAPT Data Analysis and Visualization'], ['lab.propagate', 'lab.weighted'], [3], ['applied', 'final']),
      o('lb101.budget', 'Build an uncertainty budget for a repeated measurement.', ['AAPT Data Analysis and Visualization', 'GRE-P Laboratory Methods'], ['lab.trials', 'lab.propagate'], [4], ['applied']),
      o('lb101.design', 'Design controls and recognise bias and confounding.', ['AAPT Design'], ['st.simpson'], [5], ['final']),
      o('lb101.sensors', 'Choose sensors by resolution, range and noise.', ['AAPT Technical and Practical Laboratory Skills'], ['lab.adc'], [6], ['final']),
      o('lb101.reproduce', 'Keep notebooks and plots that let others reproduce the work.', ['AAPT Communication'], ['lab.fit'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'The resource is a mechanics course', why: '8.01X is a mechanics course with experiments; it has nothing on standards, uncertainty budgets, experimental design or reproducibility.', fix: 'Units now read the metrology sources the field itself uses: the SI brochure, NIST TN 1297, the GUM and the NIST/SEMATECH e-Handbook.', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
      { what: 'Practice was borrowed', why: 'A multimeter question and summary statistics.', fix: 'Practice now covers propagation (checked by Monte Carlo), weighted means, weighted fits, how many trials a precision needs, and quantisation noise.' },
    ],
    benchmarks: [
      { id: 'lb101.g', name: 'Your measured g agrees with the reference value for your location', how: 'Look up local gravity in the PTB gravity information service; record 1 if your value lies within your stated uncertainty of it.', max: 1, url: 'https://www.ptb.de/cartoweb3/SISproject.php' },
    ],
    rubrics: {
      applied: [
        crit('Raw data and calibration', 'Every raw reading kept; the timer and length scale calibrated against a reference, with the calibration recorded.', 'Raw data kept, no calibration.', 'Only averages kept.'),
        crit('Repeated trials', 'Enough repeats for the standard error to be smaller than the systematic terms, with the number justified.', 'Some repeats, not justified.', 'Single measurement.'),
        crit('Uncertainty budget', 'A full budget listing every source (timing, length, amplitude, reaction time) with its size and the combined uncertainty.', 'Main sources only.', 'No budget.'),
        crit('Code and reproducibility', 'Analysis code turns the raw data into the result in one step.', 'Code with manual steps.', 'No code.'),
      ],
      final: [
        crit('Replication design', 'A published claim replicated with a preregistered plan, controls and a stated test of agreement.', 'Plan written after the data.', 'No plan.'),
        crit('Execution and safety', 'Carried out safely as planned, with deviations recorded.', 'Deviations unrecorded.', 'Not carried out.'),
        crit('Evidence and verdict', 'Whether the evidence supports the claim decided by the stated test, with the uncertainty that limits it.', 'Verdict without the test.', 'No verdict.'),
        crit('Next measurement', 'The measurement that would most reduce the uncertainty identified and justified.', 'Suggested without justification.', 'None.'),
      ],
    },
  },
};
