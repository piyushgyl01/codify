/** The AI track: today's mission, what's new this week, the skills, the eight-part plan, and the builds. */
import { mission, skillScore } from './actions.js';
import { monthByN, topicById } from './plan.js';
import * as missionView from './view-mission.js';
import * as newView from './view-new.js';
import * as planView from './view-plan.js';
import * as buildsView from './view-builds.js';
import * as skills from '../../views/skills-list.js';

const skillsView = {
  render: () => skills.render('ai', { topicName: id => topicById(id)?.name || '' }),
  mount: (root, rerender) => skills.mount(root, 'ai', rerender),
};
const TABS = [['today', 'Today', missionView], ['new', 'New', newView], ['skills', 'Skills', skillsView], ['plan', 'Plan', planView], ['builds', 'Builds', buildsView]];
let tab = 'today';

export const openTab = t => { if (TABS.some(([k]) => k === t)) tab = t; };

export function render() {
  const m = monthByN(mission().month), view = TABS.find(([k]) => k === tab)[2];
  return `<div class="fade-up">
    <div class="between page-head"><div><div class="h1">AI</div><div class="sub">Part ${m.n} · ${m.title}</div></div>
      <span class="badge solid">score ${skillScore()}</span></div>
    <div class="seg seg-5" style="margin-top:14px">${TABS.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-sub="${k}">${l}</button>`).join('')}</div>
    <div style="margin-top:16px">${view.render()}</div>
  </div>`;
}

export function mount(root, rerender) {
  root.querySelectorAll('[data-sub]').forEach(b => { b.onclick = () => { tab = b.dataset.sub; rerender(); document.getElementById('view').scrollTop = 0; }; });
  TABS.find(([k]) => k === tab)[2].mount(root, rerender);
}
