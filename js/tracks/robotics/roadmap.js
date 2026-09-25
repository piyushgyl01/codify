/**
 * The roadmap: the article's topics, resources and builds, arranged into four months.
 *
 * Source: "How to become a Robotics Engineer in 6 months" by Ronin (@DeRonin_).
 * Tasks, resources and prices are summarised from that article in shorter words
 * of their own; prices are as the article listed them in September 2026. Read
 * the original for the reasoning behind each choice.
 *
 * The part that is new here is `proof`: what a build's GitHub folder has to
 * contain before the app will pay for it. It is the article's own portfolio
 * standard — a photo, the numbers you measured, a section on what broke, and a
 * commit history that shows iteration — turned into checks a machine can run.
 */

export const SOURCE = {
  author: 'Ronin (@DeRonin_)',
  title: 'How to become a Robotics Engineer in 6 months',
  url: 'https://x.com/DeRonin_',
  youtube: 'https://www.youtube.com/@deronin_23',
};

/* --------------------------------- months --------------------------------- */

export const MONTHS = [
  { n:1, title:'Circuits to a robot that moves', short:'Move', level:'Beginner', icon:'⚡', color:'var(--yellow)',
    goal:'From Ohm\'s law to a line follower you tuned yourself.' },
  { n:2, title:'Control, balance and making parts', short:'Balance', level:'Beginner+', icon:'⚖️', color:'var(--acid)',
    goal:'A robot that balances on two wheels, the logged data that explains it, and parts you designed that fit.' },
  { n:3, title:'Arms, frames and ROS 2', short:'ROS 2', level:'Intermediate', icon:'🧭', color:'var(--cyan)',
    goal:'An arm that goes where you tell it, and your own robot mapping a room and navigating it in simulation.' },
  { n:4, title:'See, grasp, learn, get hired', short:'Hired', level:'Advanced', icon:'🧠', color:'var(--pink)',
    goal:'Pick things up with a camera and a policy you trained, and a portfolio that survives the third question.' },
];

export const monthByN = n => MONTHS.find(m => m.n === n);

/** Days per plan month. Month n opens at mission 30·(n−1)+1, or early once you beat its boss. */
export const MONTH_DAYS = 30;
export const PLAN_DAYS = MONTH_DAYS * MONTHS.length;

/* --------------------------------- topics --------------------------------- */

/**
 * `r` builds a resource: [name, price, url, note]. Price is a short string —
 * 'free', '$42.99', '~$10–20 on sale' — because the article's prices are ranges
 * as often as they are figures. A null url is an item the article priced but
 * did not link.
 */
const r = (name, price, url, note) => ({ name, price, url, note });

