/**
 * The robotics plan: 120 missions, four months, one a day.
 *
 * Content is the article's — its topics, resources and builds — put in an order
 * where every day uses only what came before it, and the maths sits next to the
 * thing that needs it: PID with the balancer, rotations with the arm, not all
 * of it at the end.
 *
 * Each day has three streams:
 *   learn    one thing to understand, with the topic whose links teach it
 *   skills   what today's check starts testing (older skills come back on their own)
 *   build    a step of the build in hand: [id, kind, stage index or step text]
 *
 * A build's run is its days in order. `make` steps name a stage of the
 * article's task ("Do this. Then do that.") or say the step in their own words.
 */
import { buildById } from './roadmap.js';
import { numberDays } from '../../learn/plan.js';

/** How many questions a mission's check may use, by month — it grows with you. */
export const checkBudget = month => 8 + 2 * month;

const sentences = text => text.split(/(?<=[.!?])\s+(?=[A-Z])/).map(s => s.trim()).filter(Boolean);

/** A task's stages: the article writes them as "Do this. Then do that." */
export function stages(task) {
  const out = [];
  for (const s of sentences(task)) {
    if (!out.length || /^Then\b/.test(s)) out.push(s); else out[out.length - 1] += ` ${s}`;
  }
  return out.map(s => s.replace(/^Then,?\s+(\w)/, (_, c) => c.toUpperCase()));
}

const D = (learn, topic, skills = [], build = null, order = null) => ({ learn, topic, skills, build, order });
const REVIEW = topic => D('Review: no new idea today. Your weakest skills come back harder.', topic);
const BOSS = topic => D('Boss day.', topic);

