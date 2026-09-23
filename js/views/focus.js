/**
 * The focus timer — one for every track. The only way time gets into this app
 * is by being measured: there is no field anywhere to type minutes into.
 */
import { S, timerRunning, timerMinutes, timerStart, timerStop, getDay, timerCap, MAX_SESSION_MIN, enabledTracks } from '../state.js';
import { trackById } from '../tracks/index.js';
import { sheet, esc, toast, rewardToast, hm, sfx, bar } from '../ui.js';

const tagLabel = tag => {
  if (!tag) return 'General work';
  for (const id of enabledTracks()) {
    const hit = trackById(id).today.timerTags?.().find(t => t.value === tag);
    if (hit) return hit.label;
  }
  return tag;
};

export function openFocus(rerender) {
  const running = timerRunning(), day = getDay(), goal = S.profile.focusGoal || 120;
  const groups = enabledTracks().map(id => ({ track: trackById(id), tags: trackById(id).today.timerTags?.() || [] }));

  const body = running ? `
      <div class="center">
        <div class="bench-clock num" data-live>${hm(timerMinutes())}</div>
        <div class="sub" style="margin-top:8px">On: <b>${esc(tagLabel(S.timer.tag))}</b></div>
      </div>
      <button class="btn hot block" style="margin-top:20px" data-stop>Stop and log it</button>
      <p class="tiny center" style="margin-top:12px">One session counts for at most ${MAX_SESSION_MIN / 60} hours. If you forgot it was running, you can trim it when you stop.</p>`
    : `
      <div class="card sunk">
        <div class="between"><span class="h3">Today</span><span class="num h3">${hm(day.timerMin)} / ${hm(goal)}</span></div>
        <div style="margin-top:8px">${bar((day.timerMin / goal) * 100)}</div>
        <div class="tiny" style="margin-top:8px">Focus time pays 1 XP a minute, up to ${timerCap()} a day, and twenty minutes keeps your streak. There is nowhere to type minutes in — the timer is the only way.</div>
      </div>
      <div class="field" style="margin-top:16px">
        <label for="fc-tag">What are you working on?</label>
        <select class="input" id="fc-tag">
          <option value="">General work — reading, a course, a side project</option>
          ${groups.map(g => `<optgroup label="${esc(g.track.name)}">${g.tags.map(t => `<option value="${esc(t.value)}">${esc(t.label.replace(`${g.track.name} · `, ''))}</option>`).join('')}</optgroup>`).join('')}
        </select>
      </div>
      <button class="btn primary block" style="margin-top:16px" data-start>Start the timer</button>`;

  sheet(running ? 'Focus timer' : 'Start focusing', body, (el, close) => {
    el.querySelector('[data-start]')?.addEventListener('click', () => {
      timerStart(el.querySelector('#fc-tag').value || null);
      sfx('start'); close(); toast('Timer running — it keeps going if you close the app.'); rerender();
    });
    el.querySelector('[data-stop]')?.addEventListener('click', () => {
      const mins = Math.min(timerMinutes(), MAX_SESSION_MIN);
      close();
      if (timerMinutes() >= 90) confirmStop(mins); else finish(null);
    });
    const live = el.querySelector('[data-live]');
    if (live) {
      const t = setInterval(() => { if (!document.body.contains(live)) return clearInterval(t); live.textContent = hm(timerMinutes()); }, 5000);
    }
  });

  function finish(keep) {
    const r = timerStop(keep);
    if (!r || !r.min) toast('Under a minute — nothing logged.');
    else { toast(`Logged ${hm(r.min)} of focus`); rewardToast(r.reward); }
    rerender();
  }

  function confirmStop(mins) {
    sheet('Stop the timer', `
      <p class="sub">That ran for <b>${hm(timerMinutes())}</b>${timerMinutes() > MAX_SESSION_MIN ? ` — more than the ${MAX_SESSION_MIN / 60}-hour cap` : ''}. Were you working the whole time?</p>
      <div class="field" style="margin-top:14px"><label for="fc-keep">Minutes to keep</label>
        <input class="input num" id="fc-keep" type="number" inputmode="numeric" min="1" max="${mins}" value="${mins}"></div>
      <button class="btn primary block" style="margin-top:16px" data-keep>Log it</button>
      <p class="tiny center" style="margin-top:10px">You can trim a session down, never up.</p>`,
      (el, close) => {
        el.querySelector('[data-keep]').onclick = () => {
          const v = Math.max(0, Math.min(mins, Math.round(+el.querySelector('#fc-keep').value || 0)));
          close(); finish(v);
        };
      });
  }
}
