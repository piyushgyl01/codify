/** The robotics track: today's mission, the skills and their levels, the four-month plan, the builds. */
import { mission, skillScore } from './actions.js';
import { monthByN } from './roadmap.js';
import * as missionView from './view-mission.js';
import * as planView from './view-plan.js';
import * as skillsView from './view-skills.js';
import * as buildsView from './view-builds.js';

const TABS = [['today', 'Today', missionView], ['skills', 'Skills', skillsView], ['plan', 'Plan', planView], ['builds', 'Builds', buildsView]];
let tab = 'today';

/** Let another screen open the hub on a particular tab. */
export const openTab = t => { if (TABS.some(([k]) => k === t)) tab = t; };

export function render() {
  const today = mission(), m = monthByN(today.month);
  const view = TABS.find(([k]) => k === tab)[2];
  return `<div class="fade-up">
    <div class="between page-head"><div><div class="h1">Robots</div>
      <div class="sub">Month ${m.n} · ${m.title}</div></div>
      <span class="badge solid">score ${skillScore()}</span></div>
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
