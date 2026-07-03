# Making Math Meaningful Placement Quiz — Full Site Breakdown

**Live site:** https://lordbyronq.github.io/math-placement-quiz/
**Repository:** https://github.com/lordbyronq/math-placement-quiz
**Purpose:** Automatically place a child into the correct *Making Math Meaningful* level (Cornerstone Curriculum) by having them work real math problems — replacing manual use of the paper Levels Chart.

---

## 1. What it is, in one paragraph

The site is a single-page adaptive quiz. A parent enters their child's age, hands the device to the child, and the child solves real, auto-graded math problems. Behind the scenes, the quiz walks a ladder of eight skill checkpoints taken directly from the program's Levels Chart, moving up when the child passes a set and down when they don't, until it finds the exact boundary of what the child can do. The first checkpoint the child *can't* pass is the level they should start with — the same rule the paper chart uses. The result page shows the recommendation, a breakdown of demonstrated vs. yet-to-learn skills in the chart's own language, and a link to the level's product page.

There is **no server, no framework, no build step, and no data collection**. It's three small JavaScript modules, one HTML file, and one stylesheet — hostable anywhere, editable with a text editor.

---

## 2. The user journey (five screens)

All five screens live in `index.html` as `<section>` elements; JavaScript shows one at a time by toggling the `hidden` attribute.

| # | Screen | Audience | What happens |
|---|--------|----------|--------------|
| 1 | **Welcome** | Parent | Explains the quiz (5–10 min), states the philosophy ("levels are not grades"), tells them to grab pencil and scratch paper, and asks one question: the child's age (dropdown, "4 or younger" → "14 or older"). Age only picks the *starting rung* — it never affects the result. |
| 2 | **Hand-off** | Parent | "Now hand the device to your child." For ages that start at checkpoint K, the copy changes: the parent stays and works *with* the child, since pre-readers can't take a quiz alone. |
| 3 | **Quiz** | Child | One problem per card: big type, a progress-dot trail, and an "I don't know yet" button so guessing is never required. Wrong answers are **never announced** — the quiz just moves on. No timer, no score, no red X's. |
| 4 | **Interstitial** | Child | Between checkpoint sets: "Nice work! Let's try a few more." The child never knows whether they passed or failed a set. |
| 5 | **Results** | Parent | The recommendation in the chart's own words ("Begin using Level 4."), the skill breakdown (✓ demonstrated / ○ what the level will teach), the program's auto-advance philosophy quote, a button to the level's product page on cornerstonecurriculum.com, and Start Over for a second child. |

---

## 3. The placement ladder

The Levels Chart is encoded as **eight checkpoints** in `js/data.js`. Each checkpoint has the chart row's skill lines (verbatim wording) and 4–6 problems, with every skill covered by at least one problem — 42 problems total.

| Checkpoint | Skills tested | Problems | First one failed → |
|------------|---------------|----------|--------------------|
| K | Reads / writes the numbers 0–20 | 4 (parent-assisted) | **Level K** |
| 1 | Word problems 0–20; +/− facts to 20 | 5 | **Level 1** |
| 2 | Borrowing & carrying, 0–99 | 5 | **Level 2** |
| 3 | 0–999; ×/÷ facts; writing fractions | 5 | **Level 3** |
| 4 | 0–999,999; multi-digit ×; fraction comparisons (=, ≠, <, >) | 5 | **Level 4** |
| 5 | Trillions; big ×; 5-digit ÷; fraction operations | 6 | **Level 5** |
| 6 | Decimals; long division; ratio / proportion / percent | 6 | **Level 6** |
| 7 | Pre-algebra; y + 4 = 9; 3x + 2 = 11; systems; quadratics | 6 | **Algebra I** |
| — | Passes all of checkpoint 7 | — | **Geometry/Algebra II (pending) → Calculus Made Clear** |

Checkpoint K is special (`parentAssisted: true`): its problems are either "point to the number" taps for the child or "ask your child to write 17 — did they?" yes/no questions for the parent.

---

## 4. The adaptive engine (`js/engine.js`)

Pure functions, no DOM access — which is why the whole decision system is unit-testable.

### Seeding — where the quiz starts

```
seed = clamp(age − 6, 0, 6)
```

A 9-year-old starts at checkpoint 3, an 11-year-old at checkpoint 5. This is deliberately **one rung below** the age-expected level so the first set is a likely pass and the child starts with a win. The seed is capped at 6, so checkpoint 7 (algebra) is always *earned* by passing 6 first. An invalid age falls back to checkpoint 2.

### The pass rule

A checkpoint set is **passed if the child misses at most one problem** (≈80%+). "I don't know yet" counts as a miss — silently.

### The walk

