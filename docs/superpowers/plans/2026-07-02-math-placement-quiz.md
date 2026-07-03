# Making Math Meaningful Placement Quiz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A self-contained static web page that adaptively quizzes a child with real math problems and recommends the exact *Making Math Meaningful* level to start with, per the Cornerstone Curriculum Levels Chart.

**Architecture:** Static site, no framework/build/backend. A pure-logic placement engine (`js/engine.js`) walks a ladder of 8 checkpoints defined in a data module (`js/data.js`); a thin DOM layer (`js/app.js`) renders four screens. Engine and data are ES modules tested with `node --test`.

**Tech Stack:** Vanilla HTML/CSS/JS (ES modules), Node.js built-in test runner (`node:test`), no dependencies.

**Spec:** `docs/superpowers/specs/2026-07-02-math-placement-quiz-design.md` — read it before starting.

---

## File structure

```
/                        (repo root = deployable root)
├── package.json         # {"type":"module"} + test script — enables ESM for node --test
├── index.html           # all screens (welcome, handoff, quiz, interstitial, results)
├── css/styles.css       # design tokens + all styles
├── js/data.js           # OUTCOMES + CHECKPOINTS (skills, problems, product links)
├── js/engine.js         # pure placement logic — no DOM, imports data.js only
├── js/app.js            # screen flow, rendering, input, sessionStorage
├── tests/data.test.js   # validates the problem bank against the chart's rules
└── tests/engine.test.js # seeding, grading, pass rule, adaptive walk, breakdown
```

Key vocabulary (used consistently below):
- **Checkpoint** — one rung of the ladder, index 0–7 (ids `"K","1".."7"`), each with `skills` and 4–6 `problems`.
- **Outcome key** — `"K","L1".."L6","ALGEBRA","BEYOND"`; each maps to an entry in `OUTCOMES`.
- **perProblem** — `boolean[]` of graded answers for one checkpoint run.

