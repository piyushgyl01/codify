# Physics, Term 5: audit and evidence

October 2026. This covers the final seven courses of the Physics degree:

- Advanced Experimental Physics II: Independent Investigation
- Data-Intensive and Bayesian Physics
- Physics, Society, Ethics, and Professional Practice
- Senior Research Thesis and Defense
- Cosmology and Gravitational Waves
- Quantum Materials and Many-Body Physics
- Particle Physics and the Standard Model

The method is the one in [phys-term0-audit.md](phys-term0-audit.md); the design is in [`js/degrees/curriculum/phys-term5.js`](../js/degrees/curriculum/phys-term5.js). With this term, all 34 Physics courses are audited and all 272 units have a reading.

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Independent Investigation | Junior Lab lists experiments but teaches no calibration, blinding or uncertainty budgets | Junior Lab pages and guides, plus the NIST/SEMATECH handbook, the JCGM uncertainty guide and the PDG statistics review; a measured value checked against the PDG's |
| Bayesian Physics | 18.650 has no MCMC, hierarchical models, model checking, time series or unfolding, and no solutions | Gelman et al.'s free *Bayesian Data Analysis* by chapter, GWOSC tutorials, the PDG statistics review; the book's published solutions and posteriordb reference posteriors |
| Society and Ethics | the NPTEL engineering-ethics page loads only in a browser and has no physics cases | APS ethics guidelines, *On Being a Scientist*, the Franck Report, IPCC uncertainty guidance, MacKay's *Sustainable Energy*, the Phys21 report; ORI's research-integrity simulation |
| Senior Thesis | 2.ThA is a short thesis-writing workshop | 2.ThA's handouts kept; ReScience C for reproducing a baseline, NIST, the JCGM guide, the PDG and the Turing Way |
| Cosmology and Gravitational Waves | 8.962 is graduate GR with two cosmology lectures and only lecture summaries | Tong's *Cosmology* and *General Relativity*, 8.962's videos and problem sets, Pantheon+ and the GW150914 paper; fits checked against published Ω_m and chirp mass |
| Quantum Materials | 8.511 is graduate, assumes second quantisation, stops before Fermi liquids, posts no solutions | 8.511 kept for bands and superconductivity; Tong's QFT Chapter 2, 8.512 for Fermi liquids and magnetism, TU Delft's topology course; exact diagonalisation checked against the Lieb–Wu energy |
| Particle Physics | 8.701 has no dataset and little statistics | 8.701 slides and problem sets with solutions; CMS dimuon open data; the PDG statistics review; a resonance mass checked against the PDG's |

- **New practice skills.** There are 15 in `physsenior.js`:
  - cosmology and gravitational waves: luminosity distance, the age of the universe, inspiral time, strain
  - many-body physics: counting Fock states, the two-site Hubbard model, the SSH chain, the BCS gap
  - particle physics: invariant mass, production thresholds, significance of an excess
  - statistics: beta–binomial updating, normal updating, effective sample size, χ² goodness of fit
- **Outcomes.** There are 49, with 14 rubrics and 56 anchored lines. Some outcomes in the ethics and thesis courses have no practice skill: they are judged only by their rubrics.
- **Readings.** All 49 unit links returned 200 on 17 October 2026, as did the gap and benchmark links.

## Verification

| Skill | Independent check |
|---|---|
| luminosity distance | the Friedmann equation and the light ray integrated backwards in time (RK4) |
| age of the universe | quadrature of da/(aH), against the closed form |
| inspiral time | Kepler's law and Peters' orbital-decay formula |
| strain | the quadrupole formula, differentiated numerically |
| Fock states | the configurations enumerated |
| two-site Hubbard | the Fock-space Hamiltonian built from fermion operators and Jacobi-diagonalised |
| SSH chain | edge states counted and the gap found by Sturm sequences on a long chain |
| BCS gap | the gap equation solved for the coupling that gives T_c |
| invariant mass | four-vectors summed with the real muon mass |
| thresholds | √s from explicit four-vectors, bisected |
| significance | the incomplete gamma integral and Python's erfc |
| beta–binomial | the beta–binomial identity |
| normal updating | a grid posterior |
| effective sample size | the exact autocovariance sum |
| χ² p-value | the χ² density integrated |

`physsenior`: 600 agree, 0 disagree (40 questions per skill).

**One generator was fixed.** The invariant-mass generator could produce two nearly parallel muons with a mass near 1 GeV. There the muons' own mass matters, and the "massless" answer was 2% off. The check caught it in 1 of 600 questions, and the generator now keeps pairs above 10 GeV.

## Still unverified

- **The outside graders were not run here.**
- **The ethics benchmark is a simulation, not a graded exam.** ORI's The Lab is the only free, outside check found.
- **8.511's problem sets have no solutions.** The benchmark uses the Lieb–Wu Bethe-ansatz energy instead.
