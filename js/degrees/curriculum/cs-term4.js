/**
 * Computer Science, Term 4 — the course design, audited against primary
 * sources (October 2026), as Terms 1–3 were.
 *
 * Outside graders: OpenSSF Scorecard reads a repository's engineering
 * practices automatically; MIT 18.404J exams come with solutions; the
 * Crafting Interpreters suite tests clox; PortSwigger's Web Security Academy
 * marks a lab solved only when the exploit works; OverTheWire's Bandit levels
 * open only with the right password; axe and real participants' SUS scores
 * judge HCI prototypes.
 *
 * Sources: CS2023 (SE-*, AL-Models, FPL-*, SEC-*, HCI-*); Software
 * Engineering at Google; MIT 6.045J and 18.404J; Crafting Interpreters;
 * PortSwigger Web Security Academy, OWASP; UW CSE 440, WCAG 2.2.
 * Evidence in docs/cs-term4-audit.md.
 */

const T404 = 'https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/pages/exams/';
const CI = 'https://github.com/munificent/craftinginterpreters';
const PS = 'https://portswigger.net/web-security';

const o = (id, text, cs2023, skills, units, assessed = []) => ({ id, text, cs2023, skills, units, assessed });
const anchor = (full, part, none) => ({ full, part, none });
const py = s => s.trim();

