/**
 * Skills: the things a drill can actually test.
 *
 * Each skill is a generator, not a fixed question. Numeric ones draw fresh
 * values every time, so the answer to yesterday's divider is no use today —
 * you have to do the arithmetic. Concept ones draw from a bank and the options
 * are shuffled, so position is no clue either.
 *
 * Generators receive a toolkit `t`:
 *   t.int(a, b)      inclusive integer
 *   t.pick(arr)      one element
 *   t.pickN(arr, n)  n distinct elements
 *   t.mc(bank)       one concept question from a bank of { q, a, w:[3], why }
 *
 * A numeric question is { kind:'num', q, answer, unit, dp, tol | rtol, explain }.
 * `dp` is how many decimals the explanation shows; `tol` is an absolute
 * tolerance, `rtol` a relative one (default 2%, enough to forgive rounding a
 * step early but not a wrong formula).
 *
 * Facts in the concept banks either come from the source article or are
 * standard textbook material. Nothing here asks for trivia you would look up.
 */

const r2 = v => Math.round(v * 100) / 100;
const deg = d => (d * Math.PI) / 180;
const n = (v, dp = 2) => {
  const s = Number(v.toFixed(dp));
  return s.toLocaleString('en-US', { maximumFractionDigits: dp });
};
const num = (q, answer, unit, dp, explain, tol = {}) =>
  ({ kind:'num', q, answer, unit, dp, explain, ...tol });

/* ================================ month 1 ================================ */

const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
const BANDS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
const cap = s => s[0].toUpperCase() + s.slice(1);

const ohm = t => {
  const v = t.int(0, 2);
  if (v === 0) {
    const I = t.pick([5, 10, 15, 20, 25, 30, 40, 50]), R = t.pick([100, 150, 220, 330, 470, 680, 1000]);
    const V = (I / 1000) * R;
    return num(`${I} mA flows through a ${R} Ω resistor. What voltage is across it, in volts?`,
      V, 'V', 2, `V = I × R = ${I / 1000} A × ${R} Ω = ${n(V)} V.`);
  }
  if (v === 1) {
    const V = t.pick([3.3, 5, 9, 12]), R = t.pick([220, 330, 470, 1000, 2200, 4700]);
    const I = (V / R) * 1000;
    return num(`${V} V across a ${R} Ω resistor. How much current flows, in mA?`,
      I, 'mA', 2, `I = V / R = ${V} V / ${R} Ω = ${n(I / 1000, 4)} A = ${n(I)} mA.`);
  }
  const V = t.pick([3.3, 5, 9, 12]), I = t.pick([10, 20, 25, 50, 100]);
  const R = V / (I / 1000);
  return num(`You need exactly ${I} mA to flow with ${V} V across a resistor. What resistance, in ohms?`,
    R, 'Ω', 1, `R = V / I = ${V} V / ${I / 1000} A = ${n(R, 1)} Ω.`);
};

const divider = t => {
  if (t.int(0, 1) === 0) {
    const Vin = t.pick([3.3, 5, 9, 12]);
    const [R1, R2] = t.pickN([1, 2.2, 3.3, 4.7, 10, 22, 47], 2);
    const Vout = Vin * R2 / (R1 + R2);
    return num(`A divider has R1 = ${R1} kΩ on top and R2 = ${R2} kΩ to ground, fed from ${Vin} V. What is Vout, in volts?`,
      Vout, 'V', 2, `Vout = Vin × R2 / (R1 + R2) = ${Vin} × ${R2} / ${r2(R1 + R2)} = ${n(Vout)} V.`);
  }
  const [Vin, Vout] = t.pick([[5, 3.3], [12, 5], [9, 3.3], [12, 3.3], [5, 2.5]]);
  const R1 = t.pick([1, 2.2, 4.7, 10]);
  const R2 = R1 * Vout / (Vin - Vout);
  return num(`You want ${Vout} V out of a ${Vin} V supply. R1 on top is ${R1} kΩ. What should R2 to ground be, in kΩ?`,
    R2, 'kΩ', 2, `From Vout = Vin·R2/(R1+R2): R2 = R1 × Vout / (Vin − Vout) = ${R1} × ${Vout} / ${r2(Vin - Vout)} = ${n(R2)} kΩ.`);
};

const LEDS = [['red', 2.0], ['yellow', 2.1], ['green', 2.2], ['blue', 3.0], ['white', 3.0]];
const led = t => {
  let Vs, colour, Vf;
  do { Vs = t.pick([3.3, 5, 9, 12]); [colour, Vf] = t.pick(LEDS); } while (Vs - Vf < 1);
  const I = t.pick([10, 15, 20]);
  if (t.int(0, 1) === 0) {
    const R = (Vs - Vf) / (I / 1000);
    return num(`A ${colour} LED (forward voltage ${Vf} V) runs from ${Vs} V at ${I} mA. What series resistor, in ohms?`,
      R, 'Ω', 0, `R = (Vs − Vf) / I = (${Vs} − ${Vf}) V / ${I / 1000} A = ${n(R, 0)} Ω.`);
  }
  const P = (Vs - Vf) * I;
  return num(`A ${colour} LED (Vf ${Vf} V) runs from ${Vs} V at ${I} mA through its resistor. How much power does the resistor burn, in mW?`,
    P, 'mW', 1, `The resistor drops ${r2(Vs - Vf)} V at ${I} mA: P = V × I = ${r2(Vs - Vf)} × ${I} = ${n(P, 1)} mW.`);
};

const bands = t => {
  const base = t.pick(E12), mult = t.int(0, 4);
  const value = base * 10 ** mult;
  const d1 = Math.floor(base / 10), d2 = base % 10;
  const names = [BANDS[d1], BANDS[d2], BANDS[mult]].map(cap).join(', ');
  const pretty = value >= 1e6 ? `${value / 1e6} MΩ` : value >= 1000 ? `${value / 1000} kΩ` : `${value} Ω`;
  return num(`A four-band resistor reads ${names}, Gold. What is its value, in ohms? (4.7k style is fine.)`,
    value, 'Ω', 0, `Digits ${d1} and ${d2}, multiplier ×${10 ** mult}: ${base} × ${10 ** mult} = ${value.toLocaleString('en-US')} Ω (${pretty}). Gold means ±5%.`,
    { rtol: 0 });
};

const lipo = t => {
  const v = t.int(0, 3);
  if (v === 0) {
    const s = t.pick([1, 2, 3, 4, 6]);
    return num(`A ${s}S LiPo is fully charged. What is its voltage?`, 4.2 * s, 'V', 1,
      `A LiPo cell is 4.2 V full, so ${s} cells in series is ${s} × 4.2 = ${n(4.2 * s, 1)} V.`);
  }
  if (v === 1) {
    const s = t.pick([1, 2, 3, 4, 6]);
    return num(`What is the nominal voltage of a ${s}S LiPo pack?`, 3.7 * s, 'V', 1,
      `Nominal is 3.7 V per cell: ${s} × 3.7 = ${n(3.7 * s, 1)} V.`);
  }
  if (v === 2) {
    const mah = t.pick([1000, 1300, 1500, 2200, 3000, 5000]), C = t.pick([20, 25, 30, 45, 60]);
    const A = (mah / 1000) * C;
    return num(`A ${mah} mAh pack is rated ${C}C continuous. What is its maximum continuous current, in amps?`,
      A, 'A', 1, `Max current = capacity (Ah) × C = ${mah / 1000} × ${C} = ${n(A, 1)} A.`);
  }
  const mah = t.pick([1000, 1500, 2200, 3000, 5000]), ma = t.pick([250, 500, 750, 1100, 1500]);
  const min = (mah / ma) * 60;
  return num(`A ${mah} mAh battery powers a robot averaging ${ma} mA. Ideal runtime, in minutes?`,
    min, 'min', 0, `${mah} mAh / ${ma} mA = ${n(mah / ma)} h = ${n(min, 0)} min. In practice plan on less — you should not drain a LiPo flat.`);
};

const stall = t => t.mc([
  { q:'Your microcontroller resets every time the drive motor stalls. The most likely cause?',
    a:'The stall current drags the supply below the microcontroller\'s brownout threshold',
    w:['The motor\'s magnetic field erases the program memory', 'The PWM frequency is too high for the chip', 'The motor driver sends data into the reset pin'],
    why:'A stalled motor draws its full stall current. The battery or regulator sags, the microcontroller sees undervoltage, and it resets.' },
  { q:'A regulator is rated 1 A. The motor draws 0.3 A running and 1.8 A stalled. What happens at stall?',
    a:'The regulator cannot supply it — the rail sags or it shuts down, taking everything on it too',
    w:['Nothing — it only supplies what is asked for', 'The motor is automatically limited to 1 A with no side effects', 'The spare current flows back into the battery'],
    why:'Asking a regulator for more than its rating collapses the rail or trips its protection, and everything sharing that rail browns out.' },
  { q:'Best first fix for a motor that browns out your microcontroller?',
    a:'Power the motor from its own supply, sharing only ground with the logic',
    w:['Lower the serial baud rate', 'Use a longer USB cable', 'Add a pull-up to the reset pin'],
    why:'Separating the motor supply stops its current surges sagging the logic rail. Bulk capacitance near the driver helps too.' },
  { q:'Why must the motor supply and the logic supply share a ground?',
    a:'Logic levels are measured against ground — without a common reference the driver cannot read the signals',
    w:['Ground carries the PWM signal', 'It doubles the battery life', 'It stops the motor spinning backwards'],
    why:'A voltage only means something relative to a reference. Two supplies with separate grounds disagree about what "high" is.' },
]);

