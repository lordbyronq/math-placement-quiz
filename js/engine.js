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
    // Only the recommended (lowest failed) rung's skills are broken out;
    // a failed rung above it was superseded by the lower failure.
    if (idx !== state.recommendedIndex) continue;

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