To preview the page locally (ES modules won't load over `file://`): `python3 -m http.server 4173` then open `http://localhost:4173`.

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "mmm-placement-quiz",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Create directories**

Run: `mkdir -p css js tests`

- [ ] **Step 3: Verify the test runner works (no tests yet)**

Run: `npm test`
Expected: exits without error (0 tests, or "no test files" style output — either is fine as long as it doesn't crash).

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: scaffold static project with node test runner"
```

---

### Task 2: Problem bank and chart data (`js/data.js`)

**Files:**
- Test: `tests/data.test.js`
- Create: `js/data.js`

- [ ] **Step 1: Write the failing data-validation tests**

Create `tests/data.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { CHECKPOINTS, OUTCOMES } from "../js/data.js";

test("there are exactly 8 checkpoints in ladder order K through 7", () => {
  assert.equal(CHECKPOINTS.length, 8);
  assert.deepEqual(
    CHECKPOINTS.map((c) => c.id),
    ["K", "1", "2", "3", "4", "5", "6", "7"]
  );
});

test("every checkpoint has 4-6 problems", () => {
  for (const cp of CHECKPOINTS) {
    assert.ok(
      cp.problems.length >= 4 && cp.problems.length <= 6,
      `checkpoint ${cp.id} has ${cp.problems.length} problems`
    );
  }
});

test("every skill line is covered by at least one problem", () => {
  for (const cp of CHECKPOINTS) {
    for (const skill of cp.skills) {
      const covering = cp.problems.filter((p) => p.skill === skill.id);
      assert.ok(covering.length >= 1, `skill ${skill.id} in checkpoint ${cp.id} uncovered`);
    }
  }
});

test("every problem is well-formed", () => {
  const types = new Set(["numeric", "choice", "parent-check"]);
  const seenIds = new Set();
  for (const cp of CHECKPOINTS) {
    const skillIds = new Set(cp.skills.map((s) => s.id));
    for (const p of cp.problems) {
      assert.ok(!seenIds.has(p.id), `duplicate problem id ${p.id}`);
      seenIds.add(p.id);
      assert.ok(types.has(p.type), `problem ${p.id} bad type ${p.type}`);
      assert.ok(typeof p.prompt === "string" && p.prompt.length > 0, `problem ${p.id} missing prompt`);
      assert.ok(skillIds.has(p.skill), `problem ${p.id} references unknown skill ${p.skill}`);
      if (p.type === "choice") {
        assert.ok(Array.isArray(p.choices) && p.choices.length >= 2, `problem ${p.id} needs choices`);
        assert.ok(p.choices.includes(p.answer), `problem ${p.id} answer not among choices`);
      }
      if (p.type === "numeric") {
        const n = Number(String(p.answer).replace(/,/g, ""));
        assert.ok(Number.isFinite(n), `problem ${p.id} numeric answer not a number`);
      }
      if (p.type === "parent-check") {
        assert.equal(p.answer, "yes", `problem ${p.id} parent-check answer must be "yes"`);
      }
    }
  }
});

test("every outcome has a name, action sentence, and product URL", () => {
  const keys = [...CHECKPOINTS.map((c) => c.outcome), "BEYOND"];
  for (const key of keys) {
    const o = OUTCOMES[key];
    assert.ok(o, `missing outcome ${key}`);
    assert.ok(o.name.length > 0 && o.action.length > 0, `outcome ${key} missing text`);
    assert.match(o.url, /^https:\/\/www\.cornerstonecurriculum\.com\/product-page\//);
  }
});

test("only checkpoint K is parent-assisted", () => {
  assert.deepEqual(
    CHECKPOINTS.filter((c) => c.parentAssisted).map((c) => c.id),
    ["K"]
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot find module `../js/data.js`.

- [ ] **Step 3: Create `js/data.js` with the full problem bank**

All skill `text` strings are the Levels Chart's own wording — they appear verbatim on the results page. All arithmetic below has been verified; do not "fix" answers.

```js
// Chart data for the Making Math Meaningful placement quiz.
// Source of truth: the Levels Chart (see design spec). Skill text is quoted
// on the results page in the parent's language — keep it in chart wording.

export const OUTCOMES = {
  K: {
    name: "Level K",
    action: "Begin using Level K.",
    url: "https://www.cornerstonecurriculum.com/product-page/level-k-making-math-meaningful",
  },
  L1: {
    name: "Level 1",
    action: "Begin using Level 1.",
    url: "https://www.cornerstonecurriculum.com/product-page/level-1-making-math-meaningful",
  },
  L2: {
    name: "Level 2",
    action: "Begin using Level 2.",
    url: "https://www.cornerstonecurriculum.com/product-page/level-2-making-math-meaningful",
  },
  L3: {
    name: "Level 3",
    action: "Begin using Level 3.",
    url: "https://www.cornerstonecurriculum.com/product-page/level-3-making-math-meaningful",
  },
  L4: {
    name: "Level 4",
    action: "Begin using Level 4.",
    url: "https://www.cornerstonecurriculum.com/product-page/making-math-meaningful-level-4",
  },
  L5: {
    name: "Level 5",
    action: "Begin using Level 5.",
    url: "https://www.cornerstonecurriculum.com/product-page/making-math-meaningful-level-5",
  },
  L6: {
    name: "Level 6",
    action: "Begin using Level 6.",
    url: "https://www.cornerstonecurriculum.com/product-page/making-math-meaningful-level-6",
  },
  ALGEBRA: {
    name: "Principles from Patterns: Algebra I",
    action: "Begin using Principles from Patterns: Algebra I.",
    url: "https://www.cornerstonecurriculum.com/product-page/principles-from-patterns-algebra-i",
  },
  BEYOND: {
    name: "Geometry/Algebra II, then Calculus Made Clear",
    action:
      "Begin Geometry/Algebra II (availability pending), followed by Calculus Made Clear.",
    url: "https://www.cornerstonecurriculum.com/product-page/calculus-made-clear",
  },
};

const READ_ALOUD = "Read this question aloud to your child.";

export const CHECKPOINTS = [
  {
    id: "K",
    outcome: "K",
    parentAssisted: true,
    skills: [
      { id: "K-read", text: "Reads the numbers 0–20" },
      { id: "K-write", text: "Writes the numbers 0–20" },
    ],
    problems: [
      {
        id: "K-1",
        skill: "K-read",
        type: "choice",
        parentNote: READ_ALOUD,
        prompt: "Point to the number fourteen.",
        choices: ["4", "14", "40", "41"],
        answer: "14",
      },
      {
        id: "K-2",
        skill: "K-read",
        type: "choice",
        parentNote: READ_ALOUD,
        prompt: "Point to the number eight.",
        choices: ["3", "8", "6", "9"],
        answer: "8",
      },
      {
        id: "K-3",
        skill: "K-write",
        type: "parent-check",
        prompt:
          "Ask your child to write the number 17 on scratch paper. Did they write it correctly?",
        answer: "yes",
      },
      {
        id: "K-4",
        skill: "K-write",
        type: "parent-check",
        prompt:
          "Ask your child to write the number 6 on scratch paper. Did they write it correctly?",
        answer: "yes",
      },
    ],
  },
  {
    id: "1",
    outcome: "L1",
    parentAssisted: false,
    skills: [
      { id: "1-word", text: "Solves word problems using the numbers 0–20" },
      { id: "1-facts", text: "Knows the basic addition and subtraction facts 0–20" },
    ],
    problems: [
      {
        id: "1-1",
        skill: "1-word",
        type: "numeric",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "Maria has 8 apples. She gives 3 to her brother. How many apples does Maria have left?",
        answer: "5",
      },
      {
        id: "1-2",
        skill: "1-word",
        type: "numeric",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "Sam has 6 marbles. His friend gives him 7 more. How many marbles does Sam have now?",
        answer: "13",
      },
      { id: "1-3", skill: "1-facts", type: "numeric", prompt: "9 + 6 =", answer: "15" },
      { id: "1-4", skill: "1-facts", type: "numeric", prompt: "14 − 8 =", answer: "6" },
      { id: "1-5", skill: "1-facts", type: "numeric", prompt: "7 + 8 =", answer: "15" },
    ],
  },
  {
    id: "2",
    outcome: "L2",
    parentAssisted: false,
    skills: [
      {
        id: "2-ops",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using the numbers 0–99",
      },
    ],
    problems: [
      { id: "2-1", skill: "2-ops", type: "numeric", prompt: "38 + 45 =", answer: "83" },
      { id: "2-2", skill: "2-ops", type: "numeric", prompt: "52 − 27 =", answer: "25" },
      { id: "2-3", skill: "2-ops", type: "numeric", prompt: "64 + 29 =", answer: "93" },
      { id: "2-4", skill: "2-ops", type: "numeric", prompt: "81 − 46 =", answer: "35" },
      {
        id: "2-5",
        skill: "2-ops",
        type: "numeric",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "A farmer collects 47 eggs on Monday and 36 eggs on Tuesday. How many eggs does the farmer collect in all?",
        answer: "83",
      },
    ],
  },
  {
    id: "3",
    outcome: "L3",
    parentAssisted: false,
    skills: [
      {
        id: "3-ops",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using the numbers 0–999",
      },
      { id: "3-facts", text: "Knows the basic multiplication and division facts" },
      { id: "3-frac", text: "Writes the symbolic representations for common fractions" },
    ],
    problems: [
      { id: "3-1", skill: "3-ops", type: "numeric", prompt: "304 − 178 =", answer: "126" },
      { id: "3-2", skill: "3-ops", type: "numeric", prompt: "457 + 286 =", answer: "743" },
      { id: "3-3", skill: "3-facts", type: "numeric", prompt: "7 × 8 =", answer: "56" },
      { id: "3-4", skill: "3-facts", type: "numeric", prompt: "42 ÷ 6 =", answer: "7" },
      {
        id: "3-5",
        skill: "3-frac",
        type: "choice",
        prompt:
          "A pizza is cut into 4 equal pieces. You eat 3 of them. Which fraction shows how much of the pizza you ate?",
        choices: ["3/4", "4/3", "1/3", "1/4"],
        answer: "3/4",
      },
    ],
  },
  {
    id: "4",
    outcome: "L4",
    parentAssisted: false,
    skills: [
      {
        id: "4-ops",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using the numbers 0–999,999",
      },
      { id: "4-mult", text: "Multiplies 1- and 2-digit numbers times 2- and 3-digit numbers" },
      {
        id: "4-frac",
        text:
          "Writes equal, not equal, less than, and greater than equations for fractions",
      },
    ],
    problems: [
      {
        id: "4-1",
        skill: "4-ops",
        type: "numeric",
        prompt: "412,305 − 178,426 =",
        answer: "233879",
      },
      { id: "4-2", skill: "4-mult", type: "numeric", prompt: "34 × 216 =", answer: "7344" },
      { id: "4-3", skill: "4-mult", type: "numeric", prompt: "6 × 138 =", answer: "828" },
      {
        id: "4-4",
        skill: "4-frac",
        type: "choice",
        prompt: "Choose the correct symbol:  2/3 ▢ 3/4",
        choices: ["<", ">", "=", "≠"],
        answer: "<",
      },
      {
        id: "4-5",
        skill: "4-frac",
        type: "choice",
        prompt: "Choose the correct symbol:  2/4 ▢ 1/2",
        choices: ["<", ">", "=", "≠"],
        answer: "=",
      },
    ],
  },
  {
    id: "5",
    outcome: "L5",
    parentAssisted: false,
    skills: [
      {
        id: "5-big",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using numbers in the trillions",
      },
      { id: "5-mult", text: "Multiplies 2- and 3-digit numbers times 3- and 4-digit numbers" },
      { id: "5-div", text: "Divides a 5-digit number by a 1-digit number" },
      { id: "5-frac", text: "Adds, subtracts, multiplies, and divides common fractions" },
    ],
    problems: [
      {
        id: "5-1",
        skill: "5-big",
        type: "choice",
        prompt: "2,400,000,000,000 + 600,000,000,000 =",
        choices: [
          "3,000,000,000,000",
          "2,460,000,000,000",
          "30,000,000,000,000",
          "2,406,000,000,000",
        ],
        answer: "3,000,000,000,000",
      },
      { id: "5-2", skill: "5-mult", type: "numeric", prompt: "245 × 1,338 =", answer: "327810" },
      { id: "5-3", skill: "5-div", type: "numeric", prompt: "34,258 ÷ 7 =", answer: "4894" },
      {
        id: "5-4",
        skill: "5-frac",
        type: "choice",
        prompt: "3/4 + 2/3 =",
        choices: ["17/12", "5/7", "5/12", "6/7"],
        answer: "17/12",
      },
      {
        id: "5-5",
        skill: "5-frac",
        type: "choice",
        prompt: "2/3 × 3/5 =",
        choices: ["2/5", "5/8", "2/15", "9/10"],
        answer: "2/5",
      },
      {
        id: "5-6",
        skill: "5-frac",
        type: "choice",
        prompt: "1/2 ÷ 1/4 =",
        choices: ["2", "1/8", "1/2", "4"],
        answer: "2",
      },
    ],
  },
  {
    id: "6",
    outcome: "L6",
    parentAssisted: false,
    skills: [
      {
        id: "6-word",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using numbers involving decimals",
      },
      { id: "6-div", text: "Divides a 6-digit number by a 2- or 3-digit number" },
      { id: "6-ops", text: "Adds, subtracts, multiplies, and divides using decimals" },
      { id: "6-ratio", text: "Finds ratio, proportions, and percentages" },
    ],
    problems: [
      { id: "6-1", skill: "6-ops", type: "numeric", prompt: "4.6 × 2.3 =", answer: "10.58" },
      { id: "6-2", skill: "6-ops", type: "numeric", prompt: "7.2 − 3.85 =", answer: "3.35" },
      { id: "6-3", skill: "6-div", type: "numeric", prompt: "132,489 ÷ 27 =", answer: "4907" },
      { id: "6-4", skill: "6-ratio", type: "numeric", prompt: "What is 35% of 80?", answer: "28" },
      {
        id: "6-5",
        skill: "6-ratio",
        type: "numeric",
        prompt:
          "A recipe uses 2 cups of flour for every 3 cups of milk. If you use 6 cups of flour, how many cups of milk do you need?",
        answer: "9",
      },
      {
        id: "6-6",
        skill: "6-word",
        type: "numeric",
        prompt:
          "A board is 2.75 meters long. You cut off a piece 1.4 meters long. How many meters long is the piece that is left?",
        answer: "1.35",
      },
    ],
  },
  {
    id: "7",
    outcome: "ALGEBRA",
    parentAssisted: false,
    skills: [
      { id: "7-pre", text: "Knows pre-algebraic concepts" },
      { id: "7-simple", text: "Solves simple algebraic equations (for example, y + 4 = 9)" },
      { id: "7-linear", text: "Solves linear algebraic equations (for example, 3x + 2 = y)" },
      {
        id: "7-system",
        text: "Solves systems of equations and inequalities involving 2 equations with 2 unknowns",
      },
      { id: "7-quad", text: "Solves quadratic equations" },
      { id: "7-factor", text: "Factors quadratic equations" },
    ],
    problems: [
      {
        id: "7-1",
        skill: "7-pre",
        type: "choice",
        prompt: "Which expression means “five more than a number n”?",
        choices: ["n + 5", "5n", "n − 5", "5 − n"],
        answer: "n + 5",
      },
      {
        id: "7-2",
        skill: "7-simple",
        type: "numeric",
        prompt: "If y + 4 = 9, what is y?",
        answer: "5",
      },
      {
        id: "7-3",
        skill: "7-linear",
        type: "numeric",
        prompt: "If 3x + 2 = 11, what is x?",
        answer: "3",
      },
      {
        id: "7-4",
        skill: "7-system",
        type: "numeric",
        prompt: "If 2x + y = 9 and x + y = 10, what is y?",
        answer: "11",
      },
      {
        id: "7-5",
        skill: "7-quad",
        type: "numeric",
        prompt: "x² − 5x + 6 = 0 has two solutions. What is the smaller one?",
        answer: "2",
      },
      {
        id: "7-6",
        skill: "7-factor",
        type: "choice",
        prompt: "Factor: x² + 5x + 6",
        choices: [
          "(x + 2)(x + 3)",
          "(x + 1)(x + 6)",
          "(x + 5)(x + 6)",
          "(x − 2)(x − 3)",
        ],
        answer: "(x + 2)(x + 3)",
      },
    ],
  },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all 6 data tests green.

- [ ] **Step 5: Commit**

```bash
git add tests/data.test.js js/data.js
git commit -m "feat: chart data and problem bank with validation tests"
```

---

### Task 3: Engine — seeding and grading

**Files:**
- Test: `tests/engine.test.js`
- Create: `js/engine.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/engine.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  seedForAge,
  normalizeNumeric,
  gradeAnswer,
  isCheckpointPassed,
} from "../js/engine.js";

test("seedForAge maps ages to entry checkpoints per spec", () => {
  // spec: seed = clamp(age - 6, 0, 6)
  const cases = [
    [4, 0], [5, 0], [6, 0], [7, 1], [8, 2], [9, 3],
    [10, 4], [11, 5], [12, 6], [13, 6], [14, 6],
  ];
  for (const [age, expected] of cases) {
    assert.equal(seedForAge(age), expected, `age ${age}`);
  }
});

test("seedForAge falls back to checkpoint 2 for invalid input", () => {
  assert.equal(seedForAge("not a number"), 2);
  assert.equal(seedForAge(undefined), 2);
});

test("normalizeNumeric strips commas and whitespace", () => {
  assert.equal(normalizeNumeric(" 7,344 "), "7344");
  assert.equal(normalizeNumeric("10.58"), "10.58");
});

test("gradeAnswer handles numeric answers with formatting", () => {
  const p = { type: "numeric", answer: "7344" };
  assert.equal(gradeAnswer(p, "7344"), true);
  assert.equal(gradeAnswer(p, "7,344"), true);
  assert.equal(gradeAnswer(p, " 7344 "), true);
  assert.equal(gradeAnswer(p, "7343"), false);
  assert.equal(gradeAnswer(p, ""), false);
  assert.equal(gradeAnswer(p, null), false); // "I don't know yet"
});

test("gradeAnswer handles decimals and negatives", () => {
  assert.equal(gradeAnswer({ type: "numeric", answer: "10.58" }, "10.58"), true);
  assert.equal(gradeAnswer({ type: "numeric", answer: "-1" }, "-1"), true);
});

test("gradeAnswer compares choice and parent-check answers exactly", () => {
  const choice = { type: "choice", answer: "3/4" };
  assert.equal(gradeAnswer(choice, "3/4"), true);
  assert.equal(gradeAnswer(choice, "1/4"), false);
  const pc = { type: "parent-check", answer: "yes" };
  assert.equal(gradeAnswer(pc, "yes"), true);
  assert.equal(gradeAnswer(pc, "no"), false);
});

test("isCheckpointPassed allows at most one miss", () => {
  assert.equal(isCheckpointPassed([true, true, true, true]), true);
  assert.equal(isCheckpointPassed([true, true, true, false]), true);
  assert.equal(isCheckpointPassed([true, true, false, false]), false);
  assert.equal(isCheckpointPassed([true, true, true, true, false]), true);
  assert.equal(isCheckpointPassed([true, true, true, false, false]), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot find module `../js/engine.js`. (Data tests still pass.)

- [ ] **Step 3: Create `js/engine.js` with seeding and grading**

```js
// Pure placement logic. No DOM. Imports only the chart data.
import { CHECKPOINTS } from "./data.js";

const TOP_INDEX = CHECKPOINTS.length - 1; // checkpoint 7
const MAX_SEED = TOP_INDEX - 1; // never seed at 7; it must be earned by passing 6
const DEFAULT_SEED = 2;
const MAX_MISSES = 1;

export function seedForAge(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return DEFAULT_SEED;
  return Math.min(MAX_SEED, Math.max(0, Math.floor(n) - 6));
}

export function normalizeNumeric(text) {
  return String(text).replace(/[,\s]/g, "");
}

export function gradeAnswer(problem, response) {
  if (response === null || response === undefined || response === "") return false;
  if (problem.type === "numeric") {
    const got = Number(normalizeNumeric(response));
    const want = Number(normalizeNumeric(problem.answer));
    return Number.isFinite(got) && got === want;
  }
  return response === problem.answer;
}

export function isCheckpointPassed(perProblem) {
  const misses = perProblem.filter((r) => !r).length;
  return misses <= MAX_MISSES;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all data + engine tests green.

- [ ] **Step 5: Commit**

```bash
git add tests/engine.test.js js/engine.js
git commit -m "feat: engine seeding, answer grading, and pass rule"
```

---

### Task 4: Engine — adaptive walk

**Files:**
- Modify: `tests/engine.test.js` (append)
- Modify: `js/engine.js` (append)

- [ ] **Step 1: Append the failing walk tests to `tests/engine.test.js`**

Add these imports to the existing import statement from `../js/engine.js`: `createQuizState`, `recordCheckpointResult`. Also add at the top:

```js
import { CHECKPOINTS } from "../js/data.js";
```

Then append:

```js
// Simulates a full quiz: the child passes exactly the checkpoints whose ids
// are in passIds and fails all others. Returns the final state.
function runWalk(age, passIds) {
  let state = createQuizState(age);
  let guard = 0;
  while (state.outcome === null) {
    assert.ok(++guard <= 8, "walk did not terminate");
    const cp = CHECKPOINTS[state.currentIndex];
    const n = cp.problems.length;
    const passed = passIds.has(cp.id);
    // pass: all correct; fail: only the first correct (>= 2 misses since n >= 4)
    const perProblem = Array.from({ length: n }, (_, i) => (passed ? true : i === 0));
    state = recordCheckpointResult(state, perProblem);
  }
  return state;
}

test("pass at seed walks up; first failure is the recommendation", () => {
  let s = createQuizState(9); // seed 3
  assert.equal(s.currentIndex, 3);
  const pass = CHECKPOINTS[3].problems.map(() => true);
  s = recordCheckpointResult(s, pass);
  assert.equal(s.outcome, null);
  assert.equal(s.direction, "up");
  assert.equal(s.currentIndex, 4);
  const fail = CHECKPOINTS[4].problems.map((_, i) => i === 0);
  s = recordCheckpointResult(s, fail);
  assert.equal(s.outcome, "L4");
  assert.equal(s.recommendedIndex, 4);
});

test("fail at seed walks down; first pass ends with the rung above as recommendation", () => {
  let s = createQuizState(9); // seed 3
  s = recordCheckpointResult(s, CHECKPOINTS[3].problems.map(() => false));
  assert.equal(s.direction, "down");
  assert.equal(s.currentIndex, 2);
  s = recordCheckpointResult(s, CHECKPOINTS[2].problems.map(() => false));
  assert.equal(s.currentIndex, 1);
  s = recordCheckpointResult(s, CHECKPOINTS[1].problems.map(() => true));
  assert.equal(s.outcome, "L2");
  assert.equal(s.recommendedIndex, 2);
});

test("failing checkpoint K recommends Level K", () => {
  const s = runWalk(7, new Set()); // seed 1, fails everything
  assert.equal(s.outcome, "K");
  assert.equal(s.recommendedIndex, 0);
});

test("passing checkpoint 7 gives the beyond outcome", () => {
  const all = new Set(CHECKPOINTS.map((c) => c.id));
  const s = runWalk(14, all); // seed 6: pass 6, pass 7
  assert.equal(s.outcome, "BEYOND");
  assert.equal(s.recommendedIndex, null);
});

test("placement result is independent of the seeding age", () => {
  // For each rung k, a child who can do everything below k but not k itself
  // must be recommended rung k's level, no matter where they entered.
  for (let k = 0; k < CHECKPOINTS.length; k++) {
    const passIds = new Set(CHECKPOINTS.slice(0, k).map((c) => c.id));
    for (const age of [5, 9, 14]) {
      const s = runWalk(age, passIds);
      assert.equal(
        s.outcome,
        CHECKPOINTS[k].outcome,
        `rung ${k} from age ${age}`
      );
      assert.equal(s.recommendedIndex, k, `rung ${k} from age ${age}`);
    }
  }
  for (const age of [5, 9, 14]) {
    const s = runWalk(age, new Set(CHECKPOINTS.map((c) => c.id)));
    assert.equal(s.outcome, "BEYOND", `beyond from age ${age}`);
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `createQuizState` is not exported.

- [ ] **Step 3: Append the walk to `js/engine.js`**

```js
export function createQuizState(age) {
  return {
    currentIndex: seedForAge(age),
    direction: null, // null | "up" | "down"
    tested: {}, // checkpointIndex -> { passed, perProblem }
    outcome: null, // outcome key once finished
    recommendedIndex: null, // checkpoint the recommendation is based on (null for BEYOND)
  };
}

export function recordCheckpointResult(state, perProblem) {
  const passed = isCheckpointPassed(perProblem);
  const idx = state.currentIndex;
  const base = {
    ...state,
    tested: { ...state.tested, [idx]: { passed, perProblem } },
  };

  if (passed) {
    if (idx === TOP_INDEX) {
      return { ...base, outcome: "BEYOND", recommendedIndex: null };
    }
    if (state.direction === "down") {
      // Walking down and finally passed: the rung above is the lowest failed.
      return finish(base, idx + 1);
    }
    return { ...base, direction: "up", currentIndex: idx + 1 };
  }

  if (idx === 0) return finish(base, 0);
  if (state.direction === "up") {
    // Walking up and hit the first failure: this rung is the recommendation.
    return finish(base, idx);
  }
  return { ...base, direction: "down", currentIndex: idx - 1 };
}

function finish(state, recommendedIndex) {
  return {
    ...state,
    outcome: CHECKPOINTS[recommendedIndex].outcome,
    recommendedIndex,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/engine.test.js js/engine.js
git commit -m "feat: adaptive ladder walk with terminal outcomes"
```

---

### Task 5: Engine — skill breakdown for the results page

**Files:**
- Modify: `tests/engine.test.js` (append)
- Modify: `js/engine.js` (append)

- [ ] **Step 1: Append the failing tests**

Add `skillBreakdown` to the `../js/engine.js` import. Append:

```js
test("skillBreakdown splits the failed checkpoint's skills by full correctness", () => {
  let s = createQuizState(9); // seed 3
  s = recordCheckpointResult(s, CHECKPOINTS[3].problems.map(() => true)); // pass 3
  // Checkpoint 4 problems: [4-ops, 4-mult, 4-mult, 4-frac, 4-frac].
  // Miss both multiplication problems -> fail the checkpoint (2 misses),
  // but 4-ops and 4-frac were fully correct.
  s = recordCheckpointResult(s, [true, false, false, true, true]);
  assert.equal(s.outcome, "L4");

  const { demonstrated, toLearn } = skillBreakdown(s);
  const cp3Texts = CHECKPOINTS[3].skills.map((sk) => sk.text);
  for (const t of cp3Texts) assert.ok(demonstrated.includes(t), t);
  assert.ok(
    demonstrated.includes(
      "Solves word problems and computational problems involving borrowing and carrying using the numbers 0–999,999"
    )
  );
  assert.ok(
    demonstrated.includes(
      "Writes equal, not equal, less than, and greater than equations for fractions"
    )
  );
  assert.deepEqual(toLearn, [
    "Multiplies 1- and 2-digit numbers times 2- and 3-digit numbers",
  ]);
});

test("skillBreakdown for the beyond outcome lists everything demonstrated, nothing to learn", () => {
  const all = new Set(CHECKPOINTS.map((c) => c.id));
  const s = runWalk(14, all);
  const { demonstrated, toLearn } = skillBreakdown(s);
  assert.deepEqual(toLearn, []);
  // Every tested (passed) checkpoint's skills appear.
  for (const idx of Object.keys(s.tested)) {
    for (const sk of CHECKPOINTS[Number(idx)].skills) {
      assert.ok(demonstrated.includes(sk.text), sk.text);
    }
  }
});

test("skillBreakdown when everything failed shows no demonstrated skills", () => {
  const s = runWalk(7, new Set());
  const { demonstrated, toLearn } = skillBreakdown(s);
  assert.deepEqual(demonstrated, []);
  assert.deepEqual(
    toLearn,
    CHECKPOINTS[0].skills.map((sk) => sk.text)
  );
});
```

Note: `runWalk`'s fail vector marks only the *first* problem correct, so in the "everything failed" case, checkpoint K's first skill (`K-read`, problems at positions 0 and 1) is not fully correct — no skill is.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `skillBreakdown` is not exported.

- [ ] **Step 3: Append `skillBreakdown` to `js/engine.js`**

```js
export function skillBreakdown(state) {
  const demonstrated = [];
  const toLearn = [];

  for (let idx = 0; idx < CHECKPOINTS.length; idx++) {
    const result = state.tested[idx];
    if (!result) continue;
    const cp = CHECKPOINTS[idx];

    if (result.passed) {
      for (const skill of cp.skills) demonstrated.push(skill.text);
      continue;
    }
    if (idx !== state.recommendedIndex) continue; // a failed rung below the
    // recommendation was superseded by a lower fail; only the recommended
    // (lowest failed) rung's skills are broken out.

    for (const skill of cp.skills) {
      const positions = cp.problems
        .map((p, i) => (p.skill === skill.id ? i : -1))
        .filter((i) => i !== -1);
      const allCorrect = positions.every((i) => result.perProblem[i]);
      (allCorrect ? demonstrated : toLearn).push(skill.text);
    }
  }
  return { demonstrated, toLearn };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — full suite green.

- [ ] **Step 5: Commit**

```bash
git add tests/engine.test.js js/engine.js
git commit -m "feat: skill breakdown for results page"
```

---

### Task 6: Static shell — `index.html` and `css/styles.css`

**Files:**
- Create: `index.html`
- Create: `css/styles.css`

No unit tests for markup; verification is visual (step 3).

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Find Your Child's Level — Making Math Meaningful</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,500;0,700;1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
<main>

  <section id="screen-welcome" class="screen" aria-labelledby="welcome-heading">
    <h1 id="welcome-heading">Find the Perfect Starting Level</h1>
    <p class="lede">Your child works a few real math problems, and we recommend exactly
    which <em>Making Math Meaningful</em> level to begin with — in about 5–10 minutes.</p>
    <div class="card">
      <h2>Before you begin</h2>
      <ul class="prep-list">
        <li><strong>Levels are not grades.</strong> Children move to the next level whenever they're ready.</li>
        <li>Have <strong>pencil and scratch paper</strong> ready.</li>
        <li>Younger children can have problems read aloud to them.</li>
      </ul>
      <form id="welcome-form">
        <label class="field-label" for="age-select">How old is your child?</label>
        <select id="age-select" required>
          <option value="" selected disabled>Choose an age…</option>
          <option value="4">4 or younger</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="13">13</option>
          <option value="14">14 or older</option>
        </select>
        <p class="hint">Not sure where they'll land? Just pick their age — the quiz adapts.</p>
        <button type="submit" class="btn">Start</button>
      </form>
    </div>
  </section>

  <section id="screen-handoff" class="screen" aria-labelledby="handoff-heading" hidden>
    <h1 id="handoff-heading">Ready?</h1>
    <div class="card">
      <p id="handoff-copy"></p>
      <button id="handoff-continue" class="btn" type="button">We're ready</button>
    </div>
  </section>

  <section id="screen-quiz" class="screen" aria-label="Math problems" hidden>
    <div class="dots" id="progress-dots" aria-hidden="true"></div>
    <div class="card problem-card">
      <p id="parent-note" class="parent-note" hidden></p>
      <p id="problem-prompt" class="problem-prompt" aria-live="polite"></p>
      <div id="answer-area"></div>
      <button id="idk-button" class="btn-ghost" type="button">I don't know yet</button>
    </div>
  </section>

  <section id="screen-interstitial" class="screen center" aria-labelledby="interstitial-heading" hidden>
    <div class="card">
      <h2 id="interstitial-heading">Nice work!</h2>
      <p>Let's try a few more.</p>
      <button id="interstitial-continue" class="btn" type="button">Keep going</button>
    </div>
  </section>

  <section id="screen-results" class="screen" aria-labelledby="result-action" hidden>
    <p class="result-kicker">Our recommendation</p>
    <h1 id="result-action"></h1>
    <p class="lede" id="result-blurb"></p>
    <div class="card">
      <h2>What your child demonstrated</h2>
      <ul id="demonstrated-list" class="skill-list demonstrated"></ul>
      <h2 id="to-learn-heading"></h2>
      <ul id="to-learn-list" class="skill-list to-learn"></ul>
    </div>
    <div class="card philosophy">
      <p>“Auto-advance to the next level when ready! We encourage teaching multiple
      children/ages together, and all age recommendations should be adapted to your
      individual family's needs.”</p>
    </div>
    <p class="actions">
      <a id="result-link" class="btn" href="#">See this level</a>
      <button id="start-over" class="btn-ghost" type="button">Start over</button>
    </p>
  </section>

</main>
<script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/styles.css`**

```css
:root {
  --color-cream: #f5efe6;
  --color-paper: #fdfaf4;
  --color-maroon: #8b1a1a;
  --color-maroon-dark: #6e1414;
  --color-ink: #2e2a26;
  --color-ink-soft: #6b6259;
  --color-rule: #e0d6c6;
  --color-accent-bg: #f0e6d6;

  --text-base: clamp(1.05rem, 0.95rem + 0.5vw, 1.2rem);
  --text-problem: clamp(1.5rem, 1.1rem + 2vw, 2.4rem);
  --text-heading: clamp(1.9rem, 1.4rem + 2.5vw, 2.9rem);

  --space: clamp(1rem, 0.8rem + 1vw, 1.6rem);
  --duration: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-cream);
  color: var(--color-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: var(--text-base);
  line-height: 1.6;
}

main {
  max-width: 680px;
  margin: 0 auto;
  padding: calc(var(--space) * 2) var(--space) calc(var(--space) * 4);
}

h1, h2 {
  font-family: "EB Garamond", Georgia, serif;
  color: var(--color-maroon);
  line-height: 1.15;
}
h1 { font-size: var(--text-heading); margin: 0 0 0.5em; }
h2 { font-size: 1.35rem; margin: 0 0 0.6em; }

.lede { color: var(--color-ink-soft); font-size: 1.1em; margin-top: 0; }

.card {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: 12px;
  padding: calc(var(--space) * 1.5);
  margin: var(--space) 0;
  box-shadow: 0 2px 12px rgba(46, 42, 38, 0.06);
}

.prep-list { padding-left: 1.2em; }
.prep-list li { margin-bottom: 0.4em; }

.field-label { display: block; font-weight: bold; margin-bottom: 0.4em; }

select {
  font: inherit;
  padding: 0.5em 0.8em;
  border: 2px solid var(--color-rule);
  border-radius: 8px;
  background: #fff;
  color: var(--color-ink);
  min-width: 12em;
}
select:focus-visible { border-color: var(--color-maroon); outline: none; }

.hint { color: var(--color-ink-soft); font-size: 0.9em; font-style: italic; }

.btn {
  display: inline-block;
  font: inherit;
  font-weight: bold;
  color: #fff;
  background: var(--color-maroon);
  border: none;
  border-radius: 999px;
  padding: 0.65em 1.8em;
  cursor: pointer;
  text-decoration: none;
  transition: background var(--duration) var(--ease-out), transform var(--duration) var(--ease-out);
}
.btn:hover { background: var(--color-maroon-dark); transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.btn-ghost {
  font: inherit;
  color: var(--color-ink-soft);
  background: none;
  border: 1px solid var(--color-rule);
  border-radius: 999px;
  padding: 0.5em 1.4em;
  cursor: pointer;
  transition: border-color var(--duration) var(--ease-out), color var(--duration) var(--ease-out);
}
.btn-ghost:hover { border-color: var(--color-ink-soft); color: var(--color-ink); }

.btn:focus-visible, .btn-ghost:focus-visible, .choice-btn:focus-visible {
  outline: 3px solid var(--color-maroon);
  outline-offset: 2px;
}

/* Quiz */
.dots { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: var(--space); }
.dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--color-rule); }
.dot.done { background: var(--color-maroon); }
.dot.current { outline: 2px solid var(--color-maroon); outline-offset: 2px; }

.problem-card { text-align: center; }
.parent-note {
  color: var(--color-ink-soft);
  font-style: italic;
  font-size: 0.95em;
  background: var(--color-accent-bg);
  border-radius: 8px;
  padding: 0.5em 1em;
  display: inline-block;
}
.problem-prompt { font-size: var(--text-problem); line-height: 1.35; margin: 0.6em 0 0.9em; }
.problem-prompt:focus { outline: none; }
h1:focus, h2:focus { outline: none; }

.answer-form { display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: center; align-items: center; }
.answer-input {
  font: inherit;
  font-size: var(--text-problem);
  width: min(100%, 300px);
  padding: 0.3em 0.5em;
  text-align: center;
  border: 2px solid var(--color-rule);
  border-radius: 10px;
  background: #fff;
  color: var(--color-ink);
}
.answer-input:focus-visible { border-color: var(--color-maroon); outline: none; }

.choices { display: grid; gap: 0.75rem; max-width: 380px; margin: 0 auto; }
.choice-btn {
  font: inherit;
  font-size: 1.25em;
  padding: 0.6em 1em;
  background: #fff;
  color: var(--color-ink);
  border: 2px solid var(--color-rule);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color var(--duration) var(--ease-out);
}
.choice-btn:hover { border-color: var(--color-maroon); }

#idk-button { margin-top: calc(var(--space) * 1.2); }

/* Results */
.result-kicker {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.8em;
  color: var(--color-ink-soft);
  margin-bottom: 0.2em;
}
.skill-list { list-style: none; padding: 0; margin: 0 0 1em; }
.skill-list li { padding: 0.35em 0 0.35em 1.8em; position: relative; }
.skill-list li::before { position: absolute; left: 0; font-weight: bold; }
.skill-list.demonstrated li::before { content: "\2713"; color: var(--color-maroon); }
.skill-list.to-learn li::before { content: "\25CB"; color: var(--color-ink-soft); }

.philosophy p { font-style: italic; color: var(--color-ink-soft); margin: 0; }
.actions { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }

.center { text-align: center; }

/* Screen transitions — compositor-friendly only */
.screen { animation: screen-in var(--duration) var(--ease-out); }
@keyframes screen-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .screen { animation: none; }
  .btn, .btn-ghost, .choice-btn { transition: none; }
}

[hidden] { display: none !important; }
```

- [ ] **Step 3: Verify visually**

Run: `python3 -m http.server 4173` (from the repo root), open `http://localhost:4173`.
Expected: welcome screen renders in cream/maroon serif style; age dropdown and Start button visible; other screens hidden. (Start does nothing yet — `js/app.js` doesn't exist; a 404 for it in the console is expected at this stage.)

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: static shell with design tokens for all screens"
```

---

### Task 7: App — welcome, hand-off, and problem rendering

**Files:**
- Create: `js/app.js`

Browser-verified (engine logic is already unit-tested).

- [ ] **Step 1: Create `js/app.js`**

```js
import { CHECKPOINTS, OUTCOMES } from "./data.js";
import {
  createQuizState,
  recordCheckpointResult,
  gradeAnswer,
  skillBreakdown,
} from "./engine.js";

const STORAGE_KEY = "mmm-placement-v1";
const NUMERIC_PATTERN = /^-?[\d,]*\.?\d+$/;

const screens = {
  welcome: document.getElementById("screen-welcome"),
  handoff: document.getElementById("screen-handoff"),
  quiz: document.getElementById("screen-quiz"),
  interstitial: document.getElementById("screen-interstitial"),
  results: document.getElementById("screen-results"),
};

let quiz = null; // engine state
let run = null; // { problemIdx, perProblem } for quiz.currentIndex

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
  const focusTarget = screens[name].querySelector("h1, h2, .problem-prompt");
  if (focusTarget) {
    focusTarget.setAttribute("tabindex", "-1");
    focusTarget.focus();
  }
}

// --- persistence (Task 9 wires restore; save is defined here so every
// mutation point can call it from the start)
function save() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ quiz, run }));
  } catch {
    // Private browsing or storage disabled: quiz still works,
    // it just won't survive a page refresh.
  }
}
function clearSaved() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

// --- welcome & hand-off
document.getElementById("welcome-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const age = document.getElementById("age-select").value;
  if (!age) return;
  quiz = createQuizState(Number(age));
  run = null;
  save();
  renderHandoff();
  showScreen("handoff");
});

function renderHandoff() {
  const cp = CHECKPOINTS[quiz.currentIndex];
  document.getElementById("handoff-copy").textContent = cp.parentAssisted
    ? "These first questions are for you and your child together. Sit alongside them, read each one aloud, and answer honestly — there are no wrong placements, only right starting points."
    : "Now hand the device to your child. Feel free to sit alongside and read problems aloud — but let them do the math themselves. Guessing is never required: there's always an “I don't know yet” button.";
}

document.getElementById("handoff-continue").addEventListener("click", () => {
  beginCheckpoint();
});

// --- quiz
function beginCheckpoint() {
  run = { problemIdx: 0, perProblem: [] };
  save();
  renderProblem();
  showScreen("quiz");
}

function currentProblem() {
  return CHECKPOINTS[quiz.currentIndex].problems[run.problemIdx];
}

function renderProblem() {
  const cp = CHECKPOINTS[quiz.currentIndex];
  const p = currentProblem();
  renderDots(cp.problems.length, run.problemIdx);

  const note = document.getElementById("parent-note");
  note.hidden = !p.parentNote;
  note.textContent = p.parentNote || "";

  document.getElementById("problem-prompt").textContent = p.prompt;

  const area = document.getElementById("answer-area");
  area.innerHTML = "";
  area.appendChild(p.type === "numeric" ? buildNumericInput() : buildChoices(p));

  // Parents answering yes/no shouldn't see a child-voiced escape hatch.
  document.getElementById("idk-button").hidden = p.type === "parent-check";

  const focusTarget = area.querySelector("input, button");
  if (focusTarget) focusTarget.focus();
}

function renderDots(total, current) {
  const wrap = document.getElementById("progress-dots");
  wrap.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("span");
    dot.className = "dot" + (i < current ? " done" : i === current ? " current" : "");
    wrap.appendChild(dot);
  }
}

function buildNumericInput() {
  const form = document.createElement("form");
  form.className = "answer-form";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "answer-input";
  input.inputMode = "decimal";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Your answer");
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "btn";
  submit.textContent = "Next";
  submit.disabled = true;
  input.addEventListener("input", () => {
    submit.disabled = !NUMERIC_PATTERN.test(input.value.trim());
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!submit.disabled) answer(input.value.trim());
  });
  form.append(input, submit);
  return form;
}

function buildChoices(p) {
  const wrap = document.createElement("div");
  wrap.className = "choices";
  const isParentCheck = p.type === "parent-check";
  const options = isParentCheck ? ["yes", "no"] : p.choices;
  const labels = { yes: "Yes, they could", no: "Not yet" };
  for (const opt of options) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "choice-btn";
    b.textContent = isParentCheck ? labels[opt] : opt;
    b.addEventListener("click", () => answer(opt));
    wrap.appendChild(b);
  }
  return wrap;
}

document.getElementById("idk-button").addEventListener("click", () => answer(null));

function answer(response) {
  const p = currentProblem();
  run.perProblem.push(gradeAnswer(p, response));
  run.problemIdx += 1;
  const cp = CHECKPOINTS[quiz.currentIndex];
  if (run.problemIdx < cp.problems.length) {
    save();
    renderProblem();
    return;
  }
  completeCheckpoint();
}

// Placeholder for this task; Task 8 replaces it with the real implementation.
function completeCheckpoint() {
  console.log("checkpoint complete", quiz.currentIndex, run.perProblem);
}

// --- boot
showScreen("welcome");
```

- [ ] **Step 2: Verify in the browser**

With the server from Task 6 still running, reload `http://localhost:4173`:
- Pick age 9, Start → hand-off copy about handing the device over → "We're ready" → a problem card for checkpoint 3 (`304 − 178 =`) with 5 progress dots.
- Numeric input: Next stays disabled until a valid number is typed.
- Answer all 5 problems → console logs `checkpoint complete 3` and an array of 5 booleans.
- Pick age 4 (fresh reload): hand-off copy is the parent-assisted version; checkpoint K shows choice buttons and Yes/No parent checks; "I don't know yet" is hidden on parent-check items.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: welcome, hand-off, and problem rendering"
```

---

### Task 8: App — checkpoint completion, interstitial, and results

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Replace the placeholder `completeCheckpoint` and add results rendering**

Replace the placeholder `completeCheckpoint` function in `js/app.js` with:

```js
function completeCheckpoint() {
  quiz = recordCheckpointResult(quiz, run.perProblem);
  run = null;
  save();
  if (quiz.outcome) {
    renderResults();
    showScreen("results");
    return;
  }
  showScreen("interstitial");
}

document
  .getElementById("interstitial-continue")
  .addEventListener("click", beginCheckpoint);

// --- results
function renderResults() {
  const outcome = OUTCOMES[quiz.outcome];
  document.getElementById("result-action").textContent = outcome.action;
  document.getElementById("result-blurb").textContent =
    quiz.outcome === "BEYOND"
      ? "Your child demonstrated every skill on the placement ladder — they're ready for high-school math."
      : "This is the level where your child is ready to grow. Here's what we saw:";

  const { demonstrated, toLearn } = skillBreakdown(quiz);
  fillList(
    "demonstrated-list",
    demonstrated.length
      ? demonstrated
      : ["Your child is just beginning — and every mathematician starts here."]
  );
  document.getElementById("to-learn-heading").textContent = toLearn.length
    ? `${outcome.name} will teach`
    : "";
  fillList("to-learn-list", toLearn);

  const link = document.getElementById("result-link");
  link.href = outcome.url;
  link.textContent = `See ${outcome.name}`;
}

function fillList(id, items) {
  const ul = document.getElementById(id);
  ul.innerHTML = "";
  for (const text of items) {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  }
}

document.getElementById("start-over").addEventListener("click", () => {
  clearSaved();
  quiz = null;
  run = null;
  document.getElementById("welcome-form").reset();
  showScreen("welcome");
});
```

- [ ] **Step 2: Verify the full flow in the browser**

Reload `http://localhost:4173` and run three journeys:
1. **Age 9, answer everything correctly** (answers are in `js/data.js`): checkpoint 3 → interstitial → 4 → 5 → 6 → 7 → results say "Begin Geometry/Algebra II (availability pending), followed by Calculus Made Clear."
2. **Age 9, correct on checkpoint 3, then click "I don't know yet" on the two multiplication problems of checkpoint 4** (`34 × 216`, `6 × 138`), correct elsewhere: results say "Begin using Level 4."; demonstrated includes the 0–999,999 borrowing/carrying line and the fraction-symbols line; "Level 4 will teach" lists the multiplication line; the button links to the Level 4 product page.
3. **Age 4, click "Not yet"/wrong on everything**: results say "Begin using Level K." with the friendly just-beginning line.

Then click **Start over** → welcome screen, fresh form.

- [ ] **Step 3: Run the unit suite to confirm nothing regressed**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: checkpoint completion, interstitial, and results screens"
```

---

### Task 9: App — sessionStorage restore

**Files:**
- Modify: `js/app.js`

`save()`/`clearSaved()` already exist and are called at every mutation point; this task adds restore-on-load.

- [ ] **Step 1: Add `restore` and change the boot line**

In `js/app.js`, replace the final boot line (`showScreen("welcome");`) with:

```js
function restore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || !saved.quiz) return false;
    quiz = saved.quiz;
    run = saved.run;
    if (quiz.outcome) {
      renderResults();
      showScreen("results");
      return true;
    }
    if (run) {
      renderProblem();
      showScreen("quiz");
      return true;
    }
    renderHandoff();
    showScreen("handoff");
    return true;
  } catch {
    return false;
  }
}