const pullup = t => t.mc([
  { q:'A button connects a pin to GND, and the pin has its internal pull-up enabled. What does it read while pressed?',
    a:'LOW', w:['HIGH', 'It alternates every loop', 'Whatever was last written to it'],
    why:'The pull-up holds the pin HIGH; pressing connects it straight to ground, so it reads LOW.' },
  { q:'Same button to GND with the internal pull-up — what does it read when nobody is touching it?',
    a:'HIGH', w:['LOW', 'Random values', '0.5 V'],
    why:'With the button open the only path is the pull-up to the supply, so the pin sits HIGH.' },
  { q:'A button connects a pin to 3.3 V, with a 10 kΩ resistor from the pin to ground. Pressed, it reads:',
    a:'HIGH', w:['LOW', 'Floating', 'It shorts the supply'],
    why:'That is a pull-down: LOW at rest, HIGH when the button connects the pin to 3.3 V.' },
  { q:'An input pin with nothing connected and no pull resistor reads…',
    a:'Unpredictably — it floats and picks up noise', w:['Always LOW', 'Always HIGH', 'The last value it read'],
    why:'A floating input has no defined voltage and flips with noise, touch and nearby signals. Pull it up or down.' },
  { q:'Why is a pull-up a resistor rather than a wire to 3.3 V?',
    a:'So pressing the button to ground does not short the supply', w:['Wires cannot carry 3.3 V', 'To make the pin read faster', 'Resistors store the button state'],
    why:'The resistor limits the current that flows when the button pulls the pin to ground. A wire would be a dead short.' },
]);

const decouple = t => t.mc([
  { q:'Where does a decoupling capacitor go?', a:'As close as possible to the IC\'s power pin, to ground',
    w:['Next to the battery connector', 'In series with the power line', 'Across the data lines'],
    why:'It only helps if the current it supplies does not have to travel far — trace inductance defeats a distant capacitor.' },
  { q:'What does a decoupling capacitor do?', a:'Supplies fast bursts of current locally and shunts supply noise to ground',
    w:['Stores the program between resets', 'Limits the current into the IC', 'Converts AC mains to DC'],
    why:'Chips draw current in sharp spikes. A small capacitor right at the pin supplies them, so the rail stays clean.' },
  { q:'The usual per-pin decoupling capacitor is…', a:'100 nF ceramic', w:['100 µF electrolytic', '1 F supercapacitor', '1 pF'],
    why:'100 nF ceramic is the standard. Larger electrolytics are used as bulk capacitance near power entry and motor drivers.' },
]);

const symbols = t => t.mc([
  { q:'Which part blocks steady DC but passes changing signals?', a:'Capacitor', w:['Resistor', 'Diode', 'Inductor'],
    why:'A capacitor charges up and then passes no DC; changes pass through it. An inductor does roughly the opposite.' },
  { q:'Which part lets current flow in one direction only?', a:'Diode', w:['Capacitor', 'Resistor', 'Potentiometer'],
    why:'A diode conducts forward and blocks reverse — which is why it goes across a motor as a flyback path.' },
  { q:'Which part lets a small current or voltage switch a much larger one?', a:'Transistor', w:['Diode', 'Capacitor', 'Fuse'],
    why:'A transistor (BJT or MOSFET) is the switch between a 3.3 V logic pin and a load that needs more current.' },
  { q:'On a schematic, Vcc labels…', a:'The positive supply rail', w:['Ground', 'A clock signal', 'An analog input'],
    why:'Vcc (or Vdd) is the positive supply. Ground is the reference everything is measured against.' },
  { q:'Three horizontal lines stacked, each shorter than the one above, is the symbol for…', a:'Ground', w:['A battery', 'A capacitor', 'An antenna'],
    why:'That stack is ground. A battery is long and short plates alternating; a capacitor is two parallel plates.' },
]);

const meter = t => t.mc([
  { q:'To measure current, the multimeter goes…', a:'In series, so the current flows through the meter',
    w:['In parallel, across the load', 'Across the battery terminals', 'On ground, the other probe floating'],
    why:'An ammeter measures what passes through it, so you break the circuit and put the meter in the gap.' },
  { q:'To measure voltage, the multimeter goes…', a:'In parallel, across the two points', w:['In series with the load', 'Between the load and the switch only', 'Anywhere — it does not matter'],
    why:'Voltage is a difference between two points, so the probes go on those two points.' },
  { q:'Resistance should be measured with the circuit…', a:'Unpowered', w:['Powered at full voltage', 'Powered at half voltage', 'Connected to the charger'],
    why:'The meter drives its own small current to measure resistance. A powered circuit corrupts the reading and can damage the meter.' },
  { q:'You measured current with the probes straight across a battery, and the current range now reads nothing. Why?',
    a:'You shorted the battery through the meter and blew its fuse', w:['The battery is now full', 'Current mode needs a warm-up', 'The probes are reversed'],
    why:'On the current range the meter is nearly a short. Across a battery that is a short circuit, and the internal fuse does its job.' },
  { q:'Continuity mode beeps when…', a:'The resistance between the probes is very low — they are connected', w:['The voltage is above 5 V', 'A capacitor is charging', 'The battery is flat'],
    why:'It is a fast yes/no for "are these two points connected?" — perfect for finding a broken wire or a solder bridge.' },
]);

const solder = t => t.mc([
  { q:'The correct way to make a through-hole joint:', a:'Heat the pad and the lead together, then feed solder into the joint',
    w:['Melt solder on the tip and carry it to the joint', 'Heat the solder until it runs, then touch the pad', 'Blow on the joint to set it faster'],
    why:'The parts must be hot enough to melt the solder themselves — that is what makes it wet the pad rather than sit on top.' },
  { q:'A dull, grainy, balled-up joint is…', a:'A cold joint — the solder never wetted the pad', w:['Ideal — shiny joints are overheated', 'A lead-free joint, and fine', 'Too much flux'],
    why:'A good joint is a smooth concave fillet. A lumpy ball sitting on the pad is unreliable and may barely connect.' },
  { q:'Solder beads up and refuses to flow onto a pad. What do you try first?', a:'Flux', w:['A higher-voltage iron', 'Pressing harder', 'Thicker solder'],
    why:'Oxidation stops solder wetting. Flux strips it, and fixes most problems beginners blame on the iron.' },
  { q:'"Tinning the tip" means…', a:'Coating the clean, hot tip with a thin layer of solder', w:['Wrapping the tip in tin foil', 'Filing the tip to a point', 'Cooling the tip in water'],
    why:'A tinned tip conducts heat into the joint far better and resists oxidising.' },
]);

const cli = t => t.mc([
  { q:'Which command stages your changes for the next commit?', a:'git add', w:['git push', 'git fetch', 'git init'],
    why:'git add stages, git commit records, git push sends it to GitHub.' },
  { q:'Search for text inside files from the terminal:', a:'grep', w:['cd', 'ls', 'ssh'],
    why:'grep -r "text" . searches recursively. You will use it constantly in ROS workspaces.' },
  { q:'Create an isolated Python environment for a project:', a:'python -m venv .venv', w:['pip freeze > env', 'git init .venv', 'cd venv'],
    why:'A virtual environment keeps each project\'s packages separate, so one install cannot break another.' },
  { q:'Log into a Raspberry Pi on your network:', a:'ssh', w:['grep', 'curl', 'git clone'],
    why:'ssh user@host gives you a shell on the other machine — how you work on a robot\'s onboard computer.' },
  { q:'See the commit history of a repo:', a:'git log', w:['git status', 'git diff', 'git stash'],
    why:'git log shows commits; status shows what is changed right now; diff shows the changes themselves.' },
  { q:'Create a new branch and switch to it:', a:'git switch -c name', w:['git branch -d name', 'git merge name', 'git fetch name'],
    why:'switch -c creates and checks out in one step. branch -d deletes, merge combines.' },
]);

/* ================================ month 2 ================================ */

