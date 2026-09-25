/**
 * One boss per month: that month's skills as a timed fight you can lose.
 *
 * The boss has HP, you have hearts. A right answer hits for 100 times your
 * combo; a wrong one, or running out of time, costs a heart. Lose and you can
 * come back tomorrow. Win and the next month opens early, so a boss is also the
 * way to run ahead of the calendar.
 */
export const BOSSES = [
  { month:1, id:'short',       name:'The Short Circuit',   icon:'⚡',
    intro:'Everything is connected to everything. That is the problem.',
    half:'Your regulator is sagging.', lost:'Tripped. Check the ground, come back tomorrow.', won:'Continuity restored.' },
  { month:2, id:'oscillator',  name:'The Oscillator',      icon:'〰️',
    intro:'Overshoot. Undershoot. Overshoot.',
    half:'You added D. It is working.', lost:'Unstable. Retune it and come back tomorrow.', won:'Critically damped.' },
  { month:3, id:'tftree',      name:'The Broken TF Tree',  icon:'🌳',
    intro:'Could not transform base_link to laser.',
    half:'A frame just connected.', lost:'Lookup failed. Come back tomorrow.', won:'The tree is whole.' },
  { month:4, id:'third',       name:'The Third Question',  icon:'❓',
    intro:'Why that gain? Why that sensor? What happens when the battery sags?',
    half:'Two levels deep. One to go.', lost:'"I would have to check." Tomorrow.', won:'You would hire you.' },
];

export const bossFor = month => BOSSES.find(b => b.month === month);

export const BOSS_HP = 1000;
export const BOSS_HEARTS = 3;
export const BOSS_QUESTIONS = 14;
/** Seconds per question. Arithmetic needs longer than recognition. */
export const BOSS_SECS = { num: 90, mc: 30 };

export const bossXp = month => 600 + month * 400;
export const bossCoins = month => 150 + month * 50;
export const bossMinRarity = month => (month <= 2 ? 'rare' : 'epic');
