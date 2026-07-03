# Making Math Meaningful — Placement Quiz Design

**Date:** 2026-07-02
**Status:** Approved by user (sections 1–5 + product links on results)

## Goal

A single web page that automatically places a child into the correct *Making Math Meaningful* level (Cornerstone Curriculum). It replaces manual use of the paper "Levels Chart" with an adaptive quiz: the child works real, auto-graded problems, and the page recommends the exact level the chart would — the first level whose skills the child cannot yet do.

Hosting is undecided; the deliverable is a self-contained static page that works anywhere (no backend, no build step). Style must fit the existing cornerstonecurriculum.com look (cream, deep maroon, classic serif).

## Source of truth: the Levels Chart

The engine encodes the chart row-for-row. Skill lines are quoted in the parent's language on the results page.

| Checkpoint | Skill lines (verbatim from chart) | First failed → recommendation |
|---|---|---|
| K | Reads and writes the numbers 0–20 | **Level K** |
| 1 | Solves word problems using the numbers 0–20 · Knows the basic addition and subtraction facts 0–20 | **Level 1** |
| 2 | Solves word problems and computational problems involving borrowing and carrying using the numbers 0–99 | **Level 2** |
| 3 | Borrowing and carrying using the numbers 0–999 · Knows the basic multiplication and division facts · Writes the symbolic representations for common fractions | **Level 3** |
| 4 | Borrowing and carrying using the numbers 0–999,999 · Multiplies 1- and 2-digit numbers times 2- and 3-digit numbers · Writes equal, not equal, less than, and greater than equations for fractions | **Level 4** |
| 5 | Borrowing and carrying using numbers in the trillions · Multiplies 2- and 3-digit numbers times 3- and 4-digit numbers · Divides a 5-digit number by a 1-digit number · Adds, subtracts, multiplies, and divides common fractions | **Level 5** |
| 6 | Word/computational problems involving decimals · Divides a 6-digit number by a 2- or 3-digit number · Adds, subtracts, multiplies, and divides using decimals · Finds ratio, proportions, and percentages | **Level 6** |
| 7 | Knows pre-algebraic concepts · Solves simple algebraic equations (y + 4 = 9) · Solves linear algebraic equations (3x + 2 = y) · Solves systems of 2 equations with 2 unknowns · Solves quadratic equations · Factors quadratic equations | **Principles from Patterns: Algebra I** |
| — | Passes all of checkpoint 7 | **Geometry/Algebra II (availability pending), followed by Calculus Made Clear** |

Product links for the results page (cornerstonecurriculum.com/product-page/…):
`level-k-making-math-meaningful`, `level-1-making-math-meaningful`, `level-2-making-math-meaningful`, `level-3-making-math-meaningful`, `making-math-meaningful-level-4`, `making-math-meaningful-level-5`, `making-math-meaningful-level-6`, `principles-from-patterns-algebra-i`, `calculus-made-clear`.

## User flow (four screens)

1. **Welcome (parent).** What the quiz does ("find the perfect starting level, about 5–10 minutes"), the program's philosophy (levels are not grades; children auto-advance when ready; adapt recommendations to your family), a note to have pencil and scratch paper ready, and one required input: **child's age** (dropdown, "4 or younger" through "14 or older"). Age only seeds the starting rung; it never affects the result. Microcopy: "Not sure? Pick your best guess — the quiz adapts."
2. **Hand-off.** "Now hand the device to your child." For young children, instructs the parent to sit alongside and read problems aloud. Checkpoint K items are explicitly parent-assisted.
3. **Quiz.** One problem per card: large type, progress dot trail, an "I don't know yet" button (counts as a miss, silently), neutral-to-encouraging transitions between sets. No red X's, no visible scoring, no timer. Wrong answers are never announced.
4. **Results (parent).** See "Results page" below.

## Placement engine

**Checkpoints.** Eight (K–7), each a set of 4–6 auto-graded problems in which every skill line of that chart row is represented by at least one problem.

**Seeding.** Expected checkpoint by age ≈ (age − 5); seed one rung below it so the first set is a likely pass and builds confidence. Formula: seed = clamp(age − 6, K, 6). Mapping: age ≤5 → K, 6 → K, 7 → 1, 8 → 2, 9 → 3, 10 → 4, 11 → 5, 12+ → 6. (Max seed is 6, so checkpoint 7 is always reached by passing 6 rather than seeded directly.)

**Pass rule.** A checkpoint is passed when the child misses **at most one** problem in the set (≈80%+). "I don't know yet" is a miss.

**Adaptive walk.** Run the seed checkpoint.
- First result **pass** → keep stepping up one rung at a time until the first fail (that rung is the recommendation) or checkpoint 7 passes (→ Geometry/Algebra II outcome).
- First result **fail** → keep stepping down until the first pass (the rung above it — the lowest failed — is the recommendation) or checkpoint K fails (→ Level K).

The walk is monotonic, so it always terminates; it mirrors the chart's assumption that failing a rung implies failing every rung above it. Typical run: 2–3 checkpoints, 8–15 problems.

**State.** Quiz state (answers, current rung, direction) persists in `sessionStorage` so an accidental refresh doesn't lose progress. "Start over" clears it.

## Problem bank

