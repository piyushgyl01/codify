/** The robotics track: the six-month plan, the drillable skills, and the builds. */
import { S } from '../../state.js';
import { plan, currentMonth } from './actions.js';
import { monthByN, PLAN_DAYS } from './roadmap.js';
import * as planView from './view-plan.js';
import * as skillsView from './view-skills.js';
import * as buildsView from './view-builds.js';

const TABS = [['plan', 'Plan', planView], ['skills', 'Skills', skillsView], ['builds', 'Builds', buildsView]];
let tab = 'plan';

/** Let another screen open the hub on a particular tab. */
export const openTab = t => { if (TABS.some(([k]) => k === t)) tab = t; };

export function render() {
  const m = monthByN(currentMonth()), p = plan();
  const view = TABS.find(([k]) => k === tab)[2];
  return `<div class="fade-up">
    <div class="between page-head"><div><div class="h1">Robots</div>
      <div class="sub">Month ${m.n} · ${m.title}</div></div>
      <span class="badge">day ${Math.min(p.day + 1, PLAN_DAYS)} / ${PLAN_DAYS}</span></div>
    <div class="seg" style="margin-top:14px">${TABS.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-sub="${k}">${l}</button>`).join('')}</div>
    <div style="margin-top:16px">${view.render()}</div>
  </div>`;
}

export function mount(root, rerender) {
  root.querySelectorAll('[data-sub]').forEach(b => {
    b.onclick = () => { tab = b.dataset.sub; rerender(); document.getElementById('view').scrollTop = 0; };
  });
  TABS.find(([k]) => k === tab)[2].mount(root, rerender);
}
