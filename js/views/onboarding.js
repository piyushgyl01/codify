/** First run: who you are, which tracks, which accounts, and how long a day is. */
import { S, saveProfile, linkGithub, TRACK_IDS } from '../state.js';
import { TRACKS } from '../tracks/index.js';
import { linkCodeforces, setDailySolves } from '../tracks/cp/actions.js';
import { checkHandle } from '../tracks/cp/codeforces.js';
import { checkGithub } from '../platforms.js';
import { setStart } from '../tracks/robotics/actions.js';
import { dayKey } from '../game.js';
import { h, raw, esc, bind, $, confetti, sfx, toast } from '../ui.js';

let step = 0;
const draft = { name:'', tracks:[...TRACK_IDS], handle:'', github:'', focusGoal:120, solves:2 };

const GOALS = [
  { min:60,  name:'One hour',    desc:'Alongside a demanding job.' },
  { min:120, name:'Two hours',   desc:'Steady, serious progress.' },
  { min:180, name:'Three hours', desc:'Pushing hard.' },
];

function splash() {
  return `<div class="ob-splash">
    <div class="ob-mark">CODIFY</div>
    <div class="h2" style="margin-top:22px">Tech, as an RPG.</div>
    <p class="sub" style="margin:12px auto 0;max-width:340px">One character that levels up across everything you learn.
      It only pays for what it can check — a judge's verdict, a graded answer, a commit, a timed minute.</p>
    <div class="stack s2" style="margin-top:20px;text-align:left">${TRACKS.map(t => `
      <div class="card pad-s rail" style="--rail:${t.color}"><div class="h3">${t.icon} ${esc(t.name)}</div>
        <div class="tiny" style="margin-top:2px">${esc(t.tagline)}</div></div>`).join('')}</div>
    <button class="btn primary block" style="margin-top:22px" data-act="next">Start</button>
  </div>`;
}

const nameStep = () => h`
  <div class="label">1 of 4</div>
  <div class="h1" style="margin-top:8px">What should we call you?</div>
  <div class="field" style="margin-top:20px"><label for="ob-name">Name</label>
    <input class="input" id="ob-name" maxlength="32" autocomplete="given-name" value="${draft.name}" placeholder="Your name"></div>
  <button class="btn primary block" style="margin-top:20px" data-act="next">Next</button>`;

function tracksStep() {
  return `<div class="label">2 of 4</div>
    <div class="h1" style="margin-top:8px">What are you levelling?</div>
    <p class="sub" style="margin-top:10px">Pick one or both. You can switch tracks on or off any time in Hero — the character stays the same.</p>
    <div class="stack" style="margin-top:16px">${TRACKS.map(t => `
      <button class="card tap opt ${draft.tracks.includes(t.id) ? 'on' : ''}" data-track="${t.id}">
        <div class="between"><div class="h3">${t.icon} ${esc(t.name)}</div><span class="badge">${draft.tracks.includes(t.id) ? '✓ on' : 'off'}</span></div>
        <div class="tiny" style="margin-top:4px">${esc(t.tagline)}</div>
        <div class="tiny" style="margin-top:4px">Checks: ${esc(t.checks)}.</div>
      </button>`).join('')}</div>
    <button class="btn primary block" style="margin-top:20px" data-act="next">Next</button>`;
}

function accountsStep() {
  const cp = draft.tracks.includes('cp'), ro = draft.tracks.includes('robotics');
  return h`<div class="label">3 of 4</div>
    <div class="h1" style="margin-top:8px">Where does your work live?</div>
    <p class="sub" style="margin-top:10px">Public accounts only, no sign-in. These are what the app reads to check your work.</p>
    ${raw(cp ? `<div class="field" style="margin-top:18px"><label for="ob-cf">Codeforces handle</label>
      <input class="input" id="ob-cf" autocapitalize="off" spellcheck="false" value="${esc(draft.handle)}" placeholder="tourist"></div>
      <div class="tiny" style="margin-top:6px">Every tier and contest in Programming is read from your accepted submissions.</div>` : '')}
    <div class="field" style="margin-top:18px"><label for="ob-gh">GitHub username${raw(ro ? '' : ' <span class="tiny">(optional)</span>')}</label>
      <input class="input" id="ob-gh" autocapitalize="off" spellcheck="false" value="${draft.github}" placeholder="octocat"></div>
    <div class="tiny" style="margin-top:6px">${ro ? 'Robotics builds are verified against your public repos. Public commits also earn XP.' : 'Public commits earn XP.'}</div>
    <button class="btn primary block" style="margin-top:20px" data-act="accounts">Next</button>
    <button class="btn ghost block sm" style="margin-top:8px" data-act="skip">Skip — add them later in Hero</button>`;
}

