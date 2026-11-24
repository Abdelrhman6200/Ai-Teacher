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
5. **Each session is a quest in four phases: Learn, Apply, Prove, Use.** The session page shows a phase strip, Zed walking to the next
   stop, and a chest for each phase (+10, +10, +15 and +20 XP). Finishing a step shows where you are and a "phase cleared" ribbon.
6. **The home screen is a trail.** A mini-map of all 24 sessions in five worlds, with Zed on the current stop (he walks there when you
   come back), plus three daily quests (finish a step, win a practice step, open a reference) and a daily chest.
7. **From the sources.** Every session has a step built from Anthropic's own documentation and research: lesson cards with real numbers,
   diagrams and four questions. Each card names its source and links to it. See "Where the content comes from".
8. **Source notes, read inside the app.** 197 short notes extracted from Anthropic's documentation, Help Center, and engineering and
   research posts sit on every session and study sheet and in one searchable library. A note opens as a reader on top of whatever you
   are doing, so a lesson card's source line never takes you out of the lesson. Reading one earns 2 XP once and counts towards the
   Explorer and Deep diver badges. **Nothing in the app is a link:** no addresses, no new tabs.
9. Sessions 4 to 24 use an authored worked example (three "predict, then see" scenarios) and an authored case with three specific
   self-check points, in the same style as sessions 1 to 3.

## Where the content comes from

Everything a learner reads is inside the app. The content was built from Anthropic's published pages, extracted and rewritten:

1. `tools/build_notes.py` fetches each page on a session's reference shelf (`src/refs_a.py`, `refs_b.py`) and extracts a **source note**:
   a lead line, the key sections with their most informative sentences (rules, defaults, limits, figures), and one key table where the
   page has one. It writes `src/notes.json`, which the build embeds. Notes are short extracts with plain-text provenance, not copies of
   the pages. Pages that cannot be read keep what they had.
2. The **"From the sources"** step (`src/field_*.py`) is written from those pages: lesson cards, real numbers, diagrams and four
   questions per session. Each card names its source note, which opens in the reader. `src/field.py` refuses to build if a card cites a
   page that is not on that session's shelf, and the build refuses a shelf entry or source line that has no note.
3. The only addresses in the repo are the provenance the scripts use to refresh the notes. They are never shipped in the page.

- Facts are as of 24 November 2026 and several change monthly (model names, prices, retirement dates, plan limits). Re-check them with the
  routine in session 16, then refresh the notes: `python3 tools/check_links.py` and `python3 tools/build_notes.py`.
- Shelves list Anthropic-hosted pages only, because those were the pages that could be fetched and read. Material from other sites (the MCP
  specification, OWASP's LLM list, arXiv papers) can be added the same way once it has been fetched and checked.
- The notes quote short extracts from Anthropic's pages. If you publish this app beyond your own course, check Anthropic's terms for
  reusing its documentation and keep the attribution each note carries.

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
- `src/refs_a.py`, `src/refs_b.py`, `src/refs.py`: the shelves (which pages feed each session) and their validator. `src/notes.json`: the extracted notes.
- `src/field_*.py`, `src/field.py`: the "From the sources" cards and questions and their validator (every card cites its own shelf, 3 to 6 cards
  and exactly 4 questions per session, a diagram in each). `python3 src/field.py` checks them on its own.
- `src/diagrams.js`: 13 diagram types, including swim (sequence between actors), rings (defence in layers), delta (before and after),
  matrix, ladder and timeline.
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
tests/run.sh quest            # sources step in every session, no web address in the data, notes read in the app, diagrams, phases, chests, trail, daily quests, library
tests/run.sh onboard          # set-up, placement (pass and fail), start point, situations, debrief, use-it-today, real task
tests/run.sh duetest          # spaced review: due, answer, reschedule
tests/run.sh shot dg_loop 420 900          # screenshot of a scene (see scenes in tests/test_driver.js)
```

Expected: the output ends with `OK` and contains no `FAIL` or `WARN` lines.

## Notes

- If the repo is public, learners can read the answers in the page source and in `references/`. Use a private repo or keep it to instructors.
- Time-sensitive facts (model names, prices, plan limits) are as of 16 November 2026. Re-check them each month.
- Gates are graded by the instructor, not by the app.
