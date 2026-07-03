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
