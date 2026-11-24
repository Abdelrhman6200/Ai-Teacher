"""From the sources, session 19."""
P = 'https://platform.claude.com/docs/en/'
A = 'https://www.anthropic.com/'
Q = {}
POST = A + 'research/april-23-postmortem'
POST2 = A + 'engineering/a-postmortem-of-three-recent-issues'

Q[19] = dict(steps=[
 dict(title='A score from a small suite is a measurement with noise',
      paras=['Anthropic\'s statistics note makes five recommendations for reading eval scores. Report a standard error, because a score is an average over a sample of questions. Use paired differences, because scores only mean something relative to each other: compare two models or prompts on the same questions. And do a power analysis, because with few questions the confidence interval is wide and only a large gap can be detected.',
             'Our own arithmetic shows the scale. A score of 85 percent on 20 cases has a standard error of about 8 points, so a rough 95 percent range runs from around 69 to 100.'],
      stats=[('±16', 'points: a rough 95% range around 85% on 20 cases (our arithmetic)')],
      viz=dict(kind='bars', title='What a 3-point lead is worth', unit='Illustrative: 20 cases, scores of 88 and 85 percent, rough 95 percent ranges around each.',
               rows=[dict(h='Prompt B', v=88, label='88% ± 16'), dict(h='Prompt A', v=85, label='85% ± 16')]),
      src=('A statistical approach to model evaluations', A + 'research/statistical-approach-to-model-evals')),
 ('You compare two prompts on the same 20 cases and one scores 3 points higher. What does Anthropic\'s statistical guidance point to?',
  ['Analyse paired differences on the same cases, against the noise', 'Ship the higher-scoring one, since any lead is a real one', 'Average the two prompts into a single blended prompt', 'Add a third prompt to break the tie between them'],
  'With 20 cases a 3-point gap is well inside the noise. More cases or repeated trials would be needed to show it.'),
 dict(title='The way you run the eval moves the score',
      paras=['Anthropic found that running one coding benchmark on its own cluster gave scores that did not match the official leaderboard, with as many as 6 percent of tasks failing from pod errors unrelated to the model. Resource limits were the cause.',
             'Up to roughly 3 times the benchmark\'s specs, extra resources only removed crash noise, making the eval more stable without making it easier. Above that, extra resources started actively helping the agent. In principle every part of the setup can matter: hardware, concurrency, even bandwidth. A 2-point leaderboard lead might be genuine, or might be the setup.'],
      stats=[('6%', 'of tasks failed from pod errors, unrelated to the model'), ('~3×', 'the specs, where extra resources start to help the agent')],
      viz=dict(kind='compare', title='More resources, two effects', leftTone='good', rightTone='bad',
               left=dict(h='Up to about 3 times the specs', items=['Fixes crashes from resource spikes', 'More stable, not easier']), right=dict(h='Beyond that', items=['Extra resources help the agent', 'Scores rise for the wrong reason'])),
      src=('Infrastructure noise in agentic coding evals', A + 'engineering/infrastructure-noise')),
 ('Two runs of the same agent score 2 points apart on different clusters. What might that gap reflect, per Anthropic\'s infrastructure-noise post?',
  ['Run-setup differences, such as resources, as well as capability', 'A real capability difference between them, always', 'Nothing: the choice of cluster never affects a score', 'A mistake in the grader, which is the cause every time'],
  'Run every eval under the same conditions, and write those conditions down with the score.'),
 dict(title='The suite said no regressions. A broader one said minus 3%.',
      paras=['In Claude Code, Anthropic added one line to the system prompt to cut verbosity: keep text between tool calls to 25 words or fewer and final answers to 100 words or fewer. After weeks of internal testing with no regressions in its evals, it shipped on April 16.',
             'Later ablations, which remove prompt lines one at a time and run a broader set of evaluations, showed a 3 percent drop for both Opus 4.6 and 4.7. The prompt was reverted on April 20. Their fixes: per-model evals for every system prompt change, ablations of each line, soak periods and gradual rollouts.'],
      stats=[('3%', 'drop found by a broader eval that weeks of testing had missed')],
      viz=dict(kind='timeline', title='One prompt line', events=[dict(h='Weeks of testing', s='No regressions in the suite that was run'), dict(h='April 16', s='The length-limit prompt ships with a new model', warn=True), dict(h='Ablations on a broader suite', s='Show a 3 percent drop'), dict(h='April 20', s='Reverted')]),
      src=('An update on Claude Code quality reports', POST)),
 ('In Anthropic\'s Claude Code postmortem, what exposed the 3% drop that weeks of testing had missed?',
  ['Ablations: removing prompt lines one by one on a broader suite', 'A single detailed complaint from a long-standing customer', 'Running exactly the same suite again, several more times', 'The model itself refusing to run the evaluation at all'],
  'A suite only protects what it covers. Widen it when a change could trade off against quality.'),
 dict(title='Why quality problems hid until users noticed',
      paras=['Anthropic\'s postmortem of three overlapping bugs, one of which misrouted up to 16 percent of requests at the worst hour, explains why its own checks missed them. The evaluations it ran did not capture the degradation users reported, partly because Claude often recovers well from isolated mistakes. It had also leaned too heavily on noisy evaluations.',
             'The changes: evaluations that more reliably tell working from broken implementations, quality evaluations run continuously on true production systems, faster tooling to debug community feedback without giving up privacy, and a standing request for specific, reproducible user reports through /bug or a thumbs-down.'],
      viz=dict(kind='flow', title='Closing the gap', steps=[dict(h='Sensitive evals', s='Tell working from broken'), dict(h='Run in production', s='Continuously, not just before release'), dict(h='Trace the failure', s='Debug a report without exposing a user'), dict(h='Add it as a test', s='So it cannot return unseen')]),
      src=('A postmortem of three recent issues', POST2)),
 ('A postmortem says its evaluations missed a degradation that users reported. Which reason does Anthropic give?',
  ['They did not capture it: Claude often recovers from isolated errors', 'The users who reported the problem were simply mistaken', 'The evaluations were never run against a live system', 'Quality of this kind cannot be measured by any evaluation'],
  'An eval that checks only the end result can look fine while the path to it got worse. Add checks that cover the path.'),
])
