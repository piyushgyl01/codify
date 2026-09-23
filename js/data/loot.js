/**
 * Gear — one collection for the whole character.
 *
 * Each distinct piece you own is a permanent XP multiplier on everything, capped
 * at +40% in total so a long save never inflates until easy and hard work look
 * the same. A duplicate converts to credits.
 *
 * Two sets. Desk gear drops from programming, bench gear from robotics; anything
 * shared (quests, the timer) can drop either. IDs are unchanged from Codify and
 * Botify, so gear already owned in either carries across.
 */
export const RARITY = {
  common:    { name:'Common',    color:'var(--muted)',  weight:55, bonus:0.01,  dupe:40,  rank:0 },
  rare:      { name:'Rare',      color:'var(--cyan)',   weight:28, bonus:0.025, dupe:90,  rank:1 },
  epic:      { name:'Epic',      color:'var(--violet)', weight:13, bonus:0.04,  dupe:180, rank:2 },
  legendary: { name:'Legendary', color:'var(--orange)', weight:4,  bonus:0.07,  dupe:400, rank:3 },
};

export const LOOT_CAP = 0.40;

const g = (id, name, icon, rarity, set, desc) => ({ id, name, icon, rarity, set, desc, bonus: RARITY[rarity].bonus });

export const LOOT = [
  /* desk — programming */
  g('duck',       'Rubber duck',           '🦆', 'common',    'desk', 'Explain the bug out loud.'),
  g('keeb',       'Mechanical keyboard',   '⌨️', 'common',    'desk', 'A keyboard you like using.'),
  g('monitor',    'Second monitor',        '🖥️', 'common',    'desk', 'Docs on one screen, code on the other.'),
  g('chair',      'A chair that fits',     '🪑', 'common',    'desk', 'Long sessions without back pain.'),
  g('cans',       'Noise-cancelling headphones', '🎧', 'common', 'desk', 'Uninterrupted focus.'),
  g('timer',      'Kitchen timer',         '⏲️', 'common',    'desk', 'Fixed-length focus blocks.'),
  g('dotfiles',   'Dotfiles repo',         '📁', 'rare',      'desk', 'Your setup, reproducible anywhere.'),
  g('keybinds',   'Editor keybinds',       '⌘',  'rare',      'desk', 'Editing without the mouse.'),
  g('devenv',     'Reproducible dev env',  '📦', 'rare',      'desk', 'Builds the same on every machine.'),
  g('scratch',    'Scratch repo',          '🧪', 'rare',      'desk', 'Somewhere to try things safely.'),
  g('reading',    'Reading queue',         '📚', 'rare',      'desk', 'Papers and docs, in order.'),
  g('notes',      'Second brain',          '🧠', 'epic',      'desk', 'Notes you can find again.'),
  g('snippets',   'Snippet library',       '✂️', 'epic',      'desk', 'Templates for the algorithms you reuse.'),
  g('ci',         'CI you trust',          '🟢', 'epic',      'desk', 'Tests on every push.'),
  g('harness',    'Stress-test harness',   '🧰', 'epic',      'desk', 'Brute force against your solution on random input.'),
  g('mentor',     'A mentor',              '🧭', 'legendary', 'desk', 'Someone who reviews your work.'),
  g('oss',        'Maintainership',        '🌍', 'legendary', 'desk', 'A project other people depend on.'),
  g('taste',      'Taste',                 '◈',  'legendary', 'desk', 'Knowing which solution to write.'),
  /* bench — robotics */
  g('jumpers',    'Jumper wires',          '🧵', 'common',    'bench', 'Breadboard wiring.'),
  g('breadboard', 'Breadboard',            '🔲', 'common',    'bench', 'Solderless prototyping.'),
  g('cutters',    'Flush cutters',         '✂️', 'common',    'bench', 'Trims leads flat to the joint.'),
  g('flux',       'Flux pen',              '🖊️', 'common',    'bench', 'Makes solder wet the pad.'),
  g('hands',      'Helping hands',         '🤲', 'common',    'bench', 'Holds the work while you solder.'),
  g('meter',      'Multimeter 9205B+',     '📟', 'rare',      'bench', 'Volts, amps to 20 A, continuity.'),
  g('pinecil',    'Pinecil V2',            '🔥', 'rare',      'bench', 'Temperature-controlled iron, USB-C.'),
  g('tb6612',     'TB6612FNG',             '🎛️', 'rare',      'bench', 'The driver to use instead of the L298N.'),
  g('calipers',   'Digital calipers',      '📏', 'rare',      'bench', 'Measure the part, not the drawing.'),
  g('psu',        'Bench power supply',    '🔋', 'epic',      'bench', 'Current limiting turns a short into a reading.'),
  g('logic',      'Logic analyzer',        '📈', 'epic',      'bench', 'See what the I2C bus is actually doing.'),
  g('bno',        'BNO085 IMU',            '🧭', 'epic',      'bench', 'Orientation fused on-chip.'),
  g('printer',    'Bambu Lab A1',          '🖨️', 'epic',      'bench', 'The tenth revision costs cents.'),
  g('lidar',      'RPLIDAR C1',            '🛰️', 'legendary', 'bench', '360° scans for SLAM.'),
  g('scope',      'Oscilloscope',          '〰️', 'legendary', 'bench', 'Watch the PWM, the ringing, the brownout.'),
  g('so101',      'SO-101 pair',           '🦾', 'legendary', 'bench', 'Leader and follower arms.'),
];

export const LOOT_BY_ID = Object.fromEntries(LOOT.map(l => [l.id, l]));

/** XP multiplier from owned gear — each unique piece once, capped. */
export function lootBonus(owned = {}) {
  const sum = Object.keys(owned).filter(id => owned[id] > 0 && LOOT_BY_ID[id])
    .reduce((n, id) => n + LOOT_BY_ID[id].bonus, 0);
  return 1 + Math.min(LOOT_CAP, sum);
}

/**
 * Roll for a drop. `chance` is the probability of anything at all, `minRarity`
 * floors the result for bosses and contests, `set` limits it to one track's gear.
 */
export function rollLoot({ chance = 1, minRarity = 'common', set = null, rng = Math.random } = {}) {
  if (rng() > chance) return null;
  const floor = RARITY[minRarity].rank;
  const pool = Object.entries(RARITY).filter(([, r]) => r.rank >= floor);
  const total = pool.reduce((n, [, r]) => n + r.weight, 0);
  let x = rng() * total, rarity = pool[0][0];
  for (const [id, r] of pool) { if ((x -= r.weight) <= 0) { rarity = id; break; } }
  const items = LOOT.filter(l => l.rarity === rarity && (!set || l.set === set));
  return items[Math.floor(rng() * items.length)];
}