const pwm = t => {
  const v = t.int(0, 2);
  if (v === 0) {
    const duty = t.pick([10, 20, 25, 30, 40, 50, 60, 75, 80, 90]), Vs = t.pick([5, 6, 7.4, 9, 12]);
    const avg = (duty / 100) * Vs;
    return num(`A motor is driven from ${Vs} V at ${duty}% PWM duty. What average voltage does it see?`,
      avg, 'V', 2, `Average = duty × supply = ${duty / 100} × ${Vs} V = ${n(avg)} V.`);
  }
  if (v === 1) {
    const duty = t.pick([10, 20, 25, 40, 50, 60, 75, 90]);
    const val = Math.round((duty / 100) * 255);
    return num(`With 8-bit PWM, what value do you pass to analogWrite() for ${duty}% duty?`,
      val, '', 0, `8-bit runs 0–255, so ${duty}% × 255 = ${n((duty / 100) * 255, 1)} → ${val}.`, { tol: 1 });
  }
  const val = t.int(20, 240);
  const duty = (val / 255) * 100;
  return num(`analogWrite(pin, ${val}) on an 8-bit PWM pin. What duty cycle is that, in percent?`,
    duty, '%', 1, `${val} / 255 = ${n(duty / 100, 3)} = ${n(duty, 1)}%.`, { tol: 0.5 });
};

const encoder = t => {
  const cpr = t.pick([12, 16, 20, 48, 64]), ratio = t.pick([20, 30, 34, 50, 75, 100]);
  const perRev = cpr * ratio;
  const v = t.int(0, 2);
  if (v === 0) {
    return num(`An encoder gives ${cpr} counts per motor revolution, and the gearbox is ${ratio}:1. Counts per wheel revolution?`,
      perRev, 'counts', 0, `The motor turns ${ratio} times per wheel turn: ${cpr} × ${ratio} = ${perRev} counts.`, { rtol: 0 });
  }
  const d = t.pick([32, 42, 60, 65, 70, 80]);
  if (v === 1) {
    const mm = (Math.PI * d) / perRev;
    return num(`A ${d} mm wheel, ${perRev} counts per wheel revolution. Distance per count, in mm?`,
      mm, 'mm', 3, `Circumference = π × ${d} = ${n(Math.PI * d)} mm; ÷ ${perRev} = ${n(mm, 3)} mm per count.`);
  }
  const dist = t.pick([100, 250, 500, 1000]);
  const counts = (dist / (Math.PI * d)) * perRev;
  return num(`A ${d} mm wheel with ${perRev} counts per revolution. How many counts to drive ${dist} mm?`,
    counts, 'counts', 0, `${dist} / (π × ${d}) = ${n(dist / (Math.PI * d), 3)} revolutions × ${perRev} = ${n(counts, 0)} counts.`);
};

const timing = t => t.mc([
  { q:'Why does delay() ruin robots?', a:'It blocks the loop — nothing else runs while it waits',
    w:['It uses too much memory', 'It only works on the ESP32', 'It changes the PWM frequency'],
    why:'During delay() nothing reads sensors, buttons or runs control. Schedule with millis() instead.' },
  { q:'The rollover-safe way to run something every 20 ms with millis():', a:'if (millis() - last >= 20)',
    w:['if (millis() >= last + 20)', 'delay(20)', 'if (millis() % 20 == 0)'],
    why:'Subtracting unsigned values stays correct across the ~49-day rollover; comparing against last + 20 does not.' },
  { q:'Why catch a button with an interrupt rather than polling it in loop()?', a:'The interrupt catches the press even while the loop is busy',
    w:['Interrupts use less power than digitalRead', 'Polling is not allowed on Arduino', 'Interrupts debounce automatically'],
    why:'A slow loop can miss a short press entirely. An interrupt fires on the edge whatever the loop is doing.' },
  { q:'One press of a button registers as several. Why?', a:'Contact bounce — the contacts chatter for a few milliseconds',
    w:['The pull-up is too strong', 'Serial is too slow', 'The interrupt is on the wrong pin'],
    why:'Mechanical contacts bounce. Ignore edges for a few ms after the first one — that is debouncing.' },
  { q:'Inside an interrupt handler you should…', a:'Do as little as possible — set a flag or save a timestamp, and return',
    w:['Print to Serial and wait for a reply', 'Call delay() to debounce', 'Redraw the whole display'],
    why:'While a handler runs, other interrupts and timing can stall. Do the work in loop() when you see the flag.' },
]);

const buses = t => t.mc([
  { q:'I2C uses which wires?', a:'SDA and SCL, shared by every device, each device with its own address',
    w:['MOSI, MISO, SCK and a chip-select per device', 'TX and RX, crossed over', 'One dedicated wire per device'],
    why:'I2C is a two-wire shared bus; devices are told apart by address. The address is in the datasheet.' },
  { q:'SPI chooses which device is talking by…', a:'A chip-select line for each device', w:['An address in the first byte', 'The clock speed', 'Which ground it uses'],
    why:'SPI shares MOSI, MISO and SCK, and each device gets its own chip-select pulled low to talk.' },
  { q:'Two I2C sensors have the same fixed address. The fix:', a:'Change one via its address pin, or add an I2C multiplexer',
    w:['Swap SDA and SCL on one of them', 'Raise the bus speed', 'Give them separate grounds'],
    why:'Two devices on one address collide. Many breakouts have an address-select pin; otherwise a mux such as the TCA9548A.' },
  { q:'The I2C lines need…', a:'Pull-up resistors, because the bus is open-drain', w:['Pull-down resistors', 'Series capacitors', 'Nothing at all'],
    why:'Devices only pull the lines low; pull-ups bring them high. Many breakout boards already include them.' },
  { q:'UART between two boards is wired…', a:'TX to RX and RX to TX, with a shared ground', w:['TX to TX and RX to RX', 'SDA to SDA and SCL to SCL', 'Only TX to TX'],
    why:'One board\'s transmit is the other\'s receive. And, as always, the grounds must be common.' },
]);

const mcu = t => t.mc([
  { q:'Why not run a balancing control loop in MicroPython?', a:'Garbage-collection pauses make the loop timing unpredictable',
    w:['MicroPython cannot read an IMU', 'It only runs on the Uno', 'It has no floating point'],
    why:'A balancing loop needs steady timing. A GC pause at the wrong moment and the robot falls over.' },
  { q:'When do you move from the Arduino framework to ESP-IDF?', a:'When you need real control of tasks, cores, power and timing',
    w:['As soon as you use Wi-Fi', 'Never — ESP-IDF is deprecated', 'When the sketch exceeds 100 lines'],
    why:'Arduino gets you to a working robot fastest; ESP-IDF is the full toolchain when you outgrow that layer.' },
  { q:'Something an ESP32 has that an Arduino Uno does not:', a:'Wi-Fi, Bluetooth and two cores', w:['5 V logic on every pin', 'A built-in motor driver', 'An operating system with a desktop'],
    why:'More processing, two cores and wireless, for less money than an Uno.' },
  { q:'ESP32 GPIO pins work at…', a:'3.3 V logic', w:['5 V logic', '12 V logic', '1.2 V logic'],
    why:'Feeding 5 V into an ESP32 pin can damage it. Level-shift 5 V signals first.' },
]);

const drivers = t => {
  if (t.int(0, 2) === 0) {
    const Vs = t.pick([6, 7.4, 9, 11.1, 12]);
    return num(`An L298N drops roughly 2 V across its output stage. From a ${Vs} V pack, about what reaches the motor?`,
      Vs - 2, 'V', 1, `${Vs} − 2 = ${n(Vs - 2, 1)} V — and those 2 V become heat in the driver, straight out of your battery.`, { tol: 0.3 });
  }
  return t.mc([
    { q:'Why replace the L298N with a TB6612FNG or DRV8833?', a:'The L298N is a bipolar H-bridge that drops about 2 V, runs hot and wastes battery',
      w:['The L298N cannot reverse a motor', 'The L298N only works with steppers', 'The L298N needs a 24 V supply'],
      why:'Newer MOSFET drivers lose far less voltage and heat. Learn the L298N because tutorials use it, then move on.' },
    { q:'An H-bridge reverses a DC motor by…', a:'Swapping which motor terminal goes to supply and which to ground',
      w:['Inverting the PWM duty', 'Lowering the voltage', 'Moving the signal to a different pin'],
      why:'The four switches of an H-bridge let current flow through the motor either way round.' },
    { q:'Both switches on one side of an H-bridge turn on at once. Result?', a:'Shoot-through — the supply is shorted to ground',
      w:['The motor brakes gently', 'The motor runs at double speed', 'Nothing, it is a normal state'],
      why:'That is a dead short through the driver. Good drivers insert dead time to make it impossible.' },
  ]);
};

const actuators = t => t.mc([
  { q:'Open-loop absolute positioning with high holding torque:', a:'Stepper motor', w:['Brushed DC gearmotor', 'Hobby servo', 'Smart serial bus servo'],
    why:'A stepper moves a known angle per step and holds hard — no feedback needed unless it skips.' },
  { q:'Daisy-chained, with position, velocity and current feedback:', a:'Smart serial bus servo', w:['Hobby servo', 'Stepper motor', 'Brushed DC gearmotor'],
    why:'Bus servos like the STS3215 report their state over one shared line — what modern low-cost arms use.' },
  { q:'Cheap, needs an H-bridge, no position feedback unless you add an encoder:', a:'Brushed DC gearmotor', w:['Stepper motor', 'Smart serial bus servo', 'Hobby servo'],
    why:'The default for a first rover. Add an encoder and you can close a loop around it.' },
  { q:'Internal closed loop, about 180° of travel, no feedback out:', a:'Hobby servo', w:['Smart serial bus servo', 'Stepper motor', 'Brushed DC gearmotor'],
    why:'You send an angle and trust it; you cannot read back where it actually got to.' },
]);

