// Chart data for the Making Math Meaningful placement quiz.
// Source of truth: the Levels Chart (see design spec). Skill text is quoted
// on the results page in the parent's language — keep it in chart wording.

export const OUTCOMES = {
  K: {
    name: "Level K",
    action: "Begin using Level K.",
    url: "https://www.cornerstonecurriculum.com/product-page/level-k-making-math-meaningful",
  },
  L1: {
    name: "Level 1",
    action: "Begin using Level 1.",
    url: "https://www.cornerstonecurriculum.com/product-page/level-1-making-math-meaningful",
  },
  L2: {
    name: "Level 2",
    action: "Begin using Level 2.",
    url: "https://www.cornerstonecurriculum.com/product-page/level-2-making-math-meaningful",
  },
  L3: {
    name: "Level 3",
    action: "Begin using Level 3.",
    url: "https://www.cornerstonecurriculum.com/product-page/level-3-making-math-meaningful",
  },
  L4: {
    name: "Level 4",
    action: "Begin using Level 4.",
    url: "https://www.cornerstonecurriculum.com/product-page/making-math-meaningful-level-4",
  },
  L5: {
    name: "Level 5",
    action: "Begin using Level 5.",
    url: "https://www.cornerstonecurriculum.com/product-page/making-math-meaningful-level-5",
  },
  L6: {
    name: "Level 6",
    action: "Begin using Level 6.",
    url: "https://www.cornerstonecurriculum.com/product-page/making-math-meaningful-level-6",
  },
  ALGEBRA: {
    name: "Principles from Patterns: Algebra I",
    action: "Begin using Principles from Patterns: Algebra I.",
    url: "https://www.cornerstonecurriculum.com/product-page/principles-from-patterns-algebra-i",
  },
  BEYOND: {
    name: "Geometry/Algebra II, then Calculus Made Clear",
    action:
      "Begin Geometry/Algebra II (availability pending), followed by Calculus Made Clear.",
    url: "https://www.cornerstonecurriculum.com/product-page/calculus-made-clear",
  },
};

const READ_ALOUD = "Read this question aloud to your child.";

