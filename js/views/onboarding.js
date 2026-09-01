/** First run: a name, a goal, and the account that makes any of this real. */
import { S, saveProfile, linkCodeforces, THEMES, selectTheme, applyTheme } from '../state.js';
import { GOALS } from '../game.js';
import { TOPICS, TIERS } from '../data/skilltree.js';
import { checkHandle } from '../platforms.js';
import { syncAll } from '../sync.js';
import { h, raw, esc, $, $$, sfx, haptic, confetti, toast } from '../ui.js';

let step = 0;
const draft = { name:'', goal:'levelup', theme:'cobalt' };
let checking = false;

export function render() {
  return h`<div class="onboard">${raw(
    step === 0 ? splash() :
    step === 1 ? askName() :
    step === 2 ? askGoal() :
                 askHandle()
  )}</div>`;
}

const splash = () => `
  <div class="ob-splash">
    <div class="ob-mark">&lt;/&gt;</div>
    <div class="h1" style="margin-top:22px">CODIFY</div>
    <div class="h3" style="color:var(--dim);margin-top:8px">An RPG where the XP is real.</div>

    <div class="card" style="margin-top:24px;text-align:left">
      <div class="label">How it works</div>
      <ol class="ob-list">
        <li>You solve problems on Codeforces, like you already would.</li>
        <li>This reads your accepted submissions from their public API.</li>
        <li>Levels, tiers, streaks and loot come from that — not from anything you type.</li>
      </ol>
    </div>

    <div class="card sunk" style="margin-top:12px;text-align:left">
      <div class="label">What it will not do</div>
      <p class="sub" style="margin-top:8px">
        Take your word for it. There is no "mark as done" button anywhere in this app.
        You can still jot notes, but notes pay nothing and are labelled as such.
      </p>
    </div>

    <div class="wrap" style="justify-content:center;margin-top:20px">
      <span class="badge">${TOPICS.length} topics</span>
      <span class="badge">${TOPICS.length * TIERS.length} tiers</span>
      <span class="badge">5 contests</span>
    </div>

    <button class="btn primary block" style="margin-top:22px" data-next>Start</button>
  </div>`;

const askName = () => wrap('What should we call you?',
  'Stored on this device and nowhere else.', `
  <input class="input" id="ob-name" placeholder="Your name" maxlength="24"
         value="${esc(draft.name)}" autocomplete="off">
  <div class="section">
    <div class="label">Accent</div>
    <div class="pill-row" style="margin-top:8px">
      ${THEMES.filter(t => t.cost === 0).map(t => `
        <button class="pill ${draft.theme === t.id ? 'on' : ''}" data-theme="${t.id}">
          <span class="dot" style="background:${t.accent}"></span>${t.name}</button>`).join('')}
    </div>
  </div>`);

const askGoal = () => wrap('How hard are you going at this?',
  'Sets the daily target. Both numbers are things the app can check.', `
  <div class="stack s2">
    ${GOALS.map(g => `
      <button class="card tap opt ${draft.goal === g.id ? 'on' : ''}" data-goal="${g.id}">
        <div class="between">
          <div class="row" style="gap:10px">
            <span class="ob-glyph">${g.icon}</span>
            <div><div class="h3">${g.name}</div><div class="tiny">${esc(g.desc)}</div></div>
          </div>
          <div class="right">
            <div class="num h3">${g.solves}/day</div>
            <div class="tiny">${g.minutes}m</div>
          </div>
        </div>
      </button>`).join('')}
  </div>`);

const askHandle = () => `
  <div class="ob-progress">${Array.from({ length: 3 }, (_, i) => `<i class="${i < 3 ? 'on' : ''}"></i>`).join('')}</div>
  <div class="h2" style="margin-top:20px">Connect Codeforces</div>
  <p class="sub" style="margin-top:8px">
    Your handle only. No password, no token — the app reads the same public API
    anyone can. This is where every point in the game comes from.
  </p>

  <div class="field" style="margin-top:18px">
    <label>Codeforces handle</label>
    <input class="input" id="ob-handle" placeholder="tourist" autocapitalize="none"
           autocorrect="off" spellcheck="false">
    <div class="tiny" id="ob-status" style="min-height:18px"></div>
  </div>

  <button class="btn primary block" style="margin-top:14px" data-link>Connect and sync</button>
  <button class="btn ghost block sm" style="margin-top:8px" data-skip>Skip — I will connect later</button>

  <div class="card sunk" style="margin-top:18px">
    <div class="tiny">Without an account connected the app has nothing to measure, so
      levels and tiers will sit at zero. You can add it any time from the Hero tab.</div>
  </div>`;