// --- boot
if (!restore()) showScreen("welcome");
```

- [ ] **Step 2: Verify in the browser**

- Start a quiz (age 9), answer 2 problems, hit browser refresh → same checkpoint resumes at problem 3 with dots showing 2 done.
- Finish a quiz, refresh → results screen persists.
- Click Start over, refresh → welcome screen (state cleared).
- Open a fresh tab to the same URL → welcome screen (sessionStorage is per-tab; this is intended).

- [ ] **Step 3: Run the unit suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: session persistence across accidental refresh"
```

---

### Task 10: Verification pass and README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: PASS — data validation + engine suites, zero failures.

- [ ] **Step 2: Manual verification checklist (browser at `http://localhost:4173`)**

- **Responsive:** DevTools at 320, 375, 768, 1024, 1440 widths — no horizontal overflow on any screen; problem text remains large and readable at 320.
- **Keyboard only:** complete an entire quiz using Tab/Enter/arrow keys only; focus lands on the heading/problem at each screen change; focus outlines visible.
- **Reduced motion:** enable "prefers-reduced-motion" emulation in DevTools rendering tab — screen transitions appear instantly with no animation.
- **No mid-quiz feedback:** wrong answers advance identically to right answers; nothing red appears anywhere.
- **Numeric formats:** `7,344` and `7344` and ` 7344 ` all accepted as correct for `34 × 216`.
- **Product links:** each results outcome links to the matching cornerstonecurriculum.com product page (spot-check Level 4 and Algebra I).
- Fix anything found; re-run `npm test` after any change.