const DAYS = [
  /* ============ Month 1 — circuits to a robot that moves (beginner) ============ */
  // Week 1: circuits, fast, in the simulator
  D('Ohm\'s law, power and voltage dividers — work each one out by hand before you simulate it', 'm1-elec', ['ohm', 'divider'], ['b01', 'plan'],
    'the starter kit and a multimeter (about $45–60) — they take days to arrive'),
  D('LED resistors, and the current a part actually draws', 'm1-elec', ['led', 'stall'], ['b01', 'make', 0]),
  D('Reading a schematic; pull-up and pull-down resistors', 'm1-elec', ['symbols', 'pullup'], ['b01', 'make', 1]),
  D('Decoupling capacitors, and a transistor as a switch', 'm1-elec', ['decouple'], ['b01', 'test']),
  D('LiPo batteries: cell counts, C ratings, and why you never charge one unattended', 'm1-elec', ['lipo'], ['b01', 'ship']),
  D('The terminal and Git: init, add, commit, push, and a README someone can follow', 'm1-python', ['cli'],
    ['b04', 'make', 'Write a resistor colour-code decoder in Python and run it from the terminal']),
  D('Python at the bench: functions, files and a virtual environment', 'm1-python', ['bands'], ['b04', 'ship']),

  // Week 2: the bench, then your first microcontroller
  D('The multimeter: volts, resistance and continuity — and never measuring current across a supply', 'm1-bench', ['meter'], ['b02', 'make', 0],
    'a soldering iron (a Pinecil), solder and flux — about $26–36'),
  D('Finding faults: a break, a short, a dead part', 'm1-bench', [], ['b02', 'make', 1]),
  D('Soldering: tin the tip, heat the joint not the solder', 'm1-solder', ['solder'], ['b02', 'ship']),
  D('Cold joints by sight, flux, and through-hole before surface-mount', 'm1-solder', [], ['b03', 'make', 0],
    'a motor driver (TB6612FNG), two encoder gearmotors and an MPU-6050 — about $50'),
  D('Microcontrollers: which board, and digital pins in and out', 'm2-esp32', ['mcu'], ['b03', 'make', 1]),
  D('PWM: what analogWrite really does', 'm2-arduino', ['pwm'], ['b03', 'ship']),
  D('Timing: millis() instead of delay(), interrupts, and debouncing a button', 'm2-arduino', ['timing'], ['b05', 'plan']),

  // Week 3: talking to parts, then motors
  D('Serial, I2C and SPI: wiring them and finding an address in a datasheet', 'm2-arduino', ['buses'],
    ['b05', 'make', 'LED after a random delay, a button stops the clock, the time prints to serial in milliseconds']),
  D('Serial debugging — your main tool for months', 'm2-arduino', [],
    ['b05', 'make', 'Move the button to an interrupt, debounce it, and time it with millis() — no delay()']),
  D('Motors: DC gearmotor, hobby servo, bus servo, stepper — which job each does', 'm2-motors', ['actuators'], ['b05', 'ship']),
  D('Motor drivers: the H-bridge, and why you graduate from the L298N', 'm2-motors', ['drivers'], ['b07', 'make', 0],
    'line-follower parts — about $38 on a budget'),
  D('Encoders: counts per revolution through a gearbox, and odometry', 'm2-motors', ['encoder'], ['b07', 'make', 1]),
  D('Gear ratios: speed traded for torque', 'm3-transmission', ['gears'], ['b07', 'test'],
    'balancer parts for next month — about $62 on a budget'),
  D('Closing a loop: turning an error into a correction, P first', 'm2-robots', ['pid'], ['b07', 'ship']),

  // Week 4: sensors and your first robot
  D('Range sensors and IMUs: ultrasonic vs time-of-flight, on-chip fusion vs your own', 'm2-sensors', ['sensors'],
    ['b08', 'make', 'Mount the IMU, print the pitch angle, hold it still and watch it drift anyway']),
  D('Why a gyro drifts and an accelerometer is noisy — and the complementary filter', 'm2-sensors', ['compfilter'],
    ['b08', 'make', 'Add a complementary filter and watch the drift go']),
  D('Complementary before Kalman: what each is for', 'm2-sensors', [], ['b08', 'ship']),
  D('Line followers: a sensor array becomes an error signal', 'm2-robots', [], ['b09', 'plan']),
  D('P control: how hard to turn, from how far off the line', 'm2-robots', [], ['b09', 'make', 'Build it and tune it with P alone']),
  D('D: damping the oscillation', 'm2-robots', [], ['b09', 'make', 'Add D and watch the oscillation disappear']),
  D('Evidence: the badly tuned robot next to the tuned one', 'm2-robots', [], ['b09', 'test', 'Film both versions side by side']),
  D('Review: no new idea today. Ship the line follower.', 'm2-robots', [], ['b09', 'ship']),
  BOSS('m2-robots'),

  /* ======== Month 2 — control, balance and making parts (beginner+) ======== */
  // Week 5: PID properly, on a robot that falls over without it
  D('PID by the numbers: what P, I and D each add, term by term', 'm5-pid', ['pidmath'], ['b10', 'plan'],
    'the SO-101 arm kit now — it takes weeks to arrive ($122–490 by kit)'),
  D('Loop timing: run the controller at a fixed rate, and measure that rate', 'm5-pid', [],
    ['b10', 'make', 'Mount motors, IMU and battery; read a stable angle']),
  D('The derivative term amplifies noise — filter it', 'm5-pid', [], ['b10', 'make', 'Close the loop on the angle']),
  D('Integrator windup, and why an arm slams coming off a limit', 'm5-pid', [], ['b10', 'make', 'Tune until it stands for ten seconds']),
  D('Steady-state error: integrator, or gravity compensation?', 'm5-pid', [], ['b10', 'test']),
  D('Feedforward — the cheapest improvement most people never add', 'm5-pid', [], ['b10', 'ship']),
  D('Step responses: rise time, overshoot and settling', 'm5-pid', [],
    ['b20', 'make', 'Log step responses to CSV with P only, then PD']),

  // Week 6: data, then wireless, then CAD
  D('Logging to CSV and plotting it in Python', 'm5-pid', [], ['b20', 'make', 'Add I and feedforward, and log the same step']),
  D('Deciding from data: which controller would you ship?', 'm5-pid', [], ['b20', 'test', 'Plot all three together and write which you would ship, and why']),
  D('Review: no new idea today. Ship the comparison.', 'm5-pid', [], ['b20', 'ship'],
    'access to a 3D printer — your own, a library, or a print service'),
  D('ESP32: Wi-Fi and a web server without blocking your control loop', 'm2-esp32', [], ['b06', 'make', 0]),
  D('Arduino framework, ESP-IDF or MicroPython — when each is right', 'm2-esp32', [], ['b06', 'ship']),
  D('CAD: fully constrained sketches and parametric design', 'm3-cad', ['cad'], ['b11', 'plan']),
  D('Assemblies, mates, and designing from a datasheet', 'm3-cad', [],
    ['b11', 'make', 'Model the bracket from the servo\'s drawing, fully constrained']),

  // Week 7: printing parts that fit
  D('Filaments: PLA, PETG, ABS/ASA, TPU and carbon-filled', 'm3-print', ['materials'], ['b11', 'make', 'Print it and check the fit']),
  D('Designing for FDM: orientation, overhangs and layer strength', 'm3-print', ['orient'], ['b11', 'ship']),
  D('Clearances: print a tolerance gauge and design with real numbers', 'm3-print', ['tolerance'], ['b12', 'make', 0]),
  D('Snap fits: designing for a click, not glue', 'm3-print', [], ['b12', 'make', 1]),
  D('STEP for sharing, STL for printing', 'm3-cad', [], ['b12', 'make', 'Iterate the case until it clicks shut']),
  D('Review: no new idea today. Ship the case.', 'm3-print', [], ['b12', 'ship']),
  D('Backlash, and why software cannot fully fix it', 'm3-transmission', ['backlash'], ['b13', 'plan']),

  // Week 8: transmissions, then the arm
  D('Belt, gear or direct drive', 'm3-transmission', [], ['b13', 'make', 'Design and print a planetary or cycloidal reducer']),
  D('Bearings and preload', 'm3-transmission', [], ['b13', 'make', 'Measure its backlash by holding the output and rocking it']),
  D('Why a cheap servo\'s plastic gears fail first', 'm3-transmission', [], ['b13', 'test', 'Redesign to reduce the backlash, and measure again']),
  D('Review: no new idea today. Ship the reducer.', 'm3-transmission', [], ['b13', 'ship']),
  D('Holding torque: what a servo must hold at full reach', 'm3-arm', ['torque'], ['b14', 'plan']),
  D('The SO-101, and leader/follower teleoperation', 'm3-arm', [], ['b14', 'make', 'Assemble the leader and the follower']),
  D('No hardware yet? The whole LeRobot stack runs in MuJoCo first', 'm3-arm', [], ['b14', 'make', 'Calibrate every servo, then teleoperate the follower']),
  REVIEW('m3-arm'),
  BOSS('m5-pid'),

  /* ============ Month 3 — arms, frames and ROS 2 (intermediate) ============ */
  // Week 9: the maths of the arm, on the arm
  D('Rotations and frames: rotation matrices, and what order means', 'm5-kin', ['rot'], ['b14', 'make', 1]),
  D('Homogeneous transforms, and composing them', 'm5-kin', [], ['b14', 'test', 'Test your fingers on three objects of different shapes']),
  D('Workspace limits versus joint limits', 'm5-kin', [], ['b14', 'ship']),
  D('Forward kinematics: from joint angles to where the gripper is', 'm5-kin', ['fk'], ['b22', 'make', 0]),
  D('Inverse kinematics, and the Jacobian that makes it work', 'm5-kin', ['jacobian'], ['b22', 'make', 1]),
  D('Singularities: what they physically are', 'm5-kin', [], ['b22', 'test', 'Drive it near a singularity and record what the solver does']),
  D('Joint-space versus Cartesian trajectories', 'm5-kin', [], ['b22', 'ship']),

  // Week 10: ROS 2 from nothing
  D('Which ROS 2, and how to spot a ROS 1 tutorial in five seconds', 'm4-distro', ['ros1', 'distro'], ['b15', 'plan']),
  D('Nodes, topics, services and actions — which one a problem needs', 'm4-core', ['comms'],
    ['b15', 'make', 'A sensor publisher, a processing node and a service-based config node']),
  D('Custom .msg and .srv, parameters and YAML', 'm4-core', [], ['b15', 'make', 'A parameterised aggregator, with your own .msg and .srv']),
  D('Launch files, colcon workspaces and ros2 bag', 'm4-core', ['graph'], ['b15', 'test', 'Record the graph with ros2 bag and replay it']),
  D('QoS mismatches: why a topic publishes and nothing receives', 'm4-core', [], ['b15', 'ship']),
  D('URDF and TF: joint_state_publisher, robot_state_publisher and the transform tree', 'm4-urdf', ['tf'],
    ['b16', 'make', 'A differential-drive base with correct inertias and separate collision geometry']),
  D('xacro macros from day one, and why inertial tags are not optional', 'm4-urdf', [], ['b16', 'make', 'Add the sensor mast and the two-axis pan-tilt head']),

  // Week 11: simulation
  D('A missing static transform breaks SLAM', 'm4-urdf', [], ['b16', 'ship']),
  D('Simulators: Gazebo first, MuJoCo for learning, Isaac only with RTX', 'm4-sim', ['simchoice'],
    ['b17', 'make', 'Build a custom SDF world with obstacles']),
  D('Gazebo and ROS 2 pairs, and gz instead of ign', 'm4-sim', [], ['b17', 'make', 'Add lidar and camera plugins and see the data on ROS 2 topics']),
  D('Review: no new idea today. Ship the simulated robot.', 'm4-sim', [], ['b17', 'ship']),
  D('Diff-drive kinematics: wheel speeds to robot motion', 'm4-control', ['diffdrive'], ['b18', 'make', 0]),
  D('Actions with feedback and cancellation', 'm4-control', [], ['b18', 'make', 1]),
  D('ros2_control: controllers configured, not hand-written', 'm4-control', [], ['b18', 'test']),

  // Week 12: mapping and navigating
  D('Review: no new idea today. Ship the controller.', 'm4-control', [], ['b18', 'ship']),
  D('SLAM: mapping versus localising, and when to switch', 'm4-nav', ['nav'], ['b19', 'plan']),
  D('A smeared map is almost always odometry, not the algorithm', 'm4-nav', [], ['b19', 'make', 'Run SLAM Toolbox, teleop around your world and save the map']),
  D('Costmaps: inflation radius, obstacle layers, local versus global', 'm4-nav', [],
    ['b19', 'make', 'Switch to localisation, send Nav2 goals from RViz']),
  D('Behaviour trees: how Nav2 decides what to do next', 'm4-nav', [], ['b19', 'test', 'Tune the costmaps until it stops clipping corners, and record the screen']),
  D('Review: no new idea today. Ship the navigation.', 'm4-nav', [], ['b19', 'ship']),
  REVIEW('m4-nav'),
  REVIEW('m4-core'),
  BOSS('m4-urdf'),

  /* ========== Month 4 — see, grasp, learn, get hired (advanced) ========== */
  // Week 13: cameras
  D('Pinhole projection: image coordinates versus world coordinates', 'm5-vision', ['pinhole'], ['b23', 'plan']),
  D('Intrinsics and distortion, and a real calibration with a printed chessboard', 'm5-vision', [],
    ['b23', 'make', 'Calibrate your camera with a printed chessboard and save the intrinsics']),
  D('Depth: stereo versus structured light versus time-of-flight', 'm5-vision', ['stereo'],
    ['b23', 'make', 'Detect a coloured object and estimate its 3D position relative to the camera']),
  D('Point clouds: downsample, fit the table, cluster the objects', 'm5-vision', ['cloud'], ['b23', 'make', 1]),
  D('Why a lighting change breaks a pipeline that worked yesterday', 'm5-vision', [], ['b23', 'ship']),
  D('MoveIt 2: planning scenes and collision objects', 'm5-moveit', ['moveit'], ['b24', 'make', 0]),
  D('Breaking a task into stages with the Task Constructor', 'm5-moveit', [], ['b24', 'make', 1]),

  // Week 14: grasping, and control beyond PID
  D('Grasps, IK and collisions, together', 'm5-moveit', [], ['b24', 'test']),
  D('Review: no new idea today. Ship the pick and place.', 'm5-moveit', [], ['b24', 'ship']),
  D('State space and LQR: choosing gains on principle', 'm5-lqr', ['control'], ['b21', 'make', 'Implement LQR for a simulated cart-pole in Python']),
  D('MPC, and why underactuation needs different thinking', 'm5-lqr', [], ['b21', 'make', 'Hand-tune a PID for the same plant and hit both with the same disturbance']),
  D('Review: no new idea today. Ship the comparison.', 'm5-lqr', [], ['b21', 'ship']),
  D('Imitation learning: the record–train–deploy loop, and ACT', 'm6-lerobot', ['lerobot'], ['b25', 'plan']),
  D('Dataset quality: sloppy demonstrations make a sloppy policy', 'm6-lerobot', [], ['b25', 'make', 'Record 50 demonstrations of one simple task']),

  // Week 15: a policy that runs on your arm
  D('Measuring a policy: success rate, and how many trials you need', 'm6-lerobot', ['rate'], ['b25', 'make', 'Train ACT, deploy it, and measure its success rate']),
  D('Diffusion Policy: the policy as a denoising process', 'm6-lerobot', [], ['b25', 'make', 'Record 50 more covering the failures, retrain, measure again']),
  D('Review: no new idea today. Ship the before-and-after.', 'm6-lerobot', [], ['b25', 'ship']),
  D('Vision-language-action models: which have open weights, and which to fine-tune', 'm6-vla', ['vla'], ['b26', 'plan']),
  D('Reinforcement learning: start in MuJoCo Playground', 'm6-rl', ['rl'], ['b26', 'make', 0]),
  D('The reward decides the behaviour', 'm6-rl', [], ['b26', 'make', 'Change the reward function and show how the gait changes']),
  D('Review: no new idea today. Ship the gaits.', 'm6-rl', [], ['b26', 'ship']),

  // Week 16: the portfolio and the interview
  D('Pick a direction: robot learning, autonomy, or embedded', 'm6-portfolio', ['career'], ['b27', 'plan']),
  D('What a reviewer looks for: commit history, real data, measured results', 'm6-portfolio', [],
    ['b27', 'make', 'Rewrite your best project\'s README: video at the top, diagram, numbers, what failed']),
  D('Red flags: ROS 1 with no migration, certificates over contributions', 'm6-portfolio', [], ['b27', 'make', 'Do the same for your second and third projects']),
  D('Interview topics: IK, PID, sensor fusion, SLAM, RRT', 'm6-interview', [], ['b27', 'ship']),
  D('The broken controller they hand you in simulation', 'm6-interview', [],
    ['b28', 'make', 'Have someone question you on your own repo for twenty minutes']),
  D('Telling the story of a failure, three levels deep', 'm6-interview', [], ['b28', 'ship']),
  REVIEW('m6-interview'),
  REVIEW('m6-portfolio'),
  BOSS('m6-interview'),
];

