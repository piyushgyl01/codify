/**
 * PROF110 Technical Communication — the parts of Google's Technical Writing
 * One and Two, CommonMark and the W3C images tutorial that have a right
 * answer: active voice, numbered against bulleted lists, what Markdown
 * renders to, and alt text by the role of an image.
 *
 * Writing itself cannot be marked by a machine, and nothing here pretends to.
 * Markdown questions carry `python` that renders the text with markdown-it-py,
 * a CommonMark-compliant parser; the others are right by construction — the
 * sentence was built active or passive, the scenario written ordered or not —
 * following the rule the source states.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });

const ACTORS = [['The server', 'servers'], ['The compiler', 'compilers'], ['The script', 'scripts'], ['The cache', 'caches'], ['The client', 'clients']];
const ACTIONS = [['rejects', 'rejected', 'the request'], ['validates', 'validated', 'the input'], ['caches', 'cached', 'the response'], ['logs', 'logged', 'every error'], ['compresses', 'compressed', 'the file']];

export const WRITING = [
  SKILL('tw.voice', 'Active voice', 'Prefer the active voice: the actor first, then the action (Technical Writing One).', t => {
    const [actor] = t.pick(ACTORS), [verb, part, object] = t.pick(ACTIONS);
    const obj = object[0].toUpperCase() + object.slice(1), a = actor.toLowerCase();
    const active = `${actor} ${verb} ${object}.`;
    const passives = [`${obj} is ${part} by ${a}.`, `${obj} was ${part}.`, `${obj} has been ${part} by ${a}.`];
    return { kind: 'mc', q: 'Which sentence is in the active voice?', options: [active, ...passives], correct: 0,
      explain: `Passive voice is a form of "be" plus a past participle (is ${part}, was ${part}); the actor moves to the end or disappears. "${active}" names the actor first.`,
      python: `import re\nopts = ${JSON.stringify([active, ...passives])}\nactive = [o for o in opts if not re.search(r'\\b(is|are|was|were|be|been|being)\\s+\\w+ed\\b', o)]\nprint(active[0] if len(active) == 1 else 'ambiguous')` };
  }),

  SKILL('tw.lists', 'Numbered or bulleted', 'Number a list when order matters; bullet it when it does not (Technical Writing One: lists and tables).', t => {
    const ordered = [
      'the steps to install the tool and run its first build', 'how to rotate an API key without downtime', 'the order in which a migration script must run its stages',
      'what to do, in turn, when a deploy fails', 'setting up a development machine from scratch',
    ];
    const unordered = [
      'the browsers the library supports', 'the features new in this release', 'the file formats the importer accepts',
      'the environment variables the service reads', 'the people to contact about the project',
    ];
    const isOrdered = t.rng() < 0.5, item = t.pick(isOrdered ? ordered : unordered);
    const right = isOrdered ? 'A numbered list' : 'A bulleted list';
    return { kind: 'mc', q: `You are documenting ${item}. Which list should you use?`, options: [right, isOrdered ? 'A bulleted list' : 'A numbered list', 'A single paragraph', 'A table with one column'], correct: 0,
      explain: isOrdered ? 'The reader must follow these in order, so number them.' : 'These items have no order, so bullets say exactly that.' };
  }),

  SKILL('tw.markdown', 'What Markdown renders', 'Read CommonMark like a parser: lists, headings, code blocks and emphasis.', t => {
    const form = t.int(0, 3);
    let md, ask, answer, py;
    if (form === 0) {
      const n = t.int(2, 5), gap = t.rng() < 0.5;
      const items = Array.from({ length: n }, (_, i) => `${i + 1}. Step ${i + 1}`);
      if (gap) items.splice(t.int(1, n - 1), 0, '');
      md = items.join('\n');
      ask = 'How many list items does this Markdown produce?'; answer = n;
      py = `from markdown_it import MarkdownIt\nprint(sum(1 for t in MarkdownIt().parse(${JSON.stringify(md)}) if t.type == 'list_item_open'))`;
    } else if (form === 1) {
      const lv = t.int(1, 4);
      md = `${'#'.repeat(lv)} Setup\n\nInstall the tool.`;
      ask = 'What HTML heading level (the n in <hn>) does the first line produce?'; answer = lv;
      py = `from markdown_it import MarkdownIt\nprint(next(int(t.tag[1]) for t in MarkdownIt().parse(${JSON.stringify(md)}) if t.type == 'heading_open'))`;
    } else if (form === 2) {
      const spaces = t.pick([2, 3, 4, 4]);
      md = `Run this:\n\n${' '.repeat(spaces)}npm test\n\nThen check the output.`;
      ask = 'How many code blocks does this Markdown produce?'; answer = spaces >= 4 ? 1 : 0;
      py = `from markdown_it import MarkdownIt\nprint(sum(1 for t in MarkdownIt().parse(${JSON.stringify(md)}) if t.type in ('code_block', 'fence')))`;
    } else {
      const k = t.int(1, 3);
      md = Array.from({ length: k }, (_, i) => `This is **bold ${i + 1}**`).join(' and ') + ' and this is not.';
      ask = 'How many <strong> elements does this Markdown produce?'; answer = k;
      py = `from markdown_it import MarkdownIt\nprint(MarkdownIt().render(${JSON.stringify(md)}).count('<strong>'))`;
    }
    return { kind: 'num', q: ask, code: md, answer, tol: 0, dp: 0, needs: 'markdown_it',
      explain: ['A blank line between items keeps one list (it becomes a loose list); the numbers still count items.', 'The number of # signs is the heading level.',
        'An indented code block needs four spaces of indentation; fewer is a normal paragraph.', 'Each **…** pair is one <strong>.'][form],
      python: py };
  }),

  SKILL('tw.alttext', 'Alt text', 'Write alt text for what an image does: W3C\'s images decision tree.', t => {
    const cases = [
      { s: 'A magnifying-glass icon is the only content of the search button.', right: 'alt="Search"', why: 'A functional image gets alt text for the action, not the picture.' },
      { s: 'A decorative swirl sits beside the page title.', right: 'alt="" (empty)', why: 'Decoration adds nothing for a screen reader, so alt is empty and it is skipped.' },
      { s: 'A chart shows response time halving after the cache was added, and the text does not say so.', right: 'alt="Response time fell by half after adding the cache"', why: 'An informative image gets the information it carries.' },
      { s: 'A logo image spells the company name "Acme", with no other text nearby.', right: 'alt="Acme"', why: 'An image of text gets the same text as its alternative.' },
      { s: 'A photo of the same chart appears right next to a full paragraph explaining it.', right: 'alt="" (empty)', why: 'When the surrounding text already says it all, the image is decorative in context.' },
    ];
    const c = t.pick(cases), others = cases.filter(x => x.right !== c.right).map(x => x.right);
    const wrong = [...new Set([...others, 'alt="image"', 'alt="picture of icon"'])].filter(w => w !== c.right);
    return { kind: 'mc', q: `${c.s} Which alt text fits best?`, options: [c.right, ...t.pickN(wrong, 3)], correct: 0, explain: c.why };
  }),
];
