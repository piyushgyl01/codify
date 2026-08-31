/**
 * Gear.
 *
 * Every session rolls for a drop; a gauntlet you win always drops rare or better.
 * Each distinct piece you own is a permanent multiplier on every XP gain, which
 * makes the collection progression rather than a sticker book.
 *
 * The bonus is capped, and the cap matters: without one, a long-running save
 * eventually multiplies everything so far that the numbers stop meaning anything
 * and a hard session and an easy one look the same.
 *
 * The items are the things that actually compound for engineers — a setup you
 * are not fighting, notes you can find again, and eventually other people.
 */

export const RARITY = {
  common:    { name:'Common',    color:'var(--dim)',    weight:58, bonus:0.01 },
  rare:      { name:'Rare',      color:'var(--info)',   weight:27, bonus:0.025 },
  epic:      { name:'Epic',      color:'var(--violet)', weight:12, bonus:0.05 },
  legendary: { name:'Legendary', color:'var(--warn)',   weight:3,  bonus:0.09 },
};

export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

/** Nothing compounds past this. See the note above. */
export const MAX_BONUS = 0.40;

export const LOOT = [
  /* ------------------------------- common -------------------------------- */
  { id:'duck',      name:'Rubber Duck',        icon:'🦆', rarity:'common',
    flavour:'Explaining it out loud finds the bug about a third of the time. Free.' },
  { id:'keeb',      name:'Mechanical Keyboard', icon:'⌨️', rarity:'common',
    flavour:'Does not make you faster. Makes you want to sit down, which does.' },
  { id:'monitor',   name:'Second Monitor',     icon:'🖥️', rarity:'common',
    flavour:'Docs on one side, code on the other. The oldest productivity trick there is.' },
  { id:'chair',     name:'A Chair That Fits',  icon:'🪑', rarity:'common',
    flavour:'Nothing ends a deep block faster than your own lower back.' },
  { id:'cans',      name:'Noise-Cancelling Cans', icon:'🎧', rarity:'common',
    flavour:'Half the value is the signal to everyone else that you are not available.' },
  { id:'timer',     name:'Kitchen Timer',      icon:'⏲️', rarity:'common',
    flavour:'A physical one. The phone is the thing you are hiding from.' },

  /* -------------------------------- rare --------------------------------- */
  { id:'dotfiles',  name:'Dotfiles Repo',      icon:'📁', rarity:'rare',
    flavour:'A new machine becomes your machine in one command. Compounds forever.' },
  { id:'keybinds',  name:'Muscle-Memory Keybinds', icon:'⌘', rarity:'rare',
    flavour:'The gap between thinking it and it happening gets shorter every month.' },
  { id:'devenv',    name:'Reproducible Dev Env', icon:'📦', rarity:'rare',
    flavour:'It works on your machine, and now that is a testable claim.' },
  { id:'scratch',   name:'Scratch Repo',       icon:'🧪', rarity:'rare',
    flavour:'Somewhere to try the thing without deciding first whether it deserves a project.' },
  { id:'reading',   name:'Reading Queue',      icon:'📚', rarity:'rare',
    flavour:'Papers and source you meant to read, in one place instead of forty tabs.' },

  /* -------------------------------- epic --------------------------------- */
  { id:'notes',     name:'Second Brain',       icon:'🧠', rarity:'epic',
    flavour:'You solved this before. The difference is whether you can find it.' },
  { id:'snippets',  name:'Snippet Library',    icon:'✂️', rarity:'epic',
    flavour:'Everything you have written twice, written once and kept.' },
  { id:'ci',        name:'CI You Trust',       icon:'🟢', rarity:'epic',
    flavour:'Green means green. A flaky suite is worse than no suite.' },
  { id:'harness',   name:'Personal Test Harness', icon:'🧰', rarity:'epic',
    flavour:'The scaffolding that makes starting anything take five minutes.' },

  /* ------------------------------ legendary ------------------------------ */
  { id:'mentor',    name:'A Mentor',           icon:'🧭', rarity:'legendary',
    flavour:'Someone who has already made the mistake you are about to. Nothing else is this fast.' },
  { id:'oss',       name:'Maintainership',     icon:'🌍', rarity:'legendary',
    flavour:'Strangers depend on your judgement now. You will get better at it very quickly.' },
  { id:'taste',     name:'Taste',              icon:'◈', rarity:'legendary',
    flavour:'Knowing which of the working solutions is the good one. The last thing to arrive.' },
];

export const LOOT_BY_ID = Object.fromEntries(LOOT.map(l => [l.id, l]));

/** Multiplier from everything owned, capped. Distinct items only — duplicates
 *  are worth coins, not compounding power. */
export function lootBonus(owned = {}) {
  const raw = Object.keys(owned)
    .filter(id => owned[id] > 0 && LOOT_BY_ID[id])
    .reduce((n, id) => n + RARITY[LOOT_BY_ID[id].rarity].bonus, 0);
  return 1 + Math.min(MAX_BONUS, raw);
}

export const dropRarity = () => {
  const total = RARITY_ORDER.reduce((n, r) => n + RARITY[r].weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITY_ORDER) {
    roll -= RARITY[r].weight;
    if (roll <= 0) return r;
  }
  return 'common';
};

/**
 * Roll a drop. `chance` gates whether anything falls at all; `minRarity` floors
 * the result, which is how a won gauntlet always pays properly.
 */
export function rollLoot({ chance = 1, minRarity = null } = {}) {
  if (Math.random() > chance) return null;

  let rarity = dropRarity();
  if (minRarity) {
    const floor = RARITY_ORDER.indexOf(minRarity);
    if (RARITY_ORDER.indexOf(rarity) < floor) rarity = RARITY_ORDER[floor];
  }

  const pool = LOOT.filter(l => l.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)] || null;
}
