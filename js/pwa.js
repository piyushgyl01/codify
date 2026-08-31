/**
 * Install and update plumbing.
 * Everything here degrades silently: a browser with no service worker and no
 * install prompt just runs the app as an ordinary page.
 */
import { toast } from './ui.js';

let deferredPrompt = null;
const listeners = new Set();
export const onInstallChange = fn => (listeners.add(fn), () => listeners.delete(fn));
const notify = () => listeners.forEach(fn => fn());

export const isInstalled = () =>
  matchMedia('(display-mode: standalone)').matches ||
  matchMedia('(display-mode: minimal-ui)').matches ||
  navigator.standalone === true;

export const canInstall = () => !!deferredPrompt;

/** Returns 'accepted' | 'dismissed' | 'unavailable'. */
export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';
  const prompt = deferredPrompt;
  deferredPrompt = null;               // a prompt can only be used once
  notify();
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome;
}

export function initPwa() {
  addEventListener('beforeinstallprompt', e => {
    e.preventDefault();                // keep our own button in charge of timing
    deferredPrompt = e;
    notify();
  });

  addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
    toast('Installed — open it from your home screen');
  });

  if (!('serviceWorker' in navigator)) return;

  addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });

      const takeOver = worker => {
        toast('New version ready — updating…', 2600);
        worker.postMessage('skip-waiting');
      };
      if (reg.waiting) takeOver(reg.waiting);

      // Once the fresh worker controls the page, reload so it actually runs the
      // new files. Every mutation writes to localStorage as it happens, so a
      // reload costs nothing but the repaint.
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        location.reload();
      });

      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          // A controller already present means this is an update, not first install.
          if (sw.state === 'installed' && navigator.serviceWorker.controller) takeOver(sw);
        });
      });
    } catch (err) {
      console.warn('[pwa] service worker registration failed:', err.message);
    }
  });
}
