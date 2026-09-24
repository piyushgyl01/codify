/** The robotics card on Today: today's mission, and the boss when it is due. */
import { S } from '../../state.js';
import { mission, currentMonth, isVerified, missionsDone } from './actions.js';
import { monthByN, BUILDS, PLAN_DAYS } from './roadmap.js';
import { esc } from '../../ui.js';
import { missionCard, mountMission } from './view-mission.js';

export function render() {
  const m = mission(), month = monthByN(m.month), done = missionsDone();
  return `<div class="card track-card" style="--tc:var(--acid)">
    <div class="path-top"><span class="path-ico">🤖</span>
      <div class="grow"><div class="h3">Mission ${m.n} of ${PLAN_DAYS}</div>
        <div class="tiny truncate">Month ${month.n} · ${esc(month.title)}</div></div>
      <button class="btn xs" data-go="robotics">Open</button></div>
    <div class="plan-bar" style="margin-top:10px">${[1, 2, 3, 4, 5, 6].map(n => {
      const f = Math.max(0, Math.min(1, (done - 30 * (n - 1)) / 30));
      return `<i class="${n <= month.n ? 'open' : ''}" style="--f:${f}"></i>`;
    }).join('')}</div>
    ${missionCard({ compact: true })}
  </div>`;
}

export const mount = mountMission;

/** Things the focus timer can be tagged with: the builds you could be working on. */
export const timerTags = () => BUILDS.filter(b => b.month <= currentMonth() && !isVerified(b.id))
  .map(b => ({ value: `robotics:${b.id}`, label: `Robotics · M${b.month} · ${b.name}` }));