const sensors = t => t.mc([
  { q:'Soft, sound-absorbing surfaces fool which range sensor?', a:'Ultrasonic (HC-SR04)', w:['Time-of-flight laser (VL53L0X)', 'Lidar', 'An encoder'],
    why:'Ultrasonic needs an echo; soft surfaces swallow it. Its wide cone also picks up things to the side.' },
  { q:'Narrow cone and no double-echo problems:', a:'Time-of-flight laser', w:['Ultrasonic', 'Accelerometer', 'Hall-effect sensor'],
    why:'A ToF sensor times light over a narrow cone, so it sees what it points at.' },
  { q:'Which IMU hands you an already-fused orientation?', a:'BNO085', w:['MPU-6050', 'HC-SR04', 'VL53L0X'],
    why:'The BNO085 fuses on-chip and outputs a quaternion. With the MPU-6050 you do the fusion — which is the point of learning on it.' },
  { q:'Gyroscope vs accelerometer for measuring tilt:', a:'The gyro is smooth but drifts; the accelerometer does not drift but is noisy',
    w:['Both drift equally', 'The accelerometer drifts; the gyro is noisy', 'Neither can measure tilt'],
    why:'Integrating the gyro accumulates error; the accelerometer is jolted by motion. A filter combines the good halves.' },
]);

const compfilter = t => {
  if (t.int(0, 3) === 0) {
    return t.mc([{ q:'In angle = a·(angle + gyro·dt) + (1 − a)·accelAngle, with a ≈ 0.98, what does a set?',
      a:'How much you trust the gyro short-term vs the accelerometer long-term',
      w:['The loop rate in Hz', 'The accelerometer\'s range', 'How fast the motor responds'],
      why:'High a follows the smooth gyro moment to moment, while the small accelerometer share slowly pulls out the drift.' }]);
  }
  const a = t.pick([0.95, 0.96, 0.98, 0.99]);
  const prev = t.int(-10, 10), gyro = t.int(-60, 60), dt = t.pick([0.005, 0.01, 0.02]);
  const acc = prev + t.int(-5, 5);
  const next = a * (prev + gyro * dt) + (1 - a) * acc;
  return num(`Complementary filter, a = ${a}, dt = ${dt} s. The angle was ${prev}°, the gyro reads ${gyro}°/s and the accelerometer says ${acc}°. New angle, in degrees? (3 decimals)`,
    next, '°', 3, `${a} × (${prev} + ${gyro} × ${dt}) + ${r2(1 - a)} × ${acc} = ${a} × ${n(prev + gyro * dt, 3)} + ${n((1 - a) * acc, 3)} = ${n(next, 3)}°.`,
    { tol: 0.01 });
};

const pid = t => t.mc([
  { q:'Your line follower overshoots and wobbles around the line. Which term helps most?', a:'D — it damps the rate of change',
    w:['I — it accumulates error', 'Remove P entirely', 'Raise the PWM frequency'],
    why:'The derivative term pushes against fast changes in error, which is exactly what damps an oscillation.' },
  { q:'It settles slightly off the line and never corrects the last bit. Which term?', a:'I — it accumulates the remaining error',
    w:['D', 'Lower P', 'None — that is normal'],
    why:'A small constant error produces a small constant P output that may not be enough. I keeps adding until it is gone.' },
  { q:'It responds sluggishly and swings wide on curves.', a:'Increase P', w:['Increase D', 'Add I only', 'Lower the loop rate'],
    why:'P is the main stiffness. Too little and the robot barely reacts to the error.' },
  { q:'Adding D made the motors buzz and twitch.', a:'D amplifies sensor noise — filter it or lower Kd',
    w:['D needs a higher voltage', 'D only works with an I term', 'The motors are wired backwards'],
    why:'Differentiating a noisy signal makes noise bigger. A low-pass on the derivative is the standard fix.' },
  { q:'Against a constant load, which controller leaves a steady-state error?', a:'P alone', w:['PI', 'PID', 'I alone'],
    why:'Proportional control needs some error to produce any output, so it settles short. The integral term removes that.' },
]);

/* ================================ month 3 ================================ */

const gears = t => {
  const v = t.int(0, 2);
  if (v === 0) {
    const rpm = t.pick([3000, 6000, 9000, 12000]), ratio = t.pick([10, 20, 30, 50, 100]);
    return num(`A motor spins at ${rpm} rpm into a ${ratio}:1 gearbox. Output speed, in rpm?`, rpm / ratio, 'rpm', 1,
      `Output = ${rpm} / ${ratio} = ${n(rpm / ratio, 1)} rpm.`);
  }
  if (v === 1) {
    const T = t.pick([0.2, 0.3, 0.5, 0.8]), ratio = t.pick([10, 20, 30, 50]), eff = t.pick([0.7, 0.8, 0.9]);
    const out = T * ratio * eff;
    return num(`A motor makes ${T} kg·cm through a ${ratio}:1 gearbox that is ${Math.round(eff * 100)}% efficient. Output torque, in kg·cm?`,
      out, 'kg·cm', 2, `${T} × ${ratio} × ${eff} = ${n(out)} kg·cm. The gearbox trades speed for torque and keeps some as friction.`);
  }
  const a = t.pick([3, 4, 5]), b = t.pick([5, 6, 8]), rpm = t.pick([3000, 6000, 9600]);
  return num(`Two gear stages, ${a}:1 then ${b}:1, driven at ${rpm} rpm. Output speed, in rpm?`, rpm / (a * b), 'rpm', 1,
    `Stages multiply: ${a} × ${b} = ${a * b}:1, so ${rpm} / ${a * b} = ${n(rpm / (a * b), 1)} rpm.`);
};

const backlash = t => t.mc([
  { q:'Backlash is…', a:'Free play in a transmission — the output moves a little before the gears engage',
    w:['Heat build-up in a motor', 'Electrical noise from brushes', 'A gearbox running backwards'],
    why:'Hold the output and rock it: the slack you feel is backlash.' },
  { q:'Why can software not fully fix backlash?', a:'Inside the play the output is not driven, so the controller can neither see nor push it',
    w:['Microcontrollers are too slow', 'Encoders cannot count backwards', 'It can — any PID removes it'],
    why:'An encoder on the motor sees the motor, not the loose output. You can compensate, but not remove the play.' },
  { q:'Which drive usually has the least backlash?', a:'Direct drive', w:['A cheap spur gearbox', 'A plastic servo gearset', 'A loose belt'],
    why:'No gears, no mesh, no play — at the cost of needing a motor with enough torque on its own.' },
  { q:'The first thing to fail on a cheap servo arm:', a:'The plastic gearset', w:['The PWM signal', 'The metal horn screw', 'The case'],
    why:'Plastic teeth strip under shock loads and sustained torque long before anything else gives.' },
]);

const materials = t => t.mc([
  { q:'The default material for a real robot part that has to survive a drop:', a:'PETG', w:['PLA', 'TPU', 'Nylon'],
    why:'PETG is tough with much better layer adhesion than PLA. PLA is stiffer but brittle.' },
  { q:'A bracket right next to a hot motor:', a:'ABS or ASA', w:['PLA', 'TPU', 'PETG'],
    why:'PLA softens around 55–60 °C. ABS and ASA take heat — but warp without an enclosure.' },
  { q:'Compliant gripper fingers and bumpers:', a:'TPU', w:['PLA', 'Carbon-fibre filled', 'ABS'],
    why:'TPU is flexible, so fingers conform to objects and bumpers absorb hits.' },
  { q:'Carbon-fibre filled filament needs…', a:'A hardened nozzle — it is abrasive', w:['A heated chamber at 200 °C', 'Glue on the bed', 'Nothing special'],
    why:'The fibres wear a brass nozzle out quickly.' },
  { q:'Prototype brackets, jigs and the SO-101 arm itself:', a:'PLA or PLA+', w:['TPU', 'Nylon', 'ASA'],
    why:'Easy to print and the stiffest of the easy materials. It creeps under sustained load, which matters later.' },
]);

const tolerance = t => {
  if (t.int(0, 1) === 0) {
    const shaft = t.pick([3, 5, 8, 10]), c = t.pick([0.15, 0.2, 0.25, 0.3]);
    return num(`Your tolerance gauge says a sliding fit needs ${c} mm extra on the diameter. What hole diameter do you model for a ${shaft} mm shaft?`,
      shaft + c, 'mm', 2, `${shaft} + ${c} = ${n(shaft + c)} mm. Use your printer's measured number, never a generic one.`, { tol: 0.005 });
  }
  const price = t.pick([18, 20, 22, 25]), g = t.pick([40, 85, 140, 260]);
  const cost = price * g / 1000;
  return num(`Filament costs $${price} per kg. A part uses ${g} g. Material cost, in dollars?`, cost, '$', 2,
    `${g} g is ${g / 1000} kg; × $${price} = $${n(cost)}. Cheap enough that iterating at home wins.`, { tol: 0.01 });
};

