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

// --- persistence
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

// --- boot
showScreen("welcome");