export const TOPICS = [
  /* ------------------------------ month 1 ------------------------------ */
  { id:'m1-elec', month:1, name:'Electronics fundamentals',
    why:'Ohm\'s law, dividers, capacitors, transistor switching and reading a schematic. Start in a simulator — wiring something wrong there costs nothing.',
    focus:[
      'Ohm\'s law and voltage dividers until they are automatic',
      'Current draw, and why a stalling motor browns out the microcontroller',
      'Schematic symbols: resistor, capacitor, diode, transistor, ground, Vcc',
      'Pull-up and pull-down resistors',
      'What a decoupling capacitor does, and why every IC wants one',
      'LiPo basics: cell counts, C ratings, and never charging unattended',
    ],
    resources:[
      r('Falstad Circuit Simulator', 'free', 'https://www.falstad.com/circuit/', 'Watch current move and voltages colour in live, in the browser.'),
      r('Tinkercad Circuits', 'free', 'https://www.tinkercad.com/circuits', 'A virtual breadboard, Arduino and multimeter together.'),
      r('Lessons in Electric Circuits', 'free', 'https://www.allaboutcircuits.com/textbook/', 'Open six-volume textbook — the reference when a video hand-waves.'),
      r('Afrotechmods tutorials', 'free', 'https://afrotechmods.com/tutorials/', 'Short, quick videos sorted by level.'),
      r('Make: Electronics, 3rd ed.', '$29.99', 'https://www.makershed.com/products/make-electronics-3rd-edition-print', 'A paper book built around destroying parts on purpose.'),
    ] },

  { id:'m1-bench', month:1, name:'The bench, and what it costs',
    why:'Budget tiers from nothing upwards. Do the free tier first, then buy a kit and a meter.',
    focus:[
      'Tier 0, $0: simulators and the free textbook',
      'Tier 1, ~$45–60: a starter kit and a multimeter',
      'Tier 2, ~$110–160: iron, solder, cutters, strippers, helping hands, perfboard',
      'Tier 3, ~$200–300: bench supply, better meter, desoldering pump, storage, a chassis',
      'First order from Amazon or the maker direct; AliExpress once you know what a 10k resistor is for',
    ],
    resources:[
      r('Elegoo UNO R3 Super Starter Kit', '$42.99', 'https://www.elegoo.com/products/elegoo-uno-r3-super-starter-kit', 'Best value, and the kit most courses assume.'),
      r('Elegoo UNO Basic Starter Kit', '$19.99', 'https://www.elegoo.com/products/elegoo-uno-basic-starter-kit', 'The cheapest real way in.'),
      r('SparkFun Inventor\'s Kit v4.1.2', '$99.95', 'https://www.sparkfun.com/sparkfun-inventor-s-kit-v4-1-2.html', 'The best curriculum of any kit; the guide is free either way.'),
      r('Adafruit multimeter 9205B+', '$17.50', 'https://www.adafruit.com/product/2034', 'Volts, current to 20 A, continuity, capacitance.'),
      r('Pinecil V2 soldering iron', '$25.99–35.99', 'https://pine64.com/product/pinecil-smart-mini-portable-soldering-iron/', 'Temperature-controlled, USB-C, standard tips.'),
    ] },

  { id:'m1-solder', month:1, name:'Soldering',
    why:'A jumper wire stops being good enough the day a robot shakes itself apart mid-demo.',
    focus:[
      'Tin the tip and keep it clean',
      'Heat the joint, not the solder',
      'Recognise a cold joint by sight',
      'Through-hole first; surface-mount much later',
      'Flux fixes most of what beginners blame on the iron',
    ],
    resources:[
      r('Adafruit Guide to Excellent Soldering', 'free', 'https://learn.adafruit.com/adafruit-guide-excellent-soldering', 'Technique, photos of every common failure, and safety.'),
      r('SparkFun: How to Use a Multimeter', 'free', 'https://learn.sparkfun.com/tutorials/how-to-use-a-multimeter', 'Including what to do when you blow the fuse.'),
    ] },

  { id:'m1-python', month:1, name:'Python, the terminal and Git',
    why:'You will use all three every week from here on, so get them out of the way now.',
    focus:[
      'Python: functions, classes, file I/O, JSON, virtual environments, pip',
      'Terminal: cd, ls, grep, running scripts, environment variables, ssh',
      'Git: init, add, commit, push, branches — and a README someone can follow',
    ],
    resources:[
      r('CS50P', 'free', 'https://cs50.harvard.edu/python/', 'Rigorous, with problem sets; the structure is why people finish.'),
      r('Python for Everybody', 'free to audit', 'https://www.coursera.org/specializations/python', 'The gentler start if CS50P feels steep.'),
      r('The Missing Semester', 'free', 'https://missing.csail.mit.edu/', 'Shell and command-line fluency — robotics runs on it.'),
      r('Learn Git Branching', 'free', 'https://learngitbranching.js.org/', 'Branches and merges, visually.'),
    ] },

  /* ------------------------------ month 2 ------------------------------ */
  { id:'m2-arduino', month:1, name:'Arduino',
    why:'Start here rather than on the ESP32: every tutorial in existence targets it, and nothing you learn is wasted.',
    focus:[
      'digitalWrite/Read, analogRead/Write, and what PWM actually is',
      'Interrupts, and why polling a button eventually fails you',
      'I2C and SPI: wiring them, and finding the address in a datasheet',
      'Serial debugging — your main tool for months',
      'millis() instead of delay(), because delay() ruins every robot',
    ],
    resources:[
      r('Paul McWhorter, Arduino Lessons', 'free', 'https://toptechboy.com/arduino-lessons/', 'Slow, thorough, homework every lesson.'),
      r('Arduino Built-in Examples', 'free', 'https://docs.arduino.cc/built-in-examples/', 'Already inside your IDE.'),
      r('Arduino Docs — Learn', 'free', 'https://docs.arduino.cc/learn/', 'Reference for IO, PWM, I2C, SPI, UART.'),
      r('Arduino Project Hub', 'free', 'https://projecthub.arduino.cc/', 'Where to go when the tutorials run out.'),
    ] },

  { id:'m2-esp32', month:1, name:'ESP32',
    why:'Wi-Fi, Bluetooth, two cores and more speed, for less than an Uno.',
    focus:[
      'Arduino framework: fastest route to a working robot',
      'ESP-IDF: when you need control of tasks, cores, power and timing',
      'MicroPython for sensor experiments — never a balancing loop, GC pauses wreck timing',
      'An ESP32-S3 as the main board, plus one classic ESP32 for old tutorial code',
    ],
    resources:[
      r('Random Nerd Tutorials — ESP32', 'free', 'https://randomnerdtutorials.com/getting-started-with-esp32/', 'A fix for nearly every beginner failure.'),
      r('ESP-IDF Programming Guide', 'free', 'https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html', 'The source of truth past the Arduino layer.'),
      r('Arduino ESP32 core docs', 'free', 'https://docs.espressif.com/projects/arduino-esp32/en/latest/', 'Espressif\'s own docs for the Arduino layer.'),
      r('DroneBot Workshop — ESP32', 'free', 'https://dronebotworkshop.com/esp32-2/', 'Long-form, wiring-diagram heavy.'),
      r('ESP32-S3-DevKitC-1', '$15.95', 'https://www.adafruit.com/product/5312', 'Main board.'),
      r('Classic ESP32 dev board', '$15.00', 'https://www.adafruit.com/product/3269', 'For older tutorial code.'),
      r('Seeed XIAO ESP32-C3', '$4.99', 'https://www.seeedstudio.com/Seeed-XIAO-ESP32C3-p-5431.html', 'When you need something tiny.'),
    ] },

  { id:'m2-motors', month:1, name:'Motors, drivers and actuation',
    why:'Motors draw real current and behave badly. This is where electronics stops being abstract.',
    focus:[
      'Brushed DC gearmotor: cheap, needs an H-bridge, no position feedback without an encoder',
      'Hobby servo: internal loop, about 180°, no feedback out',
      'Smart serial bus servo: daisy-chained, position, velocity and current feedback',
      'Stepper: open-loop absolute positioning, high holding torque',
      'Learn the L298N because tutorials use it — then use a TB6612FNG or DRV8833',
    ],
    resources:[
      r('DroneBot — DC motors with the L298N', 'free', 'https://dronebotworkshop.com/dc-motors-l298n-h-bridge/', 'PWM, H-bridge internals, three sketches.'),
      r('SparkFun TB6612FNG Hookup Guide', 'free', 'https://learn.sparkfun.com/tutorials/tb6612fng-hookup-guide/all', 'The driver you should actually use.'),
      r('DroneBot — Stepper motors', 'free', 'https://dronebotworkshop.com/stepper-motors-with-arduino/', 'Microstepping, NEMA sizing, three drivers.'),
      r('SimpleFOC documentation', 'free', 'https://docs.simplefoc.com/', 'The clearest free explanation of field-oriented control.'),
      r('Adafruit DRV8833 driver', '$5.95', 'https://www.adafruit.com/product/3297', 'Cheapest good driver.'),
      r('SparkFun TB6612FNG breakout', '$14.77', 'https://www.sparkfun.com/sparkfun-motor-driver-dual-tb6612fng-1a.html', 'The default L298N replacement.'),
      r('Pololu gearmotor with encoder', '$19.95', 'https://www.pololu.com/product/3675', 'Encoder wiring already solved.'),
      r('Pololu A4988 stepper driver', '$8.95', 'https://www.pololu.com/product/1182', 'For steppers.'),
      r('FeeTech STS3215 smart servo', '$31.71', 'https://www.robotshop.com/products/feetech-12v-30kgcm-magnetic-encoding-servo-sts3215', 'The servo in the SO-101 arm.'),
    ] },

  { id:'m2-sensors', month:1, name:'Sensors and reading the world',
    why:'Drift, noise and fusion — the smallest possible version of state estimation.',
    focus:[
      'Ultrasonic vs time-of-flight: cone width and soft surfaces',
      'An IMU that fuses on-chip vs one where you do the fusion yourself',
      'Write a complementary filter before a Kalman filter',
      'Why a gyro drifts and an accelerometer is noisy',
    ],
    resources:[
      r('Adafruit BNO085 guide', 'free', 'https://learn.adafruit.com/adafruit-9-dof-orientation-imu-fusion-breakout-bno085/overview', 'Fusion on-chip, a quaternion out.'),
      r('Kalman and Bayesian Filters in Python', 'free', 'https://rlabbe.github.io/Kalman-and-Bayesian-Filters-in-Python/', 'Runnable notebooks from g-h filters to particle filters.'),
      r('MathWorks — Understanding Sensor Fusion', 'free', 'https://www.mathworks.com/videos/series/understanding-sensor-fusion-and-tracking.html', 'The concepts before the code.'),
      r('HC-SR04 ultrasonic', '$3.95', null, 'Cheap, wide cone, poor on soft surfaces.'),
      r('VL53L0X time-of-flight', '$14.95', null, 'Much narrower cone.'),
      r('MPU-6050 6-DoF IMU', '$12.95', null, 'You do the fusion — which is the point.'),
      r('BNO085 9-DoF IMU', '$29.50', null, 'Fusion on-chip.'),
      r('RPLIDAR C1', '$69.00', null, '360° lidar, from DFRobot.'),
    ] },

  { id:'m2-robots', month:1, name:'Your first two robots',
    why:'A line follower is a closed loop with a tuning problem — a humanoid, only smaller and cheaper to break.',
    focus:[
      'Line follower: tune with P, add D, watch the oscillation go',
      'Film both versions; tuned next to untuned proves you understand the loop',
      'The balancer will not work until the filter and the loop timing are both right',
    ],
    resources:[
      r('Line follower — quality build', '~$105', null, 'ESP32-S3, Pololu Romi, TB6612FNG, QTR-8RC array.'),
      r('Line follower — budget build', '~$38', null, 'Generic ESP32, 2WD acrylic chassis, DRV8833, TCRT5000s.'),
      r('Balancer — quality build', '~$134', null, 'ESP32, two encoder gearmotors, TB6612FNG, MPU-6050.'),
      r('Balancer — budget build', '~$62', null, 'The same loop on cheaper parts.'),
    ] },

  /* ------------------------------ month 3 ------------------------------ */
  { id:'m3-cad', month:2, name:'CAD',
    why:'Pick one tool and go deep. Onshape if designing in public is fine; Fusion Personal for CAM later; FreeCAD if you want no licence at all.',
    focus:[
      'Fully constrained sketches — an under-constrained one moves when you edit it',
      'Parametric design driven by variables',
      'Assemblies and mates that behave like real joints',
      'Design around hardware you own, from its datasheet',
      'STEP for sharing, STL for printing',
    ],
    resources:[
      r('Onshape Fundamentals: CAD', 'free', 'https://learn.onshape.com/learning-paths/onshape-fundamentals-cad', 'Structured, with a credential at the end.'),
      r('Learn Fusion in 30 Days', 'free', 'https://productdesignonline.com/learn-autodesk-fusion-360-in-30-days-official-course/', 'Thirty objects in thirty days.'),
      r('MangoJelly — FreeCAD', 'free', 'https://www.youtube.com/@MangoJellySolutions', 'Short, targeted FreeCAD lessons.'),
      r('Design for 3D printing (Protolabs)', 'free', 'https://www.hubs.com/knowledge-base/design-for-3d-printing/', 'Walls, orientation, tolerances, snap-fits.'),
    ] },

  { id:'m3-print', month:2, name:'3D printing',
    why:'A printer pays for itself on iteration, not on one build: the tenth gripper finger costs cents at home.',
    focus:[
      'PLA/PLA+ for prototypes and the SO-101 itself',
      'PETG as the default real robot part',
      'ABS/ASA near hot motors and outdoors — they need an enclosure',
      'TPU for feet, bumpers and gripper fingers',
      'Carbon-fibre filled needs a hardened nozzle',
      'Print a tolerance gauge and design with your real clearances',
    ],
    resources:[
      r('OrcaSlicer Calibration wiki', 'free', 'https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration', 'Every calibration, in running order.'),
      r('Teaching Tech calibration', 'free', 'https://teachingtechyt.github.io/calibration.html', 'Printer-agnostic walkthrough.'),
      r('CNC Kitchen', 'free', 'https://www.youtube.com/@CNCKitchen', 'Measured strength tests, not folklore.'),
      r('Clearance and tolerance gauge', 'free STL', 'https://www.printables.com/model/57067-clearance-and-tolerance-3d-printer-gauge', 'Print once, know your machine.'),
      r('Creality Ender-3 V3 SE', '$199', 'https://store.creality.com/products/ender-3-v3-se-3d-printer', null),
      r('Bambu Lab A1 mini', '$219.99', 'https://www.bestbuy.com/product/bambu-lab-a1-mini-3d-printer-silver/CZTZV9ZGGV', null),
      r('Bambu Lab A1', '$299.99', 'https://www.bestbuy.com/product/bambu-lab-a1-3d-printer-silver/CZW2ZH33H4', 'The 256 mm bed you will want.'),
      r('Creality K1C', '$369', 'https://store.creality.com/products/k1c-3d-printer', 'Enclosed, carbon-fibre ready.'),
      r('Bambu Lab P1S', '$799', 'https://us.store.bambulab.com/products/p1s', 'Enclosed, for ABS and ASA.'),
      r('Fab Labs worldwide', 'varies', 'https://fablabs.io/labs', 'No printer? Find one near you.'),
      r('Library makerspaces', 'free or cheap', 'https://action.everylibrary.org/how_to_find_a_makerspace_near_you', null),
      r('Craftcloud', 'quoted', 'https://craftcloud3d.com/', 'Compares print services across 95 countries.'),
      r('JLC3DP', 'from $1/part', 'https://jlc3dp.com/', 'MJF nylon and FDM, three-day builds.'),
    ] },

  { id:'m3-transmission', month:2, name:'Actuators and transmissions',
    why:'Reduction, backlash and torque density separate a robot that works once on video from one that works every time.',
    focus:[
      'Gear ratios: speed traded for torque',
      'Backlash, and why software cannot fully fix it',
      'Bearing selection and preload',
      'Belt vs gear vs direct drive',
      'Why a cheap servo\'s plastic gears are the first thing to fail',
    ],
    resources:[
      r('OpenCycloid actuator', 'free', 'https://www.instructables.com/OpenCycloid-3D-printed-Open-Source-Robotic-Actuato/', 'A starting geometry for your reducer.'),
    ] },

  { id:'m3-arm', month:2, name:'Build a real robot arm',
    why:'The SO-101 is built as a leader and follower pair, so you can hand-guide one and record demonstrations — which the last month depends on.',
    focus:[
      'SO-101: open-source 5-DOF arm plus gripper',
      'Leader/follower teleoperation is what makes demonstrations possible',
      'No hardware? The whole LeRobot stack runs in MuJoCo first',
    ],
    resources:[
      r('SO-ARM100 repository', 'BOM $229.88 pair / $121.94 follower', 'https://github.com/TheRobotStudio/SO-ARM100', 'The official bill of materials, excluding printing.'),
      r('Seeed SO-ARM101 Pro kit', '$277.99', 'https://www.seeedstudio.com/SO-ARM101-Low-Cost-AI-Arm-Kit-Pro-p-6427.html', 'Motors and boards, no printed parts.'),
      r('Seeed SO-ARM101 printed parts', '$30.99', 'https://www.seeedstudio.com/SO-ARM101-3D-printed-Enclosure-p-6428.html', 'If you have no printer.'),
      r('Robonine SO-ARM101 kit', '$349.00', 'https://robonine.com/shop/so-arm101-black-robotic-arm-kit/', 'Complete kit.'),
      r('WowRobo SO-ARM101 (OpenELAB)', '$325.99–489.99', 'https://openelab.com/products/wowrobo-robotics-so-arm101-diykit', 'Parts to fully assembled.'),
      r('EEZYbotARM MK2', '~$50–80', 'https://www.thingiverse.com/thing:1454048', 'Hobby-servo arm; teaches linkages.'),
      r('Hiwonder xArm 1S', '$199.99', 'https://www.hiwonder.com/products/xarm-1s', 'Cheapest arm with smart bus servos.'),
    ] },

  /* ------------------------------ month 4 ------------------------------ */
  { id:'m4-distro', month:3, name:'Which ROS 2 — and the ROS 1 trap',
    why:'Most highly-ranked tutorial content is ROS 1, which reached end of life in May 2025. Learn to recognise it instantly.',
    focus:[
      'Start on Jazzy (supported to May 2029); move to Lyrical once tutorials catch up',
      'Kilted ends on 31 December 2026 — do not start there',
      'catkin_make, roscore, rosrun, rospy or XML-only launch files mean ROS 1: close the tab',
      'ROS 2 uses colcon build, has no master, and uses ros2 run and Python launch files',
    ],
    resources:[
      r('Official ROS 2 tutorials (Jazzy)', 'free', 'https://docs.ros.org/en/jazzy/Tutorials.html', 'The canonical reference.'),
    ] },

  { id:'m4-core', month:3, name:'ROS 2 core concepts',
    why:'The single most requested skill in robotics job listings — and all of it works on a laptop with no GPU.',
    focus:[
      'Nodes, topics, services and actions — and which one a problem needs',
      'Custom .msg and .srv definitions',
      'Parameters and YAML config',
      'Python launch files with arguments and remapping',
      'colcon workspaces and package layout',
      'ros2 bag for anything that only fails occasionally',
      'QoS mismatches: why a topic publishes and nothing receives',
    ],
    resources:[
      r('The Construct', 'free tier, from €39.97/mo', 'https://www.theconstruct.ai/', 'ROS in the browser — no install weekend.'),
      r('ROS 2 for Beginners (Udemy)', '~$10–20 on sale', 'https://www.udemy.com/course/ros2-for-beginners/', 'Python and C++. Never pay list price.'),
      r('Articulated Robotics', 'free', 'https://articulatedrobotics.xyz/tutorials/', 'Design to SLAM, end to end.'),
      r('MOGI-ROS university course', 'free', 'https://github.com/orgs/MOGI-ROS/repositories', 'A semester on Jazzy and Gazebo Harmonic.'),
      r('Automatic Addison', 'free', 'https://automaticaddison.com/tutorials/', 'Recipes by distro, already covering Lyrical.'),
    ] },

  { id:'m4-urdf', month:3, name:'URDF, TF and describing a robot',
    why:'Frames and transforms are the concept that blocks most people\'s understanding of URDF.',
    focus:[
      'joint_state_publisher invents joint positions; robot_state_publisher turns them into transforms',
      'Always include inertial tags, or the robot explodes or sinks through the floor',
      'A missing static transform to the lidar frame breaks SLAM',
      'Use xacro macros from day one',
    ],
    resources:[
      r('Coordinate Transforms for Robotics', 'free', 'https://articulatedrobotics.xyz/category/coordinate-transforms-for-robotics', 'Frames, properly.'),
      r('ROS 2 TF, URDF, RViz, Gazebo (Udemy)', '~$10–20 on sale', 'https://www.udemy.com/course/ros2-tf-urdf-rviz-gazebo/', 'The best single URDF resource.'),
      r('URDF with robot_state_publisher', 'free', 'https://docs.ros.org/en/jazzy/Tutorials/Intermediate/URDF/Using-URDF-with-Robot-State-Publisher-cpp.html', 'The official walkthrough.'),
    ] },

  { id:'m4-sim', month:3, name:'Simulation',
    why:'Gazebo was renamed twice; the version you install has to match your ROS 2 distro or you will fight build errors.',
    focus:[
      'Gazebo Classic ended in January 2025; every ign command became gz',
      'Humble–Fortress, Jazzy–Harmonic, Kilted–Ionic, Lyrical–Jetty',
      'Gazebo first, MuJoCo for RL and locomotion, Isaac Sim only with RTX hardware',
      'Skip PyBullet; watch Genesis but do not build a portfolio on it yet',
    ],
    resources:[
      r('Gazebo docs', 'free', 'https://gazebosim.org/docs/latest/getstarted/', 'Robots, worlds, sensors.'),
      r('MuJoCo', 'free', 'https://mujoco.readthedocs.io/en/stable/overview.html', 'Accurate contact dynamics, no GPU needed.'),
      r('Isaac Sim requirements', 'free', 'https://docs.isaacsim.omniverse.nvidia.com/6.0.0/installation/requirements.html', 'Read this before getting excited: RTX 4080 minimum.'),
    ] },

  { id:'m4-control', month:3, name:'ros2_control',
    why:'The topic most self-taught candidates have never touched — the fastest way to stand out.',
    focus:[
      '<ros2_control> tags in your xacro',
      'diff_drive_controller and joint_state_broadcaster configured in YAML',
      'Actions with feedback and cancellation',
    ],
    resources:[
      r('ros2_control documentation', 'free', 'https://control.ros.org/rolling/index.html', 'Where URDF meets actuation.'),
      r('ros2_control on real hardware', 'free', 'https://articulatedrobotics.xyz/tutorials/mobile-robot/applications/ros2_control-real/', 'The sim-to-hardware step, done properly.'),
    ] },

  { id:'m4-nav', month:3, name:'SLAM and navigation',
    why:'A robot navigating a map it built itself is the most compelling thing a self-taught roboticist can show.',
    focus:[
      'Mapping vs localizing, and when to switch SLAM Toolbox modes',
      'A smeared map is almost always odometry, not the algorithm',
      'Costmaps: inflation radius, obstacle layers, local vs global',
      'Behaviour trees are how Nav2 orchestrates everything',
    ],
    resources:[
      r('Nav2 — Getting Started', 'free', 'https://docs.nav2.org/rolling/getting_started/index.html', 'Nav2 in simulation in five minutes.'),
      r('Nav2 tutorials', 'free', 'https://docs.nav2.org/rolling/tutorials/', 'SLAM, keepouts, docking, your own plugins.'),
      r('SLAM Toolbox', 'free', 'https://github.com/SteveMacenski/slam_toolbox', 'The supported ROS 2 SLAM library.'),
      r('RTAB-Map for ROS 2', 'free', 'https://github.com/introlab/rtabmap_ros', 'For depth cameras and 3D maps.'),
      r('Hiwonder MentorPi M1', 'from $299.99', 'https://www.hiwonder.com/products/mentorpi-m1', 'Ready platform with lidar and depth camera.'),
      r('Waveshare UGV Rover ROS 2 kit', '$534.99', 'https://www.waveshare.com/ugv-rover-ros2-kit.htm', 'Pi host plus ESP32 real-time controller.'),
    ] },

  /* ------------------------------ month 5 ------------------------------ */
  { id:'m5-pid', month:2, name:'Control theory, starting with PID',
    why:'You tuned PID by feel in month two. Now learn why it worked.',
    focus:[
      'What P, I and D each physically do, and how each one fails',
      'Integrator windup, and why an arm slams coming off a limit',
      'The derivative term amplifies sensor noise and needs filtering',
      'Steady-state error: integrator, or gravity compensation?',
      'Feedforward — the cheapest improvement most people never add',
    ],
    resources:[
      r('Understanding PID Control (MATLAB)', 'free', 'https://www.mathworks.com/videos/series/understanding-pid-control.html', 'Seven parts, windup to tuning.'),
      r('Brian Douglas — control lectures', 'free', 'https://www.youtube.com/@BrianBDouglas/playlists', 'Intuition first.'),
      r('The Fundamentals of Control Theory', 'free', 'https://engineeringmedia.com/books', 'The written companion.'),
      r('Control Bootcamp (Steve Brunton)', 'free', 'https://www.youtube.com/playlist?list=PLMrJAkhIeNNR20Mz-VpzgfQs5zrYi085m', 'State space, LQR, Kalman.'),
      r('Feedback Systems (Åström & Murray)', 'free PDF', 'https://fbswiki.org/wiki/index.php/Feedback_Systems:_An_Introduction_for_Scientists_and_Engineers', 'The rigorous textbook.'),
    ] },

  { id:'m5-lqr', month:4, name:'State space, LQR and MPC',
    why:'This is where control theory becomes robotics: pendulums, walking, humanoids.',
    focus:[
      'State, input and output instead of a transfer function',
      'LQR as a principled way of choosing gains',
      'MPC buys you constraints and costs you compute',
      'Underactuation, and why it needs different thinking',
    ],
    resources:[
      r('Understanding MPC (MATLAB)', 'free', 'https://www.mathworks.com/videos/series/understanding-model-predictive-control.html', 'Why, and how to make it fast.'),
      r('Underactuated Robotics (MIT)', 'free', 'https://underactuated.csail.mit.edu/index.html', 'Tedrake\'s notes, PDF and lectures.'),
    ] },

  { id:'m5-kin', month:3, name:'Kinematics and dynamics',
    why:'Enough kinematics to reason about an arm — and to feel it lose a degree of freedom.',
    focus:[
      'Homogeneous transforms and composing them',
      'Forward kinematics is easy; inverse kinematics is not',
      'The Jacobian, and what a singularity physically means',
      'Workspace limits vs joint limits',
      'Joint-space vs Cartesian trajectories',
    ],
    resources:[
      r('Modern Robotics (Lynch)', 'free', 'http://hades.mech.northwestern.edu/index.php/Modern_Robotics', 'The standard textbook, with code and videos.'),
      r('Modern Robotics Specialization', 'free to audit', 'https://www.coursera.org/specializations/modernrobotics', 'The same, with deadlines.'),
      r('Robotics Toolbox for Python', 'free', 'https://github.com/petercorke/robotics-toolbox-python', 'FK, Jacobians, IK, fifty real arms.'),
      r('QUT Robot Academy', 'free', 'https://robotacademy.net.au', 'Two hundred short lessons.'),
    ] },

  { id:'m5-vision', month:4, name:'Perception and computer vision',
    why:'Enough vision to turn a camera into 3D information — and to know why it breaks.',
    focus:[
      'Intrinsics and distortion; a real calibration with a printed chessboard',
      'Pinhole projection: image coordinates vs world coordinates',
      'Depth from stereo vs structured light vs time-of-flight',
      'Point clouds: downsample, fit the table plane, cluster the objects',
      'Why a lighting change breaks a pipeline that worked yesterday',
    ],
    resources:[
      r('OpenCV Bootcamp', 'free', 'https://courses.opencv.org/courses/course-v1:OpenCV+Bootcamp+CV0/about', 'The official course, two to three hours.'),
      r('OpenCV camera calibration', 'free', 'https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html', 'Know this one from memory.'),
      r('Cyrill Stachniss lectures', 'free', 'https://www.ipb.uni-bonn.de/online-training-robotics/', 'The geometric side, from Bonn.'),
      r('Open3D point clouds', 'free', 'https://www.open3d.org/docs/release/tutorial/geometry/pointcloud.html', 'ICP, planes and clusters in Python.'),
    ] },

  { id:'m5-moveit', month:4, name:'Manipulation and MoveIt 2',
    why:'Understanding why a planner fails teaches more than watching it succeed.',
    focus:[
      'Planning scenes and collision objects',
      'Breaking a task into stages with the Task Constructor',
      'Grasp generation, IK and collision management together',
    ],
    resources:[
      r('MoveIt 2 — Getting Started', 'free', 'https://moveit.picknik.ai/main/doc/tutorials/getting_started/getting_started.html', 'Jazzy on Ubuntu 24.04 is smoothest.'),
      r('Pick and place with the Task Constructor', 'free', 'https://moveit.picknik.ai/main/doc/tutorials/pick_and_place_with_moveit_task_constructor/pick_and_place_with_moveit_task_constructor.html', 'The most useful manipulation tutorial.'),
      r('Robotic Manipulation (MIT)', 'free', 'https://manipulation.csail.mit.edu/', 'The whole stack in one book.'),
      r('Contact-GraspNet', 'free', 'https://github.com/NVlabs/contact_graspnet', 'The learned-grasping baseline.'),
    ] },

  /* ------------------------------ month 6 ------------------------------ */
  { id:'m6-lerobot', month:4, name:'LeRobot: record, train, deploy',
    why:'Teleoperate, record, train, deploy — the loop the whole low-cost robot-learning world has converged on.',
    focus:[
      'The record–train–deploy loop, end to end, on your own arm',
      'Dataset quality: sloppy demonstrations make a sloppy policy',
      'ACT first — predicting chunks of future actions',
      'Diffusion Policy — the policy as a denoising process',
    ],
    resources:[
      r('LeRobot documentation', 'free', 'https://huggingface.co/docs/lerobot/index', 'The full pipeline.'),
      r('LeRobot repository', 'free', 'https://github.com/huggingface/lerobot', 'Read how the policies are built.'),
      r('Hugging Face Robotics Course', 'free', 'https://huggingface.co/learn/robotics-course/unit0/1', 'All in simulation — no hardware needed.'),
      r('SO-101 setup guide', 'free', 'https://huggingface.co/docs/lerobot/so101', 'Ports, motors, calibration, recording.'),
    ] },

  { id:'m6-vla', month:4, name:'Vision-language-action models',
    why:'The foundation models of robotics — and which ones you can actually run.',
    focus:[
      'π₀ family: open weights, but transfer to your robot is not guaranteed',
      'OpenVLA: 7B, fully open, the best-documented code to read',
      'GR00T: code Apache 2.0, weights under NVIDIA\'s own model licence',
      'SmolVLA: the one to fine-tune on an SO-101',
      'RT-2: no public weights — read the paper',
    ],
    resources:[
      r('openpi (π₀)', 'free', 'https://github.com/Physical-Intelligence/openpi', null),
      r('OpenVLA', 'free', 'https://openvla.github.io/', null),
      r('Isaac GR00T', 'free', 'https://github.com/Nvidia/Isaac-GR00T', '16 GB+ VRAM to run.'),
      r('SmolVLA', 'free', 'https://huggingface.co/lerobot/smolvla_base', 'Compact, affordable hardware.'),
    ] },

  { id:'m6-rl', month:4, name:'Reinforcement learning',
    why:'No hardware and no GPU beyond what Colab gives you.',
    focus:[
      'Start with MuJoCo Playground and its Colab tutorials',
      'Isaac Lab when you have the RTX hardware',
      'The reward decides the behaviour — change it and watch',
    ],
    resources:[
      r('MuJoCo Playground', 'free', 'https://github.com/google-deepmind/mujoco_playground', 'Start here.'),
      r('Isaac Lab', 'free', 'https://github.com/isaac-sim/IsaacLab', 'The standard for legged sim-to-real.'),
      r('CS 285: Deep RL (Berkeley)', 'free', 'https://rail.eecs.berkeley.edu/deeprlcourse', 'Robotics-native framing throughout.'),
    ] },

  { id:'m6-portfolio', month:4, name:'Pick a direction, build the portfolio',
    why:'Pick one direction and keep the other two at literacy level.',
    focus:[
      'Robot learning: the highest ceiling, and the most competitive',
      'Autonomy and mobile robotics: the most jobs',
      'Embedded and integration: the most consistently employable',
      'High signal: commit history that shows debugging, real-robot data, public datasets',
      'Red flags: ROS 1 with no migration, projects that fail three follow-ups, certificates over contributions',
    ],
    resources:[] },

  { id:'m6-interview', month:4, name:'Interviews',
    why:'Robotics interviews are not software interviews; LeetCode predicts much less here.',
    focus:[
      'Inverse kinematics, PID, sensor fusion, SLAM, RRT, C++ vs Python',
      'At good companies: a broken controller handed to you in simulation',
      'A long conversation about a specific past failure and how you found it',
    ],
    resources:[
      r('Glassdoor: robotics engineer questions', 'free', 'https://www.glassdoor.com/Interview/robotics-engineer-interview-questions-SRCH_KO0,17.htm', 'Real questions from 877 companies.'),
    ] },
];

