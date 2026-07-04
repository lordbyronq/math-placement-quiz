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

// --- 60/40 word-vs-computation ratio (checkpoint K exempt) ---

const scored = () => CHECKPOINTS.filter((c) => c.id !== "K");

test("checkpoints 1-7 tag every problem word|computation; K tags none", () => {
  for (const cp of CHECKPOINTS) {
    for (const p of cp.problems) {
      if (cp.id === "K") {
        assert.equal(p.format, undefined, `K problem ${p.id} should have no format`);
      } else {
        assert.ok(
          p.format === "word" || p.format === "computation",
          `problem ${p.id} has bad format ${p.format}`
        );
      }
    }
  }
});

test("each scored checkpoint hits its 60/40 target", () => {
  for (const cp of scored()) {
    const word = cp.problems.filter((p) => p.format === "word").length;
    const comp = cp.problems.filter((p) => p.format === "computation").length;
    const expected = cp.id === "7" ? { word: 4, comp: 2 } : { word: 3, comp: 2 };
    assert.deepEqual(
      { word, comp },
      expected,
      `checkpoint ${cp.id} mix is ${word} word / ${comp} computation`
    );
  }
});

test("checkpoints 1-6 each include an open-sentence (blank) computation problem", () => {
  const blank = /_{2,}/;
  for (const cp of scored()) {
    if (cp.id === "7") continue; // CP7 uses variable-letter algebra instead of blanks
    const openSentences = cp.problems.filter(
      (p) => p.format === "computation" && blank.test(p.prompt)
    );
    assert.ok(
      openSentences.length >= 1,
      `checkpoint ${cp.id} has no open-sentence computation problem`
    );
    for (const p of openSentences) {
      assert.equal(p.type, "numeric", `open sentence ${p.id} must be numeric`);
      assert.ok(
        Number.isFinite(Number(String(p.answer).replace(/,/g, ""))),
        `open sentence ${p.id} answer not numeric`
      );
    }
  }
});
