/**
 * What's new in AI, read live from the sources — no server in between.
 *
 *   Papers   Hugging Face Daily Papers, the most upvoted of the last week
 *   Models   trending on Hugging Face, with enough downloads to be real
 *   Repos    the fastest-rising new AI repositories on GitHub this week
 *
 * arXiv would be the obvious source, but it does not answer browsers; the
 * papers people actually read turn up on Hugging Face's list anyway. Trending
 * lists attract spam and worse, so items need real use behind them and a few
 * words are simply refused. A day's feed is cached so opening the tab twice
 * costs nothing — and GitHub's 60 requests an hour go further.
 */
import { dayKey, addDays } from '../../game.js';

const CACHE_KEY = 'codify.aifeed.v1';
const BLOCK = /nsfw|uncensored|abliterat|porn|nude|lewd|hentai|erotic|18\+|onlyfans|deepnude|undress/i;
const MIN_DOWNLOADS = 1000;

async function json(url, fetchImpl) {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`${new URL(url).hostname} answered ${res.status}`);
  return res.json();
}

/** Turn the three raw responses into one list of items: { kind, id, title, url, note, score }. */
export function shapeFeed({ papers = [], models = [], repos = [] }, now = dayKey()) {
  const since = addDays(now, -7);
  const P = papers
    .filter(p => p?.paper?.id && (p.paper.submittedOnDailyAt || p.publishedAt || '').slice(0, 10) >= since)
    .filter(p => !BLOCK.test(`${p.paper.title} ${p.paper.summary || ''}`))
    .sort((a, b) => (b.paper.upvotes || 0) - (a.paper.upvotes || 0))
    .slice(0, 8)
    .map(p => ({ kind: 'paper', id: p.paper.id, title: p.paper.title, url: `https://huggingface.co/papers/${p.paper.id}`,
      note: `${p.paper.upvotes || 0} upvotes · arXiv ${p.paper.id}`, score: p.paper.upvotes || 0 }));
  const Mo = models
    .filter(m => m?.id && (m.downloads || 0) >= MIN_DOWNLOADS && !BLOCK.test(m.id))
    .slice(0, 8)
    .map(m => ({ kind: 'model', id: m.id, title: m.id, url: `https://huggingface.co/${m.id}`,
      note: `${m.pipeline_tag || 'model'} · ${(m.likes || 0).toLocaleString('en-US')} likes · ${(m.downloads || 0).toLocaleString('en-US')} downloads`, score: m.likes || 0 }));
  const seen = new Set();
  const Re = (repos.items || repos || [])
    .filter(x => x?.full_name && !x.fork && !BLOCK.test(`${x.full_name} ${x.description || ''}`) && !seen.has(x.full_name) && seen.add(x.full_name))
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 8)
    .map(x => ({ kind: 'repo', id: x.full_name, title: x.full_name, url: x.html_url,
      note: `${(x.stargazers_count || 0).toLocaleString('en-US')} stars · ${x.description ? x.description.slice(0, 90) : 'no description'}`, score: x.stargazers_count || 0 }));
  return { papers: P, models: Mo, repos: Re };
}

/** The day's feed. Cached per day; `force` refetches. Any source that fails is left empty, not fatal. */
export async function loadFeed({ force = false, fetchImpl = globalThis.fetch, now = dayKey() } = {}) {
  if (!force) {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c?.day === now && c.feed) return { ...c.feed, cached: true };
    } catch { /* no cache, or it is unreadable — fetch */ }
  }
  const since = addDays(now, -7);
  const q = topic => `https://api.github.com/search/repositories?q=${encodeURIComponent(`topic:${topic} created:>=${since}`)}&sort=stars&order=desc&per_page=10`;
  const [papers, models, llm, agents] = await Promise.allSettled([
    json('https://huggingface.co/api/daily_papers?limit=50', fetchImpl),
    json('https://huggingface.co/api/models?sort=trendingScore&limit=40', fetchImpl),
    json(q('llm'), fetchImpl),
    json(q('ai-agents'), fetchImpl),
  ]);
  const ok = x => (x.status === 'fulfilled' ? x.value : null);
  const feed = shapeFeed({
    papers: ok(papers) || [], models: ok(models) || [],
    repos: [...(ok(llm)?.items || []), ...(ok(agents)?.items || [])],
  }, now);
  feed.errors = [papers, models, llm].filter(x => x.status === 'rejected').length;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ day: now, feed })); } catch { /* storage full or blocked */ }
  return feed;
}