export const topicById = id => TOPICS.find(t => t.id === id);
export const topicsIn = n => TOPICS.filter(t => t.month === n);

/* --------------------------------- builds --------------------------------- */

/* Patterns shared by several builds. Kept here so the README checklist the user
   reads and the check the verifier runs can never disagree. */
const VOLTS = /\d+(?:\.\d+)?\s*V\b/g;
const OHMS  = /\b\d+(?:\.\d+)?\s*(?:[kKM]\s*(?:Ω|[oO]hms?)?|Ω|[oO]hms?)(?![A-Za-z])/g;
const MM    = /\d+(?:\.\d+)?\s*mm\b/g;
const DEG   = /\d+(?:\.\d+)?\s*(?:°|deg(?:rees?)?\b|arc-?min)/i;
const FIRMWARE = { label:'Firmware source (.ino, .cpp, .c or .h)', re:/\.(?:ino|cpp|c|h)$/i };
const CADFILE  = { label:'A CAD or print file (.step, .stl, .3mf, .f3d or .FCStd)', re:/\.(?:step|stp|stl|3mf|f3d|fcstd)$/i };
const PYFILE   = { label:'Python or a notebook (.py or .ipynb)', re:/\.(?:py|ipynb)$/i };
const NO_ROS1  = { label:'No ROS 1 left in it (catkin_make, roscore, rospy)', re:/catkin_make|\broscore\b|\brospy\b/ };