export const CS_TERM4 = {
  'software-engineering': {
    doc: 'docs/cs-term4-audit.md',
    outcomes: [
      o('cs330.scale', 'Reason about software over time: change, migration cost and irreversible decisions.', ['SE-Requirements', 'SE-Maintenance'], ['se.delivery'], [1]),
      o('cs330.team', 'Work in a team: ownership, knowledge sharing and onboarding.', ['SEP-Communication 4', 'SE-Teamwork'], [], [2], ['final']),
      o('cs330.readable', 'Write readable, documented code and keep complexity in check.', ['SE-Construction 1–3', 'SDF-Practices 3'], ['se.complexity'], [3]),
      o('cs330.testing', 'Design a risk-based test strategy and measure what tests cover.', ['SE-Testing 1–4'], ['se.coverage', 'py.mutation', 'py.boundary'], [4], ['midterm']),
      o('cs330.deps', 'Manage dependencies and evolve APIs compatibly.', ['SE-Tools 2', 'SE-Construction 4'], ['se.ranges', 'py.semver'], [5]),
      o('cs330.vcs', 'Use version control and code review to make changes safe.', ['SE-Tools 1'], ['se.git'], [6], ['midterm']),
      o('cs330.ci', 'Build reproducibly and release through CI with rollback.', ['SE-Tools 3–4'], ['se.flaky'], [7], ['final']),
      o('cs330.debt', 'Measure and pay down technical debt.', ['SE-Maintenance 2'], ['se.complexity'], [8], ['final']),
    ],
    gaps: [
      { what: 'Engineering practice judged by you alone', why: 'Every assessment\'s evidence was self-reported.', fix: 'OpenSSF Scorecard checks a repository automatically (CI, branch protection, code review, pinned dependencies, security policy); a merged pull request to someone else\'s project is review by real maintainers.', url: 'https://github.com/ossf/scorecard' },
    ],
    benchmarks: [
      { id: 'cs330.scorecard', name: 'OpenSSF Scorecard score of your team repo', how: 'Run Scorecard (CLI or GitHub Action) on the repository you maintain; record the overall score out of 10.', max: 10, url: 'https://github.com/ossf/scorecard' },
      { id: 'cs330.pr', name: 'Merged pull requests to other people\'s projects', how: 'Record how many of your pull requests a maintainer of someone else\'s project has merged (Portfolio & jobs counts them from GitHub).', max: 20, url: 'https://goodfirstissue.dev/' },
    ],
    anchors: {
      'midterm/Change decomposition': anchor('Commits each small, building and passing tests on their own, ordered so any prefix is safe to ship.', 'Reasonable commits, one too large or not independently green.', 'One big commit.'),
      'midterm/Test strategy': anchor('Tests matched to risk: the changed paths at full branch coverage, a contract test at the API boundary, a regression test per bug.', 'Tests exist but do not target the risky paths.', 'No new tests.'),
      'midterm/Review quality': anchor('A recorded review that caught at least one real issue, with the fix and the reviewer\'s sign-off.', 'A review happened but found nothing actionable.', 'No review.'),
      'midterm/Compatibility and rollback': anchor('Old clients keep working (shown by a test), and a rollback is demonstrated without data loss.', 'Compatibility argued but not tested.', 'A breaking change, or no rollback.'),
      'final/System maintainability': anchor('Scorecard ≥ 7, documented architecture, and complexity hotspots reduced with numbers before and after.', 'Maintainable, unmeasured.', 'Unmaintainable.'),
      'final/Release reliability': anchor('Reproducible build from a clean checkout, staged release, automatic rollback on a failed check.', 'Release works, manual steps remain.', 'Releases break.'),
      'final/Operational learning': anchor('The seeded incident handled with a blameless post-mortem and an action item that landed.', 'Incident handled, no learning captured.', 'Incident mishandled.'),
      'final/Team knowledge transfer': anchor('A new owner shipped a change alone using only the docs.', 'Handoff happened with help.', 'No handoff.'),
    },
  },

  'theory-of-computation': {
    doc: 'docs/cs-term4-audit.md',
    outcomes: [
      o('cs401.fa', 'Construct DFAs and NFAs, and reason about the strings they accept.', ['AL-Models 1–2'], ['tc.dfa'], [1], ['midterm']),
      o('cs401.subset', 'Convert NFAs to DFAs and minimise DFAs.', ['AL-Models 2'], ['tc.subset', 'tc.minimize'], [1, 2], ['midterm']),
      o('cs401.regex', 'Move between regular expressions and automata, and prove languages non-regular.', ['AL-Models 3'], ['tc.regex'], [2], ['midterm']),
      o('cs401.cfl', 'Design context-free grammars and pushdown automata.', ['AL-Models 4'], ['tc.cfg'], [3]),
      o('cs401.tm', 'Specify and simulate Turing machines.', ['AL-Models 5'], ['tc.tm'], [4]),
      o('cs401.decide', 'Classify problems as decidable, recognizable, co-recognizable or neither.', ['AL-Models 6'], ['tc.decide'], [5], ['final']),
      o('cs401.reduce', 'Prove undecidability with mapping reductions.', ['AL-Models 6', 'AL-Complexity'], ['tc.decide'], [6], ['final']),
      o('cs401.np', 'Define P and NP, and prove NP-completeness.', ['AL-Complexity 3–5'], ['alg.sat'], [7, 8], ['final']),
    ],
    gaps: [
      { what: 'No exams to practise on', why: '6.045J Spring 2011 publishes no exams on OCW.', fix: 'Practise on Sipser\'s 18.404J (Fall 2020) exams, which cover the same material and come with solutions.', url: T404 },
    ],
    benchmarks: [
      { id: 'cs401.ex', name: 'MIT 18.404J midterm (Fall 2020)', how: 'Sit it in 80 minutes and mark against the solutions; record your percentage.', max: 100, url: T404 },
      { id: 'cs401.final', name: 'MIT 18.404J final (Fall 2020)', how: 'Three hours, against the solutions; record your percentage.', max: 100, url: T404 },
    ],
    keyChecks: {
      midterm: [
        { id: 'cs401.mid.l1', q: 'How many states does the minimal DFA for L1 (ends in 01, even number of 1s) have?', answer: 4, tol: 0,
          python: py(`from itertools import product
L = lambda w: w.endswith('01') and w.count('1') % 2 == 0
W = [''.join(p) for k in range(9) for p in product('01', repeat=k)]
print(len({tuple(L(w + s) for s in W) for w in W}))`) },
        { id: 'cs401.mid.l2', q: 'How many states does the minimal DFA for L2 (every 00 before every 11) have, counting the dead state?', answer: 5, tol: 0,
          python: py(`from itertools import product
def L(w):
    a = [i for i in range(len(w) - 1) if w[i:i + 2] == '00']; b = [i for i in range(len(w) - 1) if w[i:i + 2] == '11']
    return not a or not b or max(a) < min(b)
W = [''.join(p) for k in range(9) for p in product('01', repeat=k)]
print(len({tuple(L(w + s) for s in W) for w in W}))`) },
        { id: 'cs401.mid.count', q: 'How many binary strings of length at most 8 (including the empty string) are in L1?', answer: 63, tol: 0,
          python: py(`from itertools import product
print(sum(1 for k in range(9) for p in product('01', repeat=k) if ''.join(p).endswith('01') and ''.join(p).count('1') % 2 == 0))`) },
      ],
    },
    anchors: {
      'midterm/Automata correctness': anchor('Both automata accept exactly L1 and L2, checked on every string up to length 8 (matching the answer checks\' counts).', 'Correct on most strings; one class of edge case wrong.', 'Automata accept the wrong language.'),
      'midterm/Construction and minimization': anchor('Minimised by partition refinement to 4 and 5 states, with the refinement steps shown.', 'Minimal sizes right, steps missing.', 'Not minimised.'),
      'midterm/Proof quantifiers': anchor('The pumping argument quantifies correctly: for every p there is s; for every split xyz with |xy| ≤ p and |y| > 0 there is i with xyⁱz ∉ L.', 'Right idea, one quantifier wrong.', 'Picks a specific p or a specific split.'),
      'midterm/Validation evidence': anchor('An exhaustive test against a reference predicate for every string up to length 8.', 'Spot checks.', 'No validation.'),
      'final/Decidability classification': anchor('Each problem classified with a recognizer, a co-recognizer or a reduction as evidence.', 'Classifications right, evidence thin.', 'Misclassified.'),
      'final/Mapping-reduction validity': anchor('The reduction is computable, maps in the right direction, and both directions of w ∈ A ⟺ f(w) ∈ B are proved.', 'One direction proved.', 'Reduction in the wrong direction.'),
      'final/NP-completeness proof': anchor('Membership by a polynomial verifier with certificate size, and hardness by a polynomial reduction from a known NP-complete problem, both directions proved.', 'Hardness or membership missing.', 'No proof.'),
      'final/Correction rigor': anchor('Every error from the exam corrected with the right argument.', 'Some corrections.', 'None.'),
    },
  },

  'compilers-and-language-implementation': {
    doc: 'docs/cs-term4-audit.md',
    grader: 'Crafting Interpreters\' published test suite for clox — not this app.',
    outcomes: [
      o('cs420.scan', 'Specify a lexical grammar and scan source into tokens with positions.', ['FPL-Syntax 1'], ['comp.scan'], [1]),
      o('cs420.parse', 'Parse with recursive descent, honouring precedence and associativity.', ['FPL-Syntax 2–3'], ['comp.prec', 'comp.first'], [2], ['midterm']),
      o('cs420.eval', 'Evaluate expressions and statements with runtime errors handled.', ['FPL-Translation 1'], ['comp.prec'], [3]),
      o('cs420.functions', 'Implement functions and closures.', ['FPL-Translation 2', 'FPL-Run-Time'], ['pl.scope', 'pl.closure'], [4], ['midterm']),
      o('cs420.resolve', 'Resolve names statically and implement classes and inheritance.', ['FPL-Semantics 1–2', 'FPL-OOP'], ['pl.let'], [5], ['midterm']),
      o('cs420.vm', 'Compile to bytecode and run it on a stack virtual machine.', ['FPL-Code 1–3'], ['comp.vm'], [6], ['final']),
      o('cs420.memory', 'Manage memory: hash tables, interning and garbage collection.', ['FPL-Run-Time 2–3'], ['comp.gc', 'ds.hash'], [7], ['final']),
      o('cs420.optimize', 'Optimise with measured, semantics-preserving changes.', ['FPL-Code 4', 'FPL-Analysis'], ['comp.regs'], [8], ['final']),
    ],
    gaps: [
      { what: 'Conformance judged by your own tests', why: 'Nothing outside checked the interpreter or the VM.', fix: 'Run Crafting Interpreters\' test suite against your clox, chapter by chapter.', url: CI },
    ],
    problemSets: {
      2: [{ name: 'Crafting Interpreters tests — parsing and expressions', url: CI, cmd: 'dart tool/bin/test.dart chap17_compiling --interpreter build/clox' }],
      4: [{ name: 'Crafting Interpreters tests — functions and closures', url: CI, cmd: 'dart tool/bin/test.dart chap25_closures --interpreter build/clox' }],
      7: [{ name: 'Crafting Interpreters tests — garbage collection', url: CI, cmd: 'dart tool/bin/test.dart chap26_garbage --interpreter build/clox' }],
      8: [{ name: 'Crafting Interpreters tests — the full clox suite', url: CI, cmd: 'dart tool/bin/test.dart clox --interpreter build/clox' }],
    },
    benchmarks: [
      { id: 'cs420.clox', name: 'Crafting Interpreters clox test suite', how: 'Record the percentage of the full clox suite your VM passes.', max: 100, url: CI },
    ],
    anchors: {
      'midterm/Lexical and parsing correctness': anchor('Every valid fixture parses to the right tree, precedence and associativity included (checked against a reference evaluator).', 'Most fixtures parse; one precedence level wrong.', 'Parser wrong on ordinary input.'),
      'midterm/Error recovery': anchor('Synchronises at statement boundaries and reports every independent error in a file with line and column.', 'Reports the first error only.', 'Crashes on bad input.'),
      'midterm/Name resolution': anchor('Rejects duplicate and unresolved names with spans, resolves every variable to its scope depth.', 'Resolves names; misses one error class.', 'No resolution pass.'),
      'midterm/Test coverage': anchor('Fixtures for every grammar rule and error, plus the relevant Crafting Interpreters tests passing.', 'Own fixtures only.', 'Few tests.'),
      'final/Language conformance': anchor('The clox suite passes at ≥ 95%, with failures explained.', 'Passes ≥ 70%.', 'Below 70%.'),
      'final/Runtime and memory correctness': anchor('No leaks or use-after-free under ASan with GC stress mode on.', 'Clean without stress mode.', 'Memory errors.'),
      'final/Performance evidence': anchor('A real workload profiled, one optimisation made, speed-up measured over repeated runs.', 'Optimisation without measurement.', 'None.'),
      'final/Architecture defense': anchor('Bytecode, value representation and GC design defended against alternatives with numbers.', 'Described, not defended.', 'Not defended.'),
    },
  },

  'computer-security': {
    doc: 'docs/cs-term4-audit.md',
    grader: 'PortSwigger\'s Web Security Academy, which marks a lab solved only when your exploit works — not this app.',
    outcomes: [
      o('cs430.threat', 'Model threats, assets and attack surfaces, and stay within an authorised scope.', ['SEC-Foundations 1–3', 'SEC-Governance'], [], [1], ['midterm', 'final']),
      o('cs430.authn', 'Get authentication and sessions right: password storage, cookies and tokens.', ['SEC-Foundations', 'SEC-Crypto'], ['sec.entropy', 'sec.cookie', 'sec.jwt'], [2]),
      o('cs430.authz', 'Enforce access control at every object and function.', ['SEC-Engineering'], [], [2], ['final']),
      o('cs430.injection', 'Find and fix injection.', ['SEC-Coding 1–2'], ['web.injection'], [3], ['midterm']),
      o('cs430.browser', 'Defend browser trust boundaries: XSS, CSRF, CORS and CSP.', ['SEC-Coding', 'SPD-Web 5'], ['sec.csp', 'web.cors', 'sec.cookie'], [4, 5], ['midterm']),
      o('cs430.server', 'Prevent path traversal and server-side request forgery.', ['SEC-Coding'], ['sec.path'], [6]),
      o('cs430.crypto', 'Use cryptography correctly, from first principles.', ['SEC-Crypto 1–4'], ['sec.rsa', 'modpow'], [2, 7]),
      o('cs430.report', 'Test methodically and report findings professionally.', ['SEC-Engineering', 'SEP-Communication'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Mismatched practice', why: 'The course\'s practice was modular arithmetic and string hashing, which say nothing about web security.', fix: 'Practice now covers cookies, CSP, JWTs, path traversal, injection and RSA.' },
      { what: 'Ethics stated, not structured', why: 'The course says "authorised targets only" but gives nowhere to practise legally beyond the Academy.', fix: 'OverTheWire\'s Bandit wargame and the Academy are legal practice grounds; never test systems you do not own or have written permission for.', url: 'https://overthewire.org/wargames/bandit/' },
    ],
    benchmarks: [
      { id: 'cs430.academy', name: 'Web Security Academy labs solved', how: 'Record how many labs the Academy shows as solved on your account (apprentice and practitioner).', max: 250, url: `${PS}/all-labs` },
      { id: 'cs430.bandit', name: 'OverTheWire Bandit level reached', how: 'Each level opens only with the password from the last. Record the highest level you have reached.', max: 34, url: 'https://overthewire.org/wargames/bandit/' },
    ],
    anchors: {
      'midterm/Ethical scope compliance': anchor('Written scope and authorisation before testing; every action inside it; no third-party systems touched.', 'In scope, but the scope was not written down first.', 'Testing outside authorisation — fail the assessment.'),
      'midterm/Exploit correctness': anchor('Both flaws reproduced from clean steps, with the Academy marking each lab solved.', 'One flaw reproduced.', 'No working exploit.'),
      'midterm/Remediation strength': anchor('Root-cause fixes (parameterised queries, contextual output encoding, CSP), with regression tests that fail before the fix.', 'Fixes that block this payload only.', 'No fix.'),
      'midterm/Evidence and risk analysis': anchor('Evidence for each finding and a severity with likelihood and impact justified.', 'Evidence without risk analysis.', 'Neither.'),
      'final/Methodical coverage': anchor('A written test plan covering every boundary in the brief, with what was and was not tested.', 'Most boundaries tested ad hoc.', 'Spotty testing.'),
      'final/Technical finding validity': anchor('Every finding reproducible and real; no scanner false positives reported as findings.', 'Mostly valid.', 'Invalid findings.'),
      'final/Remediation and retest': anchor('Priority findings fixed and retested, with the retest evidence.', 'Fixed, not retested.', 'Not fixed.'),
      'final/Professional security communication': anchor('An executive summary a manager can act on and technical details an engineer can reproduce.', 'One audience served.', 'Unclear report.'),
    },
  },

  'human-computer-interaction': {
    doc: 'docs/cs-term4-audit.md',
    outcomes: [
      o('cs440.ethics', 'Plan ethical research: consent, minimal risk and data handling.', ['HCI-SEP', 'SEP-Privacy'], [], [1], ['midterm', 'final']),
      o('cs440.inquiry', 'Run interviews and observation, and analyse tasks.', ['HCI-User 1–3'], [], [2], ['midterm']),
      o('cs440.models', 'Model users and tasks, and predict expert performance.', ['HCI-User', 'HCI-Design'], ['hci.klm', 'hci.hick'], [3]),
      o('cs440.design', 'Sketch broadly, then converge with rationale.', ['HCI-Design 1–3'], [], [4], ['midterm']),
      o('cs440.pointing', 'Apply the laws of human performance to layout and controls.', ['HCI-User 4'], ['hci.fitts', 'hci.target'], [5]),
      o('cs440.a11y', 'Make prototypes accessible: keyboard, contrast, target size.', ['HCI-Accessibility 2–3'], ['web.contrast', 'hci.target'], [6], ['final']),
      o('cs440.eval', 'Evaluate usability with valid studies and honest statistics.', ['HCI-Evaluation 1–4'], ['hci.sus', 'hci.users', 'hci.ci'], [7], ['final']),
      o('cs440.iterate', 'Iterate from evidence and communicate the design.', ['HCI-Design 4', 'SEP-Communication'], [], [8], ['final']),
    ],
    gaps: [
      { what: 'Every unit linked the course home page', why: 'All eight units pointed at CSE 440\'s front page rather than their topic.', fix: 'Use the unit titles to find the matching CSE 440 lecture; the quantitative methods now have their own practice.' },
      { what: 'No numbers', why: 'Usability was assessed only in words.', fix: 'Practice now covers SUS scoring, sample sizes, confidence intervals and the laws of human performance; the final uses SUS and axe as outside measures.' },
    ],
    benchmarks: [
      { id: 'cs440.sus', name: 'Mean SUS score from at least five real participants', how: 'Run SUS after your final usability test; record the mean (68 is average).', max: 100, url: 'https://measuringu.com/sus/' },
      { id: 'cs440.axe', name: 'axe-core: zero violations on the prototype', how: 'Run axe on every screen of the interactive prototype; record 1 at zero violations.', max: 1, url: 'https://github.com/dequelabs/axe-core' },
    ],
    anchors: {
      'midterm/Research ethics and quality': anchor('Consent, withdrawal and data handling written and followed; questions neutral; only needed data collected.', 'Ethical, but a leading question or excess data.', 'No consent or protocol.'),
      'midterm/Evidence synthesis': anchor('Findings traced to quotes and observations, with breakdowns and workarounds coded.', 'Findings without traceable evidence.', 'Opinions, not evidence.'),
      'midterm/Design breadth and rationale': anchor('Three genuinely different designs, compared against the requirements, with the choice justified.', 'Variations of one design.', 'One design.'),
      'midterm/Prototype task coverage': anchor('The prototype covers every critical task, including error recovery.', 'Happy paths only.', 'Missing tasks.'),
      'final/Prototype usability': anchor('Success, time and error thresholds met on all three tasks, and SUS ≥ 68.', 'Most thresholds met.', 'Fails the tasks.'),
      'final/Study validity': anchor('Protocol published before testing and followed without post-hoc changes; completion rates with adjusted-Wald intervals.', 'Valid study, statistics thin.', 'Changed after seeing data.'),
      'final/Accessibility compliance': anchor('Zero axe violations, full keyboard operation, WCAG 2.2 AA contrast and target size verified.', 'Minor violations.', 'Inaccessible.'),
      'final/Evidence-based iteration and defense': anchor('Each change traced to a finding, retested, and the remaining limits and harms stated.', 'Changes made without tracing.', 'No iteration.'),
    },
  },
};
