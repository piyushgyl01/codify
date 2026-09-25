/** The programming card on Today: today's mission, in the same card as the Code tab. */
import { S } from '../../state.js';
import { mission, plan, isLinked } from './actions.js';
import { MONTHS, monthByN, TOTAL_MISSIONS } from './plan.js';
import { TOPICS } from './topics.js';
import { esc } from '../../ui.js';
import { missionCard, mountMission } from './view-mission.js';
import { MONTH_DAYS } from '../../learn/plan.js';

export function render() {
  const m = mission(), month = monthByN(m.month), p = plan(), done = p.done + p.skipped;
  return `<div class="card track-card" style="--tc:var(--blue)">
    <div class="path-top"><span class="path-ico">🧩</span>
      <div class="grow"><div class="h3">Mission ${m.n} of ${TOTAL_MISSIONS}</div>
        <div class="tiny truncate">Code · ${isLinked() ? esc(S.tracks.cp.handle) : 'connect Codeforces to count solves'} · part ${month.n}</div></div>
      <button class="btn xs" data-go="cp">Open</button></div>
    <div class="plan-bar" style="margin-top:10px;--cols:${MONTHS.length}">${MONTHS.map(x => {
      const f = Math.max(0, Math.min(1, (done - MONTH_DAYS * (x.n - 1)) / MONTH_DAYS));
      return `<i class="${x.n <= month.n ? 'open' : ''}" style="--f:${f}"></i>`;
    }).join('')}</div>
    ${missionCard({ compact: true })}
  </div>`;
}

export const mount = mountMission;

/** Things the focus timer can be tagged with: the topics. */
export const timerTags = () => TOPICS.map(t => ({ value: `cp:${t.id}`, label: `Programming · ${t.name}` }));
