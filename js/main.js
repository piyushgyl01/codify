/** Boot: restore the save, audit the streak, resume anything unfinished, wire globals. */
import { S, applyTheme, auditStreak, on, onSaveError, today, save } from './state.js';
import { boot, rerender, go, tickTimerChip } from './router.js';
import { autoSync } from './sync.js';
import { initPwa } from './pwa.js';
import { closeTop, $, toast } from './ui.js';
import { openFocus } from './views/focus.js';
import { resumeSession } from './tracks/robotics/player.js';

applyTheme();
auditStreak();
boot({ onTimer: () => openFocus(rerender) });
initPwa();

/* Everything lives in this browser's storage. Ask it not to evict it. */
navigator.storage?.persist?.().catch(() => {});

onSaveError(() => toast('⚠ Could not save — storage is full or blocked. Back up from Hero now.', 9000));

/* Pull from Codeforces and GitHub on open when linked and the last pull is stale. */
autoSync(() => rerender());

/* A phone that killed the tab mid-drill comes back to the same question. */
if (S.profile.onboarded && S.active) resumeSession(rerender);

/* Home-screen shortcuts arrive as ?tab=… — honour them, then tidy the URL. */
const wanted = new URLSearchParams(location.search).get('tab');
if (wanted) { go(wanted); history.replaceState({ app: true }, '', location.pathname); }

/* Repaint once per frame at most, whatever burst of changes caused it. */
let pending = false;
on(() => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; rerender(); });
});

/* Escape and browser-back close the top overlay instead of leaving the app. */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTop(); });
history.pushState({ app: true }, '');
addEventListener('popstate', () => { closeTop(); history.pushState({ app: true }, ''); });

/* Roll over at midnight if left open; save when hidden. */
let mounted = today();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') { save({ immediate: true }); return; }
  if (today() !== mounted) { mounted = today(); auditStreak(); rerender(); }
  tickTimerChip();
});
addEventListener('beforeunload', () => save({ immediate: true }));
setInterval(tickTimerChip, 15000);

const fx = $('#fx');
const sizeFx = () => { fx.width = fx.clientWidth; fx.height = fx.clientHeight; };
addEventListener('resize', sizeFx);
sizeFx();

console.log('%cCODIFY', 'font:800 20px system-ui;color:#5EA82E', '— save v' + S.v);
