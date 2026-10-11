/**
 * Loading a degree's catalog. Each degree is a few hundred kilobytes, so it is
 * fetched the first time it is needed rather than shipped with the app shell;
 * the service worker keeps a copy for offline use once it has been seen.
 */
import { DEGREE_META } from './meta.js';

const cache = new Map(), pending = new Map();

export const DEGREES = DEGREE_META;
export const degreeMeta = idOrSlug => DEGREE_META.find(d => d.id === idOrSlug || d.slug === idOrSlug) || null;
export const DEGREE_IDS = DEGREE_META.map(d => d.id);

/** The catalog if it is loaded, else null. */
export const degreeData = id => cache.get(degreeMeta(id)?.slug) || null;

/** Tests and tools hand the catalog in directly. */
export const setDegreeData = (id, data) => { cache.set(degreeMeta(id)?.slug || id, data); };

export function loadDegree(id) {
  const slug = degreeMeta(id)?.slug;
  if (!slug) return Promise.reject(new Error(`Unknown degree: ${id}`));
  if (cache.has(slug)) return Promise.resolve(cache.get(slug));
  if (!pending.has(slug)) {
    pending.set(slug, fetch(`data/degrees/${slug}.json`)
      .then(r => { if (!r.ok) throw new Error(`Could not load ${slug} (${r.status})`); return r.json(); })
      .then(data => { cache.set(slug, data); pending.delete(slug); return data; })
      .catch(err => { pending.delete(slug); throw err; }));
  }
  return pending.get(slug);
}