- [ ] **Step 3: Create `README.md`**

```markdown
# Making Math Meaningful — Placement Quiz

A self-contained placement quiz for Cornerstone Curriculum's *Making Math
Meaningful*. A child works real math problems; the page recommends the exact
level to start with, following the program's Levels Chart.

## Run locally

ES modules require a web server (not `file://`):

    python3 -m http.server 4173

Then open http://localhost:4173.

## Deploy

Upload the repo contents (minus `tests/`, `docs/`, `package.json` if you like —
they're harmless either way) to any static host: GitHub Pages, Netlify,
Cloudflare Pages, or plain shared hosting. No build step, no server code.

## Edit the problems

Everything a curriculum author might tweak lives in `js/data.js`:
problem wording, answers, skill descriptions, and product links.
After editing, run the validation suite:

    npm test

## Structure

- `js/data.js` — the Levels Chart as data: checkpoints, skills, problems, links
- `js/engine.js` — placement logic (pure functions, unit-tested)
- `js/app.js` — screens and rendering
- `tests/` — run with `npm test` (Node 18+)
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README with run, deploy, and editing instructions"
```

---

## Self-review notes

- **Spec coverage:** welcome/age seeding (Tasks 6–7), parent-assisted K (Tasks 2, 7), adaptive walk + pass rule + all 9 outcomes (Tasks 4–5 tests), "I don't know yet" (Task 7), no mid-quiz feedback (Tasks 7–8 + checklist), skill breakdown incl. partial-credit rule (Task 5), philosophy quote + product link + start over (Tasks 6, 8), sessionStorage (Task 9), comma-stripping (Task 3), reduced motion/responsive/a11y (Tasks 6, 10), out-of-scope items untouched. ✓
- **Types/names:** `perProblem`, `recommendedIndex`, `outcome` keys (`K, L1..L6, ALGEBRA, BEYOND`), and function names are consistent across data, engine, app, and tests. ✓
- **Arithmetic in the bank:** every answer hand-verified (e.g., 412,305 − 178,426 = 233,879; 27 × 4,907 = 132,489; 7 × 4,894 = 34,258). ✓
