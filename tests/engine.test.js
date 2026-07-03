import test from "node:test";
import assert from "node:assert/strict";
import {
  seedForAge,
  normalizeNumeric,
  gradeAnswer,
  isCheckpointPassed,
  createQuizState,
  recordCheckpointResult,
} from "../js/engine.js";
import { CHECKPOINTS } from "../js/data.js";

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
