# Mechanical Engineering, Term 4: audit and evidence

October 2026. This covers seven courses:

- Computational Mechanics: FEA and CFD
- Mechatronics and Embedded Control
- Integrated Mechanical Systems Laboratory
- Capstone Design I: Needs, Requirements, Architecture, and Prototype
- Robot Mechanics, Kinematics, and Motion Planning
- Aerodynamics and Compressible Flow
- Advanced Energy Conversion: Turbomachinery, Combustion, and Fuel Cells

The method and standards are those in [me-term0-audit.md](me-term0-audit.md); the design is in [`js/degrees/curriculum/me-term4.js`](../js/degrees/curriculum/me-term4.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| FEA and CFD | 2.094 is a graduate nonlinear course with no finite volumes; the projects assumed a commercial solver; no practice | 2.092 for the basics, 2.29 for finite volumes and stability, 2.094 for convergence and coupling, NASA's NPARC tutorial for grid convergence; FEniCS as the free solver; five new skills; an NPARC validation case as the benchmark |
| Mechatronics | 2.737 posts only LabVIEW/myRIO labs; nothing on power budgets or watchdogs; Robotics practice | Valvano's free e-book, 2.72 on actuators, *Feedback Systems* on implementation, two 2.737 labs; four new skills; Wokwi as the simulated test bench |
| Systems Laboratory | every unit pointed at 2.672 as a whole; no practice | 2.672's lab manual and experiments by unit, DoITPoMS, 2.737's feedback lab; half-power damping and spectrum skills; published property data as the outside check |
| Capstone Design I | 15.783J (2006) teaches no requirements, reviews or safety | 15.783J for needs, concepts and prototyping; NASA's Systems Engineering Handbook and 16.63J for the rest; fault-tree and critical-path skills; NASA's review criteria as the benchmark |
| Robot Mechanics | every unit pointed at the *Modern Robotics* site; Robotics practice with no checks | *Modern Robotics* chapters by page; four new skills; the Modern Robotics library as the outside grader |
| Aerodynamics | 16.100 (2005) barely treats shocks and nozzles, and posts no solutions; no practice | 16.100 notes, NASA Glenn's Beginner's Guide for compressible flow; seven new skills; Unified Engineering quizzes and XFOIL as checks |
| Energy Conversion | every unit pointed at 2.60J as a whole; little turbomachinery; no practice | 2.60J lectures by unit, MIT Unified notes on the Euler equation; seven new skills; 2.60J homework with solutions |

- **New practice skills.** There are 30, in four new modules:
  - `mecae.js`: tapered-bar elements, the direct stiffness method, Richardson extrapolation and the GCI, convection–diffusion and the cell Péclet number, finite-difference plates
  - `memech.js`: gear-ratio matching, quadrature encoders, PWM current ripple, RMS torque, manipulator Jacobians, holding torques, polynomial trajectories, Rodrigues rotations
  - `meaero.js`: the standard atmosphere, lifting-line wings, isentropic flow, normal and oblique shocks, choked flow, drag polars; Euler pump head, affinity laws, flame temperature, fuel cells, battery packs, the Betz limit, a day of solar energy
  - `meproj.js`: half-power damping, reading a spectrum, fault trees, critical-path scheduling
- **Outcomes.** There are 56, with 14 rubrics and 56 anchored lines.
- **Readings.** 56 units, 56 distinct links. All 55 pages, with benchmarks and gap references, returned 200 on 17 October 2026.

## Verification

| Skill | Independent check |
|---|---|
| bar elements | the global stiffness matrix assembled and solved; the exact taper by Simpson's rule |
| two-bar truss | statics and compatibility instead of stiffness assembly |
| Richardson, GCI | the three-mesh equations solved by bisection on the order |
| convection–diffusion | a 20 000-interval solution; the mesh limit by testing meshes for wiggles |
| plate temperatures | over-relaxed Gauss–Seidel (the generator uses elimination) |
| gear ratio | motor and load solved as coupled equations, then the ratio searched |
| encoder | edges counted on simulated quadrature signals |
| PWM ripple | the winding switched cycle by cycle (the generator solves the periodic exponentials) |
| RMS torque | the move simulated and T² integrated |
| Jacobian | forward kinematics differenced |
| holding torques | the gradient of potential energy (virtual work) |
| trajectories | coefficients from the boundary conditions as a linear system, then sampled |
| Rodrigues | the matrix exponential's series summed |
| standard atmosphere | hydrostatic balance integrated upward |
| lifting line | Prandtl's equation solved by collocation |
| isentropic flow | mass flux from explicit temperature, density and velocity |
| normal shock | the three conservation laws solved for the downstream velocity |
| oblique shock | the density-ratio form of the shock relation |
| choked flow | ρ*a*A* from the sonic state |
| drag polar | L/D searched by golden section |
| Euler head | velocity triangle as vectors; power from angular-momentum flux |
| affinity laws | flow, head and power coefficients carried across |
| flame temperature | products from an atom balance; temperature bisected |
| fuel cell | voltage from the equilibrium constant; hydrogen by counting electrons |
| battery | current bisected on delivered power |
| Betz limit | the actuator-disc power coefficient maximised |
| solar day | power integrated through the day |
| half-power damping | the response scanned and the half-power points bisected (the generator solves the quartic) |
| spectrum | the DFT computed term by term |
| fault tree | every combination of basic-event states enumerated |
| critical path | every path through the network listed |

`mecae`: 200 agree. `memech`: 320. `meaero`: 560. `meproj`: 160. All used 40 questions per skill. No generator needed fixing after verification; before it, a rotation-matrix entry that should be zero was shown as 6 × 10⁻¹⁷ and is now rounded to 0.

Two checks are close to the generator's own route: the solar cell temperature (one line of arithmetic) and the encoder count rate once edges are counted.

## Still unverified

- **The outside graders were not run here.**
- **Several catalogued courses post no solutions.** These are 16.100, 2.737 and 2.672. Benchmarks use other MIT courses, NASA's archives or open tools instead.
- **Labs need equipment.** The laboratory, mechatronics and capstone work needs hardware or honest simulation.
