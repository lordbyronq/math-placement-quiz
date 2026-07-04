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
        format: "word",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "Maria has 8 apples. She gives 3 to her brother. How many apples does Maria have left?",
        answer: "5",
      },
      {
        id: "1-2",
        skill: "1-word",
        type: "numeric",
        format: "word",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "Sam has 6 marbles. His friend gives him 7 more. How many marbles does Sam have now?",
        answer: "13",
      },
      {
        id: "1-3",
        skill: "1-word",
        type: "numeric",
        format: "word",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "There are 5 red birds and 8 blue birds on a branch. How many birds are there in all?",
        answer: "13",
      },
      {
        id: "1-4",
        skill: "1-facts",
        type: "numeric",
        format: "computation",
        prompt: "9 + 6 =",
        answer: "15",
      },
      {
        id: "1-5",
        skill: "1-facts",
        type: "numeric",
        format: "computation",
        prompt: "20 = 12 + ______",
        answer: "8",
      },
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
      {
        id: "2-1",
        skill: "2-ops",
        type: "numeric",
        format: "word",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "A farmer collects 47 eggs on Monday and 36 eggs on Tuesday. How many eggs does the farmer collect in all?",
        answer: "83",
      },
      {
        id: "2-2",
        skill: "2-ops",
        type: "numeric",
        format: "word",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "A book has 82 pages. Nora has read 45 of them. How many pages does she have left to read?",
        answer: "37",
      },
      {
        id: "2-3",
        skill: "2-ops",
        type: "numeric",
        format: "word",
        parentNote: "Feel free to read this aloud.",
        prompt:
          "A store had 63 apples in the morning and sold 28 of them. How many apples are left?",
        answer: "35",
      },
      {
        id: "2-4",
        skill: "2-ops",
        type: "numeric",
        format: "computation",
        prompt: "52 − 27 =",
        answer: "25",
      },
      {
        id: "2-5",
        skill: "2-ops",
        type: "numeric",
        format: "computation",
        prompt: "80 − ______ = 53",
        answer: "27",
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
      {
        id: "3-1",
        skill: "3-ops",
        type: "numeric",
        format: "word",
        prompt:
          "A library had 457 books. It received 286 more. How many books does it have now?",
        answer: "743",
      },
      {
        id: "3-2",
        skill: "3-facts",
        type: "numeric",
        format: "word",
        prompt:
          "There are 7 baskets with 8 apples in each basket. How many apples are there altogether?",
        answer: "56",
      },
      {
        id: "3-3",
        skill: "3-frac",
        type: "choice",
        format: "word",
        prompt:
          "A pizza is cut into 4 equal pieces. You eat 3 of them. Which fraction shows how much of the pizza you ate?",
        choices: ["3/4", "4/3", "1/3", "1/4"],
        answer: "3/4",
      },
      {
        id: "3-4",
        skill: "3-ops",
        type: "numeric",
        format: "computation",
        prompt: "304 − 178 =",
        answer: "126",
      },
      {
        id: "3-5",
        skill: "3-facts",
        type: "numeric",
        format: "computation",
        prompt: "15 × ______ = 60",
        answer: "4",
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
        format: "word",
        prompt:
          "A city had 412,305 people. Then 178,426 people moved away. How many people live there now?",
        answer: "233879",
      },
      {
        id: "4-2",
        skill: "4-mult",
        type: "numeric",
        format: "word",
        prompt:
          "A stadium has 34 rows with 216 seats in each row. How many seats are there in all?",
        answer: "7344",
      },
      {
        id: "4-3",
        skill: "4-frac",
        type: "choice",
        format: "word",
        prompt: "Which is the larger amount — 2/3 of a pizza or 3/4 of a pizza?",
        choices: ["2/3", "3/4", "They are the same"],
        answer: "3/4",
      },
      {
        id: "4-4",
        skill: "4-ops",
        type: "numeric",
        format: "computation",
        prompt: "623,451 − 158,207 =",
        answer: "465244",
      },
      {
        id: "4-5",
        skill: "4-mult",
        type: "numeric",
        format: "computation",
        prompt: "______ × 216 = 7,344",
        answer: "34",
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
        format: "word",
        prompt:
          "One country's budget is 2,400,000,000,000 dollars. A neighbor's is 600,000,000,000 dollars. What is their combined budget?",
        choices: [
          "3,000,000,000,000",
          "2,460,000,000,000",
          "30,000,000,000,000",
          "2,406,000,000,000",
        ],
        answer: "3,000,000,000,000",
      },
      {
        id: "5-2",
        skill: "5-div",
        type: "numeric",
        format: "word",
        prompt:
          "34,258 seeds are shared equally among 7 fields. How many seeds does each field get?",
        answer: "4894",
      },
      {
        id: "5-3",
        skill: "5-frac",
        type: "choice",
        format: "word",
        prompt:
          "A bakery uses 3/4 cup of sugar for each batch. How much sugar is needed for 2 batches?",
        choices: ["1 1/2 cups", "3/4 cup", "2/4 cup", "2 1/4 cups"],
        answer: "1 1/2 cups",
      },
      {
        id: "5-4",
        skill: "5-mult",
        type: "numeric",
        format: "computation",
        prompt: "245 × 1,338 =",
        answer: "327810",
      },
      {
        id: "5-5",
        skill: "5-mult",
        type: "numeric",
        format: "computation",
        prompt: "______ × 1,338 = 327,810",
        answer: "245",
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
      {
        id: "6-1",
        skill: "6-word",
        type: "numeric",
        format: "word",
        prompt:
          "A board is 2.75 meters long. You cut off a piece 1.4 meters long. How many meters long is the piece that is left?",
        answer: "1.35",
      },
      {
        id: "6-2",
        skill: "6-div",
        type: "numeric",
        format: "word",
        prompt:
          "132,489 apples are packed equally into 27 crates. How many apples are in each crate?",
        answer: "4907",
      },
      {
        id: "6-3",
        skill: "6-ratio",
        type: "numeric",
        format: "word",
        prompt:
          "A recipe uses 2 cups of flour for every 3 cups of milk. If you use 6 cups of flour, how many cups of milk do you need?",
        answer: "9",
      },
      {
        id: "6-4",
        skill: "6-ops",
        type: "numeric",
        format: "computation",
        prompt: "4.6 × 2.3 =",
        answer: "10.58",
      },
      {
        id: "6-5",
        skill: "6-ops",
        type: "numeric",
        format: "computation",
        prompt: "7.2 − ______ = 3.35",
        answer: "3.85",
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
        format: "word",
        prompt: "Which expression means “five more than a number n”?",
        choices: ["n + 5", "5n", "n − 5", "5 − n"],
        answer: "n + 5",
      },
      {
        id: "7-2",
        skill: "7-simple",
        type: "numeric",
        format: "computation",
        prompt: "If y + 4 = 9, what is y?",
        answer: "5",
      },
      {
        id: "7-3",
        skill: "7-linear",
        type: "numeric",
        format: "computation",
        prompt: "If 3x + 2 = 11, what is x?",
        answer: "3",
      },
      {
        id: "7-4",
        skill: "7-system",
        type: "numeric",
        format: "word",
        prompt:
          "Three apples and two bananas cost $13. One apple and two bananas cost $7. How much does one apple cost, in dollars?",
        answer: "3",
      },
      {
        id: "7-5",
        skill: "7-quad",
        type: "numeric",
        format: "word",
        prompt:
          "A number multiplied by itself equals 5 times the number, minus 6. Two numbers work — what is the smaller one?",
        answer: "2",
      },
      {
        id: "7-6",
        skill: "7-factor",
        type: "choice",
        format: "word",
        prompt: "Which of these is the factored form of x² + 5x + 6?",
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