/**
 * `proof` is what the build's folder on GitHub must contain.
 *
 *   readme  patterns the write-up must include, each with an optional `min` count
 *   files   patterns at least one file path in the folder must match
 *   forbid  patterns the write-up must NOT include
 *   video   how many videos (GIF, MP4, YouTube, GitHub-uploaded) it needs
 *
 * Every build also gets the universal checks in github.js: public repo you own,
 * a README, a photo or video, a "what broke" section, 120+ words, and three or
 * more commits by you. That list is the article's portfolio standard.
 */
export const BUILDS = [
  /* ------------------------------ month 1 ------------------------------ */
  { id:'b01', month:1, topic:'m1-elec', name:'A divider, then a transistor switch', cost:'$0 — in the simulator',
    task:'In Falstad, build a voltage divider and work out its output by hand before you run it. Then build a transistor switch that lights an LED from a logic-level input — the exact circuit that later lets a 3.3 V pin drive something hungrier than the pin can supply.',
    proof:{ readme:[
      { label:'Two voltages: the one you calculated and the one the simulator showed', re:VOLTS, min:2 },
      { label:'The transistor switch (transistor, MOSFET, NPN or BJT)', re:/transistor|mosfet|\bNPN\b|\bBJT\b/i },
    ] } },

  { id:'b02', month:1, topic:'m1-bench', name:'Measure everything', cost:'~$45–60 — a kit and a meter',
    task:'Measure a battery\'s voltage. Measure five resistors and check each against its colour bands. Then break a wire on purpose and find the break with continuity mode. It sounds trivial; it will save you more hours than anything else this month.',
    proof:{ readme:[
      { label:'A measured battery voltage', re:VOLTS },
      { label:'Five resistor readings (e.g. 4.7kΩ, 220 ohm)', re:OHMS, min:5 },
      { label:'Continuity mode used', re:/continuity/i },
    ] } },

  { id:'b03', month:1, topic:'m1-solder', name:'Header pins, three times over', cost:'~$26–36 — Pinecil and solder',
    task:'Solder header pins onto a cheap breakout and check every pin with continuity. Do it three times. Then desolder one pin and redo it — removing parts badly is how most beginners destroy boards.',
    proof:{ readme:[
      { label:'Every pin checked with continuity', re:/continuity/i },
      { label:'The desolder and resolder', re:/desolder/i },
    ] } },

  { id:'b04', month:1, topic:'m1-python', name:'The repo habit', cost:'$0',
    task:'Write a small Python script that is useful at your bench — a resistor colour-code decoder is ideal — run it from the terminal, and push it. From today every project gets a repo whose README has a photo, a wiring description, and what broke.',
    proof:{
      readme:[{ label:'A wiring, setup or usage section heading', re:/^#{1,6}\s.*\b(?:wiring|circuit|setup|hardware|usage|how to run)\b/im }],
      files:[{ label:'A Python file', re:/\.py$/i }] } },

  /* ------------------------------ month 2 ------------------------------ */
  { id:'b05', month:1, topic:'m2-arduino', name:'Reaction timer', cost:'~$20–43 — an Arduino kit',
    task:'An LED fires after a random delay, a button stops the clock, and the time prints to serial in milliseconds. Use an interrupt, debounce the button, and time it with millis() — no delay(). It has a score, so it demos in fifteen seconds of video.',
    proof:{ video:1,
      readme:[
        { label:'A reaction time in ms', re:/\d+\s*ms\b/ },
        { label:'The interrupt', re:/interrupt/i },
        { label:'Debouncing', re:/debounc/i },
      ],
      files:[FIRMWARE] } },

  { id:'b06', month:2, topic:'m2-esp32', name:'ESP32 control panel', cost:'~$16 — an ESP32-S3',
    task:'Serve a web page from the ESP32 that shows live sensor readings and has buttons that drive a servo. Open it from your phone on the same network. Wi-Fi, HTTP and asynchronous work in one project.',
    proof:{ readme:[
        { label:'The ESP32', re:/esp32/i },
        { label:'The servo', re:/servo/i },
        { label:'The web page or Wi-Fi', re:/wi-?fi|http|web ?(?:page|server)/i },
      ],
      files:[{ label:'Firmware or project source', re:/\.(?:ino|cpp|c|h|py)$|platformio\.ini$/i }] } },

  { id:'b07', month:1, topic:'m2-motors', name:'Exactly one revolution', cost:'~$35 — driver and encoder gearmotor',
    task:'Drive a DC motor forwards and backwards at five PWM speeds. Then add an encoder and write a function that turns the wheel exactly one revolution whatever the battery voltage. That second half is your first real closed loop, and it is much harder than it sounds.',
    proof:{ readme:[
        { label:'PWM', re:/\bPWM\b/i },
        { label:'Encoder counts per revolution', re:/\d+\s*(?:counts?|ticks?|CPR|pulses?)\b/i },
        { label:'Tested at two or more battery voltages', re:VOLTS, min:2 },
      ],
      files:[FIRMWARE] } },

  { id:'b08', month:1, topic:'m2-sensors', name:'Watch the drift disappear', cost:'~$13 — an MPU-6050',
    task:'Mount an IMU, print the pitch angle, hold it perfectly still and watch the number drift anyway. Add a complementary filter and watch the drift go. The most important lesson in state estimation, in twenty minutes.',
    proof:{ readme:[
        { label:'The drift, in degrees', re:DEG },
        { label:'The complementary filter', re:/complementary/i },
      ] } },

  { id:'b09', month:1, topic:'m2-robots', name:'Line follower: P, then PD', cost:'~$38 budget, ~$105 quality',
    task:'Build the line follower. Tune it with P alone, then add D and watch the oscillation disappear. Film both — the badly tuned robot next to the same robot tuned properly proves you understand the loop rather than having copied a gain.',
    proof:{ video:2, readme:[
        { label:'Your proportional gain (Kp)', re:/\bKp\b/ },
        { label:'Your derivative gain (Kd)', re:/\bKd\b/ },
      ] } },

  { id:'b10', month:2, topic:'m2-robots', name:'Self-balancing robot', cost:'~$62 budget, ~$134 quality',
    task:'Build a robot that balances on two wheels. It will not work at all until your angle filter and your loop timing are both right — and that frustration is the point.',
    proof:{ video:1, readme:[
        { label:'Your control loop rate (Hz or ms)', re:/\d+\s*(?:Hz|ms)\b/i },
        { label:'The filter you used', re:/complementary|kalman/i },
      ] } },

  /* ------------------------------ month 3 ------------------------------ */
  { id:'b11', month:2, topic:'m3-cad', name:'A bracket from the datasheet', cost:'$0 CAD, plus printing',
    task:'Model a bracket that holds the exact servo you own, with screw holes and shaft clearance taken from the manufacturer\'s drawing rather than by eye. Print it and see if it fits. It probably will not the first time; that is the lesson.',
    proof:{ readme:[
        { label:'Dimensions in mm', re:MM, min:2 },
        { label:'The datasheet', re:/datasheet/i },
      ], files:[CADFILE] } },

  { id:'b12', month:2, topic:'m3-print', name:'Know your printer', cost:'A printer or a print service',
    task:'Print the tolerance gauge and write down your machine\'s real clearances. Then design a two-part snap-fit case for your ESP32 that closes without glue, and iterate until it clicks.',
    proof:{ readme:[
        { label:'Your measured clearance (e.g. 0.2 mm)', re:/\b0?\.\d+\s*mm\b/ },
        { label:'The snap-fit', re:/snap/i },
      ], files:[CADFILE] } },

  { id:'b13', month:2, topic:'m3-transmission', name:'Backlash, measured', cost:'Printer plus a NEMA17 or hobby motor',
    task:'Design and print a planetary or cycloidal reducer, and accept that the first one will be bad. Measure its backlash by holding the output and rocking it, then redesign to reduce it.',
    proof:{ readme:[
        { label:'Backlash in degrees or arcminutes', re:DEG },
        { label:'The reduction ratio (e.g. 10:1)', re:/\d+(?:\.\d+)?\s*:\s*1\b/ },
      ], files:[CADFILE] } },

  { id:'b14', month:3, topic:'m3-arm', name:'SO-101, with fingers you designed', cost:'$122–490 by kit; $0 in MuJoCo',
    task:'Build the SO-101, calibrate every servo, and teleoperate the follower with the leader. Then design and print your own gripper fingers in TPU and test them on three objects of different shapes.',
    proof:{ video:1, readme:[
        { label:'Calibration', re:/calibrat/i },
        { label:'The TPU fingers', re:/\bTPU\b/i },
        { label:'Three objects tested', re:/\b(?:three|3)\b[^.\n]{0,40}\bobjects?\b/i },
      ], files:[CADFILE] } },

  /* ------------------------------ month 4 ------------------------------ */
  { id:'b15', month:3, topic:'m4-core', name:'A ROS 2 graph with no robot', cost:'$0',
    task:'A sensor publisher, a processing node, a service-based config node and a parameterised aggregator — with your own .msg and .srv — wired together in a Python launch file that takes arguments. Record it with ros2 bag and replay it. Proves you understand the graph, not that you can run turtlesim.',
    proof:{ readme:[{ label:'ros2 bag', re:/ros2\s+bag/i }],
      files:[
        { label:'package.xml', re:/(?:^|\/)package\.xml$/ },
        { label:'A custom message (.msg)', re:/\.msg$/ },
        { label:'A custom service (.srv)', re:/\.srv$/ },
        { label:'A Python launch file', re:/launch[^/]*\.py$/ },
      ],
      forbid:[NO_ROS1] } },

  { id:'b16', month:3, topic:'m4-urdf', name:'Your own robot, in xacro', cost:'$0',
    task:'Not TurtleBot — your design. A differential-drive base, a sensor mast and a two-axis pan-tilt head, with correct inertias and separate collision and visual geometry. Drive the joints with joint_state_publisher_gui and view the whole TF tree in RViz.',
    proof:{ readme:[
        { label:'RViz', re:/rviz/i },
        { label:'Inertias', re:/inertia/i },
      ], files:[{ label:'A .xacro file', re:/\.xacro$/i }], forbid:[NO_ROS1] } },

  { id:'b17', month:3, topic:'m4-sim', name:'Sensors in a world you built', cost:'$0',
    task:'Put your xacro robot in Gazebo with lidar and camera plugins, inside a custom SDF world with obstacles. Confirm the sensor data appears on ROS 2 topics and renders in RViz.',
    proof:{ readme:[
        { label:'Gazebo', re:/gazebo/i },
        { label:'The lidar', re:/lidar|laser ?scan/i },
        { label:'The camera', re:/camera/i },
      ],
      files:[{ label:'A world file (.sdf or .world)', re:/\.(?:sdf|world)$/i }],
      forbid:[{ label:'No Gazebo Classic commands (ign gazebo, gazebo_ros)', re:/\bign gazebo\b|roslaunch gazebo_ros/ }, NO_ROS1] } },

  { id:'b18', month:3, topic:'m4-control', name:'Drive through a controller', cost:'$0',
    task:'Add <ros2_control> tags, configure diff_drive_controller and joint_state_broadcaster in YAML, and drive the robot in Gazebo with keyboard teleop. Then write an action server that drives a commanded distance and reports progress, with feedback and cancellation.',
    proof:{ readme:[
        { label:'diff_drive_controller', re:/diff_drive_controller/ },
        { label:'Action feedback', re:/feedback/i },
        { label:'Cancellation', re:/cancel/i },
      ], files:[{ label:'Controller config (.yaml)', re:/\.ya?ml$/i }], forbid:[NO_ROS1] } },

  { id:'b19', month:3, topic:'m4-nav', name:'Map it, then navigate it', cost:'$0 in Gazebo; $250–535 on hardware',
    task:'Run SLAM Toolbox in your world, teleop around it and save the map. Switch to localization mode, send Nav2 goals from RViz, and tune the costmaps until it stops clipping corners. Record the screen.',
    proof:{ video:1, readme:[
        { label:'SLAM Toolbox', re:/slam[_ ]toolbox/i },
        { label:'Nav2', re:/nav2/i },
        { label:'Costmap tuning', re:/costmap|inflation/i },
      ], files:[{ label:'A saved map (.pgm, .posegraph or map .yaml)', re:/\.(?:pgm|posegraph)$|map[^/]*\.ya?ml$/i }] } },

  /* ------------------------------ month 5 ------------------------------ */
  { id:'b20', month:2, topic:'m5-pid', name:'Three controllers, one robot', cost:'Your balancer from month two',
    task:'On the balancer, implement P only, then PD, then PID with feedforward. Log each step response to CSV, plot all three together, and write up which you would ship and why. That plot is worth more in an interview than any certificate.',
    proof:{ readme:[
        { label:'Feedforward', re:/feed-?forward/i },
        { label:'Overshoot or settling time', re:/overshoot|settling/i },
      ], files:[{ label:'Step-response data (.csv)', re:/\.csv$/i }] } },

  { id:'b21', month:4, topic:'m5-lqr', name:'LQR against PID', cost:'$0',
    task:'Implement LQR for a simulated cart-pole in Python, then a hand-tuned PID for the same plant, and compare how each handles the same disturbance. Tedrake\'s notes give you the model — you are implementing, not deriving.',
    proof:{ readme:[
        { label:'LQR', re:/\bLQR\b/ },
        { label:'The disturbance', re:/disturbance/i },
      ], files:[PYFILE] } },

  { id:'b22', month:3, topic:'m5-kin', name:'FK by hand, IK in code', cost:'$0 with the Robotics Toolbox',
    task:'Compute your SO-101\'s forward kinematics by hand from its link lengths and check it against the Robotics Toolbox. Then write a numerical IK solver that moves the end effector to a commanded XYZ, and watch what it does near a singularity.',
    proof:{ readme:[
        { label:'Link lengths or positions (mm or m)', re:/\d+(?:\.\d+)?\s*(?:mm|m)\b/g, min:2 },
        { label:'Inverse kinematics', re:/\bIK\b|inverse kinematics/i },
        { label:'The singularity', re:/singular/i },
      ], files:[PYFILE] } },

  { id:'b23', month:4, topic:'m5-vision', name:'Pixel to position', cost:'Any webcam and a printed chessboard',
    task:'Calibrate a real camera with a printed chessboard and save the intrinsics. Detect a coloured object and estimate its 3D position relative to the camera. Then change the lighting, watch it fail, and fix it.',
    proof:{ readme:[
        { label:'Reprojection error in pixels', re:/\d+(?:\.\d+)?\s*(?:px|pixels?)\b/i },
        { label:'The lighting failure', re:/light/i },
      ], files:[{ label:'Saved intrinsics (.yaml, .json or .npz)', re:/\.(?:ya?ml|json|npz)$/i }] } },

  { id:'b24', month:4, topic:'m5-moveit', name:'Pick, place, then block it', cost:'$0',
    task:'Plan and execute a pick and place in MoveIt 2 with collision objects in the planning scene. Then put an obstacle in the only viable path and record how the planner behaves.',
    proof:{ video:1, readme:[
        { label:'MoveIt', re:/moveit/i },
        { label:'Collision objects', re:/collision/i },
      ] } },

  /* ------------------------------ month 6 ------------------------------ */
  { id:'b25', month:4, topic:'m6-lerobot', name:'Fifty demos, then fifty more', cost:'Your SO-101 pair',
    task:'Record 50 demonstrations of one simple task — a cube into a bin — train an ACT policy and deploy it. It will work about half the time. Record 50 more covering the failures and retrain. The success rate before and after, and the fact you measured it, is the portfolio piece.',
    proof:{ video:1, readme:[
        { label:'Success rate before and after (two percentages)', re:/\d+(?:\.\d+)?\s*%/g, min:2 },
        { label:'ACT', re:/\bACT\b/ },
        { label:'Your dataset on the Hugging Face Hub', re:/(?:huggingface\.co|hf\.co)\/datasets\//i },
      ] } },

  { id:'b26', month:4, topic:'m6-rl', name:'Change the reward, change the gait', cost:'$0 on Colab',
    task:'Train a quadruped locomotion policy in MuJoCo Playground from one of its Colab tutorials. Then change the reward function and show how the gait changes.',
    proof:{ video:2, readme:[{ label:'The reward change', re:/reward/i }], files:[PYFILE] } },

  { id:'b27', month:4, topic:'m6-portfolio', name:'Three READMEs, rewritten', cost:'$0',
    task:'Take your three best projects and rewrite their READMEs: a video at the top, a wiring or architecture diagram, the numbers you measured, and a section on what broke and how you fixed it. That last section is the part that cannot be faked from a tutorial.',
    /* Checked across your other builds rather than one folder: passes once three
       verified builds have a photo or video within the first lines of their README. */
    proof:{ meta:'portfolio', count:3 } },

  { id:'b28', month:4, topic:'m6-interview', name:'Survive the third question', cost:'$0 and a friend',
    task:'Have someone interrogate you about your own repo for twenty minutes — your code, not concepts. Why that gain, why that sensor, what happens when the battery sags. Write every question and your answer into INTERVIEW.md, three levels deep.',
    proof:{ doc:'INTERVIEW.md', universal:false, questions:9, words:300 } },
];

export const buildById = id => BUILDS.find(b => b.id === id);
export const buildsIn = n => BUILDS.filter(b => b.month === n);

/** XP and credits for a verified build rise with the month. */
export const buildXp = b => 200 + b.month * 100;
export const buildCoins = b => 40 + b.month * 20;

/* ------------------------------- milestones ------------------------------- */

/**
 * Each month's milestone list, from the article, mapped to things the app can
 * check. A milestone is met when every build it names is verified and every
 * skill it names is at level 3 or higher — so nobody ticks these by hand.
 */
export const MILESTONES = {
  1: [
    { text:'Read a schematic and build the circuit it describes', builds:['b01'], skills:['symbols'] },
    { text:'Check a resistor value before you plug it in', skills:['ohm', 'led', 'bands'] },
    { text:'Find a short, a break or a dead part with a multimeter', builds:['b02'], skills:['meter'] },
    { text:'Solder a clean through-hole joint and check it electrically', builds:['b03'] },
    { text:'Turn a motor exactly one revolution, whatever the battery', builds:['b07'], skills:['pwm', 'encoder'] },
    { text:'Fuse accelerometer and gyro into a stable angle', builds:['b08'], skills:['compfilter'] },
    { text:'A line follower, tuned with P and then PD, on video', builds:['b09'], skills:['pid'] },
  ],
  2: [
    { text:'A robot that balances on two wheels', builds:['b10'] },
    { text:'Tune PID from logged step responses and explain every term', builds:['b20'], skills:['pidmath'] },
    { text:'Control a robot from your phone over Wi-Fi', builds:['b06'] },
    { text:'Model a part from a datasheet with fully constrained sketches', builds:['b11'], skills:['cad'] },
    { text:'State your printer\'s real clearances from measurement', builds:['b12'], skills:['tolerance'] },
    { text:'Choose a filament and design the part for FDM', skills:['materials', 'orient'] },
    { text:'Explain backlash and show it on something you built', builds:['b13'], skills:['backlash'] },
  ],
  3: [
    { text:'A robot arm you assembled, calibrated and modified', builds:['b14'] },
    { text:'Forward kinematics by hand, inverse kinematics numerically', builds:['b22'], skills:['fk', 'rot'] },
    { text:'Explain a singularity by pointing at a robot doing it', builds:['b22'], skills:['jacobian'] },
    { text:'ROS 2 nodes using topics, services and actions', builds:['b15'], skills:['comms'] },
    { text:'Your own robot in xacro, in Gazebo, with lidar and camera', builds:['b16', 'b17'], skills:['tf', 'simchoice'] },
    { text:'Drive it through ros2_control, not raw commands', builds:['b18'], skills:['diffdrive'] },
    { text:'Map with SLAM Toolbox and navigate with Nav2', builds:['b19'], skills:['nav'] },
  ],
  4: [
    { text:'Calibrate a camera and turn a pixel into a 3D position', builds:['b23'], skills:['pinhole', 'stereo'] },
    { text:'Plan and execute a collision-free pick and place', builds:['b24'], skills:['moveit'] },
    { text:'Run LQR and PID on the same plant and compare them', builds:['b21'], skills:['control'] },
    { text:'Record a dataset and train a policy that runs on your hardware', builds:['b25'], skills:['lerobot'] },
    { text:'State your direction, and why', direction:true },
    { text:'Three portfolio projects with video, metrics and failure analysis', builds:['b27'] },
    { text:'Answer three levels of follow-up on your own code', builds:['b28'], skills:['career'] },
  ],
};

/** The three directions from the last month. Chosen, not earned — it is a decision. */
export const DIRECTIONS = [
  { id:'learning', name:'Robot learning & embodied AI', icon:'🧠',
    desc:'LeRobot, VLA fine-tuning, imitation learning, RL. Highest ceiling, most competitive.' },
  { id:'autonomy', name:'Autonomy & mobile robotics', icon:'🧭',
    desc:'ROS 2, Nav2, SLAM, perception, sensor fusion, C++. The most jobs.' },
  { id:'embedded', name:'Embedded, mechatronics & integration', icon:'🔧',
    desc:'Firmware, motor control, real-time, functional safety. The most consistently employable.' },
];