- **Pass a set** → step **up** one rung and test again. Pass checkpoint 7 → the beyond-algebra outcome.
- **Fail a set** → step **down** one rung. Fail checkpoint K → Level K.
- The quiz ends the moment the boundary is known:
  - Walking **up** and hit a failure → *that* rung is the recommendation.
  - Walking **down** and finally pass → the rung **above** (the lowest failure) is the recommendation.

The walk is monotonic — after the first result it only ever moves in one direction — so it always terminates, in 2–3 checkpoints for a well-seeded child (8–15 problems). This mirrors the chart's own assumption: if you can't do checkpoint 4's skills, you can't do checkpoint 6's either.

The unit tests include a proof of the key property: **for every possible skill boundary, the final recommendation is identical whether the child entered at age 5, 9, or 14.** Age changes how long the quiz takes, never where it lands.

### Grading (`gradeAnswer`)

| Problem type | How it's graded |
|---|---|
| `numeric` | Commas and whitespace stripped, then compared as numbers — so `7,344`, `7344`, and ` 7344 ` are all correct. Decimals and negatives supported. |
| `choice` | Exact match against the stored answer string. Used for anything notation-heavy: fractions, comparison symbols, factored quadratics. |
| `parent-check` | Parent taps "Yes, they could" / "Not yet"; only "yes" is correct. |

Empty input can't be submitted (the Next button stays disabled until the input matches a number pattern), and `null` — the "I don't know yet" path — always grades false.

### Skill breakdown (`skillBreakdown`)

For the results page:
- Every skill line from every **passed** checkpoint → **"Your child demonstrated."**
- Within the failed (recommended) checkpoint, a skill whose problems were *all* answered correctly still counts as demonstrated — partial credit at skill granularity.
- The remaining skill lines of the failed checkpoint → **"Level N will teach."**

So a child who aced the fraction-comparison problems but missed multiplication sees exactly that distinction on the results page.

---

## 5. The data model (`js/data.js`)

Everything a curriculum author might edit lives in this one file:

```js
// One of the 8 checkpoints
{
  id: "4",
  outcome: "L4",              // outcome key if this is the first failed rung
  parentAssisted: false,
  skills: [                   // verbatim chart wording — shown on results page
    { id: "4-mult", text: "Multiplies 1- and 2-digit numbers times 2- and 3-digit numbers" },
    // ...
  ],
  problems: [
    { id: "4-2", skill: "4-mult", type: "numeric", prompt: "34 × 216 =", answer: "7344" },
    { id: "4-4", skill: "4-frac", type: "choice",
      prompt: "Choose the correct symbol:  2/3 ▢ 3/4",
      choices: ["<", ">", "=", "≠"], answer: "<" },
    // ...
  ],
}
```

```js
// One of the 9 outcomes
L4: {
  name: "Level 4",
  action: "Begin using Level 4.",          // the results headline
  url: "https://www.cornerstonecurriculum.com/product-page/making-math-meaningful-level-4",
}
```

A validation test suite (`tests/data.test.js`) guards edits: exactly 8 checkpoints in K–7 order, 4–6 problems each, every skill covered, every choice answer present among its choices, every numeric answer parseable, every outcome linked to a cornerstonecurriculum.com product page. Break any rule while editing and `npm test` says exactly what's wrong.

---

## 6. The app layer (`js/app.js`)

The only file that touches the DOM. Responsibilities:

