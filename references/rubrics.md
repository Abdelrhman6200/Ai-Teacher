# Rubrics

Contents: gate rubric (sessions 3, 7, 11), capstone rubric (session 16), expert rubric (session 24), how to read them.

These are the criteria the instructor grades against. Use them to check your own work before you hand it in. Each criterion is met or not met; a near miss is not met.

## Gate rubric (Levels 1 to 3, six criteria, all must be met)

| Criterion | Met when |
|---|---|
| Real task | Done on a task from the learner's own job, not a toy example |
| Criteria first | Success criteria written before the work and measurable |
| Evidence | A verification log or eval showing the output was checked |
| Safety | Permissions scoped, approval before anything is sent or written outside |
| Choices | Model, effort and tools justified from results, not from names |
| Own explanation | The learner explains each choice without asking Claude |

## Capstone rubric (Level 4, session 16, eight criteria, all must be met)

You supply the project. The examiner supplies a new input on the day.

| Criterion | Met when |
|---|---|
| Real input | Runs on a new input the examiner supplies on the day |
| Success criteria | Written before building, specific and measurable |
| Eval | At least 20 cases including edge and adversarial cases, with results reported |
| Model and effort | Choice justified by the eval, with one cheaper alternative tested |
| Safety | External actions behind approval, tools scoped, injection test run |
| Cost | Cost per run and a monthly estimate |
| Handover | Someone else can run and update it from the doc alone |
| Explanation | The learner defends each design choice unaided |

## Expert rubric (Level 5, session 24, eight criteria, all must be met)

Evidence must come from your own running system, not from description.

| Criterion | Met when |
|---|---|
| Production-ready | Evidence in all six areas: eval, observability, security, reliability, cost and ownership |
| Eval | A suite with a held-out score that gates every prompt, model or tool change |
| Observability | Tracing and cost per run with alerts, used to find the drill failure |
| Security | A threat model, an injection test and enforced controls, not prompt advice |
| Cost and reliability | A cost model, one measured saving, retries, limits and a tested rollback |
| Runbook | Someone other than the author runs and updates the system from it |
| Drill and postmortem | The failure is found, contained and fixed, and the postmortem adds a test |
| Teaching | The learner teaches one session and defends each choice unaided |

## Quiz threshold

Each session quiz passes at 80 percent. Below that, review the study sheet and retake.
