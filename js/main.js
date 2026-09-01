/** Boot: restore the save, audit the streak, wire the global listeners. */
import { S, applyTheme, auditStreak, on, onSaveError, today, save } from './state.js';
import { boot, rerender, go } from './router.js';
import { initPwa } from './pwa.js';
import { closeTop, $, toast } from './ui.js';

applyTheme();
auditStreak();
boot();
initPwa();

/* A failed write means every action from here is being discarded. Say so once,
   loudly, rather than letting someone log a week into a full disk. */
onSaveError(() => {
  toast('⚠ Could not save — storage is full or blocked. Export a backup from Hero.', 9000);
});

/* Home-screen shortcuts arrive as ?tab=train — honour them, then tidy the URL. */
const wanted = new URLSearchParams(location.search).get('tab');
if (wanted) {
  go(wanted);
  history.replaceState({ app: true }, '', location.pathname);
}

/* Repaint the chrome (XP, credits, streak) whenever the save changes. Coalesced
   to one frame, because logging a session emits several times in a row. */
let pending = false;
on(type => {
  if (pending) return;
  if (!['focus','problem','ship','skill','retest','session','quest','shop','profile','reset','import'].includes(type)) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; rerender(); });
});

/* Escape and browser-back close the top overlay instead of leaving the app. */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTop(); });
history.pushState({ app: true }, '');
addEventListener('popstate', () => {
  closeTop();
  history.pushState({ app: true }, '');
});

/* Roll over to a new day if the tab was left open past midnight. */
let mounted = today();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') { save({ immediate: true }); return; }
  if (today() !== mounted) { mounted = today(); auditStreak(); rerender(); }
});
addEventListener('beforeunload', () => save({ immediate: true }));

/* Confetti frozen mid-flight while hidden should not still be there on return. */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    const c = $('#fx');
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
  }
});

/* Keep the confetti canvas sized to the app frame. */
const fx = $('#fx');
const sizeFx = () => { fx.width = fx.clientWidth; fx.height = fx.clientHeight; };
addEventListener('resize', sizeFx);
sizeFx();

console.log('%cCODIFY', 'font:700 20px ui-monospace,monospace;color:#2F6BFF', '— save v' + S.v);
