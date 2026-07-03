# Making Math Meaningful — Placement Quiz

A self-contained placement quiz for Cornerstone Curriculum's *Making Math
Meaningful*. A child works real math problems; the page recommends the exact
level to start with, following the program's Levels Chart.

## Run locally

ES modules require a web server (not `file://`):

    python3 -m http.server 4173

Then open http://localhost:4173.

## Deploy

Upload the repo contents (minus `tests/`, `docs/`, `package.json` if you like —
they're harmless either way) to any static host: GitHub Pages, Netlify,
Cloudflare Pages, or plain shared hosting. No build step, no server code.

## Edit the problems

Everything a curriculum author might tweak lives in `js/data.js`:
problem wording, answers, skill descriptions, and product links.
After editing, run the validation suite:

    npm test

## Structure

- `js/data.js` — the Levels Chart as data: checkpoints, skills, problems, links
- `js/engine.js` — placement logic (pure functions, unit-tested)
- `js/app.js` — screens and rendering
- `tests/` — run with `npm test` (Node 18+)
