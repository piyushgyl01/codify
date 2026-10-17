# Electrical Engineering, Term 4: audit and evidence

October 2026. This covers nine courses:

- Fields, Waves, and Communication Links
- Feedback and Real-Time Embedded Control
- Analog, Microelectronics, and VLSI Design
- Digital Signal Processing
- Senior Design I: Discover, Prove, and Communicate
- FPGA Systems and Hardware Acceleration
- Statistical Signal Processing and Machine Learning
- State Estimation and Sensor Fusion
- Power Electronics and Electric Drives

The method and standards are those in [ee-term0-audit.md](ee-term0-audit.md); the design is in [`js/degrees/curriculum/ee-term4.js`](../js/degrees/curriculum/ee-term4.js).

## What was wrong, and what changed

| Course | Problem | Now |
|---|---|---|
| Fields, Waves, Links | units pointed at 6.013, 6.02 and NPTEL as wholes; GNU Radio's wiki blocks checks; no practice | 6.013 lectures for fields and lines, 6.02 chapters for modulation, noise and access; 6.013 quizzes and final with solutions; line, link-budget, noise and error-rate practice |
| Feedback and Control | no unit links; Robotics practice with no checks | *Feedback Systems* (Åström and Murray) by chapter, Valvano, 16.63J; steady-state error, margin, Routh and Kalman practice |
| Analog and VLSI | NPTEL cannot be mapped; LTspice never answered | 6.012, 6.101 labs, 6.111 VLSI lectures, RES.6-010; CMOS threshold and Elmore-delay practice |
| DSP | units pointed at RES.6-008 and the DSP Guide as wholes; Robotics practice | RES.6-008 lectures and problem solutions, the DSP Guide by chapter, Julius Smith on resampling; moving-average, quantisation and fixed-point practice |
| Senior Design I | resources taught no design process | NASA's Systems Engineering Handbook by section, MIT 16.842, 16.63J, KiCad; NASA's review criteria as the benchmark |
| FPGA Systems | units pointed at 6.111 and 6.004 as wholes | 6.111 lectures, 6.004 chapters, RISC-V spec, Verilator and cocotb; HDLBits |
| Statistical SP and ML | no detection theory, dimension reduction or honest evaluation | 6.011 on estimation, detection and Wiener filtering, 18.06SC on the SVD, scikit-learn's evaluation guides; detection and PCA practice |
| State Estimation | units pointed at four whole resources; Robotics practice | Labbe's *Kalman and Bayesian Filters in Python* by chapter, ROS 2 tf2 and topics, NIST calibration, evo; Kalman and kinematics practice |
| Power Electronics | units pointed at 6.622 and 6.061 as wholes; Robotics practice | 6.622 typed notes and 6.061 chapters; 6.061 quizzes with solutions; buck, boost, motor and thermal practice |

- **New practice skills.** There are 22, in three new modules:
  - `eecomms.js`: reflections and VSWR, line input impedance, link budgets, noise floor and SNR, BPSK error rate, moving-average filters, quantisation SNR, Neyman–Pearson detection, principal components
  - `eecontrol.js`: steady-state error, phase margin, Routh–Hurwitz, steady-state Kalman filter, two-link arm kinematics, buck and boost converters, DC-motor operating point, junction temperature
  - `eevlsi.js`: Elmore delay, CMOS switching threshold, fixed-point quantisation, system reliability
- **Outcomes.** There are 71, with 36 rubrics and 144 anchored lines.
- **Readings.** 144 units, 118 distinct links. All returned 200 on 17 October 2026; one GitHub link was rate-limited (429) and returned 200 on retry.

## Verification

| Skill | Independent check |
|---|---|
| VSWR, reflection | the standing wave scanned along a half wavelength |
| input impedance | the line built from 4000 lumped L–C sections (ABCD matrices) |
| link budget | power density times effective aperture, in watts |
| SNR | kTB computed in watts |
| BPSK | Python's erfc against the generator's numerical Gaussian tail |
| moving average | the DTFT summed term by term |
| quantisation SNR | a 200 000-sample sine quantised and its error measured |
| detection | the threshold bisected on erfc |
| PCA | every projection direction searched |
| steady-state error | the closed loop simulated to steady state |
| phase margin | the frequency response sampled on a 200 001-point grid and interpolated |
| Routh–Hurwitz | the roots found numerically (Durand–Kerner) |
| Kalman gain | the Riccati recursion iterated |
| arm kinematics | homogeneous transforms composed |
| buck, boost | the converter switched cycle by cycle; duty bisected for volt-second balance |
| DC motor | electrical and mechanical equations integrated |
| junction temperature | a three-node thermal RC network integrated to steady state |
| Elmore delay | the ladder's step response simulated and its first moment integrated |
| CMOS threshold | bisection where the NMOS and PMOS currents meet |
| fixed point | every 16-bit code tried |
| reliability | every combination of component states summed |

`eecomms`: 270 agree, `eecontrol`: 270 agree, `eevlsi`: 120 agree, all at 30 questions per skill.

**Two first drafts were wrong:**

- **Quantisation SNR.** The 6.02N + 1.76 dB rule drifted 0.28 dB from the simulated quantiser when the sine spanned only 32 steps. Questions now keep the signal above about 120 steps, where the rule holds.
- **Buck duty check.** It used a 2000-step grid, so its duty cycle was quantised to 0.05%. It now uses 20 000 steps.

## Still unverified

- **The outside graders were not run here.**
- **Some exams have no confirmed solutions.** 6.012's and 6.011's benchmarks ask for each answer to be confirmed by calculation or simulation.