function wrap(title, sub, body) {
  return `
    <div class="ob-progress">${Array.from({ length: 3 }, (_, i) =>
      `<i class="${i <= step - 1 ? 'on' : ''}"></i>`).join('')}</div>
    <div class="h2" style="margin-top:20px">${title}</div>
    <p class="sub" style="margin-top:8px">${sub}</p>
    <div style="margin-top:20px">${body}</div>
    <div class="row" style="margin-top:24px">
      ${step > 1 ? '<button class="btn ghost" data-back>Back</button>' : ''}
      <button class="btn primary grow" data-next>Continue</button>
    </div>`;
}

function finish(rerender) {
  saveProfile({ ...draft, onboarded: true, created: new Date().toISOString().slice(0, 10) });
  selectTheme(draft.theme);
  sfx('levelup'); confetti(110);
  rerender();
}

export function mount(root, rerender) {
  const collect = () => {
    const n = $('#ob-name', root);
    if (n) draft.name = n.value.trim().slice(0, 24);
  };

  $('[data-next]', root)?.addEventListener('click', () => {
    collect(); step = Math.min(3, step + 1); sfx('tick'); rerender();
  });
  $('[data-back]', root)?.addEventListener('click', () => {
    collect(); step = Math.max(0, step - 1); rerender();
  });

  $$('[data-theme]', root).forEach(b => b.onclick = () => {
    draft.theme = b.dataset.theme;
    S.profile.theme = draft.theme; applyTheme();
    $$('[data-theme]', root).forEach(x => x.classList.toggle('on', x === b));
    haptic(6);
  });

  $$('[data-goal]', root).forEach(b => b.onclick = () => {
    draft.goal = b.dataset.goal;
    $$('[data-goal]', root).forEach(x => x.classList.toggle('on', x === b));
    sfx('tick'); haptic(6);
    setTimeout(() => { step = 3; rerender(); }, 140);
  });

  $('[data-skip]', root)?.addEventListener('click', () => finish(rerender));

  $('[data-link]', root)?.addEventListener('click', async () => {
    if (checking) return;
    const input = $('#ob-handle', root);
    const status = $('#ob-status', root);
    const handle = input.value.trim();
    if (!handle) { status.textContent = 'Enter your handle first.'; return; }

    checking = true;
    status.textContent = 'Checking…';
    try {
      const user = await checkHandle(handle);
      linkCodeforces(user);
      status.textContent = `Found ${user.handle}${user.rating ? ` · rating ${user.rating}` : ''}. Syncing…`;
      finish(rerender);
      const r = await syncAll({ force: true });
      const n = r.cf?.fresh?.length || 0;
      toast(n ? `Pulled ${n} solved problems` : 'Connected — no solves found yet', 3600);
      rerender();
    } catch (err) {
      status.textContent = err.message;
    } finally {
      checking = false;
    }
  });
}

/** Re-open the goal and name questions from the Hero tab. */
export function openProfileEditor(rerender) {
  import('../ui.js').then(({ sheet }) => {
    const p = S.profile;
    sheet('Edit profile', `
      <div class="field">
        <label>Name</label>
        <input class="input" id="pe-name" maxlength="24" value="${esc(p.name)}">
      </div>
      <div class="field" style="margin-top:16px">
        <label>Daily goal</label>
        <div class="stack s2">
          ${GOALS.map(g => `<button class="card tap pad-s opt ${p.goal === g.id ? 'on' : ''}" data-goal="${g.id}">
            <div class="between"><div><div class="h3">${g.icon} ${g.name}</div>
            <div class="tiny">${esc(g.desc)}</div></div>
            <div class="num h3">${g.solves}/day</div></div></button>`).join('')}
        </div>
      </div>
      <button class="btn primary block" style="margin-top:20px" data-save>Save</button>
    `, (el, close) => {
      let goal = p.goal;
      $$('[data-goal]', el).forEach(b => b.onclick = () => {
        goal = b.dataset.goal;
        $$('[data-goal]', el).forEach(x => x.classList.toggle('on', x === b));
      });
      $('[data-save]', el).onclick = () => {
        saveProfile({ name: $('#pe-name', el).value.trim().slice(0, 24), goal });
        close(); rerender();
      };
    });
  });
}