/* ---------------------------------- steps --------------------------------- */

/**
 * Turn each day's [id, kind, stage | text] into a numbered step of its build:
 * { id, kind, step, of, text, repeat }.
 */
function withSteps(days) {
  const runs = {};
  days.forEach((d, i) => { if (d.build) (runs[d.build[0]] ||= []).push(i); });
  for (const [id, idx] of Object.entries(runs)) {
    const parts = stages(buildById(id).task);
    idx.forEach((i, k) => {
      const [, kind, arg] = days[i].build;
      const text = typeof arg === 'string' ? arg : kind === 'make' ? parts[Math.min(arg ?? k, parts.length - 1)] : null;
      days[i] = { ...days[i], build: { id, kind, step: k + 1, of: idx.length, text } };
    });
  }
  return days;
}

export const MISSIONS = numberDays(withSteps(DAYS));
export const TOTAL_MISSIONS = MISSIONS.length;
export const missionAt = n => MISSIONS[Math.max(1, Math.min(MISSIONS.length, n)) - 1];

/** What a build step asks of you, in a line. */
export function stepLine(step) {
  if (!step) return '';
  if (step.text) return step.text;
  if (step.kind === 'plan') return 'Plan it: read the task, write down what you need, and start its folder in a public repo with a README that says what it will do. Push.';
  if (step.kind === 'test') return 'Measure it and break it on purpose. Put the numbers and a “What broke” section in the README. Push.';
  if (step.kind === 'ship') return 'Ship it: photo or video in the README, push, then press Verify.';
  return '';
}

export const STEP_NAMES = { plan: 'Plan', make: 'Make', test: 'Test', ship: 'Ship' };
export const stepName = step => STEP_NAMES[step.kind];
