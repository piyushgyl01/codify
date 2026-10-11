/**
 * Programming I — Python fundamentals: 18 practice skills, each a generator
 * that writes a short program and works out what Python does with it.
 *
 * Ported unchanged from Course Atlas (model_uni,
 * app/domain/practice/skills/python-fundamentals.ts), compiled to plain
 * JavaScript. `practice/index.js` adapts them to Codify's question format.
 */
// app/domain/practice/random.ts
function int(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
function shuffle(rng, items) {
  const out = [...items];
  for (let index = out.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [out[index], out[swap]] = [out[swap], out[index]];
  }
  return out;
}
function sample(rng, items, count) {
  return shuffle(rng, items).slice(0, count);
}
function choices(rng, correct, wrong, count = 4) {
  const distinct = [...new Set(wrong.filter((option) => option !== correct))];
  const options = shuffle(rng, [correct, ...sample(rng, distinct, count - 1)]);
  return { options, correctIndex: options.indexOf(correct) };
}

// app/domain/practice/skills/python-fundamentals.ts
var PREDICT = "What does this print?";
var floorDiv = (a, b) => Math.floor(a / b);
var pyMod = (a, b) => a - b * floorDiv(a, b);
function pySlice(s, start, stop, step = 1) {
  const n = s.length;
  const at = (index, fallback, low, high) => {
    if (index === void 0) return fallback;
    const shifted = index < 0 ? index + n : index;
    return Math.min(Math.max(shifted, low), high);
  };
  let out = "";
  if (step > 0) {
    for (let i = at(start, 0, 0, n); i < at(stop, n, 0, n); i += step)
      out += s[i];
  } else {
    for (let i = at(start, n - 1, -1, n - 1); i > at(stop, -1, -1, n - 1); i += step)
      out += s[i];
  }
  return out;
}
var lines = (...rows) => rows.join("\n");
var indent = (code) => code.split("\n").map((row) => row ? `    ${row}` : row).join("\n");
function predictNumber(skillId, code, answer, explain) {
  return {
    kind: "number",
    skillId,
    prompt: PREDICT,
    code,
    answer,
    explain,
    python: code
  };
}
function predictChoice(rng, skillId, code, correct, wrong, explain) {
  return {
    kind: "choice",
    skillId,
    prompt: PREDICT,
    code,
    ...choices(rng, correct, wrong),
    explain,
    python: code
  };
}
var arith = {
  id: "py.arith",
  title: "Expressions and precedence",
  summary: "Evaluate Python arithmetic: //, %, ** and the order they bind in.",
  generate(rng) {
    const id = "py.arith";
    const form = int(rng, 0, 7);
    if (form === 0) {
      const [a2, b2, c2] = [int(rng, 2, 9), int(rng, 2, 9), int(rng, 2, 9)];
      return predictNumber(
        id,
        `print(${a2} + ${b2} * ${c2})`,
        a2 + b2 * c2,
        `* binds tighter than +: ${b2} * ${c2} = ${b2 * c2}, then add ${a2}.`
      );
    }
    if (form === 1) {
      const [a2, b2, c2, d2] = [
        int(rng, 10, 40),
        int(rng, 3, 7),
        int(rng, 10, 30),
        int(rng, 3, 7)
      ];
      return predictNumber(
        id,
        `print(${a2} // ${b2} + ${c2} % ${d2})`,
        floorDiv(a2, b2) + pyMod(c2, d2),
        `${a2} // ${b2} = ${floorDiv(a2, b2)} and ${c2} % ${d2} = ${pyMod(c2, d2)}; both bind tighter than +.`
      );
    }
    if (form === 2) {
      const b2 = int(rng, 2, 6);
      const a2 = b2 * int(rng, 2, 6) + int(rng, 1, b2 - 1);
      return predictNumber(
        id,
        `print(-${a2} // ${b2})`,
        floorDiv(-a2, b2),
        `Floor division rounds down, towards minus infinity: -${a2} / ${b2} is ${(-a2 / b2).toFixed(2)}, which floors to ${floorDiv(-a2, b2)}.`
      );
    }
    if (form === 3) {
      const b2 = int(rng, 3, 9);
      const a2 = b2 * int(rng, 1, 5) + int(rng, 1, b2 - 1);
      return predictNumber(
        id,
        `print(-${a2} % ${b2})`,
        pyMod(-a2, b2),
        `Python's remainder takes the sign of the divisor: -${a2} = ${b2} \xD7 ${floorDiv(-a2, b2)} + ${pyMod(-a2, b2)}.`
      );
    }
    if (form === 4) {
      const a2 = int(rng, 2, 9);
      return predictNumber(
        id,
        `print(-${a2} ** 2)`,
        -(a2 * a2),
        `** binds tighter than the minus sign, so this is -(${a2} ** 2).`
      );
    }
    if (form === 5) {
      const [k, b2] = [pick(rng, [2, 3]), pick(rng, [2, 3])];
      return predictNumber(
        id,
        `print(${k} ** ${b2} ** 2)`,
        k ** b2 ** 2,
        `** groups from the right: ${k} ** (${b2} ** 2) = ${k} ** ${b2 ** 2}.`
      );
    }
    if (form === 6) {
      const [a2, b2] = [int(rng, 11, 99), pick(rng, [2, 4, 5, 8])];
      return predictNumber(
        id,
        `print(${a2} / ${b2} * 2)`,
        a2 / b2 * 2,
        `/ always gives a float, and / and * go left to right: (${a2} / ${b2}) * 2.`
      );
    }
    const [a, b, c, d] = [
      int(rng, 20, 60),
      int(rng, 2, 9),
      int(rng, 2, 9),
      int(rng, 2, 5)
    ];
    return predictNumber(
      id,
      `print(${a} - ${b} * ${c} // ${d})`,
      a - floorDiv(b * c, d),
      `* and // share a level and go left to right: (${b} * ${c}) // ${d} = ${floorDiv(b * c, d)}, then ${a} minus that.`
    );
  }
};
var binding = {
  id: "py.binding",
  title: "Names and binding",
  summary: "Trace what each name refers to through assignments and function calls.",
  generate(rng) {
    const id = "py.binding";
    const form = int(rng, 0, 4);
    if (form === 0) {
      const [a, b] = [int(rng, 2, 9), int(rng, 2, 9)];
      return predictNumber(
        id,
        lines(`x = ${a}`, "y = x", `x = x + ${b}`, "print(x * y)"),
        (a + b) * a,
        `y keeps the value x had (${a}); rebinding x afterwards does not change y. ${a + b} \xD7 ${a}.`
      );
    }
    if (form === 1) {
      const [p, q] = [int(rng, 2, 9), int(rng, 2, 9)];
      return predictNumber(
        id,
        lines(`a, b = ${p}, ${q}`, "a, b = b, a + b", "print(a * b)"),
        q * (p + q),
        `The right side is worked out first, from the old values: (${q}, ${p} + ${q}). So a = ${q}, b = ${p + q}.`
      );
    }
    if (form === 2) {
      const [k2, v2] = [int(rng, 1, 9), int(rng, 2, 9)];
      return predictNumber(
        id,
        lines(
          "def bump(n):",
          `    n = n + ${k2}`,
          "    return n * 2",
          "",
          `x = ${v2}`,
          "y = bump(x)",
          "print(x + y)"
        ),
        v2 + 2 * (v2 + k2),
        `Inside bump, n is a new local name, so x stays ${v2}. bump returns ${2 * (v2 + k2)}.`
      );
    }
    if (form === 3) {
      const [c, d] = [int(rng, 2, 20), int(rng, 1, 9)];
      return predictNumber(
        id,
        lines(
          `count = ${c}`,
          "",
          "def add(count):",
          `    count += ${d}`,
          "    return count",
          "",
          "add(count)",
          "print(count)"
        ),
        c,
        `The parameter count hides the global one, and the returned value is thrown away, so the global stays ${c}.`
      );
    }
    const [v, k] = [int(rng, 2, 9), int(rng, 1, 9)];
    return predictNumber(
      id,
      lines(`a = b = ${v}`, `a += ${k}`, "print(a + b)"),
      v + k + v,
      `Numbers cannot change in place: a += ${k} makes a new number for a. b is still ${v}.`
    );
  }
};
var WORDS = [
  "computation",
  "variable",
  "expression",
  "function",
  "iteration",
  "exception",
  "generator",
  "debugging",
  "recursion",
  "algorithm"
];
var strings = {
  id: "py.strings",
  title: "Strings and slices",
  summary: "Predict slices, steps and string operations.",
  generate(rng) {
    const id = "py.strings";
    const word = pick(rng, WORDS);
    const form = int(rng, 0, 4);
    const show = (expr) => lines(`word = "${word}"`, `print(${expr})`);
    if (form === 0) {
      const i = int(rng, 1, 3);
      const j = Math.min(word.length - 1, i + int(rng, 2, 5));
      return predictChoice(
        rng,
        id,
        show(`word[${i}:${j}]`),
        pySlice(word, i, j),
        [
          pySlice(word, i, j + 1),
          pySlice(word, i - 1, j),
          pySlice(word, i + 1, j + 1),
          pySlice(word, i, j - 1)
        ],
        `A slice starts at index ${i} and stops before index ${j}: ${j - i} characters.`
      );
    }
    if (form === 1) {
      const k2 = int(rng, 2, 4);
      return predictChoice(
        rng,
        id,
        show(`word[-${k2}:]`),
        pySlice(word, -k2),
        [
          pySlice(word, -k2 - 1),
          pySlice(word, -k2 + 1),
          pySlice(word, 0, k2),
          pySlice(word, -k2, -1)
        ],
        `-${k2} counts ${k2} from the end, and an empty stop runs to the end.`
      );
    }
    if (form === 2) {
      return predictChoice(
        rng,
        id,
        show("word[::2]"),
        pySlice(word, void 0, void 0, 2),
        [
          pySlice(word, 1, void 0, 2),
          pySlice(word, void 0, void 0, 3),
          pySlice(
            pySlice(word, void 0, void 0, -1),
            void 0,
            void 0,
            2
          )
        ],
        "A step of 2 takes every other character, starting with the first."
      );
    }
    if (form === 3) {
      const k2 = int(rng, 3, 5);
      const reversed = pySlice(word, void 0, void 0, -1);
      return predictChoice(
        rng,
        id,
        show(`word[::-1][:${k2}]`),
        pySlice(reversed, 0, k2),
        [
          pySlice(pySlice(word, 0, k2), void 0, void 0, -1),
          pySlice(reversed, 0, k2 + 1),
          pySlice(word, -k2),
          pySlice(reversed, 1, k2 + 1)
        ],
        `[::-1] reverses the word first; [:${k2}] then takes its first ${k2} characters \u2014 the last ${k2} of the original, backwards.`
      );
    }
    const k = int(rng, 2, 4);
    const head = pySlice(word, 0, k);
    return predictChoice(
      rng,
      id,
      show(`(word[:${k}] + "!") * 2`),
      `${head}!${head}!`,
      [
        `${head}!!`,
        `${head}${head}!`,
        `${pySlice(word, 0, k + 1)}!${pySlice(word, 0, k + 1)}!`,
        `${head}!2`
      ],
      "The parentheses join first, then * 2 repeats the whole string."
    );
  }
};
var PRECEDENCE = { or: 1, and: 2, not: 3, var: 4 };
function renderBool(node, parent = 0) {
  const own = PRECEDENCE[node.kind];
  const text = node.kind === "var" ? node.name : node.kind === "not" ? `not ${renderBool(node.child, own)}` : `${renderBool(node.left, own)} ${node.kind} ${renderBool(node.right, own + 1)}`;
  return own < parent ? `(${text})` : text;
}
function bracketed(node) {
  if (node.kind === "var") return node.name;
  if (node.kind === "not")
    return `not ${node.child.kind === "var" ? node.child.name : `(${bracketed(node.child)})`}`;
  const side = (child) => child.kind === "and" || child.kind === "or" ? `(${bracketed(child)})` : bracketed(child);
  return `${side(node.left)} ${node.kind} ${side(node.right)}`;
}
function evalBool(node, env) {
  if (node.kind === "var") return env[node.name];
  if (node.kind === "not") return !evalBool(node.child, env);
  return node.kind === "and" ? evalBool(node.left, env) && evalBool(node.right, env) : evalBool(node.left, env) || evalBool(node.right, env);
}
var booleans = {
  id: "py.bool",
  title: "Boolean expressions",
  summary: "Read and, or and not with Python's precedence, across a whole truth table.",
  generate(rng) {
    const [x, y, z] = shuffle(rng, ["a", "b", "c"]);
    const leaf = (name) => rng() < 0.3 ? { kind: "not", child: { kind: "var", name } } : { kind: "var", name };
    const op = () => rng() < 0.5 ? "and" : "or";
    let inner = {
      kind: op(),
      left: leaf(y),
      right: leaf(z)
    };
    if (rng() < 0.3) inner = { kind: "not", child: inner };
    const tree = rng() < 0.5 ? { kind: op(), left: leaf(x), right: inner } : { kind: op(), left: inner, right: leaf(x) };
    const expression = renderBool(tree);
    let count = 0;
    for (let row = 0; row < 8; row += 1) {
      if (evalBool(tree, {
        a: Boolean(row & 4),
        b: Boolean(row & 2),
        c: Boolean(row & 1)
      }))
        count += 1;
    }
    return {
      kind: "number",
      skillId: "py.bool",
      prompt: "a, b and c are each True or False. In how many of the 8 combinations is this True?",
      code: expression,
      answer: count,
      explain: `not binds tightest, then and, then or, so it reads as ${bracketed(tree)} \u2014 True in ${count} of the 8 rows.`,
      python: lines(
        "from itertools import product",
        "",
        `print(sum(1 for a, b, c in product([False, True], repeat=3) if ${expression}))`
      )
    };
  }
};
var branching = {
  id: "py.branch",
  title: "Conditionals and boundaries",
  summary: "Follow if/elif/else chains, especially at the boundaries.",
  generate(rng) {
    const t1 = int(rng, 85, 95);
    const t2 = int(rng, 70, 80);
    const t3 = int(rng, 50, 65);
    const [o1, o2, o3] = [
      pick(rng, [">=", ">"]),
      pick(rng, [">=", ">"]),
      pick(rng, [">=", ">"])
    ];
    const test = (score2, opr, t) => opr === ">=" ? score2 >= t : score2 > t;
    const ascending = rng() < 0.25;
    const rules = ascending ? [
      ["C", o3, t3],
      ["B", o2, t2],
      ["A", o1, t1]
    ] : [
      ["A", o1, t1],
      ["B", o2, t2],
      ["C", o3, t3]
    ];
    const score = rng() < 0.7 ? pick(rng, [t1, t2, t3]) + pick(rng, [-1, 0, 0, 1]) : int(rng, 40, 100);
    const hit = rules.find(([, opr, t]) => test(score, opr, t));
    const label = hit ? hit[0] : "F";
    const code = lines(
      "def label(score):",
      ...rules.flatMap(([grade, opr, t], index) => [
        `    ${index === 0 ? "if" : "elif"} score ${opr} ${t}:`,
        `        return "${grade}"`
      ]),
      '    return "F"',
      "",
      `print(label(${score}))`
    );
    const options = ["A", "B", "C", "F"];
    return {
      kind: "choice",
      skillId: "py.branch",
      prompt: PREDICT,
      code,
      options,
      correctIndex: options.indexOf(label),
      explain: ascending ? `The first true condition wins. Checked lowest-first, ${score} stops at the first threshold it clears: ${label}.` : `The first true condition wins: ${score} gives ${label}. Watch > versus >= at the boundary.`,
      python: code
    };
  }
};
var loopCount = {
  id: "py.loopcount",
  title: "How many times a loop runs",
  summary: "Count iterations of ranges, while loops and nested loops.",
  generate(rng) {
    const id = "py.loopcount";
    const form = int(rng, 0, 3);
    if (form === 0) {
      const down = rng() < 0.35;
      const s = down ? -int(rng, 2, 4) : int(rng, 2, 5);
      const a = down ? int(rng, 20, 40) : int(rng, 0, 10);
      const b = down ? int(rng, 0, 10) : int(rng, 20, 45);
      const count2 = Math.max(0, Math.ceil((b - a) / s));
      return predictNumber(
        id,
        lines(
          "count = 0",
          `for i in range(${a}, ${b}, ${s}):`,
          "    count += 1",
          "print(count)"
        ),
        count2,
        `range(${a}, ${b}, ${s}) stops before ${b}: ${count2} values.`
      );
    }
    if (form === 1) {
      const [a, k2] = [int(rng, 1, 5), pick(rng, [2, 3])];
      const b = int(rng, 40, 300);
      let n = a;
      let count2 = 0;
      while (n < b) {
        n *= k2;
        count2 += 1;
      }
      return predictNumber(
        id,
        lines(
          `n = ${a}`,
          "count = 0",
          `while n < ${b}:`,
          `    n *= ${k2}`,
          "    count += 1",
          "print(count)"
        ),
        count2,
        `n goes ${a}${Array.from({ length: count2 }, (_, i) => ` \u2192 ${a * k2 ** (i + 1)}`).join("")}; it stops once n reaches ${b}.`
      );
    }
    if (form === 2) {
      const n = int(rng, 4, 9);
      const upper = rng() < 0.5;
      const count2 = upper ? n * (n + 1) / 2 : n * (n - 1) / 2;
      return predictNumber(
        id,
        lines(
          "count = 0",
          `for i in range(${n}):`,
          `    for j in range(${upper ? `i, ${n}` : "i"}):`,
          "        count += 1",
          "print(count)"
        ),
        count2,
        upper ? `The inner loop runs ${n}, ${n - 1}, \u2026, 1 times: ${n}\xB7${n + 1}/2.` : `The inner loop runs 0, 1, \u2026, ${n - 1} times: ${n}\xB7${n - 1}/2.`
      );
    }
    const k = pick(rng, [2, 10]);
    const v = k === 2 ? int(rng, 9, 300) : int(rng, 100, 99999);
    const count = String(v.toString(k)).length;
    return predictNumber(
      id,
      lines(
        `n = ${v}`,
        "count = 0",
        "while n > 0:",
        `    n //= ${k}`,
        "    count += 1",
        "print(count)"
      ),
      count,
      `Each step divides by ${k} and drops the remainder \u2014 one step per ${k === 2 ? "binary " : ""}digit of ${v}.`
    );
  }
};
var accumulate = {
  id: "py.accum",
  title: "Accumulators and loop control",
  summary: "Track totals, counts and the best-so-far through loops with break and continue.",
  generate(rng) {
    const id = "py.accum";
    const form = int(rng, 0, 4);
    if (form === 0) {
      const [n, k2] = [int(rng, 10, 30), int(rng, 3, 7)];
      const m = floorDiv(n, k2);
      return predictNumber(
        id,
        lines(
          "total = 0",
          `for i in range(1, ${n} + 1):`,
          `    if i % ${k2} == 0:`,
          "        total += i",
          "print(total)"
        ),
        k2 * m * (m + 1) / 2,
        `The multiples of ${k2} up to ${n}: ${Array.from({ length: m }, (_, i) => k2 * (i + 1)).join(" + ")}.`
      );
    }
    if (form === 1) {
      const word = pick(rng, WORDS);
      const count = [...word].filter((ch) => "aeiou".includes(ch)).length;
      return predictNumber(
        id,
        lines(
          `word = "${word}"`,
          "n = 0",
          "for ch in word:",
          '    if ch in "aeiou":',
          "        n += 1",
          "print(n)"
        ),
        count,
        `It counts the vowels in "${word}".`
      );
    }
    if (form === 2) {
      const negatives = rng() < 0.45;
      const xs = Array.from(
        { length: 5 },
        () => negatives ? -int(rng, 1, 30) : int(rng, -10, 40)
      );
      const best = Math.max(0, ...xs);
      return predictNumber(
        id,
        lines(
          `xs = [${xs.join(", ")}]`,
          "best = 0",
          "for x in xs:",
          "    if x > best:",
          "        best = x",
          "print(best)"
        ),
        best,
        negatives ? "Every value is negative, so none beats the starting 0 \u2014 a classic bug: start from xs[0] instead." : `It keeps the largest value seen, starting from 0: ${best}.`
      );
    }
    if (form === 3) {
      const n = int(rng, 6, 12);
      const a = int(rng, 1, n - 2);
      const b = pick(
        rng,
        Array.from({ length: n - 2 }, (_, k2) => k2 + 2).filter((k2) => k2 !== a)
      );
      let total = 0;
      for (let i = 0; i < n; i += 1) {
        if (i === a) continue;
        if (i === b) break;
        total += i;
      }
      return predictNumber(
        id,
        lines(
          "total = 0",
          `for i in range(${n}):`,
          `    if i == ${a}:`,
          "        continue",
          `    if i == ${b}:`,
          "        break",
          "    total += i",
          "print(total)"
        ),
        total,
        a < b ? `It adds 0 to ${b - 1}, skipping ${a}, and stops at ${b}.` : `The loop breaks at ${b} before it ever reaches ${a}.`
      );
    }
    const k = int(rng, 4, 8);
    let product = 1;
    for (let i = 2; i < k; i += 1) product *= i;
    return predictNumber(
      id,
      lines("p = 1", `for i in range(2, ${k}):`, "    p *= i", "print(p)"),
      product,
      `range(2, ${k}) stops before ${k}: the product 2 \xD7 \u2026 \xD7 ${k - 1}.`
    );
  }
};
var EXCEPTIONS = [
  "ValueError",
  "TypeError",
  "KeyError",
  "IndexError",
  "ZeroDivisionError",
  "AttributeError",
  "NameError",
  "FileNotFoundError",
  "No error"
];
function exceptionCase(rng) {
  const form = int(rng, 0, 9);
  if (form === 0) {
    const text = pick(rng, ["3.5", "12a", "", "0x1A", " 42 ", "-7", "+8"]);
    const ok = /^\s*[+-]?\d+\s*$/.test(text);
    return {
      code: `int("${text}")`,
      outcome: ok ? "No error" : "ValueError",
      why: ok ? "int() accepts a sign and surrounding spaces." : `"${text}" is not a whole number in base 10, so int() raises ValueError.`
    };
  }
  if (form === 1) {
    const key = pick(rng, ["a", "b", "c"]);
    const safe = rng() < 0.3;
    return safe ? {
      code: `{"a": 1, "b": 2}.get("${key}")`,
      outcome: "No error",
      why: ".get() returns None for a missing key instead of raising."
    } : {
      code: `{"a": 1, "b": 2}["${key}"]`,
      outcome: key === "c" ? "KeyError" : "No error",
      why: key === "c" ? "Indexing a dict with a missing key raises KeyError." : `"${key}" is a key, so this is fine.`
    };
  }
  if (form === 2) {
    const index = int(rng, -4, 3);
    const ok = index >= -3 && index <= 2;
    return {
      code: `[10, 20, 30][${index}]`,
      outcome: ok ? "No error" : "IndexError",
      why: ok ? "Valid indices run from -3 to 2." : "A three-item list has indices -3 to 2; anything else raises IndexError."
    };
  }
  if (form === 3) {
    const [n, opr, zero] = [
      int(rng, 1, 9),
      pick(rng, ["/", "//", "%"]),
      pick(rng, ["0", "0.0"])
    ];
    return {
      code: `${n} ${opr} ${zero}`,
      outcome: "ZeroDivisionError",
      why: `${opr} by zero raises ZeroDivisionError \u2014 for floats too.`
    };
  }
  if (form === 4) {
    const [n, opr] = [int(rng, 2, 5), pick(rng, ["+", "*"])];
    return opr === "+" ? {
      code: `"${n}" + ${n}`,
      outcome: "TypeError",
      why: "Python will not add a str and an int; convert one first."
    } : {
      code: `"${n}" * ${n}`,
      outcome: "No error",
      why: `A str times an int repeats it: "${String(n).repeat(n)}".`
    };
  }
  if (form === 5) {
    const code2 = pick(rng, [
      "None.upper()",
      '"abc".push("d")',
      "[1, 2].add(3)",
      "(1, 2).append(3)"
    ]);
    return {
      code: code2,
      outcome: "AttributeError",
      why: "That object has no method by that name, so Python raises AttributeError."
    };
  }
  if (form === 6) {
    const n = int(rng, 1, 9);
    return {
      code: lines(`total = ${n}`, "print(totl)"),
      outcome: "NameError",
      why: "totl was never assigned \u2014 a typo raises NameError."
    };
  }
  if (form === 7) {
    return {
      code: `open("missing-${int(rng, 100, 999)}.txt")`,
      outcome: "FileNotFoundError",
      why: "Opening a file that does not exist for reading raises FileNotFoundError."
    };
  }
  if (form === 8) {
    const [month, day] = pick(rng, [
      [2, 29],
      [2, 28],
      [4, 31],
      [12, 31],
      [6, 31],
      [11, 30]
    ]);
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    const ok = day <= days;
    return {
      code: lines("import datetime", `datetime.date(2026, ${month}, ${day})`),
      outcome: ok ? "No error" : "ValueError",
      why: ok ? "That date exists." : `2026 has no ${month}/${day}, so date() raises ValueError.`
    };
  }
  const [code, outcome, why] = pick(rng, [
    ["[].pop()", "IndexError", "Popping from an empty list raises IndexError."],
    [
      '{}.pop("k")',
      "KeyError",
      "Popping a missing key with no default raises KeyError."
    ],
    [
      '"abc".index("z")',
      "ValueError",
      "str.index raises ValueError when the text is absent."
    ],
    [
      '"abc".find("z")',
      "No error",
      "str.find returns -1 when the text is absent."
    ],
    [
      lines("t = (1, 2)", "t[0] = 5"),
      "TypeError",
      "Tuples cannot be changed in place."
    ],
    ["len(5)", "TypeError", "An int has no length."]
  ]);
  return { code, outcome, why };
}
var exceptions = {
  id: "py.except",
  title: "Which exception?",
  summary: "Name the exception a line raises \u2014 or see that it raises none.",
  generate(rng) {
    const { code, outcome, why } = exceptionCase(rng);
    return {
      kind: "choice",
      skillId: "py.except",
      prompt: "What happens when this runs?",
      code,
      ...choices(rng, outcome, EXCEPTIONS),
      explain: why,
      python: lines(
        "try:",
        indent(code),
        "except Exception as error:",
        "    print(type(error).__name__)",
        "else:",
        '    print("No error")'
      )
    };
  }
};
var tryFlow = {
  id: "py.tryflow",
  title: "try, except, else, finally",
  summary: "Follow the path through exception handlers, including finally.",
  generate(rng) {
    const id = "py.tryflow";
    const form = int(rng, 0, 2);
    if (form === 0) {
      const x2 = pick(rng, [0, 0, int(rng, 1, 5)]);
      const out = x2 === 0 ? "ACE" : "ABDE";
      const code2 = lines(
        "def run(x):",
        "    try:",
        '        print("A", end="")',
        "        r = 10 // x",
        '        print("B", end="")',
        "    except ZeroDivisionError:",
        '        print("C", end="")',
        "    else:",
        '        print("D", end="")',
        "    finally:",
        '        print("E", end="")',
        "",
        `run(${x2})`,
        "print()"
      );
      return predictChoice(
        rng,
        id,
        code2,
        out,
        ["ACE", "ABDE", "ABE", "ACDE", "AE", "ABCDE"],
        x2 === 0 ? "Dividing by zero jumps straight to except, skipping B and else; finally always runs." : "Nothing fails, so except is skipped, else runs, and finally always runs."
      );
    }
    if (form === 1) {
      const value = pick(rng, ["x", "7", "4.5", "12"]);
      const bad = !/^\d+$/.test(value);
      const code2 = lines(
        "try:",
        "    try:",
        '        print("A", end="")',
        `        n = int("${value}")`,
        '        print("B", end="")',
        "    except ZeroDivisionError:",
        '        print("C", end="")',
        "    finally:",
        '        print("D", end="")',
        "except ValueError:",
        '    print("E", end="")',
        "print()"
      );
      return predictChoice(
        rng,
        id,
        code2,
        bad ? "ADE" : "ABD",
        ["ADE", "ABD", "AE", "ACDE", "AD", "ABDE"],
        bad ? "The inner handler only catches ZeroDivisionError, so the ValueError runs the inner finally, then reaches the outer handler." : "int() succeeds, nothing is raised, and the inner finally runs."
      );
    }
    const t = int(rng, 3, 8);
    const x = pick(rng, [t + int(rng, 1, 3), t - int(rng, 0, 3)]);
    const code = lines(
      "def f(x):",
      "    try:",
      `        if x > ${t}:`,
      '            return "A"',
      '        print("B", end="")',
      "    finally:",
      '        print("C", end="")',
      '    return "D"',
      "",
      `print(f(${x}))`
    );
    return predictChoice(
      rng,
      id,
      code,
      x > t ? "CA" : "BCD",
      ["CA", "AC", "BCD", "BDC", "A", "BD"],
      x > t ? "finally runs before the function actually returns, so C is printed before print() shows the result A." : "B prints, finally prints C, then the function returns D."
    );
  }
};
var ACTIONS = [
  "Treat it as success",
  "Follow the redirect",
  "Fix the request \u2014 retrying won't help",
  "Wait, then retry"
];
var STATUS = [
  [200, 0, "OK"],
  [201, 0, "Created"],
  [204, 0, "No Content"],
  [301, 1, "Moved Permanently"],
  [302, 1, "Found"],
  [307, 1, "Temporary Redirect"],
  [308, 1, "Permanent Redirect"],
  [400, 2, "Bad Request"],
  [401, 2, "Unauthorized \u2014 no valid credentials"],
  [403, 2, "Forbidden \u2014 authenticated, but not allowed"],
  [404, 2, "Not Found"],
  [409, 2, "Conflict"],
  [422, 2, "Unprocessable Content"],
  [429, 3, "Too Many Requests"],
  [502, 3, "Bad Gateway"],
  [503, 3, "Service Unavailable"],
  [504, 3, "Gateway Timeout"]
];
var http = {
  id: "py.http",
  title: "HTTP status codes",
  summary: "Know what a status code tells an API client to do next.",
  generate(rng) {
    const [code, action, meaning] = pick(rng, STATUS);
    if (rng() < 0.55) {
      return {
        kind: "choice",
        skillId: "py.http",
        prompt: `An API call returns ${code}. What should a careful client do?`,
        options: ACTIONS,
        correctIndex: action,
        explain: `${code} means ${meaning}. ${["2xx is success.", "3xx points somewhere else.", "This 4xx means the request itself is wrong; sending it again changes nothing.", "This is temporary: back off, then retry."][action]}`
      };
    }
    const others = sample(
      rng,
      STATUS.filter(([other]) => other !== code),
      6
    ).map(([other]) => String(other));
    return {
      kind: "choice",
      skillId: "py.http",
      prompt: `Which status code means "${meaning}"?`,
      ...choices(rng, String(code), others),
      explain: `${code} is ${meaning}.`
    };
  }
};
var json = {
  id: "py.json",
  title: "Reading JSON",
  summary: "Index into parsed JSON: dicts, lists and nesting.",
  generate(rng) {
    const ids = sample(rng, [2, 3, 5, 7, 11, 13, 17, 19], 3);
    const tags = ids.map(
      () => sample(rng, ["a", "b", "c", "d"], int(rng, 0, 3))
    );
    const items = ids.map(
      (itemId, i2) => `{"id": ${itemId}, "tags": [${tags[i2].map((t) => `"${t}"`).join(", ")}]}`
    );
    const page = int(rng, 1, 4);
    const doc = `{"items": [${items.join(", ")}], "page": ${page}}`;
    const [i, j] = sample(rng, [0, 1, 2], 2);
    const tagCount = (k) => tags[k].length;
    const form = int(rng, 0, 2);
    const [expr, answer, why] = form === 0 ? [
      `data["items"][${i}]["id"] + len(data["items"][${j}]["tags"])`,
      ids[i] + tagCount(j),
      `Item ${i} has id ${ids[i]}; item ${j} has ${tagCount(j)} tags.`
    ] : form === 1 ? [
      `data["items"][-1]["id"] * data["page"]`,
      ids[2] * page,
      `[-1] is the last item, id ${ids[2]}; page is ${page}.`
    ] : [
      `sum(len(item["tags"]) for item in data["items"])`,
      tagCount(0) + tagCount(1) + tagCount(2),
      "It adds up every item's tag count."
    ];
    const code = lines(
      "import json",
      "",
      `data = json.loads('${doc}')`,
      `print(${expr})`
    );
    return predictNumber("py.json", code, answer, why);
  }
};
var parseVersion = (text) => text.split(".").map(Number);
function compareVersions(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff) return Math.sign(diff);
  }
  return 0;
}
var versions = {
  id: "py.semver",
  title: "Dependency version ranges",
  summary: "Read pip requirement specifiers like ~=, == x.* and !=.",
  generate(rng) {
    const major = int(rng, 1, 4);
    const minor = int(rng, 2, 9);
    const patch = int(rng, 0, 3);
    const form = int(rng, 0, 3);
    let spec;
    let ok;
    if (form === 0) {
      spec = `~=${major}.${minor}`;
      ok = (v) => compareVersions(v, [major, minor]) >= 0 && v[0] === major;
    } else if (form === 1) {
      spec = `~=${major}.${minor}.${patch}`;
      ok = (v) => compareVersions(v, [major, minor, patch]) >= 0 && v[0] === major && v[1] === minor;
    } else if (form === 2) {
      spec = `>=${major}.${minor},<${major + 1}`;
      ok = (v) => compareVersions(v, [major, minor]) >= 0 && compareVersions(v, [major + 1]) < 0;
    } else {
      spec = `>=${major}.${minor},!=${major}.${minor}.${patch + 1}`;
      ok = (v) => compareVersions(v, [major, minor]) >= 0 && compareVersions(v, [major, minor, patch + 1]) !== 0;
    }
    const pool = [
      `${major}.${minor}`,
      `${major}.${minor}.${patch + 1}`,
      `${major}.${minor + 1}.0`,
      `${major}.${minor - 1}.9`,
      `${major + 1}.0.0`,
      `${major}.${minor + 3}`,
      `${major}.${minor}.${patch}`,
      `${major - 1}.${minor + 2}.0`
    ];
    const candidates = sample(rng, [...new Set(pool)], 4);
    const count = candidates.filter((v) => ok(parseVersion(v))).length;
    const code = lines(
      `requirement = "package${spec}"`,
      `candidates = [${candidates.map((v) => `"${v}"`).join(", ")}]`
    );
    return {
      kind: "number",
      skillId: "py.semver",
      prompt: "How many of these candidate versions satisfy the requirement?",
      code,
      answer: count,
      explain: form === 0 ? `~=${major}.${minor} means >=${major}.${minor} and ==${major}.*.` : form === 1 ? `~=${major}.${minor}.${patch} means >=${major}.${minor}.${patch} and ==${major}.${minor}.*.` : form === 2 ? `Anything from ${major}.${minor} up to, but not including, ${major + 1}.0.` : `At least ${major}.${minor}, except exactly ${major}.${minor}.${patch + 1}.`,
      python: lines(
        "try:",
        "    from packaging.specifiers import SpecifierSet",
        "except ImportError:",
        "    from pip._vendor.packaging.specifiers import SpecifierSet",
        "",
        `spec = SpecifierSet("${spec}")`,
        `print(sum(1 for v in [${candidates.map((v) => `"${v}"`).join(", ")}] if v in spec))`
      )
    };
  }
};
var boundaries = {
  id: "py.boundary",
  title: "Boundary values",
  summary: "Pick the test inputs on either side of each edge of a range.",
  generate(rng) {
    const low = int(rng, 1, 30);
    const high = low + int(rng, 8, 40);
    const [lowOp, highOp] = pick(rng, [
      ["<=", "<"],
      ["<", "<="],
      ["<=", "<="],
      ["<", "<"]
    ]);
    const valid = (x) => (lowOp === "<=" ? low <= x : low < x) && (highOp === "<=" ? x <= high : x < high);
    const edges = (test) => {
      const out = [];
      for (let x = low - 5; x <= high + 5; x += 1)
        if (test(x) !== test(x - 1) || test(x) !== test(x + 1)) out.push(x);
      return out.join(", ");
    };
    const correct = edges(valid);
    const wrong = [
      edges((x) => low <= x && x <= high),
      edges((x) => low < x && x < high),
      edges((x) => low <= x && x < high),
      edges((x) => low < x && x <= high),
      [low, low + 1, high - 1, high].join(", ")
    ];
    const code = lines(
      "def valid(x):",
      `    return ${low} ${lowOp} x ${highOp} ${high}`
    );
    return {
      kind: "choice",
      skillId: "py.boundary",
      prompt: "Which inputs sit right on either side of both boundaries?",
      code,
      ...choices(rng, correct, wrong),
      explain: `The answer flips between ${correct.split(", ").slice(0, 2).join(" and ")} at the low edge and between ${correct.split(", ").slice(2).join(" and ")} at the high edge.`,
      python: lines(
        code,
        "",
        `print(", ".join(str(x) for x in range(${low - 5}, ${high + 6}) if valid(x) != valid(x - 1) or valid(x) != valid(x + 1)))`
      )
    };
  }
};
var mutation = {
  id: "py.mutation",
  title: "Catching a mutant",
  summary: "Find the one test input that tells a buggy condition from the real one.",
  generate(rng) {
    const t = int(rng, 10, 60);
    const form = int(rng, 0, 3);
    let original;
    let mutant;
    let differs;
    let pool;
    if (form === 0) {
      [original, mutant] = [`x >= ${t}`, `x > ${t}`];
      differs = (x) => x === t;
      pool = [t - 3, t - 1, t, t + 1, t + 4];
    } else if (form === 1) {
      [original, mutant] = [`x < ${t}`, `x <= ${t}`];
      differs = (x) => x === t;
      pool = [t - 4, t - 1, t, t + 1, t + 3];
    } else if (form === 2) {
      [original, mutant] = [`x == ${t}`, `x >= ${t}`];
      differs = (x) => x > t;
      pool = [t - 5, t - 2, t - 1, t, t + int(rng, 1, 9)];
    } else {
      const high = t + int(rng, 10, 30);
      [original, mutant] = [
        `${t} <= x and x <= ${high}`,
        `${t} <= x or x <= ${high}`
      ];
      differs = (x) => x < t || x > high;
      pool = [
        t,
        t + 1,
        high - 1,
        high,
        pick(rng, [t - int(rng, 1, 9), high + int(rng, 1, 9)])
      ];
    }
    const catches = pool.filter(differs);
    const misses = pool.filter((x) => !differs(x));
    const right = pick(rng, catches);
    const options = shuffle(rng, [right, ...sample(rng, misses, 3)]).map(
      String
    );
    const code = lines(
      "def original(x):",
      `    return ${original}`,
      "",
      "def mutant(x):",
      `    return ${mutant}`
    );
    return {
      kind: "choice",
      skillId: "py.mutation",
      prompt: "Which test input would catch this mutant \u2014 give a different answer from the original?",
      code,
      options,
      correctIndex: options.indexOf(String(right)),
      explain: `original(${right}) and mutant(${right}) disagree; for the other inputs they agree, so those tests would let the bug through.`,
      python: lines(
        code,
        "",
        `print(next(x for x in [${options.join(", ")}] if original(x) != mutant(x)))`
      )
    };
  }
};
var PATTERNS = [
  [
    String.raw`\d{3}-\d{4}`,
    ["555-0199", "212-7788", "800-1234"],
    ["5550199", "555-019", "55-01999", "555-01a9", "555 0199"]
  ],
  [
    String.raw`[A-Z]{2}\d{2,3}`,
    ["AB12", "XY123", "QQ90"],
    ["Ab12", "AB1", "AB1234", "A123", "AB-12"]
  ],
  [
    String.raw`[a-z]+@[a-z]+\.com`,
    ["ana@site.com", "bo@mail.com", "x@y.com"],
    [
      "ana@site.co",
      "Ana@site.com",
      "ana@sitecom",
      "ana@@site.com",
      "@site.com"
    ]
  ],
  [
    String.raw`20\d{2}-(0[1-9]|1[0-2])-\d{2}`,
    ["2026-02-14", "2031-11-30", "2000-01-01"],
    ["2026-13-01", "2026-2-14", "1999-02-14", "2026-00-10", "2026-02-1"]
  ],
  [
    String.raw`[A-Za-z_]\w*`,
    ["total_2", "_x", "Name"],
    ["2total", "my-var", "", "x y", "a.b"]
  ]
];
var regex = {
  id: "py.regex",
  title: "Regular expressions",
  summary: "Decide which strings a pattern fully matches.",
  generate(rng) {
    const [pattern, good, bad] = pick(rng, PATTERNS);
    const tests = shuffle(rng, [
      ...sample(rng, good, int(rng, 0, 3)),
      ...sample(rng, bad, 3)
    ]).slice(0, 5);
    const full = new RegExp(`^(?:${pattern})$`);
    const count = tests.filter((test) => full.test(test)).length;
    const code = lines(
      "import re",
      "",
      `pattern = r"${pattern}"`,
      `tests = [${tests.map((test) => `"${test}"`).join(", ")}]`,
      "print(sum(1 for t in tests if re.fullmatch(pattern, t)))"
    );
    return predictNumber(
      "py.regex",
      code,
      count,
      `fullmatch needs the whole string to fit the pattern. Matching: ${tests.filter((test) => full.test(test)).map((test) => `"${test}"`).join(", ") || "none"}.`
    );
  }
};
var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isIsoDate(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return false;
  const [year, month, day] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3])
  ];
  const leap = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  const days = month === 2 && leap ? 29 : DAYS_IN_MONTH[month - 1];
  return month >= 1 && month <= 12 && day >= 1 && day <= (days ?? 0);
}
var csvRows = {
  id: "py.csv",
  title: "Validating rows",
  summary: "Apply validation rules to records, including duplicates and impossible dates.",
  generate(rng) {
    const ids = ["A1", "A2", "B7", "C3"];
    const rows = Array.from({ length: int(rng, 5, 6) }, () => {
      const kind = int(rng, 0, 5);
      const ident = kind === 0 && rng() < 0.4 ? "" : pick(rng, ids);
      const amount = kind === 1 ? pick(rng, ["-5", "3.5", "", "12a"]) : pick(rng, ["12", "7", "007", "40"]);
      const day = kind === 2 ? pick(rng, ["2026-02-30", "2026-13-01", "2026/03/01", ""]) : pick(rng, ["2026-03-01", "2024-02-29", "2026-12-31"]);
      return [ident, amount, day];
    });
    const seen = /* @__PURE__ */ new Set();
    let rejected = 0;
    for (const [ident, amount, day] of rows) {
      const ok = Boolean(ident) && !seen.has(ident) && /^\d+$/.test(amount) && isIsoDate(day);
      if (ok) seen.add(ident);
      else rejected += 1;
    }
    const code = lines(
      "import datetime",
      "",
      "rows = [",
      ...rows.map(([a, b, c]) => `    ("${a}", "${b}", "${c}"),`),
      "]",
      "",
      "def ok(row, seen):",
      "    ident, amount, day = row",
      "    if not ident or ident in seen:",
      "        return False",
      "    if not amount.isdigit():",
      "        return False",
      "    try:",
      "        datetime.date.fromisoformat(day)",
      "    except ValueError:",
      "        return False",
      "    return True",
      "",
      "seen = set()",
      "rejected = 0",
      "for row in rows:",
      "    if ok(row, seen):",
      "        seen.add(row[0])",
      "    else:",
      "        rejected += 1",
      "print(rejected)"
    );
    return predictNumber(
      "py.csv",
      code,
      rejected,
      "A row fails on a blank or already-accepted id, an amount that is not all digits, or a date that does not exist. Only accepted ids count as seen."
    );
  }
};
var objects = {
  id: "py.oop",
  title: "Objects and attributes",
  summary: "Trace instance and class attributes through method calls and shared references.",
  generate(rng) {
    const id = "py.oop";
    const form = int(rng, 0, 2);
    if (form === 0) {
      const [a, b, d, e] = [
        int(rng, 1, 9),
        int(rng, 1, 9),
        int(rng, 1, 9),
        int(rng, 1, 9)
      ];
      return predictNumber(
        id,
        lines(
          "class Counter:",
          "    def __init__(self, start):",
          "        self.value = start",
          "",
          "    def add(self, n):",
          "        self.value += n",
          "        return self",
          "",
          `c = Counter(${a})`,
          `c.add(${b}).add(${d})`,
          "alias = c",
          `alias.add(${e})`,
          "print(c.value)"
        ),
        a + b + d + e,
        "add returns the same object, so the chain keeps adding to c, and alias is another name for c."
      );
    }
    if (form === 1) {
      const shared = rng() < 0.6;
      const [firstPuts, secondPuts] = [int(rng, 1, 3), int(rng, 1, 3)];
      const calls = shuffle(rng, [
        ...Array(firstPuts).fill("first"),
        ...Array(secondPuts).fill("second")
      ]).map((who, i) => `${who}.put(${i + 1})`);
      return predictNumber(
        id,
        lines(
          "class Basket:",
          ...shared ? ["    items = []"] : ["    def __init__(self):", "        self.items = []"],
          "",
          "    def put(self, x):",
          "        self.items.append(x)",
          "",
          "first = Basket()",
          "second = Basket()",
          ...calls,
          "print(len(second.items))"
        ),
        shared ? firstPuts + secondPuts : secondPuts,
        shared ? "items is a class attribute: one list shared by every Basket." : "Each Basket makes its own list in __init__."
      );
    }
    const viaClass = rng() < 0.6;
    const made = int(rng, 2, 4);
    return predictNumber(
      id,
      lines(
        "class Ticket:",
        "    issued = 0",
        "",
        "    def __init__(self):",
        `        ${viaClass ? "Ticket" : "self"}.issued += 1`,
        "        self.number = self.issued",
        "",
        ...Array.from({ length: made }, (_, i) => `t${i + 1} = Ticket()`),
        "print(t1.number + Ticket.issued)"
      ),
      viaClass ? 1 + made : 1,
      viaClass ? `Ticket.issued is shared and reaches ${made}; t1 got number 1.` : "self.issued += 1 creates an instance attribute each time, so the class counter stays 0 and every ticket gets 1."
    );
  }
};
var aliasing = {
  id: "py.alias",
  title: "Mutability and aliasing",
  summary: "See when two names share one list \u2014 and when a copy is made.",
  generate(rng) {
    const id = "py.alias";
    const form = int(rng, 0, 2);
    if (form === 0) {
      const start = int(rng, 1, 4);
      const [toB, toC] = [int(rng, 1, 3), int(rng, 1, 3)];
      return predictNumber(
        id,
        lines(
          `a = [${Array.from({ length: start }, (_, i) => i + 1).join(", ")}]`,
          "b = a",
          "c = a[:]",
          ...Array.from({ length: toB }, (_, i) => `b.append(${10 + i})`),
          ...Array.from({ length: toC }, (_, i) => `c.append(${20 + i})`),
          "print(len(a) + len(c))"
        ),
        start + toB + (start + toC),
        "b is the same list as a; a[:] makes a separate copy for c."
      );
    }
    if (form === 1) {
      const calls = int(rng, 2, 4);
      const safe = rng() < 0.35;
      return predictNumber(
        id,
        lines(
          safe ? "def add(x, bucket=None):" : "def add(x, bucket=[]):",
          ...safe ? ["    if bucket is None:", "        bucket = []"] : [],
          "    bucket.append(x)",
          "    return len(bucket)",
          "",
          ...Array.from({ length: calls - 1 }, (_, i) => `add(${i + 1})`),
          `print(add(${calls}))`
        ),
        safe ? 1 : calls,
        safe ? "A fresh list is made on every call that leaves bucket out." : "The default list is made once, when def runs, and every call shares it."
      );
    }
    const [rows, cols, v] = [int(rng, 2, 4), int(rng, 2, 4), int(rng, 2, 9)];
    const shared = rng() < 0.6;
    return predictNumber(
      id,
      lines(
        shared ? `grid = [[0] * ${cols}] * ${rows}` : `grid = [[0] * ${cols} for _ in range(${rows})]`,
        `grid[0][0] = ${v}`,
        "print(sum(sum(row) for row in grid))"
      ),
      shared ? v * rows : v,
      shared ? `* ${rows} repeats a reference to one row, so all ${rows} rows are the same list.` : "The comprehension builds a new row each time."
    );
  }
};
var PYTHON_FUNDAMENTALS = [
  arith,
  binding,
  strings,
  booleans,
  branching,
  loopCount,
  accumulate,
  exceptions,
  tryFlow,
  http,
  json,
  versions,
  boundaries,
  mutation,
  regex,
  csvRows,
  objects,
  aliasing
];
export {
  PYTHON_FUNDAMENTALS,
  pySlice
};
