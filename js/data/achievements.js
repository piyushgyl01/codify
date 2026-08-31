/**
 * Achievements. Each is a predicate over the lifetime stat snapshot in state.js,
 * checked after anything that could have moved a number.
 *
 * They are weighted towards the behaviours that are hard rather than the ones
 * that are merely large: retests passed, problems solved without a hint, and
 * days where most of the time was spent building. Anyone can accumulate hours.
 */
export const ACHIEVEMENTS = [
  /* ------------------------------- getting in ------------------------------ */
  { id:'first-log',    icon:'▲', name:'Day One',        desc:'Log your first session',                 xp:40,  check:s => s.sessions >= 1 },
  { id:'first-solve',  icon:'✓', name:'Solved',          desc:'Log your first solved problem',          xp:50,  check:s => s.solved >= 1 },
  { id:'first-ship',   icon:'↑', name:'Shipped',         desc:'Ship something',                         xp:60,  check:s => s.ships >= 1 },
  { id:'first-skill',  icon:'◈', name:'Claimed',         desc:'Master your first skill node',           xp:80,  check:s => s.skills >= 1 },

  /* --------------------------------- volume -------------------------------- */
  { id:'ten-hours',    icon:'◔', name:'Ten Hours',       desc:'10 hours of logged practice',            xp:120, check:s => s.minutes >= 600 },
  { id:'hundred-hours',icon:'◕', name:'Hundred Hours',   desc:'100 hours of logged practice',           xp:500, check:s => s.minutes >= 6000 },
  { id:'five-hundred', icon:'●', name:'Five Hundred',    desc:'500 hours of logged practice',           xp:2000,check:s => s.minutes >= 30000 },
  { id:'fifty-solved', icon:'◎', name:'Fifty Solved',    desc:'Solve 50 problems',                      xp:300, check:s => s.solved >= 50 },
  { id:'two-hundred',  icon:'◉', name:'Two Hundred',     desc:'Solve 200 problems',                     xp:900, check:s => s.solved >= 200 },

  /* -------------------------------- quality -------------------------------- */
  { id:'builder',      icon:'⚒', name:'Builder',         desc:'50 hours in Build mode',                 xp:400, check:s => s.buildMinutes >= 3000 },
  { id:'no-tutorials', icon:'⊘', name:'Out of the Hell', desc:'30 days where Build and Drill were most of your time', xp:450, check:s => s.deliberateDays >= 30 },
  { id:'cold-solver',  icon:'❄', name:'No Hints',        desc:'Solve 25 problems without a hint',       xp:350, check:s => s.solvedNoHint >= 25 },
  { id:'hard-mode',    icon:'▲', name:'Hard Mode',       desc:'Solve 20 hard problems',                 xp:600, check:s => s.hardSolved >= 20 },
  { id:'full-cover',   icon:'▦', name:'Full Coverage',   desc:'Solve at least one problem in every pattern', xp:700, check:s => s.patternsCovered >= 18 },

  /* ------------------------------- retention ------------------------------- */
  { id:'first-retest', icon:'↻', name:'Still There',     desc:'Pass your first retest',                 xp:100, check:s => s.retestsPassed >= 1 },
  { id:'retest-ten',   icon:'↻', name:'It Stuck',        desc:'Pass 10 retests',                        xp:300, check:s => s.retestsPassed >= 10 },
  { id:'retest-fifty', icon:'⟳', name:'Durable',         desc:'Pass 50 retests',                        xp:900, check:s => s.retestsPassed >= 50 },
  { id:'honest',       icon:'⊙', name:'Honest Ledger',   desc:'Fail a retest and log it anyway',        xp:150, check:s => s.retestsFailed >= 1 },
  { id:'clean-queue',  icon:'◇', name:'Empty Queue',     desc:'Clear every due retest with 10+ skills held', xp:500, check:s => s.clearedQueue >= 1 && s.skills >= 10 },

  /* --------------------------------- streaks ------------------------------- */
  { id:'week',         icon:'▪', name:'Seven',           desc:'A 7-day streak',                         xp:150, check:s => s.bestStreak >= 7 },
  { id:'month',        icon:'▪', name:'Thirty',          desc:'A 30-day streak',                        xp:500, check:s => s.bestStreak >= 30 },
  { id:'quarter',      icon:'■', name:'Ninety',          desc:'A 90-day streak',                        xp:1500,check:s => s.bestStreak >= 90 },
  { id:'year',         icon:'■', name:'Three Six Five',  desc:'A 365-day streak',                       xp:6000,check:s => s.bestStreak >= 365 },

  /* --------------------------------- depth --------------------------------- */
  { id:'ten-skills',   icon:'◈', name:'Ten Nodes',       desc:'Master 10 skill nodes',                  xp:400, check:s => s.skills >= 10 },
  { id:'path-clear',   icon:'◆', name:'Path Complete',   desc:'Master every node on one path',          xp:1200,check:s => s.pathsComplete >= 1 },
  { id:'polymath',     icon:'✦', name:'Polymath',        desc:'Master something on all 8 paths',        xp:800, check:s => s.pathsTouched >= 8 },
  { id:'half-tree',    icon:'✧', name:'Half the Tree',   desc:'Master 33 skill nodes',                  xp:2000,check:s => s.skills >= 33 },

  /* -------------------------------- gauntlets ------------------------------ */
  { id:'first-gauntlet', icon:'☣', name:'First Blood',   desc:'Win your first gauntlet',                xp:300, check:s => s.gauntlets >= 1 },
  { id:'all-gauntlets',  icon:'⛈', name:'All Four',      desc:'Win every gauntlet',                     xp:2500,check:s => s.gauntlets >= 4 },
  { id:'comeback',       icon:'↺', name:'Second Attempt',desc:'Win a gauntlet you previously lost',     xp:400, check:s => s.gauntletComebacks >= 1 },

  /* -------------------------------- shipping ------------------------------- */
  { id:'ship-ten',     icon:'⇄', name:'Ten Pull Requests', desc:'Open 10 pull requests',                xp:350, check:s => s.prs >= 10 },
  { id:'ship-project', icon:'★', name:'Finished',        desc:'Finish a whole project',                 xp:600, check:s => s.projects >= 1 },
  { id:'ship-three',   icon:'★', name:'Three Projects',  desc:'Finish three projects',                  xp:1500,check:s => s.projects >= 3 },

  /* --------------------------------- habits -------------------------------- */
  { id:'early',        icon:'☀', name:'Before Seven',    desc:'20 sessions started before 07:00',       xp:300, check:s => s.earlyBird >= 20 },
  { id:'late',         icon:'☾', name:'After Ten',       desc:'20 sessions started after 22:00',        xp:300, check:s => s.nightOwl >= 20 },
  { id:'quests-fifty', icon:'◇', name:'Fifty Quests',    desc:'Complete 50 daily quests',               xp:400, check:s => s.quests >= 50 },
  { id:'drill-master', icon:'▤', name:'Drill Sergeant',  desc:'Finish 50 drills',                       xp:500, check:s => s.drills >= 50 },
  { id:'combo-king',   icon:'⚡', name:'Unbroken',        desc:'Finish a session with a 12-step combo',  xp:450, check:s => s.bestCombo >= 12 },
];

export const achievementById = id => ACHIEVEMENTS.find(a => a.id === id) || null;