- **Screen switching** — one function toggles `hidden` across the five sections and moves keyboard focus to the new screen's heading or problem (screen-reader and keyboard friendly).
- **Problem rendering** — builds the numeric input form or choice buttons for the current problem, shows the parent note ("Read this question aloud…") when present, renders the progress dots, and hides the "I don't know yet" button on parent-check items (a parent shouldn't see a child-voiced escape hatch).
- **Input validation** — the Next button is disabled until the text matches `^-?[\d,]*\.?\d+$`, so empty or garbage input can't be submitted and the child never sees an error message.
- **Flow control** — collects the set's graded booleans, hands them to the engine, and routes to the interstitial (quiz continues) or the results screen (outcome reached).
- **Results rendering** — headline, blurb, the two skill lists, the product link, and a friendly fallback line when a beginner demonstrates no skills yet ("Your child is just beginning — and every mathematician starts here.").

### State & persistence

Two variables hold all state: `quiz` (the engine's state: current rung, direction, tested results, outcome) and `run` (progress within the current set). Both are saved to **`sessionStorage`** after every answer, so an accidental refresh resumes exactly where the child left off — same problem, same progress dots. The results screen also survives refresh. "Start over" clears storage. `sessionStorage` is per-tab and expires when the tab closes: nothing is ever sent anywhere, and nothing lingers.

---

## 7. Design system (`css/styles.css`)

Built to sit comfortably next to cornerstonecurriculum.com:

- **Palette (CSS custom properties):** cream page (`#f5efe6`), warmer paper cards (`#fdfaf4`), deep maroon for headings and actions (`#8b1a1a`), warm gray ink. No green/red correctness colors exist anywhere — by design, since the quiz never signals right/wrong.
- **Typography:** EB Garamond (Google Fonts, `display=swap`) for headings, Georgia for body — a bookish, classic pairing matching the site. Problem text uses a fluid size, `clamp(1.5rem → 2.4rem)`, so it's large for young eyes on any device.
- **Layout:** one centered 680px column; cards with soft borders and gentle shadows; verified overflow-free from 320px (small phones) to 1440px.
- **Motion:** a single fade-and-rise transition between screens using only compositor-friendly properties (`opacity`, `transform`), fully disabled under `prefers-reduced-motion`.
- **Accessibility:** semantic sections with ARIA labels, labeled inputs, visible focus outlines, focus moved to each new problem, `aria-live` on the problem prompt, fully keyboard-operable.

---

## 8. File map

```
/
├── index.html            98 lines — all five screens, semantic markup
├── css/styles.css       188 lines — tokens + everything visual
├── js/data.js           395 lines — the Levels Chart as data (EDIT THIS ONE)
├── js/engine.js         105 lines — placement logic, pure functions
├── js/app.js            260 lines — DOM, screen flow, persistence
├── tests/data.test.js    — 6 validation tests guarding the problem bank
├── tests/engine.test.js  — 15 tests: seeding, grading, pass rule, walk, breakdown
├── package.json          — test runner only ({"type":"module"}, npm test)
├── README.md             — run / deploy / edit instructions
└── docs/                 — design spec, implementation plan, this document
```

Dependency direction is strictly one-way: `app.js → engine.js → data.js`. The engine never touches the DOM; the data file contains no logic.

---

## 9. Testing

Run with `npm test` (Node 18+; uses Node's built-in test runner — zero dependencies). **21 tests, all passing.**

- **Data validation (6 tests):** structure, coverage, and answer-key sanity for all 42 problems and 9 outcomes.
- **Engine (15 tests):** the age→seed table; comma/decimal/negative grading; pass-rule boundaries; explicit up-walk, down-walk, floor (Level K) and ceiling (beyond-7) scenarios; the seed-independence property across all 9 outcomes; and skill-breakdown partial credit, including the all-failed and all-passed edges.

Manual verification performed on the built site: responsive 320–1440 with no overflow, keyboard-only completion, reduced-motion behavior, comma-formatted answers, refresh-resume mid-quiz, and three full scripted journeys (advanced student → Calculus note; selective misses → Level 4 with correct skill split; young beginner → Level K).

---

## 10. Hosting & updating

- **Hosting:** GitHub Pages, serving the `main` branch root of `lordbyronq/math-placement-quiz`. Free, HTTPS, no server to maintain.
- **Updating:** commit to `main`, push, and the site redeploys automatically in about a minute.
- **Editing problems:** change wording/answers/links in `js/data.js`, run `npm test`, push. Nothing else needs touching.
- **Custom domain later:** GitHub Pages supports e.g. `quiz.cornerstonecurriculum.com` with one CNAME DNS record plus one setting in the repo.
- Because all asset paths are relative, the same files also work embedded anywhere else — another host, a subfolder, or an iframe on the main site.

---

## 11. Deliberate design decisions

| Decision | Why |
|---|---|
| Child works real problems (not parent estimates) | Placement reflects demonstrated ability, not recollection. |
| Seed one rung *below* age expectation | First set is a likely pass — the child starts with confidence. |
| No right/wrong feedback during the quiz | A placement test shouldn't feel like failing; misses are silent, including "I don't know yet." |
| "I don't know yet" button | Prevents forced guessing from inflating placement — a lucky guess can move a child up a whole level. |
| Pass = at most one miss | One slip (typo, misread) shouldn't sink a set a child genuinely owns. |
| Vanilla JS, no framework, no build | Anyone can edit it in a text editor for the next decade; nothing to update or break. |
| All editable content in one data file, guarded by tests | The curriculum author can tweak problems safely without knowing the code. |
| sessionStorage only, no analytics, no accounts | Zero privacy concerns for families; nothing leaves the browser. |

## 12. Current limitations (v1 scope)

- One fixed problem per slot — siblings taking it back-to-back see the same problems (variant pools are the natural v2 feature).
- No email capture, printing, or analytics (excluded by design; can be added later).
- The "Geometry/Algebra II" outcome links to the Calculus Made Clear product page, since the chart marks Geometry/Algebra II as availability-pending.
