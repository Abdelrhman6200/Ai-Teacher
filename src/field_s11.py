"""From the sources, session 11."""
P = 'https://platform.claude.com/docs/en/'
A = 'https://www.anthropic.com/'
Q = {}
BEA = A + 'engineering/building-effective-agents'

Q[11] = dict(steps=[
 dict(title='Workflows and agents are different things',
      paras=['Anthropic calls both agentic systems but draws one architectural line. In a workflow, LLMs and tools are orchestrated through predefined code paths. In an agent, the LLM dynamically directs its own process and tool use.',
             'The advice is to find the simplest solution that works and add complexity only when needed. Agentic systems trade latency and cost for performance. For many applications, optimising a single call with retrieval and in-context examples is usually enough.'],
      viz=dict(kind='compare', title='Two kinds of agentic system', leftTone='neutral', rightTone='neutral',
               left=dict(h='Workflow', items=['Predefined code paths', 'Predictable and consistent', 'For well-defined tasks']),
               right=dict(h='Agent', items=['The model directs its own steps', 'Flexible, model-driven decisions', 'For open-ended work at scale, in trusted settings'])),
      src=('Building effective AI agents', BEA)),
 ('Which description fits a workflow, as Anthropic defines the word?',
  ['LLMs and tools run along predefined code paths', 'An LLM that directs its own steps and tool use', 'Any system that happens to use more than one model', 'A single call that has a very long prompt in it'],
  'Your welcome-email flow is a workflow: you wrote the order of the steps. An agent would choose its own.'),
 dict(title='Three patterns you will use first',
      paras=['Prompt chaining splits a task into fixed steps where each call processes the last one\'s output, trading some latency for accuracy by making every call easier. Routing classifies an input and sends it to a specialised path, so tuning for one kind of input does not hurt another. Parallelization runs independent subtasks at once (sectioning) or the same task several times (voting).'],
      viz=dict(kind='tree', title='Choose the pattern by the shape of the task', root='A task you want to automate',
               kids=[dict(h='Prompt chaining', s='It splits cleanly into fixed steps'), dict(h='Routing', s='Distinct categories that are classified accurately'), dict(h='Parallelization', s='Independent parts, or you want several attempts to vote')]),
      src=('Building effective AI agents', BEA)),
 ('Your flow sends easy, common questions to a small cheap model and hard ones to a stronger model. Which pattern is that?',
  ['Routing: classify, then use a specialised path', 'Prompt chaining: each step feeds the next', 'Voting: the same task run several times', 'An autonomous agent that picks its own steps'],
  'The article names this use of routing directly: easy, common questions to smaller models, hard ones to more capable ones.'),
 dict(title='Make each step\'s output something code can trust',
      paras=['In a chain you can add programmatic checks, which the article calls gates, on any intermediate step to keep the process on track. Structured outputs make that easier. Without them Claude can return malformed JSON, drop a required field or mix data types.',
             'With a schema in output_config.format, the response is generated under constraints so it matches. JSON outputs control what Claude says. Strict tool use validates how it calls your functions. Two costs: the first use of a schema adds latency while it compiles, and the format instructions add a few input tokens.'],
      viz=dict(kind='flow', title='A gated step', steps=[dict(h='Schema', s='The shape you need'), dict(h='Claude answers', s='Under that schema'), dict(h='Gate', s='Your code checks the content'), dict(h='Next step', s='Or a retry, or a person')]),
      src=[('Structured outputs', P + 'build-with-claude/structured-outputs'), ('Building effective AI agents', BEA)]),
 ('What is the difference between JSON outputs and strict tool use in the structured-outputs docs?',
  ['JSON outputs fix the reply format; strict tool use fixes tool inputs', 'They are just two names for exactly the same feature', 'JSON outputs are for images and strict tool use is for text', 'Strict tool use makes the content of the answer correct'],
  'A schema fixes the shape. It cannot make a value true, so your gate still checks the content.'),
 dict(title='When the workflow can wait, halve the bill',
      paras=['The Message Batches API processes requests asynchronously at 50 percent of standard prices. One batch can hold up to 100,000 requests or 256 MB. Most batches finish within an hour, each request is handled independently, and every result comes back as succeeded, errored, canceled or expired.'],
      stats=[('50%', 'of standard price, input and output'), ('100,000', 'requests or 256 MB per batch, whichever comes first')],
      viz=dict(kind='delta', title='Opus 5.5, dollars per million tokens', rows=[dict(h='Input', **{'from': '$4'}, to='$2', s='Batch price'), dict(h='Output', **{'from': '$20'}, to='$10', s='Batch price')]),
      src=('Batch processing', P + 'build-with-claude/batch-processing')),
 ('A nightly job summarises support tickets and nobody needs the results until morning. Which feature does the Batch docs say halves the cost?',
  ['The Message Batches API, at half the standard price', 'Fast mode, which trades higher price for speed', 'A larger context window, set on each request', 'Streaming, which only changes how output arrives'],
  'Anything that does not need an immediate answer is a batch candidate. Results arrive per request, so plan for the errored ones.'),
])