One fixed problem per slot (variant pools are a possible future enhancement, out of scope for v1). Written in the curriculum's conceptual style — word problems and real contexts wherever the chart says "word problems," not bare drill. Representative content:

- **K (parent-assisted):** "Point to the number fourteen" (child taps from displayed numbers); "Ask your child to write the number 17 on paper — did they write it correctly?" (parent taps Yes/No).
- **1:** "Maria has 8 apples. She gives 3 to her brother. How many are left?"; facts like 9 + 6, 14 − 8.
- **2:** 52 − 27, 38 + 45, one borrowing/carrying word problem.
- **3:** 7 × 8, 42 ÷ 6, 304 − 178, "Which fraction shows three out of four equal parts?" (multiple choice).
- **4:** 34 × 216, 6-digit place value, "Choose the correct symbol: 2/3 ▢ 3/4" (=, ≠, <, >).
- **5:** 23,514 ÷ 7, 3/4 + 2/3, 245 × 1,338, 2/3 × 3/5.
- **6:** 4.6 × 2.3, 132,486 ÷ 27, "What is 35% of 80?", a ratio word problem.
- **7:** y + 4 = 9, 3x + 2 = 11, system {2x + y = 9, x + y = 10}, factor x² + 5x + 6 (multiple choice), one quadratic to solve.

**Input types.** Numeric entry for computation (validated: digits only, no empty submits); multiple choice (4 options) for anything notation-heavy (fractions, comparison symbols, factoring). Each problem records the skill line it tests.

## Results page

- **Recommendation** front and center, in the chart's own words: e.g., *"Begin using Level 4."* For the top outcome, the chart's exact wording: *"Begin Geometry/Algebra II (availability pending), followed by Calculus Made Clear."*
- **Skill breakdown**, two groups, positively framed:
  - ✓ **"Your child demonstrated"** — skill lines from passed checkpoints, plus skill lines in the failed checkpoint whose problems were *all* answered correctly.
  - ○ **"Level N will teach"** — the remaining skill lines of the recommended level.
- **Philosophy note** quoted from the chart: auto-advance when ready; age recommendations adapt to your family.
- **Product link** — one clear link/button to the recommended level's page on cornerstonecurriculum.com (links table above).
- **Start over** button (for a second child) — clears state, returns to Welcome.

## Look & feel

Start from the site's existing character and refine:

- **Palette (CSS custom properties):** cream background (≈ oklch(96% 0.01 85) / #F2EDE4 family), deep maroon accents/headings (≈ #8B1A1A family), warm gray text; color used semantically (maroon = headings/actions, green never used for "correct" mid-quiz since correctness is hidden).
- **Typography:** two families max — a classic display serif for headings (EB Garamond or similar, matching the site's feel) and a highly readable face for problems/UI with large sizes on problem cards (fluid `clamp()` scale). `font-display: swap`; preload only the critical weight.
- **Layout:** single centered column; large problem cards with generous spacing; subtle progress dot trail; parent-facing screens carry slightly more classic/bookish treatment, child-facing cards are cleaner and bigger.
- **Motion:** gentle fades/transforms between cards only (compositor-friendly properties), fully disabled under `prefers-reduced-motion`.
- **Responsive:** works from 320 px up; touch-friendly targets; many parents will run this on a phone.
- **Accessibility:** semantic HTML, labeled inputs, focus moved to each new problem, keyboard operable, WCAG AA contrast.

## Architecture

Static site, no framework, no build step, no backend:

```
/                        (repo root = deployable root)
├── index.html           # all four screens (shown/hidden), semantic markup
├── css/styles.css       # tokens + styles
├── js/data.js           # chart data: checkpoints, skill lines, problems, product links
├── js/engine.js         # pure placement logic (seed, grade, walk, result) — no DOM
├── js/app.js            # screen flow, rendering, input handling, sessionStorage
└── tests/engine.test.js # node:test suite for the engine + data validation
```

Separating `data.js` lets the curriculum author tweak problems and skill wording without touching logic. `engine.js` is pure functions, so it is directly unit-testable.

## Error handling & edge cases

- Empty/invalid numeric input: submit disabled until valid; no error flashes at the child.
- Accidental refresh: state restored from `sessionStorage`.
- "I don't know yet": silent miss; prevents forced guessing from inflating placement.
- Fail at K / pass at 7: explicit terminal outcomes (see chart table).
- Answers accepted with reasonable formats (e.g., commas in large numbers stripped before grading).
- No network dependencies at quiz time beyond fonts (with system-font fallbacks), so the page degrades gracefully offline once loaded.

## Testing

- **Engine (node:test, pure functions):** seeding for every age; pass rule boundaries (0 and 1 misses pass-side, 2 misses fail-side); full walk scenarios producing each of the 9 outcomes (Levels K–6, Algebra I, beyond-7); walk from every seed with pass-all and fail-all sequences; state serialization round-trip.
- **Data validation test:** every chart skill line has ≥1 problem; every problem has a valid answer key and skill reference; every level has a product link.
- **Manual/visual pass:** phone (320/375), tablet, desktop; reduced-motion; keyboard-only run-through.

## Out of scope (v1)

- Email capture / mailing list, printing/PDF export, analytics, problem variant pools, multiple-child profiles, server-side anything.