const cad = t => t.mc([
  { q:'Why fully constrain a sketch?', a:'An under-constrained sketch moves when you edit something else later',
    w:['It prints faster', 'The slicer needs constraints', 'It uses less memory'],
    why:'Unconstrained geometry drifts when a dimension elsewhere changes — and ruins a part you thought was finished.' },
  { q:'Which file do you send someone who will edit your design in their CAD tool?', a:'STEP', w:['STL', 'G-code', 'PNG'],
    why:'STEP keeps true geometry. STL is a triangle mesh for the slicer, and painful to edit.' },
  { q:'Parametric design means…', a:'Dimensions are driven by variables, so changing one updates the whole part',
    w:['Every part is a separate file', 'You design by sculpting a mesh', 'The part is generated by AI'],
    why:'Change the servo width variable and every hole and wall follows it.' },
  { q:'Where do a bracket\'s screw-hole positions come from?', a:'The manufacturer\'s datasheet drawing', w:['Measuring the servo by eye', 'The slicer defaults', 'A random online model'],
    why:'Designing from the datasheet is the difference between a part that fits and a part you sand down.' },
]);

const orient = t => t.mc([
  { q:'A printed part is weakest…', a:'Between layers — along the print\'s Z axis', w:['Along the layer lines', 'In the infill only', 'Equally in every direction'],
    why:'Layers are fused, not continuous. Loads that peel layers apart break parts that would survive the same load along the layers.' },
  { q:'So you orient a bracket so the main load…', a:'Runs along the layers, not trying to peel them apart',
    w:['Pulls straight between layers', 'Hits the infill head-on', 'Is ignored — orientation does not matter'],
    why:'Same part, same material, very different strength depending on how it sat on the bed.' },
  { q:'Overhangs steeper than about 45° from vertical usually need…', a:'Supports, or a redesign so they are not needed', w:['A slower fan', 'More infill', 'Nothing'],
    why:'Designing out overhangs — chamfers instead of flat ceilings — beats cleaning supports off every print.' },
]);

const torque = t => {
  const g = t.pick([100, 150, 200, 250, 300, 500]), cm = t.pick([10, 15, 20, 25, 30]);
  if (t.int(0, 1) === 0) {
    return num(`A servo holds ${g} g at the end of a ${cm} cm arm, arm weight ignored. Torque needed, in kg·cm?`,
      (g / 1000) * cm, 'kg·cm', 2, `${g / 1000} kg × ${cm} cm = ${n((g / 1000) * cm)} kg·cm. An STS3215 is rated 30 kg·cm — stall, not continuous.`);
  }
  const Nm = (g / 1000) * 9.81 * (cm / 100);
  return num(`${g} g held at ${cm} cm from the joint, arm weight ignored. Torque, in N·m? (g = 9.81)`,
    Nm, 'N·m', 3, `${g / 1000} kg × 9.81 × ${cm / 100} m = ${n(Nm, 3)} N·m.`);
};

/* ================================ month 4 ================================ */

const ROS1 = ['catkin_make', 'roscore', 'rosrun turtlesim turtlesim_node', 'import rospy', 'roslaunch my_pkg robot.launch', 'rospy.init_node("talker")'];
const ROS2 = ['colcon build --symlink-install', 'ros2 run turtlesim turtlesim_node', 'import rclpy', 'ros2 launch my_pkg robot.launch.py', 'rclpy.init()', 'ros2 bag record -a'];
const ros1 = t => {
  if (t.int(0, 1) === 0) {
    const [a] = t.pickN(ROS2, 1);
    return t.mc([{ q:'Only one of these is ROS 2. Which?', a, w:t.pickN(ROS1, 3),
      why:'ROS 2: colcon build, ros2 run, rclpy and Python launch files. The rest is ROS 1 — dead since May 2025.' }]);
  }
  const [a] = t.pickN(ROS1, 1);
  return t.mc([{ q:'One of these means the tutorial is ROS 1 and you should close the tab. Which?', a, w:t.pickN(ROS2, 3),
    why:'catkin_make, roscore, rosrun, rospy and XML-only launch files are ROS 1. Noetic reached end of life on 31 May 2025.' }]);
};

const distro = t => t.mc([
  { q:'Which Gazebo pairs with ROS 2 Jazzy?', a:'Harmonic', w:['Fortress', 'Ionic', 'Jetty'],
    why:'Humble–Fortress, Jazzy–Harmonic, Kilted–Ionic, Lyrical–Jetty. Mismatch them and you fight build errors.' },
  { q:'Which Gazebo pairs with ROS 2 Humble?', a:'Fortress', w:['Harmonic', 'Jetty', 'Ionic'],
    why:'Humble–Fortress, Jazzy–Harmonic, Kilted–Ionic, Lyrical–Jetty.' },
  { q:'Which Gazebo pairs with ROS 2 Lyrical?', a:'Jetty', w:['Harmonic', 'Fortress', 'Ionic'],
    why:'Lyrical Luth (May 2026) pairs with Gazebo Jetty.' },
  { q:'Which ROS 2 distro should a beginner start on in late 2026?', a:'Jazzy', w:['Kilted', 'Noetic', 'Iron'],
    why:'Jazzy has support to May 2029 and nearly every course targets it. Kilted ends 31 December 2026; Noetic is ROS 1.' },
  { q:'A tutorial types "ign gazebo". It is…', a:'Out of date — the ign commands became gz', w:['The current command', 'ROS 2 only syntax', 'For Isaac Sim'],
    why:'Ignition was renamed back to Gazebo in 2022 and every ign command became gz.' },
]);

const COMMS = [
  ['A lidar streaming scans ten times a second', 'Topic', 'Continuous data with any number of listeners is a topic.'],
  ['Camera frames going to three different nodes', 'Topic', 'Many subscribers to a stream: a topic.'],
  ['Set a config value and get yes or no back', 'Service', 'A quick request with a single reply is a service.'],
  ['Ask a node to reset its odometry and confirm it did', 'Service', 'Request, one response, done: a service.'],
  ['Drive two metres, report progress, allow cancelling', 'Action', 'Long-running, with feedback and cancellation: an action.'],
  ['Move an arm through a long trajectory with feedback', 'Action', 'Anything that takes a while and reports progress is an action.'],
];
const comms = t => {
  const [what, a, why] = t.pick(COMMS);
  return t.mc([{ q:`Topic, service or action? — ${what}.`, a,
    w:['Topic', 'Service', 'Action', 'Parameter'].filter(x => x !== a).slice(0, 3), why }]);
};

const graph = t => t.mc([
  { q:'Record everything on the graph so you can replay it later:', a:'ros2 bag record -a', w:['ros2 topic echo /scan', 'ros2 node list', 'colcon test'],
    why:'Bags are how you debug the bug that only happens sometimes — capture it once, replay it forever.' },
  { q:'Build a ROS 2 workspace:', a:'colcon build', w:['catkin_make', 'ros2 build', 'make install'],
    why:'colcon builds ROS 2 workspaces. catkin_make is ROS 1.' },
  { q:'A topic publishes, the subscriber is running, and nothing arrives. First suspect?', a:'A QoS mismatch between publisher and subscriber',
    w:['A missing roscore', 'The topic name is too long', 'RViz is closed'],
    why:'Incompatible QoS (reliability, durability) silently means no connection. ros2 topic info -v shows both sides.' },
  { q:'You pass arguments into a Python launch file with…', a:'DeclareLaunchArgument and LaunchConfiguration',
    w:['roslaunch args', 'rosparam load', 'Global variables'],
    why:'Declare the argument, read it with LaunchConfiguration, pass it to nodes and includes.' },
]);

const tf = t => t.mc([
  { q:'Which node turns joint positions into TF transforms?', a:'robot_state_publisher', w:['joint_state_publisher', 'static_transform_publisher', 'rviz2'],
    why:'joint_state_publisher invents joint positions; robot_state_publisher computes the transforms from them and the URDF.' },
  { q:'Your robot sinks through the Gazebo floor or explodes on spawn.', a:'Missing or wrong <inertial> tags', w:['The TF tree is too deep', 'RViz is not running', 'The lidar is off'],
    why:'Physics needs mass and inertia. Leave them out and the simulator does strange things.' },
  { q:'SLAM cannot transform the laser scan. The most common cause?', a:'No transform from the robot base to the lidar frame', w:['The map is too big', 'The lidar spins too fast', 'Nav2 is not installed'],
    why:'A missing static transform to the lidar frame causes more beginner SLAM failures than any algorithm.' },
  { q:'Why xacro instead of plain URDF?', a:'Macros and parameters instead of hundreds of lines of repeated XML', w:['Xacro runs faster in Gazebo', 'URDF is ROS 1 only', 'Xacro adds physics'],
    why:'One wheel macro used twice beats two copies that drift apart.' },
  { q:'Collision geometry vs visual geometry:', a:'Collision is a simple shape for physics; visual is the detailed mesh you see',
    w:['They must be identical', 'Visual is used for physics', 'Collision is only for RViz'],
    why:'Physics on a detailed mesh is slow and unstable. Boxes and cylinders for collision; the pretty mesh for looks.' },
]);

