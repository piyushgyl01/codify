/**
 * Achievements, checked against the lifetime stat snapshot in state.js.
 *
 * Every one of these is backed by something a judge or GitHub confirmed. There
 * is no achievement for logging hours, because logging hours is typing.
 */
export const ACHIEVEMENTS = [
  { id:'linked',      icon:'⇄', name:'Connected',    desc:'Link a Codeforces handle',            xp:60,   check:s => s.linked >= 1 },
  { id:'first-solve', icon:'✓', name:'First Blood',   desc:'One accepted solution',               xp:80,   check:s => s.solved >= 1 },
  { id:'ten-solves',  icon:'◎', name:'Ten Down',      desc:'Ten problems solved',                 xp:180,  check:s => s.solved >= 10 },
  { id:'fifty',       icon:'◉', name:'Fifty',         desc:'Fifty problems solved',               xp:450,  check:s => s.solved >= 50 },
  { id:'twohundred',  icon:'●', name:'Two Hundred',   desc:'Two hundred problems solved',         xp:1400, check:s => s.solved >= 200 },

  { id:'r1200',       icon:'▲', name:'Pupil',         desc:'Solve something rated 1200+',         xp:150,  check:s => s.bestRating >= 1200 },
  { id:'r1500',       icon:'▲', name:'Specialist',    desc:'Solve something rated 1500+',         xp:320,  check:s => s.bestRating >= 1500 },
  { id:'r1800',       icon:'▲', name:'Expert',        desc:'Solve something rated 1800+',         xp:700,  check:s => s.bestRating >= 1800 },
  { id:'r2100',       icon:'★', name:'Candidate',     desc:'Solve something rated 2100+',         xp:1600, check:s => s.bestRating >= 2100 },

  { id:'tier-1',      icon:'◈', name:'First Tier',    desc:'Clear any tier of any topic',         xp:120,  check:s => s.tiersCleared >= 1 },
  { id:'tier-10',     icon:'◈', name:'Ten Tiers',     desc:'Clear ten tiers',                     xp:400,  check:s => s.tiersCleared >= 10 },
  { id:'tier-30',     icon:'◆', name:'Thirty Tiers',  desc:'Clear thirty tiers',                  xp:1200, check:s => s.tiersCleared >= 30 },
  { id:'topic-max',   icon:'✦', name:'Maxed',         desc:'Clear every tier of one topic',       xp:900,  check:s => s.topicsMaxed >= 1 },
  { id:'broad',       icon:'▦', name:'Broad',         desc:'Solve in ten different topics',       xp:500,  check:s => s.topicsStarted >= 10 },
  { id:'complete',    icon:'✧', name:'Everything',    desc:'Touch all eighteen topics',           xp:1000, check:s => s.topicsStarted >= 18 },

  { id:'commit-1',    icon:'↑', name:'Shipped',       desc:'One public commit',                   xp:60,   check:s => s.commits >= 1 },
  { id:'commit-100',  icon:'↑', name:'A Hundred',     desc:'A hundred public commits',            xp:400,  check:s => s.commits >= 100 },
  { id:'commit-500',  icon:'⇈', name:'Five Hundred',  desc:'Five hundred public commits',         xp:1200, check:s => s.commits >= 500 },

  { id:'streak-7',    icon:'▪', name:'Seven',         desc:'A 7-day streak',                      xp:150,  check:s => s.bestStreak >= 7 },
  { id:'streak-30',   icon:'▪', name:'Thirty',        desc:'A 30-day streak',                     xp:500,  check:s => s.bestStreak >= 30 },
  { id:'streak-100',  icon:'■', name:'Hundred',       desc:'A 100-day streak',                    xp:1800, check:s => s.bestStreak >= 100 },

  { id:'timed-10',    icon:'◔', name:'Ten Hours',     desc:'Ten hours of timed practice',         xp:250,  check:s => s.verifiedMinutes >= 600 },
  { id:'timed-100',   icon:'◕', name:'Hundred Hours', desc:'A hundred hours of timed practice',   xp:1200, check:s => s.verifiedMinutes >= 6000 },
  { id:'quests-25',   icon:'◇', name:'Quest Runner',  desc:'Complete 25 daily quests',            xp:350,  check:s => s.quests >= 25 },
];

export const achievementById = id => ACHIEVEMENTS.find(a => a.id === id) || null;
