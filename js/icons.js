/**
 * Inline SVG for functional chrome. Everything else in this app uses typographic
 * marks (◈ ⬢ ▲) rather than pictures, so this set is deliberately small — only
 * the places where a glyph would be ambiguous at 20px.
 *
 * Returns a raw-marked object, not a string: the `h` template escapes plain
 * interpolations, so returning a string would print SVG source as text.
 */
import { raw } from './ui.js';

const P = {
  home:    '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/>',
  train:   '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8V6M7 18v-2M17 8V6M17 18v-2M3 12h18"/>',
  log:     '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  skills:  '<circle cx="12" cy="5" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M12 7.2v4.3M12 11.5 6.8 16M12 11.5 17.2 16"/>',
  profile: '<circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c1.4-3.7 4.2-5.6 7.5-5.6s6.1 1.9 7.5 5.6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  check:   '<path d="m4 12.5 5.2 5.2L20 7"/>',
  close:   '<path d="M6 6l12 12M18 6 6 18"/>',
  clock:   '<circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.3l3.3 2"/>',
  flame:   '<path d="M12 3s5.2 4.1 5.2 8.6a5.2 5.2 0 1 1-10.4 0C6.8 9.3 8.6 8 8.6 8s.4 2.2 1.8 2.6C11.1 8.4 12 3 12 3Z"/>',
  coin:    '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4v9.2M9.8 9.8h3.6a1.9 1.9 0 0 1 0 3.8h-3.4a1.9 1.9 0 0 0 0 3.8h3.8"/>',
  play:    '<path d="M7 4.5 19 12 7 19.5z"/>',
  pause:   '<path d="M8.5 5v14M15.5 5v14"/>',
  skip:    '<path d="M6 5.5 15 12l-9 6.5z"/><path d="M18 5v14"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
  search:  '<circle cx="10.5" cy="10.5" r="6.4"/><path d="m15.2 15.2 4.3 4.3"/>',
  bolt:    '<path d="M13.5 3 5 13.5h5.5L9.5 21 19 10.5h-5.6z"/>',
  target:  '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>',
  trend:   '<path d="M3 17.5 9.5 11l4 4L21 7"/><path d="M21 12V7h-5"/>',
  lock:    '<rect x="5" y="10.5" width="14" height="9.5" rx="1.6"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>',
  trash:   '<path d="M4.5 6.5h15M9.5 6.5V4.6h5v1.9M6.8 6.5 8 20h8l1.2-13.5"/>',
  edit:    '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14.5 5.5 4 4"/>',
  down:    '<path d="M12 4v13M6.5 11.5 12 17l5.5-5.5"/><path d="M4.5 20h15"/>',
  up:      '<path d="M12 20V7M6.5 12.5 12 7l5.5 5.5"/><path d="M4.5 4h15"/>',
  info:    '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.5"/><circle cx="12" cy="7.9" r="0.9" fill="currentColor"/>',
  warn:    '<path d="M12 4 2.8 20h18.4z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.4" r="0.9" fill="currentColor"/>',
};

export function icon(name, size = 20, extra = '') {
  const body = P[name] || P.info;
  return raw(`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" ${extra}>${body}</svg>`);
}

/** Same glyph as a plain string, for the few places that build markup by hand. */
export const iconStr = (name, size = 20) => icon(name, size).value;
