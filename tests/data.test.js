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
