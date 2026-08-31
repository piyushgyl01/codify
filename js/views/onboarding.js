/** First run: set up the profile, show what the numbers will mean, start. */
import { S, saveProfile, THEMES, selectTheme, applyTheme } from '../state.js';
import { GOALS, TRACKS, targetsFor, rankFor } from '../game.js';
import { NODES } from '../data/skilltree.js';
import { DRILLS, GAUNTLETS } from '../data/drills.js';
import { MODES } from '../data/practice.js';
import { h, raw, esc, hm, $, $$, sfx, haptic, confetti, toast } from '../ui.js';

let step = 0;
const draft = {
  name: '', track: 'generalist', hours: 2, goal: 'levelup', theme: 'phosphor',
};

const STEPS = 5;

export function render() {
  return h`<div class="onboard">${raw(
    step === 0 ? splash() :
    step === 1 ? askName() :
    step === 2 ? askTrack() :
    step === 3 ? askHours() :
    step === 4 ? askGoal() :
                 reveal()
  )}</div>`;
}

/* ---------------------------------- steps --------------------------------- */

const splash = () => `
  <div class="ob-splash">
    <div class="ob-mark">&lt;/&gt;</div>
    <div class="h1" style="margin-top:20px">CODIFY</div>
    <div class="h3" style="color:var(--accent);margin-top:6px">Deliberate practice, but it is a game.</div>
    <p class="sub" style="margin-top:16px;max-width:34ch;margin-inline:auto">
      Log the practice you actually do. Claim skills by proving them. Then get
      retested weeks later, so the tree shows what you still know rather than
      what you once did.
    </p>

    <div class="wrap" style="justify-content:center;margin-top:24px">
      <span class="badge">${NODES.length} skill nodes</span>
      <span class="badge">${DRILLS.length} drills</span>
      <span class="badge">${GAUNTLETS.length} gauntlets</span>
      <span class="badge">3 logs</span>
    </div>

    <div class="card sunk" style="margin-top:24px;text-align:left">
      <div class="label">The uncomfortable part</div>
      <p class="sub" style="margin-top:8px">
        An hour of video counts for less than an hour of building — ${MODES.map(m =>
          `${m.name} ×${m.weight.toFixed(2)}`).join(', ')}. That is the whole point,
        and it is not adjustable.
      </p>
    </div>

    <button class="btn primary block" style="margin-top:24px" data-next>Start</button>
  </div>`;

const askName = () => step2Wrap('What should we call you?',
  'It goes on the profile and nowhere else. Nothing here leaves your device.', `
  <input class="input" id="ob-name" placeholder="Your name" maxlength="24"
         value="${esc(draft.name)}" autocomplete="off" autocapitalize="words">
  <div class="section">
    <div class="label">Accent</div>
    <div class="pill-row" style="margin-top:8px">
      ${THEMES.filter(t => t.cost === 0).map(t => `
        <button class="pill ${draft.theme === t.id ? 'on' : ''}" data-theme="${t.id}">
          <span class="dot" style="background:${t.accent}"></span>${t.name}
        </button>`).join('')}
    </div>
    <div class="tiny" style="margin-top:8px">Eight more unlock with credits.</div>
  </div>`);

const askTrack = () => step2Wrap('What are you aiming at?',
  'This orders the skill tree and picks what gets recommended. You can change it any time.', `
  <div class="stack s2">
    ${TRACKS.map(t => `
      <button class="card tap opt ${draft.track === t.id ? 'on' : ''}" data-track="${t.id}">
        <div class="row">
          <span class="ob-glyph">${t.icon}</span>
          <div class="grow">
            <div class="h3">${t.name}</div>
            <div class="tiny">${t.paths.slice(0, 3).map(p => p.toUpperCase()).join(' → ')} first</div>
          </div>
        </div>
      </button>`).join('')}
  </div>`);

const askHours = () => step2Wrap('How much time do you actually have?',
  'Hours per day you could realistically give this. Be honest — every target on ' +
  'every screen is derived from this one number, and an inflated figure just ' +
  'makes the app lie to you politely.', `
  <div class="ob-hours">
    <div class="num ob-big" id="ob-hval">${draft.hours}</div>
    <div class="label" style="text-align:center">hours per day</div>
    <input type="range" id="ob-hours" min="0.5" max="8" step="0.5" value="${draft.hours}"
           class="ob-range" aria-label="Hours per day">
    <div class="between tiny"><span>30 min</span><span>8 hours</span></div>
  </div>
  <div class="card sunk" style="margin-top:16px">
    <div class="sub" id="ob-hnote"></div>
  </div>`);

