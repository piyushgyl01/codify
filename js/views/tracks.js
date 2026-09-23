/** Every switched-on track, for when there are more than the nav can hold. */
import { enabledTracks } from '../state.js';
import { trackById } from '../tracks/index.js';
import { esc } from '../ui.js';
import { go } from '../router.js';

export function render() {
  return `<div class="stack fade-up"><div class="h1">Tracks</div>
    ${enabledTracks().map(trackById).map(t => `<button class="card tap rail" style="--rail:${t.color}" data-track="${t.id}">
      <div class="h2">${t.icon} ${esc(t.name)}</div><div class="sub" style="margin-top:4px">${esc(t.tagline)}</div></button>`).join('')}</div>`;
}

export function mount(root) {
  root.querySelectorAll('[data-track]').forEach(b => { b.onclick = () => go(b.dataset.track); });
}
