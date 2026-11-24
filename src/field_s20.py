"""From the sources, session 20."""
A = 'https://www.anthropic.com/'
Q = {}
BEA = A + 'engineering/building-effective-agents'
MAR = A + 'engineering/multi-agent-research-system'
HAR = A + 'engineering/effective-harnesses-for-long-running-agents'

Q[20] = dict(steps=[
 dict(title='Three patterns for work you cannot script step by step',
      paras=['Orchestrator-workers fits tasks where you cannot predict the subtasks, such as how many files a coding change touches. A central model breaks the task down, delegates to workers and combines the results. It looks like parallelization, but the subtasks are not predefined. The orchestrator chooses them from the input.',
             'Evaluator-optimizer pairs one call that generates with another that critiques, in a loop. It works when you have clear criteria and feedback improves the result. An autonomous agent suits open-ended problems where the number of steps is unpredictable, in a trusted environment, and costs more with a risk of compounding errors.'],
      viz=dict(kind='tree', title='Choose by how predictable the task is', root='Beyond fixed steps',
               kids=[dict(h='Orchestrator-workers', s='Subtasks cannot be predicted, so a lead decides them'), dict(h='Evaluator-optimizer', s='Clear criteria, and feedback measurably improves the output'), dict(h='Autonomous agent', s='Open-ended, steps unknown, environment trusted')]),
      src=('Building effective AI agents', BEA)),
 ('What is the key difference between orchestrator-workers and parallelization, according to Anthropic?',
  ['The subtasks are not predefined: the orchestrator decides them', 'Orchestrator-workers uses only one model call in total', 'Parallelization always costs more than the alternatives', 'There is no real difference between the two patterns'],
  'Flexibility is the point. In parallelization you fix the split in advance.'),
 dict(title='What many agents buy, and what they cost',
      paras=['Anthropic\'s research system uses a lead agent that delegates to subagents working in parallel. With a stronger lead and cheaper subagents it beat a single agent by 90.2 percent on an internal research eval, especially on breadth-first questions. It works mainly because it spends enough tokens: token use alone explained 80 percent of the performance variance on one browsing benchmark.',
             'The bill is real. Agents typically use about 4 times the tokens of a chat, and multi-agent systems about 15 times. So the task must be valuable enough. Domains where all agents share context or have many dependencies, such as most coding, are a worse fit.'],
      stats=[('90.2%', 'better than one agent on an internal research eval'), ('15×', 'the tokens of a chat, for multi-agent systems')],
      viz=dict(kind='bars', title='Tokens used, relative to a chat', unit='From Anthropic\'s own data.', rows=[dict(h='Chat', v=1, label='1×'), dict(h='Single agent', v=4, label='about 4×'), dict(h='Multi-agent', v=15, label='about 15×')]),
      src=('How we built our multi-agent research system', MAR)),
 ('Roughly how many more tokens do multi-agent systems use than a chat, according to Anthropic\'s data?',
  ['About 15 times', 'About the same', 'About 2 times', 'About 150 times'],
  'That is the cost side of the 90 percent gain. It is why architecture decisions need an eval and a cost note.'),
 dict(title='Teach the lead how hard to try',
      paras=['The team\'s early agents made expensive mistakes: spawning 50 subagents for simple queries, searching endlessly for sources that did not exist, and distracting each other with updates. Vague task descriptions made subagents repeat each other\'s searches. One explored a 2021 chip crisis while two others duplicated work on 2025 supply chains.',
             'Agents struggle to judge effort, so the prompts embed scaling rules, and each subagent gets a clear objective, output format and boundary.'],
      viz=dict(kind='ladder', title='Scaling rules in the lead\'s prompt', mark=2, axis='Spend effort in proportion to the question.',
               steps=[dict(h='Complex research', s='More than 10 subagents, clearly divided duties'), dict(h='Direct comparison', s='2 to 4 subagents, 10 to 15 calls each'), dict(h='Simple fact-finding', s='1 agent, 3 to 10 tool calls')]),
      src=('How we built our multi-agent research system', MAR)),
 ('A user asks one simple factual question. According to Anthropic\'s scaling rule, how much should the lead use?',
  ['One agent with about 3 to 10 tool calls', 'Ten or more subagents working in parallel', 'Four subagents, each with about 15 calls', 'A fresh team of agents for every fact'],
  'Without a rule, the lead over-spends. Writing the rule into the prompt was one of the team\'s main fixes.'),
 dict(title='A harness for work that outlasts one context window',
      paras=['For multi-window tasks Anthropic uses an initializer agent in the first window, with a different prompt, that sets up the environment: a git repository, a progress notes file, an init script and a feature list. In its example the list held over 200 end-to-end features, all initially marked failing.',
             'Each later session starts by reading the notes and git log and running a basic test. It works on one feature, marks it passing only after careful testing, and ends with a commit and a progress update. That fixes four failures: declaring victory too early, leaving bugs or undocumented progress, marking features done prematurely, and wasting time working out how to run the app.'],
      viz=dict(kind='flow', title='One session of a long-running agent', steps=[dict(h='Get bearings', s='Notes, git log, a basic test'), dict(h='Pick one feature', s='From the failing list'), dict(h='Build and test end to end', s='Then mark it passing'), dict(h='Commit and update notes', s='So the next window can pick up')]),
      src=('Effective harnesses for long-running agents', HAR)),
 ('An agent keeps declaring the whole project finished too early. Which fix does Anthropic\'s harness use?',
  ['A list of failing features, one chosen each session', 'A longer system prompt that asks it to try harder', 'A bigger model that can hold more in its context', 'Ending every session earlier than it did before'],
  'A concrete list of what done means is what stops an agent from deciding for itself that it is done.'),
])
