# Problem Bank Rework — 60% Word / 40% Computation Design

**Date:** 2026-07-03
**Status:** Approved by user
**Supersedes:** the problem-bank portion of `2026-07-02-math-placement-quiz-design.md` (engine, screens, and hosting unchanged).

## Goal

Rework the fixed problem bank in `js/data.js` so that each scored checkpoint is weighted **60% word problems / 40% computation**, and so computation problems use a mix of **direct** (`52 − 27 =`) and **missing-value / open-sentence** (`25 = 15 + ___`, `15 × ___ = 60`, `300 − ___ = 120`) formats. Keep one fixed problem per slot (no randomized pools).

## Ratio rules

- **Classification.** Every problem in checkpoints 1–7 is tagged `format: "word" | "computation"`.
  - **word** — the prompt is set in a real-world context (a story, money, a recipe, sharing).
  - **computation** — bare arithmetic or notation, including missing-value open sentences.
- **Checkpoint K is exempt.** Its four problems are parent-assisted readiness checks (read a number, write a number), which are neither word nor computation. K problems carry no `format` tag and are excluded from the ratio.
- **Per-checkpoint targets:**
  - Checkpoints **1–6:** exactly **5 problems = 3 word / 2 computation** (clean 60/40).
  - Checkpoint **7:** **6 problems = 4 word / 2 computation** (67/33). Six mandatory skills (pre-algebra, simple equations, linear, systems, quadratics, factoring) each require a problem, so a 5-problem set is impossible; 4/2 is the nearest achievable split that still leans toward word problems. (A strict 60/40 would require a 10-problem set, rejected as too long for the final round.)
- **Aggregate:** ~36 scored problems across checkpoints 1–7 ≈ 22 word / 14 computation ≈ **61% word / 39% computation**.

## Computation-format rule

Each checkpoint's **2 computation problems** are one **direct** and one **missing-value** problem:

- **Direct:** operator-and-equals with the result blank conceptually filled by the child, e.g. `52 − 27 =`.
- **Missing-value / open sentence:** the unknown is a term, shown as a run of underscores, e.g. `25 = 15 + ______`, `15 × ______ = 60`, `300 − ______ = 120`. The child types the missing number; the stored `answer` is that number (e.g. `180` for `300 − ______ = 120`).

Missing-value forms are matched to each level:
- Checkpoints 1–2: missing addend / minuend within the level's number range.
- Checkpoint 3: missing factor (multiplication/division facts) or missing term ≤ 999.
- Checkpoints 4–6: missing value in larger numbers and decimals.
- Checkpoint 7: already this format natively (`y + 4 = 9`, `3x + 2 = 11`).

**Rendering guardrail:** blanks are a single continuous underscore run (`______`, 6 underscores) so they read consistently. A missing-value problem is still `type: "numeric"` — no new problem type, no engine change.

## Data model change (`js/data.js`)

Add one field to every checkpoint 1–7 problem:

```js
{ id: "2-2", skill: "2-ops", type: "numeric", format: "computation",
  prompt: "52 − 27 =", answer: "25" },
{ id: "2-3", skill: "2-ops", type: "numeric", format: "computation",
  prompt: "300 − ______ = 120", answer: "180" },
{ id: "2-1", skill: "2-ops", type: "numeric", format: "word",
  prompt: "A farmer collects 47 eggs on Monday and 36 on Tuesday. How many eggs in all?",
  answer: "83" },
```

- `format` is present on all checkpoint 1–7 problems, absent on checkpoint K problems.
- `type` is unchanged (`numeric`, `choice`, `parent-check`). Missing-value problems are `numeric`.
- Skill ids, outcome keys, and product links are unchanged.

## Per-checkpoint plan (skill coverage + ratio)

Every chart skill keeps ≥1 problem. "MV" = missing-value computation.

| CP | word (3, or 4 for CP7) | computation (2) | skills covered |
|----|------------------------|-----------------|----------------|
| 1 | apples-left story · marbles story · sharing story | `9 + 6 =` · `20 = 12 + __` (MV) | 1-word (×3 word), 1-facts (×2 comp) |
| 2 | eggs story · money story · distance story | `52 − 27 =` · `300 − __ = 120`… scaled to 0–99: `80 − __ = 53` (MV) | 2-ops (all 5) |
| 3 | borrowing story · ×/÷ facts story ("7 baskets of 8 apples") · pizza fraction (choice, word) | `304 − 178 =` · `15 × __ = 60` (MV) | 3-ops, 3-facts, 3-frac |
| 4 | 6-digit story · multi-digit × story · fraction-comparison in context (choice, word) | `412,305 − 178,426 =` · `34 × __ = 7,344`→ scaled: `__ × 216 = 7,344` (MV) | 4-ops, 4-mult, 4-frac |
| 5 | trillions story (5-big) · 5-digit ÷ story (5-div) · fraction-operation story (5-frac) | `245 × 1,338 =` direct · `______ × 1,338 = 327,810` MV (answer 245) — both 5-mult | 5-big, 5-div, 5-frac (word); 5-mult (×2 comp) |
| 6 | decimal story · 6-digit ÷ story · ratio/percent story | `4.6 × 2.3 =` · `7.2 − ______ = 3.35` (MV) | 6-word, 6-div, 6-ops, 6-ratio |
| 7 | "five more than a number" (choice, word) · system story · quadratic story · factoring in context (choice, word) | `y + 4 = 9` (MV-native) · `3x + 2 = 11` (MV-native) | 7-pre, 7-simple, 7-linear, 7-system, 7-quad, 7-factor |

Note: where a checkpoint's computation slot needs a fraction or decimal, the missing-value form is only used when the missing term is a clean typeable number; otherwise that slot uses a direct problem and the missing-value form goes to a slot with a clean integer/decimal answer. Every checkpoint 1–7 still has exactly one missing-value computation problem.

## Validation test additions (`tests/data.test.js`)

New assertions (existing tests unchanged):

1. **Format tag presence:** every checkpoint 1–7 problem has `format` ∈ {`word`, `computation`}; every checkpoint K problem has no `format`.
2. **Per-checkpoint ratio:** checkpoints 1–6 have exactly 3 `word` and 2 `computation`; checkpoint 7 has exactly 4 `word` and 2 `computation`.
3. **Missing-value integrity:** every checkpoint 1–7 has ≥1 computation problem whose prompt contains an underscore run; each such problem is `type: "numeric"` with a finite numeric `answer`.
4. Existing rules still hold: 8 checkpoints K–7; 4–6 problems each; every skill covered; choice answers among choices; every outcome linked.

## Out of scope

- No engine changes (`js/engine.js` untouched; pass rule "≤1 miss" scales to any set size).
- No screen/CSS changes (`index.html`, `css/styles.css` untouched — underscores render fine in the existing prompt element).
- No randomized variant pools (fixed problems only).
- No change to seeding, outcomes, product links, or the skill-breakdown logic.

## Testing

- `npm test` green: existing 21 tests + new ratio/format/missing-value assertions.
- Browser re-verification (content changed): one full correct run (advanced → beyond-algebra) and one partial run (→ a mid-level with correct skill breakdown), plus a spot check that a missing-value prompt renders its blank and grades the typed answer correctly.
- Update `docs/site-breakdown.md` / `.html` to describe the 60/40 mix and the open-sentence computation style.
