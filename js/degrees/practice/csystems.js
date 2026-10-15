/**
 * CS110 Computer Systems Foundations — practice modelled on Harvard CS50x
 * weeks 1–5 and 7: C integer arithmetic and types, data representation,
 * characters, strings and arrays, pointers, sizes in memory, the cost of
 * searching and sorting, linked lists, memory-safety bugs, and SQL.
 *
 * Every C question carries `c`: the complete program whose output is the
 * answer. The tests compile it with the system's C compiler (with -Wall
 * -Werror, as CS50's own `make` does) and run it. Memory-safety questions are
 * run under a memory checker — AddressSanitizer, or Apple's Guard Malloc and
 * the debugger where ASan cannot run — which finds the bad access itself.
 * SQL questions carry `sql`, run through sqlite3.
 */

const SKILL = (id, name, summary, gen) => ({ id, name, summary, track: 'degrees', gen });
const PREDICT = 'What does this C program print?';
const prog = (body, includes = ['stdio.h']) => `${includes.map(h => `#include <${h}>`).join('\n')}\n\nint main(void)\n{\n${body.split('\n').map(l => `    ${l}`).join('\n')}\n    return 0;\n}\n`;
const cnum = (body, answer, explain, extra = {}) => {
  const code = prog(body, extra.includes);
  return { kind: 'num', q: PREDICT, code, c: code, answer, explain, tol: 0, dp: 0, ...extra.opts };
};
const cmc = (body, right, wrong, explain, includes) => {
  const code = prog(body, includes);
  return { kind: 'mc', q: PREDICT, code, c: code, options: [right, ...wrong.filter(w => w !== right)].slice(0, 4), correct: 0, explain };
};
const trunc = (a, b) => Math.trunc(a / b);
const cmod = (a, b) => a - b * trunc(a, b);

