/**
 * Achievements. Every one reads a number the app measured or a judge confirmed —
 * none can be ticked by hand. Grouped by track for display.
 *
 * IDs that existed in Codify are kept exactly, so anything already earned there
 * stays earned; Botify's are mapped onto these when its progress is imported.
 */
const a = (track, id, icon, name, desc, xp, check) => ({ track, id, icon, name, desc, xp, check });

export const ACHIEVEMENTS = [
  /* the character */
  a('core', 'streak-7',   '🔥', 'A week',            '7-day streak',                       150,  s => s.bestStreak >= 7),
  a('core', 'streak-30',  '🔥', 'A month',           '30-day streak',                      500,  s => s.bestStreak >= 30),
  a('core', 'streak-100', '☄️', 'A hundred days',    '100-day streak',                     1800, s => s.bestStreak >= 100),
  a('core', 'streak-180', '🌋', 'Half a year',       '180-day streak',                     3000, s => s.bestStreak >= 180),
  a('core', 'timed-10',   '⏱️', 'Ten hours',         'Ten hours on the focus timer',       250,  s => s.timerMin >= 600),
  a('core', 'timed-50',   '⏲️', 'Fifty hours',       'Fifty hours on the focus timer',     600,  s => s.timerMin >= 3000),
  a('core', 'timed-100',  '🕰️', 'A hundred hours',   'A hundred hours on the focus timer', 1200, s => s.timerMin >= 6000),
  a('core', 'quests-25',  '📜', 'Quest runner',      'Complete 25 daily quests',           350,  s => s.quests >= 25),
  a('core', 'commit-1',   '🚀',  'Shipped',           'One public commit',                  60,   s => s.commits >= 1),
  a('core', 'commit-100', '🛰️',  'A hundred commits', 'A hundred public commits',           400,  s => s.commits >= 100),
  a('core', 'two-tracks', '🔀', 'Polymath',          'Real progress in two tracks',        300,  s => s.tracksActive >= 2),
  a('core', 'level-10',   '🔟', 'Level 10',          'Reach level 10',                     0,    s => s.level >= 10),
  a('core', 'level-25',   '🌟', 'Level 25',          'Reach level 25',                     0,    s => s.level >= 25),
  a('core', 'level-45',   '👑', 'Level 45',          'Reach level 45',                     0,    s => s.level >= 45),

  /* competitive programming */
  a('cp', 'linked',      '🔗', 'Connected',     'Link a Codeforces handle',        60,   s => s.linked >= 1),
  a('cp', 'first-solve', '✅', 'First blood',   'One accepted solution',           80,   s => s.solved >= 1),
  a('cp', 'ten-solves',  '🎯', 'Ten down',      'Ten problems solved',             180,  s => s.solved >= 10),
  a('cp', 'fifty',       '🏅', 'Fifty',         'Fifty problems solved',           450,  s => s.solved >= 50),
  a('cp', 'twohundred',  '🏆', 'Two hundred',   'Two hundred problems solved',     1400, s => s.solved >= 200),
  a('cp', 'r1200',       '🌱', 'Pupil',         'Solve something rated 1200+',     150,  s => s.bestRating >= 1200),
  a('cp', 'r1500',       '🔷', 'Specialist',    'Solve something rated 1500+',     320,  s => s.bestRating >= 1500),
  a('cp', 'r1800',       '💎', 'Expert',        'Solve something rated 1800+',     700,  s => s.bestRating >= 1800),
  a('cp', 'r2100',       '👑', 'Candidate',     'Solve something rated 2100+',     1600, s => s.bestRating >= 2100),
  a('cp', 'tier-1',      '🧗', 'First tier',    'Clear any tier of any topic',     120,  s => s.tiersCleared >= 1),
  a('cp', 'tier-10',     '🪜', 'Ten tiers',     'Clear ten tiers',                 400,  s => s.tiersCleared >= 10),
  a('cp', 'tier-30',     '🏔️', 'Thirty tiers',  'Clear thirty tiers',              1200, s => s.tiersCleared >= 30),
  a('cp', 'topic-max',   '⭐', 'Maxed',         'Clear every tier of one topic',   900,  s => s.topicsMaxed >= 1),
  a('cp', 'broad',       '🌈', 'Broad',         'Solve in ten different topics',   500,  s => s.topicsStarted >= 10),
  a('cp', 'contest-1',   '⚔️', 'Beat the clock', 'Win a timed contest',           300,  s => s.contestsWon >= 1),
  a('cp', 'cp-m1',       '🧭', 'First code mission', 'Finish a daily programming mission', 50, s => (s.codeMissions || 0) >= 1),
  a('cp', 'cp-m30',      '📅', 'A month of code', 'Thirty programming missions done', 300, s => (s.codeMissions || 0) >= 30),
  a('cp', 'cp-m120',     '🎓', 'The whole plan',  'All 120 programming missions done', 2000, s => (s.codeMissions || 0) >= 120),

  /* robotics */
  a('robotics', 'drill1',  '🎯', 'First mission',      'Finish a daily mission',                50,   s => s.drills >= 1),
  a('robotics', 'clean1',  '💯', 'No misses',          'Every answer right in a mission',       60,   s => s.perfectDrills >= 1),
  a('robotics', 'clean10', '🏅', 'Ten without a miss', 'Ten missions with every answer right',  250,  s => s.perfectDrills >= 10),
  a('robotics', 'up1',     '📈', 'Levelled up',        'Level up a skill',                      40,   s => (s.levelUps || 0) >= 1),
  a('robotics', 'm30',     '📅', 'A month of missions','Thirty missions done',                  300,  s => (s.missions || 0) >= 30),
  a('robotics', 'm60',     '🗓️', 'Halfway',            'Sixty missions done',                   700,  s => (s.missions || 0) >= 60),
  a('robotics', 'm120',    '🎓', 'The whole roadmap',  'All 120 missions done',                 2000, s => (s.missions || 0) >= 120),
  a('robotics', 'right100','✔️', 'A hundred right',    '100 correct robotics answers',          150,  s => s.correct >= 100),
  a('robotics', 'right500','✅', 'Five hundred right', '500 correct robotics answers',          400,  s => s.correct >= 500),
  a('robotics', 'build1',  '🔧', 'Proof',              'Verify your first build on GitHub',     150,  s => s.builds >= 1),
  a('robotics', 'build5',  '🛠️', 'Five builds',        'Five verified builds',                  400,  s => s.builds >= 5),
  a('robotics', 'build14', '🏗️', 'Halfway there',      'Fourteen verified builds',              900,  s => s.builds >= 14),
  a('robotics', 'build28', '🏭', 'Every build',        'All 28 verified',                       2500, s => s.builds >= s.totalBuilds),
  a('robotics', 'boss1',   '⚔️', 'First boss down',    'Beat a monthly boss',                   300,  s => s.bosses >= 1),
  a('robotics', 'boss4',   '🏆', 'All four',           'Beat every boss',                       2000, s => s.bosses >= 4),
  a('robotics', 'month1',  '📜', 'Month cleared',      'Every milestone of a month, plus its boss', 500, s => s.monthsCleared >= 1),
  a('robotics', 'month4',  '🎓', 'Roboticist',         'Clear all four months',                 4000, s => s.monthsCleared >= 4),
  a('robotics', 'box10',   '🗄️', 'Deep memory',        'Ten skills at level 5 or higher',       300,  s => (s.lvl5 || 0) >= 10),
  a('robotics', 'lvl10',   '🧠', 'Automatic',          'A skill at level 10',                   400,  s => (s.maxSkill || 0) >= 10),
];

/** Botify used different IDs for the achievements the two apps shared. */
export const BOTIFY_IDS = {
  streak7: 'streak-7', streak30: 'streak-30', streak100: 'streak-100', streak180: 'streak-180',
  bench10: 'timed-10', bench50: 'timed-50', bench200: 'timed-100',
  level10: 'level-10', level25: 'level-25', level45: 'level-45',
};
