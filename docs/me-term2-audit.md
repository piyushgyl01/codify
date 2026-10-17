# Mechanical Engineering, Term 2: audit and evidence

October 2026. This covers five courses:

- Rigid-Body Dynamics and Mechanical Vibrations
- Mechanics of Materials and Solid Structures
- Engineering Thermodynamics
- Fluid Mechanics
- Electronics, Sensors, and Data Acquisition

The method and standards are those in [me-term0-audit.md](me-term0-audit.md); the design is in [`js/degrees/curriculum/me-term2.js`](../js/degrees/curriculum/me-term2.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Dynamics and Vibrations | every unit pointed at 2.003SC as a whole; no practice | 2.003SC lecture pages by unit; seven dynamics and vibration skills; 2.003SC Quiz 1 and final with solutions |
| Mechanics of Materials | every unit pointed at 2.001 as a whole; 2.001 stops before columns, fatigue and fracture, and posts no exams; no practice | 2.001 lectures by unit, 16.001 for buckling, DoITPoMS for fracture; ten new skills; 16.001 Quiz 5 with solutions and the anaStruct solver as outside graders |
| Thermodynamics | the catalogued resource is a four-chapter climate book, not an engineering text; no practice | Yan's *Introduction to Engineering Thermodynamics* and MIT's Unified Thermodynamics notes by chapter; eight new skills; RES.2-008 problem sets and CoolProp as checks |
| Fluid Mechanics | 2.06 follows a paid textbook; no practice | MIT 1.060 lecture notes and 2.25 topic pages; eight new skills; 2.25 Quiz 1 with solutions |
| Electronics, Sensors, DAQ | every unit pointed at 6.002 as a whole; 6.002 has no sensors or data acquisition; Robotics practice | 6.002 lectures, NIST on calibration, *Lessons in Electric Circuits* on sensors and ADCs, TI on noise; EE circuit skills plus four new acquisition skills |

- **New practice skills.** There are 37, in five new modules:
  - `medyn.js`: polar kinematics, slider-crank velocities, a falling rod, a hoist drum, free damped vibration, forced vibration and transmissibility, two-degree-of-freedom modes
  - `mesolids.js`: thermal and indeterminate bars, torsion, bending stress, beam deflection, Mohr's circle, combined loading with von Mises and Tresca, Euler buckling, thin-walled vessels, critical crack size, Castigliano's theorem
  - `methermo.js`: polytropic processes, turbines, compressors and nozzles, entropy generation and exergy, the Otto and Brayton cycles, refrigerator and heat-pump COP, moist air, air–fuel ratio
  - `mefluids.js`: gate forces, venturis and draining tanks, jets on vanes, Colebrook pipe friction, pump operating points, model similarity, Blasius boundary layers, parallel pipes
  - `mesensors.js`: strain-gauge bridges, RTDs and thermistors, instrument loading, anti-alias filter order
- **Outcomes.** There are 40, with 10 rubrics and 40 anchored lines.
- **Readings.** 40 units, 40 distinct links. All 46 links (readings, benchmarks and gap references) returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| polar kinematics | x(t) and y(t) differentiated with five-point stencils |
| slider-crank | position and rod angle differentiated in time |
| falling rod | the swing integrated (RK4), then F = ma applied to the centre |
| hoist drum | load and drum integrated separately, coupled by the cable tension |
| free vibration | released and integrated; period and decay read from the peaks |
| forced vibration | simulated until the transient dies (e⁻²⁵), then the peaks of x and kx + cẋ read |
| two-degree modes | power and inverse iteration instead of the characteristic quadratic |
| thermal stress | the wall force bisected until the heated bars fit |
| torsion | the polar moment integrated over rings |
| bending stress | the moment scanned along the beam; I summed over strips |
| beam deflection | the curvature integrated twice, then the supports applied |
| Mohr's circle | the stress tensor rotated through 200 000 angles |
| von Mises, Tresca | principal stresses of the full 3-D tensor by Jacobi rotations |
| Euler buckling | shooting on EI y'''' + Py'' = 0 for the first load meeting the end conditions |
| pressure vessel | the pressure integrated over a half-shell |
| fracture | the crack size or stress bisected |
| Castigliano | the strain energy integrated and differentiated numerically |
| polytropic work | ∫P dV by Simpson's rule |
| turbines, compressors, nozzles; Brayton | isentropic exit temperatures bisected on zero entropy change |
| entropy generation | ∫dQ/T and ∫R dP/P integrated |
| Otto cycle | each isentrope integrated as dT/dv = −(k − 1)T/v |
| COP | the reversible work bisected on zero entropy generation |
| moist air | humidity ratio from mole fractions and molar masses instead of 0.622 |
| air–fuel ratio | an atom balance solved as a linear system |
| gate force | pressure summed over 200 000 strips |
| venturi | Bernoulli and continuity solved by bisection on velocity |
| draining tank | dh/dt integrated (RK4) |
| jets on vanes | momentum flux as vectors; best speed by golden-section search |
| Colebrook | fixed-point iteration (the generator bisects) |
| pump operating point, parallel pipes | bisection on flow |
| similarity | dimensionless groups matched by bisection |
| Blasius drag | the Blasius equation solved by shooting for f″(0), then the wall shear integrated |
| strain bridges | the bridge solved as two dividers; strain bisected |
| RTDs and thermistors | temperature bisected on the resistance curve |
| loading | KCL at the node bisected |
| anti-alias order | the Butterworth's poles placed and \|H(jω)\| evaluated directly |

`medyn`: 280 agree. `mesolids`: 400. `methermo`: 320. `mefluids`: 320. `mesensors`: 160. All used 40 questions per skill. No generator needed fixing after verification. Before any run, two first drafts were corrected:

- **Beam deflection.** The off-centre load formula needs the shorter span segment.
- **Thermal stress.** A gap could swallow all the expansion and leave a zero answer. The gap is now kept below the free expansion.

## Still unverified

- **The outside graders were not run here.**
- **The fluids benchmark is graduate level.** 2.25 Quiz 1 is the only fluids exam with posted solutions.
- **6.002 posts no solutions.** Its quizzes count only when a simulator agrees.
- **Labs need equipment.** The beam, flow-rig and sensor labs need equipment or honest synthetic data.
