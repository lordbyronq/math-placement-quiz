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