const diffdrive = t => {
  const r = t.pick([0.03, 0.035, 0.05]), L = t.pick([0.15, 0.2, 0.25, 0.3]);
  let wl = t.int(4, 14), wr = t.int(5, 15);
  if (wr <= wl) [wl, wr] = [Math.min(wl, wr) - 1 || 3, Math.max(wl, wr) + 1];
  const v = t.int(0, 2);
  if (v === 0) {
    const lin = r * (wr + wl) / 2;
    return num(`Differential drive: wheel radius ${r} m, left wheel ${wl} rad/s, right ${wr} rad/s. Forward speed, in m/s? (3 decimals)`,
      lin, 'm/s', 3, `v = r(ωr + ωl)/2 = ${r} × ${wr + wl} / 2 = ${n(lin, 3)} m/s.`, { tol: 0.002 });
  }
  if (v === 1) {
    const w = r * (wr - wl) / L;
    return num(`Wheel radius ${r} m, track width ${L} m, left ${wl} rad/s, right ${wr} rad/s. Yaw rate, in rad/s (positive = counter-clockwise)?`,
      w, 'rad/s', 3, `ω = r(ωr − ωl)/L = ${r} × ${wr - wl} / ${L} = ${n(w, 3)} rad/s.`, { tol: 0.005 });
  }
  const speed = t.pick([0.2, 0.3, 0.5]);
  return num(`To drive straight at ${speed} m/s with ${r} m wheels, how fast must each wheel spin, in rad/s?`,
    speed / r, 'rad/s', 2, `Straight means both wheels equal: ω = v / r = ${speed} / ${r} = ${n(speed / r)} rad/s.`);
};

const nav = t => t.mc([
  { q:'Your SLAM map comes out smeared and doubled. Most likely cause?', a:'Poor odometry', w:['Too few Nav2 plugins', 'The lidar is too accurate', 'RViz frame rate'],
    why:'SLAM Toolbox leans on odometry. A smeared map is almost always an odometry problem, not an algorithm one.' },
  { q:'You have a good map and want the robot to use it, not rebuild it. SLAM Toolbox mode?', a:'Localization', w:['Mapping', 'Lifelong', 'Synchronous mapping'],
    why:'Map once, then switch to localization mode and let Nav2 plan on the saved map.' },
  { q:'The robot keeps clipping corners. Which costmap setting do you look at first?', a:'Inflation radius', w:['Map resolution only', 'The lidar\'s colour', 'The behaviour tree XML'],
    why:'Inflation pads obstacles so the planner keeps its distance. Too small and paths hug walls.' },
  { q:'What orchestrates Nav2\'s planning, control and recovery?', a:'Behaviour trees', w:['A single while loop', 'roscore', 'MoveIt'],
    why:'Nav2 runs its logic as a behaviour tree — the part beginners most often fail to grasp.' },
]);

const simchoice = t => t.mc([
  { q:'Which simulator do you learn first for ROS 2 work on an ordinary laptop?', a:'Gazebo', w:['Isaac Sim', 'PyBullet', 'Genesis'],
    why:'It is the one natively wired into ROS 2, and it runs without an NVIDIA GPU.' },
  { q:'Reinforcement learning and locomotion, with no GPU:', a:'MuJoCo', w:['Isaac Sim', 'Gazebo Classic', 'RViz'],
    why:'MuJoCo is CPU-first with the most accurate contact dynamics, and the research standard.' },
  { q:'Isaac Sim\'s minimum GPU, per NVIDIA:', a:'RTX 4080 with 16 GB VRAM', w:['Any integrated GPU', 'GTX 1060', 'An A100 data-centre card'],
    why:'And data-centre cards without RT cores such as the A100 and H100 are not supported at all.' },
  { q:'Why skip PyBullet today?', a:'No release since 2022 and the issue tracker is closed', w:['It only runs on Windows', 'It needs Isaac Sim', 'It is ROS 1 only'],
    why:'Learning a dormant tool means relearning later.' },
]);

/* ================================ month 5 ================================ */

const pidmath = t => {
  const v = t.int(0, 2);
  if (v === 0) {
    const Kp = t.pick([0.5, 1, 2, 4]), Ki = t.pick([0.1, 0.2, 0.5]), Kd = t.pick([0.05, 0.1, 0.2]);
    const e = t.int(2, 10), I = t.int(1, 20), d = t.int(-5, 5);
    const u = Kp * e + Ki * I + Kd * d;
    return num(`Kp = ${Kp}, Ki = ${Ki}, Kd = ${Kd}. Error ${e}, integral of error ${I}, derivative of error ${d}. Controller output?`,
      u, '', 2, `u = ${Kp}×${e} + ${Ki}×${I} + ${Kd}×${d} = ${n(Kp * e)} + ${n(Ki * I)} + ${n(Kd * d)} = ${n(u)}.`, { tol: 0.01 });
  }
  if (v === 1) {
    const e0 = t.int(2, 12), e1 = t.int(0, 12), dt = t.pick([0.01, 0.02, 0.05]), Kd = t.pick([0.05, 0.1, 0.2]);
    const D = Kd * (e1 - e0) / dt;
    return num(`Error was ${e0}, now ${e1}, loop period ${dt} s, Kd = ${Kd}. What is the D term's contribution?`,
      D, '', 2, `de/dt = (${e1} − ${e0}) / ${dt} = ${n((e1 - e0) / dt)}; × ${Kd} = ${n(D)}.`, { tol: 0.01 });
  }
  return t.mc([
    { q:'An arm slams hard when it comes off a joint limit it was pushing against. Why?', a:'Integrator windup — the I term kept accumulating while it was stuck',
      w:['The D term is too small', 'The encoder skipped', 'P is too low'],
      why:'Clamp the integral, or stop integrating while the output is saturated.' },
    { q:'An arm sags under gravity by a fixed amount. The cheapest good fix?', a:'Gravity compensation as feedforward', w:['Raise Kd', 'Remove the I term', 'Slow the loop down'],
      why:'You know gravity\'s torque from the pose, so add it directly rather than waiting for an integrator to find it.' },
  ]);
};

const control = t => t.mc([
  { q:'What is LQR, practically?', a:'A principled way to choose gains by weighing state error against control effort',
    w:['A faster PID loop', 'A filter for noisy sensors', 'A motion planner'],
    why:'You say how much you care about each state and about effort (Q and R); LQR gives the optimal gains.' },
  { q:'What does MPC buy you, and what does it cost?', a:'It handles constraints; it costs compute', w:['It removes the need for a model', 'It is free — same cost as PID', 'It only works on linear systems'],
    why:'MPC optimises over a horizon while respecting limits, and has to solve that optimisation every cycle.' },
  { q:'The cheapest performance improvement most people never add:', a:'Feedforward', w:['A higher PWM frequency', 'A bigger integral gain', 'Another encoder'],
    why:'If you know roughly what output a move needs, send it directly and let feedback correct the remainder.' },
  { q:'An underactuated robot has…', a:'Fewer actuators than degrees of freedom', w:['More motors than joints', 'No sensors', 'Only one joint'],
    why:'A cart-pole or a walking robot cannot command every degree of freedom directly, which changes the whole approach.' },
]);

const fk = t => {
  const L1 = t.pick([100, 120, 150, 200]), L2 = t.pick([80, 100, 120, 150]);
  const a1 = t.pick([0, 15, 30, 45, 60, 90]), a2 = t.pick([-60, -30, 0, 30, 45, 60, 90]);
  const x = L1 * Math.cos(deg(a1)) + L2 * Math.cos(deg(a1 + a2));
  const y = L1 * Math.sin(deg(a1)) + L2 * Math.sin(deg(a1 + a2));
  const axis = t.int(0, 1) ? 'x' : 'y';
  const val = axis === 'x' ? x : y;
  const fn = axis === 'x' ? 'cos' : 'sin';
  return num(`Planar two-link arm: L1 = ${L1} mm, L2 = ${L2} mm, θ1 = ${a1}°, θ2 = ${a2}° (θ2 relative to link 1). End-effector ${axis}, in mm?`,
    val, 'mm', 1, `${axis} = L1·${fn}(θ1) + L2·${fn}(θ1 + θ2) = ${L1}·${fn}(${a1}°) + ${L2}·${fn}(${a1 + a2}°) = ${n(val, 1)} mm.`, { tol: 1 });
};

