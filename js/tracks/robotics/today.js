/** The robotics card on Today: today's mission, in the same card as the Robots tab. */
import { mission, isVerified, currentMonth, plan } from './actions.js';
import { monthByN, MONTHS, BUILDS, MONTH_DAYS } from './roadmap.js';
import { TOTAL_MISSIONS } from './plan.js';
import { esc } from '../../ui.js';
import { missionCard, mountMission } from './view-mission.js';

export function render() {
  const m = mission(), month = monthByN(m.month), p = plan(), done = p.done + p.skipped;
  return `<div class="card track-card" style="--tc:var(--acid)">
    <div class="path-top"><span class="path-ico">🤖</span>
      <div class="grow"><div class="h3">Mission ${m.n} of ${TOTAL_MISSIONS}</div>
        <div class="tiny truncate">Robotics · month ${month.n} · ${esc(month.title)}</div></div>
      <button class="btn xs" data-go="robotics">Open</button></div>
    <div class="plan-bar" style="margin-top:10px;--cols:${MONTHS.length}">${MONTHS.map(x => {
      const f = Math.max(0, Math.min(1, (done - MONTH_DAYS * (x.n - 1)) / MONTH_DAYS));
      return `<i class="${x.n <= month.n ? 'open' : ''}" style="--f:${f}"></i>`;
    }).join('')}</div>
    ${missionCard({ compact: true })}
  </div>`;
}

export const mount = mountMission;

/** Things the focus timer can be tagged with: the builds you could be working on. */
export const timerTags = () => BUILDS.filter(b => b.month <= currentMonth() && !isVerified(b.id))
  .map(b => ({ value: `robotics:${b.id}`, label: `Robotics · M${b.month} · ${b.name}` }));