export const CSYSTEMS = [
  SKILL('c.intdiv', 'Integer division in C', 'C divides ints by truncating toward zero — and the remainder keeps the sign of the dividend.', t => {
    const form = t.int(0, 2), a = t.pick([-17, -13, -9, 7, 9, 13, 17, 23]), b = t.pick([2, 3, 4, 5]);
    if (form === 0) return cnum(`int a = ${a}, b = ${b};\nprintf("%i\\n", a / b);`, trunc(a, b),
      `int ÷ int is int, truncated toward zero: ${a} / ${b} = ${a / b} → ${trunc(a, b)}. (Python's // would floor to ${Math.floor(a / b)}.)`);
    if (form === 1) return cnum(`int a = ${a}, b = ${b};\nprintf("%i\\n", a % b);`, cmod(a, b),
      `In C the remainder has the dividend's sign: ${a} = ${b}·${trunc(a, b)} + ${cmod(a, b)}. (Python's % gives ${((a % b) + b) % b}.)`);
    const v = Math.round((a / b) * 100) / 100;
    return cnum(`int a = ${a}, b = ${b};\nprintf("%.2f\\n", (float) a / b);`, v,
      `Casting a to float first makes it real division: ${a} / ${b} = ${v.toFixed(2)}.`, { opts: { dp: 2, tol: 0.001 } });
  }),

  SKILL('c.overflow', 'Overflow and two\'s complement', 'Fixed-width integers wrap around; signed bytes read as negative past 127.', t => {
    const form = t.int(0, 2);
    if (form === 0) { const x = t.int(240, 255), add = t.int(5, 40); return cnum(`unsigned char x = ${x};\nx = x + ${add};\nprintf("%i\\n", x);`, (x + add) % 256, `An unsigned char holds 0–255 and wraps: (${x} + ${add}) mod 256 = ${(x + add) % 256}.`); }
    if (form === 1) { const v = t.int(130, 255); return cnum(`unsigned char u = ${v};\nsigned char s = (signed char) u;\nprintf("%i\\n", s);`, v - 256, `The same 8 bits read in two's complement: ${v} − 256 = ${v - 256}.`); }
    const add = t.int(1, 9);
    return cnum(`unsigned int x = 4294967295u;\nx = x + ${add};\nprintf("%u\\n", x);`, add - 1, `4294967295 is 2³² − 1, the largest 32-bit unsigned value; adding ${add} wraps to ${add - 1}.`);
  }),

  SKILL('c.chars', 'Characters as numbers', 'A char is a small integer: ASCII arithmetic, digits, case, and the Caesar shift from problem set 2.', t => {
    const form = t.int(0, 2);
    if (form === 0) { const c1 = t.pick('BDHMQSWZ'.split('')), c2 = 'A'; return cnum(`printf("%i\\n", '${c1}' - '${c2}');`, c1.charCodeAt(0) - 65, `Letters are consecutive in ASCII, so '${c1}' − 'A' is its position: ${c1.charCodeAt(0) - 65}.`); }
    if (form === 1) { const d = t.int(1, 9), e = t.int(1, 9); return cnum(`char a = '${d}', b = '${e}';\nprintf("%i\\n", (a - '0') * (b - '0'));`, d * e, `Subtracting '0' turns a digit character into its value: ${d} × ${e} = ${d * e}.`); }
    const word = t.pick(['HELLO', 'CODE', 'ZEBRA', 'APPLE', 'QUIZ']), k = t.int(1, 25);
    const out = word.split('').map(ch => String.fromCharCode((ch.charCodeAt(0) - 65 + k) % 26 + 65)).join('');
    const wrong = [word.split('').map(ch => String.fromCharCode((ch.charCodeAt(0) - 65 + k + 1) % 26 + 65)).join(''),
      word.split('').map(ch => String.fromCharCode((ch.charCodeAt(0) - 65 - k + 26) % 26 + 65)).join(''),
      word.split('').map(ch => String.fromCharCode(ch.charCodeAt(0) + k)).join('')];
    return cmc(`char s[] = "${word}";\nint k = ${k};\nfor (int i = 0; s[i] != '\\0'; i++)\n{\n    s[i] = (s[i] - 'A' + k) % 26 + 'A';\n}\nprintf("%s\\n", s);`, out, wrong,
      `Each letter moves ${k} places, wrapping from Z back to A with % 26: ${word} → ${out}.`);
  }),

  SKILL('c.strings', 'C strings and arrays', 'A string is an array of chars ending in \'\\0\': sizeof, strlen, and indexing.', t => {
    const word = t.pick(['hello', 'cs50', 'pointer', 'memory', 'abc']), form = t.int(0, 2);
    if (form === 0) return cnum(`char s[] = "${word}";\nprintf("%zu\\n", sizeof(s));`, word.length + 1, `The array holds the ${word.length} letters plus the terminating '\\0': ${word.length + 1} bytes.`);
    if (form === 1) { const cut = t.int(1, word.length - 1); return cnum(`char s[] = "${word}";\ns[${cut}] = '\\0';\nprintf("%zu\\n", strlen(s));`, cut, `strlen stops at the first '\\0', now at index ${cut}, so it is ${cut}.`, { includes: ['stdio.h', 'string.h'] }); }
    const vowels = word.split('').filter(c => 'aeiou'.includes(c)).length;
    return cnum(`char s[] = "${word}";\nint n = 0;\nfor (int i = 0, len = strlen(s); i < len; i++)\n{\n    if (strchr("aeiou", s[i]) != NULL)\n    {\n        n++;\n    }\n}\nprintf("%i\\n", n);`, vowels,
      `It counts the vowels in "${word}": ${vowels}.`, { includes: ['stdio.h', 'string.h'] });
  }),

  SKILL('c.binary', 'Bits, hex and bitwise operators', 'Read hexadecimal, shift and mask bits, as compression and file headers do.', t => {
    const form = t.int(0, 3), a = t.int(1, 255), b = t.int(1, 255);
    if (form === 0) { const hex = a.toString(16).toUpperCase(); return cnum(`printf("%i\\n", 0x${hex});`, a, `0x${hex} = ${hex.split('').map((d, i, arr) => `${parseInt(d, 16)}×16^${arr.length - 1 - i}`).join(' + ')} = ${a}.`); }
    if (form === 1) { const op = t.pick(['&', '|', '^']), v = op === '&' ? a & b : op === '|' ? a | b : a ^ b;
      return cnum(`int a = ${a}, b = ${b};\nprintf("%i\\n", a ${op} b);`, v, `In binary ${a.toString(2).padStart(8, '0')} ${op} ${b.toString(2).padStart(8, '0')} = ${v.toString(2).padStart(8, '0')} = ${v}.`); }
    if (form === 2) { const s = t.int(1, 4); return cnum(`int x = ${a};\nprintf("%i\\n", x << ${s});`, a << s, `Shifting left by ${s} multiplies by 2^${s}: ${a} × ${2 ** s} = ${a << s}.`); }
    const bits = a.toString(2).split('').filter(c => c === '1').length;
    return cnum(`int x = ${a}, n = 0;\nwhile (x > 0)\n{\n    n += x & 1;\n    x >>= 1;\n}\nprintf("%i\\n", n);`, bits, `It counts the 1 bits of ${a} = ${a.toString(2)}: ${bits}.`);
  }),

  SKILL('c.pointers', 'Pointers', 'Follow addresses: pointer arithmetic over arrays, and swapping through pointers.', t => {
    const form = t.int(0, 2), arr = Array.from({ length: 5 }, () => t.int(1, 9));
    if (form === 0) { const i = t.int(1, 3); return cnum(`int a[] = {${arr.join(', ')}};\nint *p = a + ${i};\nprintf("%i\\n", *(p - 1) + p[1]);`, arr[i - 1] + arr[i + 1],
      `p points at a[${i}], so *(p − 1) is a[${i - 1}] = ${arr[i - 1]} and p[1] is a[${i + 1}] = ${arr[i + 1]}: ${arr[i - 1] + arr[i + 1]}.`); }
    if (form === 1) { const x = t.int(1, 9), y = t.int(10, 20);
      return cnum(`int x = ${x}, y = ${y};\nint *p = &x, *q = &y;\nint tmp = *p;\n*p = *q;\n*q = tmp;\nprintf("%i\\n", x * 100 + y);`, y * 100 + x, `The three lines swap x and y through their addresses: x = ${y}, y = ${x}, printed as ${y * 100 + x}.`); }
    const k = t.int(2, 4), sum = arr.slice(0, k).reduce((s, v) => s + v, 0);
    return cnum(`int a[] = {${arr.join(', ')}};\nint total = 0;\nfor (int *p = a; p < a + ${k}; p++)\n{\n    total += *p;\n}\nprintf("%i\\n", total);`, sum, `p walks the first ${k} elements: ${arr.slice(0, k).join(' + ')} = ${sum}.`);
  }),

  SKILL('c.sizeof', 'Sizes in memory', 'How many bytes things take on a 64-bit machine — including padding in a struct.', t => {
    const form = t.int(0, 3);
    if (form === 0) { const n = t.int(3, 12); return cnum(`int numbers[${n}];\nprintf("%zu\\n", sizeof(numbers));`, 4 * n, `An int is 4 bytes, so ${n} of them take ${4 * n}.`); }
    if (form === 1) return cnum('char *s = "hi";\nprintf("%zu\\n", sizeof(s));', 8, 'sizeof a pointer is the size of an address — 8 bytes on a 64-bit machine — not the string it points to.');
    if (form === 2) return cnum('typedef struct\n{\n    char tag;\n    int value;\n}\npair;\nprintf("%zu\\n", sizeof(pair));', 8, 'The int must start on a 4-byte boundary, so 3 bytes of padding follow the char: 1 + 3 + 4 = 8.');
    return cnum('typedef struct\n{\n    char *name;\n    int age;\n}\nperson;\nperson people[3];\nprintf("%zu\\n", sizeof(people));', 48, 'Each person is an 8-byte pointer and a 4-byte int, padded to 16 so the next pointer is aligned; three are 48.');
  }),

  SKILL('c.search', 'The cost of searching and sorting', 'Count the steps linear search, binary search and selection sort really take.', t => {
    const form = t.int(0, 2);
    if (form === 0) {
      const n = t.pick([7, 15, 31, 63, 100]), target = t.int(0, n - 1);
      let lo = 0, hi = n - 1, steps = 0; while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); steps++; if (mid === target) break; if (mid < target) lo = mid + 1; else hi = mid - 1; }
      return cnum(`int a[${n}];\nfor (int i = 0; i < ${n}; i++) a[i] = i;\nint lo = 0, hi = ${n - 1}, steps = 0;\nwhile (lo <= hi)\n{\n    int mid = (lo + hi) / 2;\n    steps++;\n    if (a[mid] == ${target}) break;\n    if (a[mid] < ${target}) lo = mid + 1;\n    else hi = mid - 1;\n}\nprintf("%i\\n", steps);`, steps,
        `Binary search halves the range each step; finding ${target} among ${n} sorted values takes ${steps} comparisons — at most ⌈log₂(${n} + 1)⌉ = ${Math.ceil(Math.log2(n + 1))}.`);
    }
    if (form === 1) { const n = t.int(5, 12); return cnum(`int n = ${n}, comparisons = 0;\nfor (int i = 0; i < n - 1; i++)\n{\n    for (int j = i + 1; j < n; j++)\n    {\n        comparisons++;\n    }\n}\nprintf("%i\\n", comparisons);`, n * (n - 1) / 2,
      `Selection sort compares each element with every later one: (n − 1) + … + 1 = n(n − 1)/2 = ${n * (n - 1) / 2}. That is Θ(n²) whatever the input.`); }
    const arr = t.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 6); let inv = 0;
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) inv++;
    return cnum(`int a[] = {${arr.join(', ')}}, n = 6, swaps = 0;\nfor (int i = 0; i < n - 1; i++)\n{\n    for (int j = 0; j < n - 1 - i; j++)\n    {\n        if (a[j] > a[j + 1])\n        {\n            int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;\n            swaps++;\n        }\n    }\n}\nprintf("%i\\n", swaps);`, inv,
      `Bubble sort swaps once per out-of-order pair (an inversion); {${arr.join(', ')}} has ${inv}.`);
  }),

  SKILL('c.linked', 'Linked lists', 'Build a list with malloc — inserting at the head reverses the order.', t => {
    const vals = Array.from({ length: t.int(3, 5) }, () => t.int(1, 9)), atHead = t.rng() < 0.6;
    const out = (atHead ? [...vals].reverse() : vals).join(' ');
    const body = `int values[] = {${vals.join(', ')}};\nnode *list = NULL${atHead ? '' : ', *tail = NULL'};\nfor (int i = 0; i < ${vals.length}; i++)\n{\n    node *n = malloc(sizeof(node));\n    n->number = values[i];\n    n->next = NULL;\n${atHead ? '    n->next = list;\n    list = n;' : '    if (list == NULL) list = n;\n    else tail->next = n;\n    tail = n;'}\n}\nfor (node *p = list; p != NULL; p = p->next)\n{\n    printf("%i ", p->number);\n}\nprintf("\\n");`;
    const code = `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct node\n{\n    int number;\n    struct node *next;\n}\nnode;\n\nint main(void)\n{\n${body.split('\n').map(l => `    ${l}`).join('\n')}\n    return 0;\n}\n`;
    const wrong = [atHead ? vals.join(' ') : [...vals].reverse().join(' '), [...vals].sort((a, b) => a - b).join(' '), vals.slice(1).join(' ')];
    return { kind: 'mc', q: PREDICT, code, c: code, options: [out, ...[...new Set(wrong)].filter(w => w !== out)].slice(0, 4), correct: 0,
      explain: atHead ? 'Each new node goes in front of the old list, so the list comes out in reverse order.' : 'Each new node is linked after the tail, so the order is kept.' };
  }),

  SKILL('c.memsafety', 'Memory-safety bugs', 'Spot a heap overflow or a use-after-free — the bugs Valgrind and AddressSanitizer catch.', t => {
    const n = t.int(3, 8), kind = t.pick(['overflow', 'useafter', 'safe']);
    const bodies = {
      overflow: `int *a = malloc(${n} * sizeof(int));\nfor (int i = 0; i <= ${n}; i++)\n{\n    a[i] = i;\n}\nprintf("%i\\n", a[0]);\nfree(a);`,
      useafter: `int *a = malloc(${n} * sizeof(int));\nfor (int i = 0; i < ${n}; i++)\n{\n    a[i] = i;\n}\nfree(a);\nprintf("%i\\n", a[0]);`,
      safe: `int *a = malloc(${n} * sizeof(int));\nif (a == NULL)\n{\n    return 1;\n}\nfor (int i = 0; i < ${n}; i++)\n{\n    a[i] = i;\n}\nprintf("%i\\n", a[${n - 1}]);\nfree(a);`,
    };
    const LABEL = { overflow: 'It writes past the end of the array (heap buffer overflow)', useafter: 'It reads memory after freeing it (use after free)', safe: 'It is memory-safe' };
    const code = prog(bodies[kind], ['stdio.h', 'stdlib.h']);
    return { kind: 'mc', q: 'Which is true of this program?', code, c: code, memcheck: true,
      options: [LABEL[kind], ...Object.values(LABEL).filter(v => v !== LABEL[kind]), 'It leaks memory'].slice(0, 4), correct: 0,
      explain: { overflow: `The loop runs i = 0 … ${n}, ${n + 1} writes into room for ${n}: a[${n}] is past the end.`, useafter: 'a is used after free(a): the memory no longer belongs to the program.', safe: `Every index is 0 … ${n - 1}, the memory is checked, used, then freed once.` }[kind] };
  }),

  SKILL('c.sql', 'SQL queries', 'Filter, count, group and join rows, as in problem set 7.', t => {
    const artists = ['Ado', 'Bea', 'Cai', 'Dua'], rows = Array.from({ length: t.int(6, 9) }, (_, i) => ({ id: i + 1, title: `Song ${i + 1}`, artist: t.pick(artists), year: t.int(2010, 2024), plays: t.int(100, 5000) }));
    const schema = `CREATE TABLE songs (id INTEGER, title TEXT, artist TEXT, year INTEGER, plays INTEGER);\n${rows.map(r => `INSERT INTO songs VALUES (${r.id}, '${r.title}', '${r.artist}', ${r.year}, ${r.plays});`).join('\n')}`;
    const table = `songs\n${'id  title    artist  year  plays'}\n${rows.map(r => `${String(r.id).padEnd(3)} ${r.title.padEnd(8)} ${r.artist.padEnd(7)} ${r.year}  ${r.plays}`).join('\n')}`;
    const form = t.int(0, 2);
    if (form === 0) {
      const y = t.int(2012, 2020), p = t.pick([1000, 2000, 3000]), q = `SELECT COUNT(*) FROM songs WHERE year >= ${y} AND plays > ${p};`;
      const ans = rows.filter(r => r.year >= y && r.plays > p).length;
      return { kind: 'num', q: 'How many rows does this query count?', code: `${table}\n\n${q}`, sql: `${schema}\n${q}`, answer: ans, tol: 0, dp: 0, explain: `Rows from ${y} on with more than ${p} plays: ${ans}.` };
    }
    if (form === 1) {
      const q = 'SELECT artist FROM songs GROUP BY artist ORDER BY SUM(plays) DESC LIMIT 1;';
      const sums = {}; rows.forEach(r => { sums[r.artist] = (sums[r.artist] || 0) + r.plays; });
      const best = Object.entries(sums).sort((a, b) => b[1] - a[1])[0][0];
      return { kind: 'mc', q: 'What does this query return?', code: `${table}\n\n${q}`, sql: `${schema}\n${q}`, options: [best, ...artists.filter(a => a !== best)].slice(0, 4), correct: 0,
        explain: `Total plays by artist: ${Object.entries(sums).map(([a, s]) => `${a} ${s}`).join(', ')}. The highest is ${best}.` };
    }
    const a = t.pick(artists.filter(x => rows.some(r => r.artist === x))), q = `SELECT ROUND(AVG(plays)) FROM songs WHERE artist = '${a}';`;
    const mine = rows.filter(r => r.artist === a), avg = Math.round(mine.reduce((s, r) => s + r.plays, 0) / mine.length);
    return { kind: 'num', q: 'What number does this query return?', code: `${table}\n\n${q}`, sql: `${schema}\n${q}`, answer: avg, tol: 0.5, dp: 0,
      explain: `${a}'s songs average ${mine.map(r => r.plays).join(', ')} → ${avg}.` };
  }),
];