function goalStep() {
  const cp = draft.tracks.includes('cp');
  return `<div class="label">4 of 4</div>
    <div class="h1" style="margin-top:8px">How long is a day?</div>
    <p class="sub" style="margin-top:10px">Your focus-timer goal, shared by every track.</p>
    <div class="stack" style="margin-top:16px">${GOALS.map(g => `
      <button class="card tap opt ${draft.focusGoal === g.min ? 'on' : ''}" data-goal="${g.min}">
        <div class="between"><div class="h3">${g.name}</div><div class="num h3">${g.min} min</div></div>
        <div class="tiny" style="margin-top:4px">${g.desc}</div></button>`).join('')}</div>
    ${cp ? `<div class="label" style="margin-top:18px">Problems a day</div>
      <div class="seg" style="margin-top:8px">${[1, 2, 3, 4].map(n => `<button class="${draft.solves === n ? 'on' : ''}" data-solves="${n}">${n}</button>`).join('')}</div>` : ''}
    <button class="btn primary block" style="margin-top:20px" data-act="finish">Begin</button>`;
}

export function render() {
  const pages = [splash, nameStep, tracksStep, accountsStep, goalStep];
  const dots = step > 0 ? `<div class="ob-progress" style="margin-bottom:22px">${[1, 2, 3, 4].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>` : '';
  return `<div class="onboard fade-up">${dots}${pages[step]()}</div>`;
}

export function mount(root, rerender) {
  const next = () => { step++; sfx('tick'); rerender(); };
  bind(root, {
    next: () => {
      const n = $('#ob-name', root);
      if (n) { draft.name = n.value.trim().slice(0, 32); if (!draft.name) { n.focus(); return; } }
      if (step === 2 && !draft.tracks.length) { toast('Pick at least one track.'); return; }
      next();
    },
    skip: () => { draft.handle = ''; draft.github = ''; next(); },
    accounts: async el => {
      draft.handle = $('#ob-cf', root)?.value.trim() || '';
      draft.github = $('#ob-gh', root)?.value.trim().replace(/^@/, '') || '';
      el.disabled = true; el.textContent = 'Checking…';
      try {
        if (draft.handle) draft.cf = await checkHandle(draft.handle);
        if (draft.github) draft.gh = await checkGithub(draft.github);
        next();
      } catch (err) {
        toast(esc(err.message), 4000);
        el.disabled = false; el.textContent = 'Next';
      }
    },
    finish: () => {
      if (draft.cf) linkCodeforces(draft.cf);
      if (draft.gh) linkGithub(draft.gh);
      setDailySolves(draft.solves);
      setStart(dayKey());
      saveProfile({ name: draft.name, tracks: draft.tracks, focusGoal: draft.focusGoal, onboarded: true });
      step = 0; confetti(90); sfx('levelup');
    },
  });
  root.querySelectorAll('[data-track]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.track;
      draft.tracks = draft.tracks.includes(id) ? draft.tracks.filter(t => t !== id) : TRACK_IDS.filter(t => [...draft.tracks, id].includes(t));
      rerender();
    };
  });
  root.querySelectorAll('[data-goal]').forEach(b => { b.onclick = () => { draft.focusGoal = +b.dataset.goal; rerender(); }; });
  root.querySelectorAll('[data-solves]').forEach(b => { b.onclick = () => { draft.solves = +b.dataset.solves; rerender(); }; });
  root.querySelector('input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') root.querySelector('[data-act="next"],[data-act="accounts"]')?.click();
  });
}