const rot = t => {
  const x = t.int(-5, 5) || 3, y = t.int(-5, 5) || 2, th = t.pick([30, 45, 60, 90, 120, 180]);
  const c = Math.cos(deg(th)), s = Math.sin(deg(th));
  if (t.int(0, 1) === 0) {
    const xr = x * c - y * s, yr = x * s + y * c;
    const axis = t.int(0, 1) ? 'x' : 'y';
    return num(`Rotate the point (${x}, ${y}) by ${th}° counter-clockwise about the origin. New ${axis}? (2 decimals)`,
      axis === 'x' ? xr : yr, '', 2,
      `x' = x·cosθ − y·sinθ = ${n(xr)}; y' = x·sinθ + y·cosθ = ${n(yr)}.`, { tol: 0.02 });
  }
  const tx = t.int(-3, 3), ty = t.int(-3, 3);
  const ax = x * c - y * s + tx, ay = x * s + y * c + ty;
  const axis = t.int(0, 1) ? 'x' : 'y';
  return num(`Frame B sits at (${tx}, ${ty}) in frame A, rotated ${th}°. A point is (${x}, ${y}) in B. Its ${axis} in frame A? (2 decimals)`,
    axis === 'x' ? ax : ay, '', 2,
    `p_A = R·p_B + t: rotate (${x}, ${y}) by ${th}° to (${n(x * c - y * s)}, ${n(x * s + y * c)}), then add (${tx}, ${ty}) → (${n(ax)}, ${n(ay)}).`, { tol: 0.02 });
};

const jacobian = t => {
  if (t.int(0, 2) === 0) {
    return t.mc([
      { q:'At what elbow angle θ2 is a planar two-link arm singular?', a:'0° or 180° — fully stretched or fully folded', w:['90°', '45°', 'Never'],
        why:'det J = L1·L2·sin θ2, which is zero exactly when θ2 is 0° or 180°.' },
      { q:'What does an arm lose at a singularity?', a:'The ability to move its end effector in some direction, however fast the joints turn',
        w:['Its joint limits', 'Power to the motors', 'Its encoder readings'],
        why:'Near a singularity IK asks for huge joint speeds for tiny motions — you feel the arm lock in one direction.' },
    ]);
  }
  const L1 = t.pick([10, 15, 20]), L2 = t.pick([10, 12, 15]), a2 = t.pick([15, 30, 60, 90, 120, 150]);
  const det = L1 * L2 * Math.sin(deg(a2));
  return num(`Two-link planar arm, L1 = ${L1} cm, L2 = ${L2} cm, elbow θ2 = ${a2}°. The Jacobian determinant is L1·L2·sin θ2. Its value, in cm²?`,
    det, 'cm²', 1, `${L1} × ${L2} × sin(${a2}°) = ${n(det, 1)} cm². It reaches zero at 0° and 180°: the singularities.`, { tol: 0.5 });
};

const pinhole = t => {
  const f = t.pick([500, 600, 800]), cx = t.pick([320, 640]);
  const X = t.pick([-0.3, -0.2, -0.1, 0.05, 0.1, 0.15, 0.25]), Z = t.pick([0.5, 1, 1.5, 2]);
  if (t.int(0, 1) === 0) {
    const u = f * X / Z + cx;
    return num(`Pinhole camera: fx = ${f} px, cx = ${cx} px. A point sits ${X} m sideways (X) and ${Z} m ahead (Z). Its image column u, in pixels?`,
      u, 'px', 1, `u = fx·X/Z + cx = ${f} × ${X} / ${Z} + ${cx} = ${n(u, 1)} px.`, { tol: 1 });
  }
  const u = Math.round(f * X / Z + cx);
  const Xb = (u - cx) * Z / f;
  return num(`fx = ${f} px, cx = ${cx} px. An object appears at column u = ${u} px and your depth sensor says it is ${Z} m away. Its sideways position X, in metres? (3 decimals)`,
    Xb, 'm', 3, `X = (u − cx)·Z / fx = (${u} − ${cx}) × ${Z} / ${f} = ${n(Xb, 3)} m.`, { tol: 0.005 });
};

const stereo = t => {
  if (t.int(0, 2) === 0) {
    return t.mc([
      { q:'Why does stereo depth get less precise with distance?', a:'Disparity shrinks with distance, so one pixel of error is a bigger depth error',
        w:['The cameras lose focus', 'The baseline shrinks', 'Far objects are darker'],
        why:'Z = f·B/d: as d gets small, a one-pixel change in d is a large change in Z.' },
      { q:'Which depth method is most easily washed out by direct sunlight?', a:'Structured light — the projected pattern disappears',
        w:['Passive stereo on a textured scene', 'Wheel odometry', 'A tape measure'],
        why:'Sunlight swamps a projected infrared pattern. Passive stereo just needs texture.' },
    ]);
  }
  const f = t.pick([500, 700, 800]), B = t.pick([0.06, 0.1, 0.12]), d = t.pick([10, 20, 35, 50]);
  const Z = f * B / d;
  return num(`Stereo pair: focal length ${f} px, baseline ${B} m. A point has a disparity of ${d} px. Depth, in metres?`,
    Z, 'm', 2, `Z = f·B/d = ${f} × ${B} / ${d} = ${n(Z)} m.`);
};

const cloud = t => t.mc([
  { q:'Voxel downsampling a point cloud…', a:'Keeps one point per small cube, cutting the count while keeping the shape',
    w:['Removes every point below the table', 'Colours the cloud by depth', 'Adds points to fill holes'],
    why:'Fewer points, same geometry — everything downstream runs faster.' },
  { q:'To find the tabletop in a cloud of a table with objects on it:', a:'Fit a plane with RANSAC', w:['Take the highest point', 'Average all the points', 'Voxel-downsample it'],
    why:'The table is the dominant plane. Remove its inliers and what is left is the objects.' },
  { q:'After removing the table plane, you separate the objects by…', a:'Clustering the remaining points', w:['Fitting another plane', 'Sorting by colour only', 'Rotating the cloud'],
    why:'Points close to each other belong to the same object — Euclidean or DBSCAN clustering.' },
  { q:'Reprojection error after camera calibration measures…', a:'How far, in pixels, known points land from where the model predicts',
    w:['How blurry the lens is', 'The distance to the chessboard', 'The frame rate'],
    why:'Lower is better. Well under a pixel is a good calibration.' },
  { q:'A colour-detection pipeline worked yesterday and fails today. First suspect?', a:'Lighting changed', w:['The CPU is slower', 'The camera\'s intrinsics changed', 'Python updated'],
    why:'Colour thresholds depend on light. It is the most common way vision pipelines break.' },
]);

const moveit = t => t.mc([
  { q:'How does MoveIt know about the table so it does not plan through it?', a:'You add it to the planning scene as a collision object',
    w:['It sees it in RViz automatically', 'Through the robot URDF', 'It does not — you add a delay'],
    why:'The planner only avoids what is in the planning scene. Add obstacles, or feed it a sensor octomap.' },
  { q:'You block the only viable path to the target. The planner…', a:'Fails to find a plan, or times out',
    w:['Moves straight through the obstacle', 'Deletes the obstacle', 'Moves to a random pose'],
    why:'That failure — and reading why — is more valuable than watching it succeed.' },
  { q:'The MoveIt Task Constructor is for…', a:'Breaking a task like pick-and-place into stages: approach, grasp, lift, place',
    w:['Building URDFs', 'Tuning PID gains', 'Recording bag files'],
    why:'Stages let the planner reason about the whole task, including grasp generation and IK.' },
]);

/* ================================ month 6 ================================ */

const lerobot = t => t.mc([
  { q:'The LeRobot workflow, in order:', a:'Teleoperate, record, train, deploy', w:['Train, record, deploy, teleoperate', 'Deploy, train, record, teleoperate', 'Record, deploy, train, teleoperate'],
    why:'You drive the robot, demonstrations are saved, a policy learns to imitate them, then it runs on its own.' },
  { q:'Why does ACT beat predicting one action at a time?', a:'It predicts chunks of future actions, which reduces compounding errors',
    w:['It uses a bigger GPU', 'It needs no demonstrations', 'It runs at a lower frame rate'],
    why:'Committing to a short chunk smooths behaviour and stops small errors snowballing step by step.' },
  { q:'Diffusion Policy represents the policy as…', a:'A denoising process that turns noise into an action sequence',
    w:['A lookup table of demonstrations', 'A PID controller', 'A decision tree'],
    why:'It learns to denoise actions, which handles tasks with several valid ways of doing them.' },
  { q:'Behaviour cloning\'s classic failure:', a:'Small errors lead to states the demos never showed, and errors compound',
    w:['It cannot use cameras', 'It needs a reward function', 'It only works in simulation'],
    why:'That is why the practice task records a second batch of demonstrations covering the failures.' },
  { q:'The biggest lever on your policy\'s quality:', a:'The quality of your demonstrations', w:['The brand of your GPU', 'The Python version', 'The colour of the objects'],
    why:'A policy trained on sloppy demonstrations is a sloppy policy.' },
]);