export const CHECKPOINTS = [
  {
    id: "K",
    outcome: "K",
    parentAssisted: true,
    skills: [
      { id: "K-read", text: "Reads the numbers 0–20" },
      { id: "K-write", text: "Writes the numbers 0–20" },
    ],
    problems: [
      {
        id: "K-1",
        skill: "K-read",
        type: "choice",
        parentNote: READ_ALOUD,
        prompt: "Point to the number fourteen.",
        choices: ["4", "14", "40", "41"],
        answer: "14",
      },
      {
        id: "K-2",
        skill: "K-read",
        type: "choice",
        parentNote: READ_ALOUD,
        prompt: "Point to the number eight.",
        choices: ["3", "8", "6", "9"],
        answer: "8",
      },
      {
        id: "K-3",
        skill: "K-write",
        type: "parent-check",
        prompt:
          "Ask your child to write the number 17 on scratch paper. Did they write it correctly?",
        answer: "yes",
      },
      {
        id: "K-4",
        skill: "K-write",
        type: "parent-check",
        prompt:
          "Ask your child to write the number 6 on scratch paper. Did they write it correctly?",
        answer: "yes",
      },
    ],
  },
  {
    id: "1",
    outcome: "L1",
    parentAssisted: false,
    skills: [
      { id: "1-word", text: "Solves word problems using the numbers 0–20" },
      { id: "1-facts", text: "Knows the basic addition and subtraction facts 0–20" },
    ],
    problems: [
      {
        id: "1-1",
        skill: "1-word",
        type: "numeric",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "Maria has 8 apples. She gives 3 to her brother. How many apples does Maria have left?",
        answer: "5",
      },
      {
        id: "1-2",
        skill: "1-word",
        type: "numeric",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "Sam has 6 marbles. His friend gives him 7 more. How many marbles does Sam have now?",
        answer: "13",
      },
      { id: "1-3", skill: "1-facts", type: "numeric", prompt: "9 + 6 =", answer: "15" },
      { id: "1-4", skill: "1-facts", type: "numeric", prompt: "14 − 8 =", answer: "6" },
      { id: "1-5", skill: "1-facts", type: "numeric", prompt: "7 + 8 =", answer: "15" },
    ],
  },
  {
    id: "2",
    outcome: "L2",
    parentAssisted: false,
    skills: [
      {
        id: "2-ops",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using the numbers 0–99",
      },
    ],
    problems: [
      { id: "2-1", skill: "2-ops", type: "numeric", prompt: "38 + 45 =", answer: "83" },
      { id: "2-2", skill: "2-ops", type: "numeric", prompt: "52 − 27 =", answer: "25" },
      { id: "2-3", skill: "2-ops", type: "numeric", prompt: "64 + 29 =", answer: "93" },
      { id: "2-4", skill: "2-ops", type: "numeric", prompt: "81 − 46 =", answer: "35" },
      {
        id: "2-5",
        skill: "2-ops",
        type: "numeric",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "A farmer collects 47 eggs on Monday and 36 eggs on Tuesday. How many eggs does the farmer collect in all?",
        answer: "83",
      },
    ],
  },
  {
    id: "3",
    outcome: "L3",
    parentAssisted: false,
    skills: [
      {
        id: "3-ops",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using the numbers 0–999",
      },
      { id: "3-facts", text: "Knows the basic multiplication and division facts" },
      { id: "3-frac", text: "Writes the symbolic representations for common fractions" },
    ],
    problems: [
      { id: "3-1", skill: "3-ops", type: "numeric", prompt: "304 − 178 =", answer: "126" },
      { id: "3-2", skill: "3-ops", type: "numeric", prompt: "457 + 286 =", answer: "743" },
      { id: "3-3", skill: "3-facts", type: "numeric", prompt: "7 × 8 =", answer: "56" },
      { id: "3-4", skill: "3-facts", type: "numeric", prompt: "42 ÷ 6 =", answer: "7" },
      {
        id: "3-5",
        skill: "3-frac",
        type: "choice",
        prompt:
          "A pizza is cut into 4 equal pieces. You eat 3 of them. Which fraction shows how much of the pizza you ate?",
        choices: ["3/4", "4/3", "1/3", "1/4"],
        answer: "3/4",
      },
    ],
  },
  {
    id: "4",
    outcome: "L4",
    parentAssisted: false,
    skills: [
      {
        id: "4-ops",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using the numbers 0–999,999",
      },
      { id: "4-mult", text: "Multiplies 1- and 2-digit numbers times 2- and 3-digit numbers" },
      {
        id: "4-frac",
        text:
          "Writes equal, not equal, less than, and greater than equations for fractions",
      },
    ],
    problems: [
      {
        id: "4-1",
        skill: "4-ops",
        type: "numeric",
        prompt: "412,305 − 178,426 =",
        answer: "233879",
      },
      { id: "4-2", skill: "4-mult", type: "numeric", prompt: "34 × 216 =", answer: "7344" },
      { id: "4-3", skill: "4-mult", type: "numeric", prompt: "6 × 138 =", answer: "828" },
      {
        id: "4-4",
        skill: "4-frac",
        type: "choice",
        prompt: "Choose the correct symbol:  2/3 ▢ 3/4",
        choices: ["<", ">", "=", "≠"],
        answer: "<",
      },
      {
        id: "4-5",
        skill: "4-frac",
        type: "choice",
        prompt: "Choose the correct symbol:  2/4 ▢ 1/2",
        choices: ["<", ">", "=", "≠"],
        answer: "=",
      },
    ],
  },
  {
    id: "5",
    outcome: "L5",
    parentAssisted: false,
    skills: [
      {
        id: "5-big",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using numbers in the trillions",
      },
      { id: "5-mult", text: "Multiplies 2- and 3-digit numbers times 3- and 4-digit numbers" },
      { id: "5-div", text: "Divides a 5-digit number by a 1-digit number" },
      { id: "5-frac", text: "Adds, subtracts, multiplies, and divides common fractions" },
    ],
    problems: [
      {
        id: "5-1",
        skill: "5-big",
        type: "choice",
        prompt: "2,400,000,000,000 + 600,000,000,000 =",
        choices: [
          "3,000,000,000,000",
          "2,460,000,000,000",
          "30,000,000,000,000",
          "2,406,000,000,000",
        ],
        answer: "3,000,000,000,000",
      },
      { id: "5-2", skill: "5-mult", type: "numeric", prompt: "245 × 1,338 =", answer: "327810" },
      { id: "5-3", skill: "5-div", type: "numeric", prompt: "34,258 ÷ 7 =", answer: "4894" },
      {
        id: "5-4",
        skill: "5-frac",
        type: "choice",
        prompt: "3/4 + 2/3 =",
        choices: ["17/12", "5/7", "5/12", "6/7"],
        answer: "17/12",
      },
      {
        id: "5-5",
        skill: "5-frac",
        type: "choice",
        prompt: "2/3 × 3/5 =",
        choices: ["2/5", "5/8", "2/15", "9/10"],
        answer: "2/5",
      },
      {
        id: "5-6",
        skill: "5-frac",
        type: "choice",
        prompt: "1/2 ÷ 1/4 =",
        choices: ["2", "1/8", "1/2", "4"],
        answer: "2",
      },
    ],
  },
  {
    id: "6",
    outcome: "L6",
    parentAssisted: false,
    skills: [
      {
        id: "6-word",
        text:
          "Solves word problems and computational problems involving borrowing and carrying using numbers involving decimals",
      },
      { id: "6-div", text: "Divides a 6-digit number by a 2- or 3-digit number" },
      { id: "6-ops", text: "Adds, subtracts, multiplies, and divides using decimals" },
      { id: "6-ratio", text: "Finds ratio, proportions, and percentages" },
    ],
    problems: [
      { id: "6-1", skill: "6-ops", type: "numeric", prompt: "4.6 × 2.3 =", answer: "10.58" },
      { id: "6-2", skill: "6-ops", type: "numeric", prompt: "7.2 − 3.85 =", answer: "3.35" },
      { id: "6-3", skill: "6-div", type: "numeric", prompt: "132,489 ÷ 27 =", answer: "4907" },
      { id: "6-4", skill: "6-ratio", type: "numeric", prompt: "What is 35% of 80?", answer: "28" },
      {
        id: "6-5",
        skill: "6-ratio",
        type: "numeric",
        prompt:
          "A recipe uses 2 cups of flour for every 3 cups of milk. If you use 6 cups of flour, how many cups of milk do you need?",
        answer: "9",
      },
      {
        id: "6-6",
        skill: "6-word",
        type: "numeric",
        prompt:
          "A board is 2.75 meters long. You cut off a piece 1.4 meters long. How many meters long is the piece that is left?",
        answer: "1.35",
      },
    ],
  },
  {
    id: "7",
    outcome: "ALGEBRA",
    parentAssisted: false,
    skills: [
      { id: "7-pre", text: "Knows pre-algebraic concepts" },
      { id: "7-simple", text: "Solves simple algebraic equations (for example, y + 4 = 9)" },
      { id: "7-linear", text: "Solves linear algebraic equations (for example, 3x + 2 = y)" },
      {
        id: "7-system",
        text: "Solves systems of equations and inequalities involving 2 equations with 2 unknowns",
      },
      { id: "7-quad", text: "Solves quadratic equations" },
      { id: "7-factor", text: "Factors quadratic equations" },
    ],
    problems: [
      {
        id: "7-1",
        skill: "7-pre",
        type: "choice",
        prompt: "Which expression means “five more than a number n”?",
        choices: ["n + 5", "5n", "n − 5", "5 − n"],
        answer: "n + 5",
      },
      {
        id: "7-2",
        skill: "7-simple",
        type: "numeric",
        prompt: "If y + 4 = 9, what is y?",
        answer: "5",
      },
      {
        id: "7-3",
        skill: "7-linear",
        type: "numeric",
        prompt: "If 3x + 2 = 11, what is x?",
        answer: "3",
      },
      {
        id: "7-4",
        skill: "7-system",
        type: "numeric",
        prompt: "If 2x + y = 9 and x + y = 10, what is y?",
        answer: "11",
      },
      {
        id: "7-5",
        skill: "7-quad",
        type: "numeric",
        prompt: "x² − 5x + 6 = 0 has two solutions. What is the smaller one?",
        answer: "2",
      },
      {
        id: "7-6",
        skill: "7-factor",
        type: "choice",
        prompt: "Factor: x² + 5x + 6",
        choices: [
          "(x + 2)(x + 3)",
          "(x + 1)(x + 6)",
          "(x + 5)(x + 6)",
          "(x − 2)(x − 3)",
        ],
        answer: "(x + 2)(x + 3)",
      },
    ],
  },
];
