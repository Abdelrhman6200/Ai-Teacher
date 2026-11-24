# Zero to 100 Practice

Practice app for the "zero to 100 in Claude and AI" course: 24 sessions, 5 levels, built as one learning loop per session
(warm-up, guess first, learn with diagrams, worked example, apply, practice, recall, mastery check, exercise, case, exit ticket,
level checkpoint, gate), with spaced review, confidence ratings and mastery gating.

The whole app is a single self-contained file, `index.html` (course data, CSS, JS and fonts inline). No server, no dependencies.
Progress is saved in the browser (`localStorage`), per device.

## The learner journey

1. **Set up (first launch, about a minute).** Name, kind of work, experience, daily goal and one real task from the last two weeks.
   The real task reappears at the top of every exercise. Anyone can skip it, and edit it later under You.
2. **Placement check (optional).** Experienced learners answer 4 questions per level (levels 1 to 2, or 1 to 4). A level is passed with
   3 of 4. The start point is the first level not passed. Nothing is marked complete and nothing is locked: skipped sessions stay open,
   no XP is paid and nothing goes on the review list. Gates are still handed to the instructor.
3. **Each session opens with a situation**: a short, real workplace story that shows why the session matters, before the outcomes.
4. **Each session closes with a debrief**: one thing to do today (+15 XP once ticked), what the learner now has, why the next session
   matters, and the outcomes secure or to revisit. The same action stays pinned at the top of a finished session until it is done.
5. Sessions 4 to 24 use an authored worked example (three "predict, then see" scenarios) and an authored case with three specific
   self-check points, in the same style as sessions 1 to 3.

## Run it

Open `index.html` in a browser.

## Publish on GitHub Pages

1. Push this repo to GitHub.
2. Settings > Pages > Build and deployment > Deploy from a branch > `main` / `(root)`.
3. The app is served at `https://<user>.github.io/<repo>/`.

## Rebuild after editing

Needs Python 3 only.

```
python3 build.py        # writes index.html from src/ and references/
```

- `references/`: the learner kit (session notes, quizzes, model answers). Facts, tables and cheat sheets are parsed from here.
- `src/content.py`, `src/generic.py`: build sessions 1 to 3 and 4 to 24 from the references.
- `src/deep_a.py`, `src/deep_b.py`: the authored situation, use-it-today action, bridge, worked example and case for every session.
  `python3 src/deep.py` validates them (shape, no dash style, and how often the correct option is the longest).
- `src/lc1.py` to `src/lc6.py`: the authored learning content for every session (guess-first, application scenarios,
  mastery-check items, teach-back, diagram). `python3 src/learn_content.py` validates it.
- `src/method.py`: turns each session into the learning loop.
- `src/app.js`: the app (screens, spaced-review engine, mastery gating). `src/chars.js`: the Zed characters.
  `src/diagrams.js` and `src/diagrams.css`: the animated diagrams. `src/style.css`: theme (GUC colours, light and dark).
- Set `Z100_REFERENCES=/path` to build from another copy of the references.

## Test

`tests/run.sh` plays the real app in headless Chrome (needs Chrome or Chromium).

```
tests/run.sh full 420 900     # all 24 sessions, gates, warm-ups, reviews, teach-backs (phone width)
tests/run.sh full 1100 900    # same at desktop width
tests/run.sh extras           # quit, keyboard, replay XP, save, search, reset
tests/run.sh onboard          # set-up, placement (pass and fail), start point, situations, debrief, use-it-today, real task
tests/run.sh duetest          # spaced review: due, answer, reschedule
tests/run.sh shot dg_loop 420 900          # screenshot of a scene (see scenes in tests/test_driver.js)
```

Expected: the output ends with `OK` and contains no `FAIL` or `WARN` lines.

## Notes

- If the repo is public, learners can read the answers in the page source and in `references/`. Use a private repo or keep it to instructors.
- Time-sensitive facts (model names, prices, plan limits) are as of 16 November 2026. Re-check them each month.
- Gates are graded by the instructor, not by the app.