const rate = t => {
  const trials = t.pick([20, 25, 40, 50]);
  const before = t.int(Math.floor(trials * 0.3), Math.floor(trials * 0.6));
  if (t.int(0, 1) === 0) {
    return num(`Your policy succeeded ${before} times in ${trials} trials. Success rate, in percent?`,
      (before / trials) * 100, '%', 1, `${before} / ${trials} = ${n(before / trials, 3)} = ${n((before / trials) * 100, 1)}%.`, { tol: 0.2 });
  }
  const after = Math.min(trials, before + t.int(3, Math.floor(trials * 0.35)));
  const pp = ((after - before) / trials) * 100;
  return num(`Before retraining: ${before}/${trials}. After retraining on the failures: ${after}/${trials}. Improvement, in percentage points?`,
    pp, 'pp', 1, `${n((after / trials) * 100, 1)}% − ${n((before / trials) * 100, 1)}% = ${n(pp, 1)} percentage points.`, { tol: 0.2 });
};

const vla = t => t.mc([
  { q:'Which of these has no public weights?', a:'RT-2', w:['OpenVLA', 'π₀', 'SmolVLA'],
    why:'RT-2 is historically important but closed. Study the paper and practise on an open model.' },
  { q:'The sensible model to fine-tune on an SO-101:', a:'SmolVLA', w:['OpenVLA 7B', 'RT-2', 'A model trained from scratch'],
    why:'SmolVLA is compact and built for affordable hardware.' },
  { q:'GR00T N1.7\'s weights are licensed under…', a:'The NVIDIA Open Model License (the code is Apache 2.0)', w:['Apache 2.0, same as the code', 'MIT', 'They are not released'],
    why:'Code and weights have different licences — a distinction often reported wrongly.' },
  { q:'Which describes OpenVLA?', a:'A fully open 7B-parameter model', w:['A closed 70B model', 'A simulator', 'A ROS 2 package'],
    why:'Trained on Open X-Embodiment, and the best-documented open VLA to read the code of.' },
  { q:'The π₀ repository warns that…', a:'It was built for their robots, and transfer to yours is not guaranteed',
    w:['It needs no fine-tuning', 'It only runs on TPUs', 'It is ROS 1 only'],
    why:'Open weights are not a promise that it will work on your hardware as-is.' },
]);

const rl = t => t.mc([
  { q:'Where do you start reinforcement learning with no GPU of your own?', a:'MuJoCo Playground on Colab', w:['Isaac Lab on a laptop', 'Gazebo Classic', 'PyBullet'],
    why:'Its Colab tutorials run on the free GPU Colab gives you.' },
  { q:'You change the reward and the quadruped learns a strange gait. What happened?', a:'It optimised exactly what the reward pays for',
    w:['The simulator is broken', 'RL is random every time', 'The GPU overheated'],
    why:'The reward is the specification. Change it, and the behaviour it produces changes with it.' },
  { q:'The sim-to-real gap is…', a:'The differences between simulation and the real robot that make a trained policy fail',
    w:['Network latency to the robot', 'The time a simulation takes to start', 'A ROS 2 QoS setting'],
    why:'Friction, latency, sensor noise and mass all differ. Domain randomisation is the usual defence.' },
]);

const career = t => t.mc([
  { q:'Which direction has the most jobs?', a:'Autonomy and mobile robotics', w:['Robot learning and embodied AI', 'Humanoid design', 'Pure computer vision research'],
    why:'Controls and field service engineers alone are over 20% of robotics postings, and this direction serves both.' },
  { q:'Which direction is the most consistently employable, including as a contractor?', a:'Embedded, mechatronics and integration', w:['Robot learning', 'VLA research', 'Simulation art'],
    why:'Least glamorous, most reliably hired. Functional safety knowledge is a real, underserved specialism.' },
  { q:'Which of these is a red flag to robotics recruiters?', a:'Still on ROS 1 with no sign of migrating', w:['A commit history showing debugging', 'A public LeRobot dataset', 'A write-up of what broke'],
    why:'The other three are exactly what they screen for.' },
  { q:'The high-signal thing in a self-taught portfolio:', a:'A section on what broke and how you fixed it', w:['A list of course certificates', 'A logo', 'One big final commit'],
    why:'Anyone can post a working demo. The debugging story is what cannot be faked from a tutorial.' },
  { q:'In a robotics interview, compared with a software one, LeetCode is…', a:'A much weaker predictor', w:['The whole interview', 'Replaced by trivia', 'Only for senior roles'],
    why:'Expect IK, PID, sensor fusion, SLAM, planning — and questions about your own past failures.' },
]);

/* ================================ registry ================================ */

/**
 * [id, month, topic, name, generator]. Order within a month is the order new
 * skills are introduced in drills — foundations before the things built on them.
 */
const LIST = [
  ['ohm',        1, 'm1-elec',    'Ohm\'s law',                ohm],
  ['divider',    1, 'm1-elec',    'Voltage dividers',          divider],
  ['led',        1, 'm1-elec',    'LED resistors and power',   led],
  ['symbols',    1, 'm1-elec',    'Reading a schematic',       symbols],
  ['pullup',     1, 'm1-elec',    'Pull-ups and pull-downs',   pullup],
  ['stall',      1, 'm1-elec',    'Current draw and brownouts', stall],
  ['decouple',   1, 'm1-elec',    'Decoupling capacitors',     decouple],
  ['lipo',       1, 'm1-elec',    'LiPo batteries',            lipo],
  ['bands',      1, 'm1-bench',   'Resistor colour codes',     bands],
  ['meter',      1, 'm1-bench',   'Using a multimeter',        meter],
  ['solder',     1, 'm1-solder',  'Soldering',                 solder],
  ['cli',        1, 'm1-python',  'Terminal and Git',          cli],

  ['pwm',        2, 'm2-arduino', 'PWM and duty cycle',        pwm],
  ['timing',     2, 'm2-arduino', 'Timing and interrupts',     timing],
  ['buses',      2, 'm2-arduino', 'I2C, SPI and UART',         buses],
  ['mcu',        2, 'm2-esp32',   'Choosing a board',          mcu],
  ['drivers',    2, 'm2-motors',  'Motor drivers',             drivers],
  ['actuators',  2, 'm2-motors',  'Choosing an actuator',      actuators],
  ['encoder',    2, 'm2-motors',  'Encoders and odometry',     encoder],
  ['sensors',    2, 'm2-sensors', 'Range sensors and IMUs',    sensors],
  ['compfilter', 2, 'm2-sensors', 'The complementary filter',  compfilter],
  ['pid',        2, 'm2-robots',  'PID by behaviour',          pid],

  ['cad',        3, 'm3-cad',     'Parametric CAD',            cad],
  ['materials',  3, 'm3-print',   'Choosing a filament',       materials],
  ['orient',     3, 'm3-print',   'Designing for FDM',         orient],
  ['tolerance',  3, 'm3-print',   'Clearances and cost',       tolerance],
  ['gears',      3, 'm3-transmission', 'Gear ratios',          gears],
  ['backlash',   3, 'm3-transmission', 'Backlash and drives',  backlash],
  ['torque',     3, 'm3-arm',     'Holding torque',            torque],

  ['ros1',       4, 'm4-distro',  'Spotting ROS 1',            ros1],
  ['distro',     4, 'm4-distro',  'Distros and Gazebo pairs',  distro],
  ['comms',      4, 'm4-core',    'Topics, services, actions', comms],
  ['graph',      4, 'm4-core',    'ROS 2 tooling',             graph],
  ['tf',         4, 'm4-urdf',    'URDF and TF',               tf],
  ['simchoice',  4, 'm4-sim',     'Choosing a simulator',      simchoice],
  ['diffdrive',  4, 'm4-control', 'Diff-drive kinematics',     diffdrive],
  ['nav',        4, 'm4-nav',     'SLAM and Nav2',             nav],

  ['pidmath',    5, 'm5-pid',     'PID arithmetic',            pidmath],
  ['control',    5, 'm5-lqr',     'LQR, MPC, feedforward',     control],
  ['rot',        5, 'm5-kin',     'Rotations and frames',      rot],
  ['fk',         5, 'm5-kin',     'Forward kinematics',        fk],
  ['jacobian',   5, 'm5-kin',     'Jacobians and singularities', jacobian],
  ['pinhole',    5, 'm5-vision',  'Pinhole projection',        pinhole],
  ['stereo',     5, 'm5-vision',  'Depth from stereo',         stereo],
  ['cloud',      5, 'm5-vision',  'Point clouds and calibration', cloud],
  ['moveit',     5, 'm5-moveit',  'Planning with MoveIt',      moveit],

  ['lerobot',    6, 'm6-lerobot', 'Imitation learning',        lerobot],
  ['rate',       6, 'm6-lerobot', 'Measuring a policy',        rate],
  ['vla',        6, 'm6-vla',     'VLA models',                vla],
  ['rl',         6, 'm6-rl',      'Reinforcement learning',    rl],
  ['career',     6, 'm6-portfolio', 'Directions and portfolios', career],
];

export const SKILLS = LIST.map(([id, month, topic, name, gen], order) => ({ id, month, topic, name, gen, order }));
export const skillById = id => SKILLS.find(s => s.id === id);
export const skillsIn = m => SKILLS.filter(s => s.month === m);
export const skillsForTopic = topic => SKILLS.filter(s => s.topic === topic);
