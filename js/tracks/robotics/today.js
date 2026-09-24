/** The robotics card on Today: the drill, where you are in the plan, the next build, the boss. */
import { S, getDay } from '../../state.js';
import { drillDoneToday, dueSkills, plan, currentMonth, isUnlocked, isVerified, bossReady } from './actions.js';
import { MONTHS, monthByN, BUILDS, PLAN_DAYS, MONTH_DAYS } from './roadmap.js';
import { bossFor } from './bosses.js';
import { esc } from '../../ui.js';
import { icon } from '../../icons.js';
import { openDrill, openBoss, resumeSession } from './player.js';
import { openBuild } from './view-builds.js';

export const nextBuild = () => BUILDS.find(b => isUnlocked(b.month) && !isVerified(b.id)) || null;

export function render() {
  const p = plan(), m = monthByN(currentMonth());
  const done = drillDoneToday(), active = S.active, due = dueSkills().length;
  const drill = getDay().robotics?.drill;
  const b = nextBuild(), n = currentMonth(), boss = bossFor(n), ready = bossReady(n), won = S.tracks.robotics.bosses[n]?.won;

  const drillBtn = active
    ? `<button class="btn primary sm" data-robo="resume">Resume ${active.mode === 'boss' ? 'fight' : active.mode}</button>`
    : done ? `<span class="badge good">✓ ${drill.score}/${drill.total}</span>`
    : `<button class="btn primary sm" data-robo="drill">Start drill</button>`;

  return `<div class="card track-card" style="--tc:var(--acid)">
    <div class="path-top"><span class="path-ico">🤖</span>
      <div class="grow"><div class="h3">Robotics</div><div class="tiny">Day ${Math.min(p.day + 1, PLAN_DAYS)} of ${PLAN_DAYS} · ${esc(m.title)}</div></div>
      <button class="btn xs" data-go="robotics">Open</button></div>
    <div class="plan-bar" style="margin-top:10px">${MONTHS.map(x => `<i class="${p.unlocked.includes(x.n) ? 'open' : ''}"
      style="--f:${Math.max(0, Math.min(1, (p.day - MONTH_DAYS * (x.n - 1)) / MONTH_DAYS))}"></i>`).join('')}</div>

    <div class="track-row">
      <div class="grow"><div class="h3">Daily drill</div>
        <div class="tiny">${done ? 'Done for today' : due ? `${due} review${due === 1 ? '' : 's'} due` : 'Five questions'}</div></div>
      ${drillBtn}
    </div>
    ${b ? `<button class="track-row tap" data-build="${b.id}">
      <div class="grow"><div class="h3 truncate">${esc(b.name)}</div><div class="tiny">Next build · ${esc(b.cost)}</div></div>
      ${icon('chevron', 16).value}</button>` : ''}
    <div class="track-row">
      <div class="grow"><div class="h3">${boss.icon} ${esc(boss.name)}</div>
        <div class="tiny">${won ? 'Defeated' : ready.ok ? 'Ready to fight' : esc(ready.why)}</div></div>
      ${!won && ready.ok ? `<button class="btn hot sm" data-robo="boss" data-month="${n}">Fight</button>` : ''}
    </div>
  </div>`;
}

export function mount(root, rerender) {
  root.querySelectorAll('[data-robo]').forEach(el => {
    el.onclick = () => {
      const a = el.dataset.robo;
      if (a === 'drill') openDrill(rerender);
      else if (a === 'resume') resumeSession(rerender);
      else if (a === 'boss') openBoss(+el.dataset.month, rerender);
    };
  });
  root.querySelectorAll('.track-card [data-build]').forEach(el => { el.onclick = () => openBuild(el.dataset.build, rerender); });
}

/** Things the focus timer can be tagged with: the builds you could be working on. */
export const timerTags = () => BUILDS.filter(b => b.month <= currentMonth() && !isVerified(b.id))
  .map(b => ({ value: `robotics:${b.id}`, label: `Robotics · M${b.month} · ${b.name}` }));