const askGoal = () => step2Wrap('How hard are you pushing?',
  'This sets what share of your time becomes the daily target. Nobody converts ' +
  'all of it, so none of these are 100%.', `
  <div class="stack s2">
    ${GOALS.map(g => {
      const t = targetsFor({ hours: draft.hours, goal: g.id });
      return `<button class="card tap opt ${draft.goal === g.id ? 'on' : ''}" data-goal="${g.id}">
        <div class="between">
          <div class="row" style="gap:10px">
            <span class="ob-glyph">${g.icon}</span>
            <div>
              <div class="h3">${g.name}</div>
              <div class="tiny">${esc(g.desc)}</div>
            </div>
          </div>
          <div class="right">
            <div class="num h3">${t.focus}m</div>
            <div class="tiny">a day</div>
          </div>
        </div>
      </button>`;
    }).join('')}
  </div>`);

function reveal() {
  const t = targetsFor(draft);
  const rank = rankFor(1);
  return `
  <div class="ob-splash">
    <div class="label">Your starting numbers</div>
    <div class="h1" style="margin-top:8px">${esc(draft.name || 'Engineer')}</div>
    <div class="h3" style="color:${rank.color};margin-top:4px">${rank.icon} ${rank.name} · Level 1</div>

    <div class="grid2" style="margin-top:22px">
      <div class="tile"><div class="v">${t.focus}m</div><div class="k">daily focus</div></div>
      <div class="tile"><div class="v">${t.deliberate}%</div><div class="k">deliberate floor</div></div>
      <div class="tile"><div class="v">${hm(t.weekly)}</div><div class="k">a week</div></div>
      <div class="tile"><div class="v">${t.problems}/d</div><div class="k">problems</div></div>
    </div>

    <div class="card sunk" style="margin-top:16px;text-align:left">
      <div class="label">What happens next</div>
      <ol class="ob-list">
        <li>Log practice as you do it — three logs: sessions, problems, ships.</li>
        <li>Claim skill nodes by actually doing their task, with a timer running.</li>
        <li>A week later the first retest falls due. That is where this stops being a tracker.</li>
      </ol>
    </div>

    <button class="btn primary block" style="margin-top:22px" data-finish>Begin</button>
    <button class="btn ghost block sm" style="margin-top:8px" data-back>Back</button>
  </div>`;
}

/* --------------------------------- chrome --------------------------------- */

function step2Wrap(title, sub, body) {
  return `
    <div class="ob-progress">
      ${Array.from({ length: STEPS }, (_, i) =>
        `<i class="${i < step ? 'on' : ''}"></i>`).join('')}
    </div>
    <div class="h2" style="margin-top:20px">${title}</div>
    <p class="sub" style="margin-top:8px">${sub}</p>
    <div style="margin-top:20px">${body}</div>
    <div class="row" style="margin-top:24px">
      ${step > 1 ? '<button class="btn ghost" data-back>Back</button>' : ''}
      <button class="btn primary grow" data-next>Continue</button>
    </div>`;
}

/* ---------------------------------- mount --------------------------------- */

/** Pull typed values out of the DOM before moving on. */
function collect(root) {
  const name = $('#ob-name', root);
  if (name) draft.name = name.value.trim().slice(0, 24);
  const hours = $('#ob-hours', root);
  if (hours) draft.hours = +hours.value;
}

const hoursNote = hrs => {
  if (hrs <= 1) return 'Modest and sustainable. Most people overestimate this number by double.';
  if (hrs <= 2.5) return 'The realistic band for anyone with a job. This is where most progress happens.';
  if (hrs <= 5) return 'Serious. Worth checking against a week you have actually had, not a good one.';
  return 'Full-time study territory. The app will tell you if you drift above what you can hold.';
};

