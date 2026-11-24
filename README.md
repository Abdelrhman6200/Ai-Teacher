# Zero to 100 Practice

Practice app for the "zero to 100 in Claude and AI" course: 24 sessions, 5 levels, built as one learning loop per session
(warm-up, guess first, learn with diagrams, worked example, apply, practice, recall, mastery check, exercise, case, exit ticket,
level checkpoint, gate), with spaced review, confidence ratings and mastery gating, and a game layer (field missions, player levels,
Sparks and a shop, collectible rule cards, Blitz rounds, a skill profile, a playbook and a certificate).

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
   diagrams and four questions. Each card names its source note, which opens in the reader. See "Where the content comes from".
8. **Source notes, read inside the app.** 197 short notes extracted from Anthropic's documentation, Help Center, and engineering and
   research posts sit on every session and study sheet and in one searchable library. A note opens as a reader on top of whatever you
   are doing, so a lesson card's source line never takes you out of the lesson. Reading one earns 2 XP once and counts towards the
   Explorer and Deep diver badges. **Nothing in the app is a link:** no addresses, no new tabs.
9. Sessions 4 to 24 use an authored worked example (three "predict, then see" scenarios) and an authored case with three specific
   self-check points, in the same style as sessions 1 to 3.
10. **Field missions.** Every session has a branching decision story in its Apply phase (24 missions, 82 decisions). Each step gives a scene,
    three calls and, at once, what the call cost: two or three meters move, the reason is given and the strong move is shown. Stars come
    from the points (3 for 85 percent, 2 for 60 percent, otherwise 1) and the mission can be replayed for a better run. Level-end sessions
    (3, 7, 11, 16, 24) have a five-decision **boss mission** that draws on the whole level. A mission pays 22 to 38 XP (36 to 60 for a boss)
    and 3 Sparks a star, and counts towards the Field agent and Mission ace badges. `src/mission.py` validates the structure, ratings,
    wording and answer-length balance at build time.
11. **Player level and Sparks.** XP also carries you up a ladder of titles (Newcomer to Master, level 1 to 25 and beyond) shown in a strip
    under the tabs. **Sparks** come from chests, finished sessions, level-ups, badges, Blitz rounds and missions. The **shop** sells a
    streak freeze (covers one missed day, up to two held), an XP booster (the next new step pays double) and a mystery chest.
12. **Rule cards.** 53 collectible cards, each one a rule from the course: a core card for finishing a session (24), a drop card from
    chests and the shop (24) and an epic card for handing in a level gate (5). Chests open with a reward pop-up and a card. The album lists
    what you have and what is still to find, and works as a revision deck.
13. **Blitz.** On the Review tab: ten questions from sessions you can open, ninety seconds, points that multiply with a combo. Right answers
    count as spaced review and misses leave smudges. Three paid rounds a day (XP and Sparks), unlimited play for a best score.
14. **Skill profile.** A radar of eight skills (model sense, prompting, verifying, creating, context, connecting, building, safe and lean),
    each built from the steps, mastery checks and missions of the sessions that teach it, with a Train button for the next session.
15. **Playbook and certificate.** The playbook gathers what you wrote and earned (rules, exit-ticket verdicts, exercise logs, case answers,
    teach-backs, doubts, actions) and can be copied or printed. The certificate unlocks with the Level 1 gate, grows with each level and
    prints or saves as a PDF. Both are local to the page.
16. **Sound and touch.** Optional synthesised tones (off by default) and a small vibration tap on phones (on by default), under You, Settings.
17. **Comfort and safety.**
    - The browser's Back button stays in the app: it closes a dialog, asks before quitting a question, and goes up one level
      (question, session, Learn). At the Learn screen it leaves the page as usual.
    - Dialogs trap keyboard focus, close on Escape, hide the page behind them and give focus back.
    - **Back up** (You, Settings): copy a backup code, paste it to restore on this or another device. Progress lives in the browser
      only, so this is the way to keep it across browsers, devices or a cleared cache.
    - **Theme** (You, Settings): Auto follows the device; Light and Dark override it.
    - An axe-core pass over 50 screens in light and dark, at phone and desktop width, is clean (see Test).

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
- `src/cards.py`: the 53 rule cards and their validator. `src/mission.py` with `src/missions_a.py`, `missions_b.py`, `missions_c.py`: the 24 field missions.
- `src/game.js` (player level, Sparks, shop, cards, rewards, skill profile), `src/missions.js` (the mission player), `src/blitz.js`, `src/fx.js` (sound and
  vibration) and `src/book.js` (playbook and certificate) are joined into the app by `build.py`.
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
tests/run.sh full 420 900     # all 24 sessions with their missions, gates, warm-ups, reviews, teach-backs, then rewards, skills, playbook, certificate, shop and streak freeze
tests/run.sh full 1100 900    # same at desktop width
tests/run.sh extras           # quit, keyboard, replay XP, save, search, reset
tests/run.sh quest            # sources step in every session, no web address in the data, notes read in the app, diagrams, phases, chests, trail, daily quests, library,
                              # focus trap, Back, backup, theme, field missions, Blitz, sound and touch, playbook
tests/run.sh onboard          # set-up, placement (pass and fail), start point, situations, debrief, use-it-today, real task
tests/run.sh duetest          # spaced review: due, answer, reschedule
tests/run.sh shot dg_loop 420 900          # screenshot of a scene (see scenes in tests/test_driver.js)
```

Optional accessibility check (axe-core, light and dark, any scenes): `npm i playwright axe-core` then
`node tests/axe_check.js smoke you2 library note case_rev` (`WIDTHS=420,1100` for both widths). It exits 1 on any violation.

Expected: the output ends with `OK` and contains no `FAIL` or `WARN` lines.

## Notes

- If the repo is public, learners can read the answers in the page source and in `references/`. Use a private repo or keep it to instructors.
- Time-sensitive facts (model names, prices, plan limits) are as of 16 November 2026. Re-check them each month. A spot check on
  24 November 2026 compared prices, effort defaults, batch limits, cache figures, skill limits, the hook exit code, the Sonnet 4.5
  retirement date and several research figures with the source pages. Two claims were reworded (the tokenizer note and the
  Fable 5.2 and Mythos 5.2 relationship); the rest matched.
- Gates are graded by the instructor, not by the app.