export function mount(root, rerender) {
  const next = () => { collect(root); step = Math.min(STEPS, step + 1); sfx('tick'); rerender(); };
  const back = () => { collect(root); step = Math.max(0, step - 1); rerender(); };

  $('[data-next]', root)?.addEventListener('click', next);
  $('[data-back]', root)?.addEventListener('click', back);

  $$('[data-theme]', root).forEach(b => b.addEventListener('click', () => {
    draft.theme = b.dataset.theme;
    // Paint it immediately — picking a colour you cannot see is a strange ask.
    S.profile.theme = draft.theme;
    applyTheme();
    $$('[data-theme]', root).forEach(x => x.classList.toggle('on', x === b));
    haptic(6);
  }));

  $$('[data-track]', root).forEach(b => b.addEventListener('click', () => {
    draft.track = b.dataset.track;
    $$('[data-track]', root).forEach(x => x.classList.toggle('on', x === b));
    sfx('tick'); haptic(6);
    setTimeout(next, 140);
  }));

  $$('[data-goal]', root).forEach(b => b.addEventListener('click', () => {
    draft.goal = b.dataset.goal;
    $$('[data-goal]', root).forEach(x => x.classList.toggle('on', x === b));
    sfx('tick'); haptic(6);
    setTimeout(next, 140);
  }));

  const slider = $('#ob-hours', root);
  if (slider) {
    const note = $('#ob-hnote', root), val = $('#ob-hval', root);
    const paint = () => {
      draft.hours = +slider.value;
      val.textContent = draft.hours;
      note.textContent = hoursNote(draft.hours);
    };
    slider.addEventListener('input', paint);
    paint();
  }

  $('[data-finish]', root)?.addEventListener('click', () => {
    collect(root);
    saveProfile({ ...draft, onboarded: true, created: undefined });
    delete S.profile.created;
    S.profile.created = new Date().toISOString().slice(0, 10);
    selectTheme(draft.theme);
    sfx('levelup'); confetti(120);
    toast('Logged in. Go and do something hard.', 3200);
    rerender();
  });
}

/* ---------------------------- profile editing ----------------------------- */

/** Re-run the same questions from the Hero tab, as a sheet. */
export function openProfileEditor(rerender) {
  import('../ui.js').then(({ sheet }) => {
    const p = S.profile;
    sheet('Edit profile', `
      <div class="stack s4">
        <div class="field">
          <label>Name</label>
          <input class="input" id="pe-name" maxlength="24" value="${esc(p.name)}">
        </div>

        <div class="field">
          <label>Track</label>
          <div class="pill-row">
            ${TRACKS.map(t => `<button class="pill ${p.track === t.id ? 'on' : ''}"
              data-track="${t.id}">${t.name}</button>`).join('')}
          </div>
        </div>

        <div class="field">
          <label>Hours available per day — <span class="num" id="pe-hval">${p.hours}</span></label>
          <input type="range" id="pe-hours" class="ob-range" min="0.5" max="8" step="0.5" value="${p.hours}">
        </div>

        <div class="field">
          <label>Intensity</label>
          <div class="stack s2">
            ${GOALS.map(g => {
              const t = targetsFor({ hours: p.hours, goal: g.id });
              return `<button class="card tap pad-s opt ${p.goal === g.id ? 'on' : ''}" data-goal="${g.id}">
                <div class="between"><div><div class="h3">${g.icon} ${g.name}</div>
                <div class="tiny">${esc(g.desc)}</div></div>
                <div class="num h3" data-focus="${g.id}">${t.focus}m</div></div></button>`;
            }).join('')}
          </div>
        </div>

        <button class="btn primary block" data-save>Save</button>
      </div>`, (el, close) => {
      let track = p.track, goal = p.goal;

      const repaintFocus = () => {
        const hrs = +$('#pe-hours', el).value;
        $('#pe-hval', el).textContent = hrs;
        GOALS.forEach(g => {
          const node = el.querySelector(`[data-focus="${g.id}"]`);
          if (node) node.textContent = `${targetsFor({ hours: hrs, goal: g.id }).focus}m`;
        });
      };
      $('#pe-hours', el).addEventListener('input', repaintFocus);

      $$('[data-track]', el).forEach(b => b.onclick = () => {
        track = b.dataset.track;
        $$('[data-track]', el).forEach(x => x.classList.toggle('on', x === b));
      });
      $$('[data-goal]', el).forEach(b => b.onclick = () => {
        goal = b.dataset.goal;
        $$('[data-goal]', el).forEach(x => x.classList.toggle('on', x === b));
      });

      $('[data-save]', el).onclick = () => {
        saveProfile({
          name: $('#pe-name', el).value.trim().slice(0, 24),
          hours: +$('#pe-hours', el).value,
          track, goal,
        });
        close();
        toast('Profile updated');
        rerender();
      };
    });
  });
}
