"""Reference shelves, sessions 1 to 12. Each entry: (kind, url, title, why).
kind: 'docs' = Read (official documentation), 'deep' = Go deeper (Anthropic research or engineering writing), 'try' = Try it (hands-on).
Every link was opened and answered when this shelf was built (see tools/check_links.py to re-check)."""
P = 'https://platform.claude.com/docs/en/'
C = 'https://code.claude.com/docs/en/'
H = 'https://support.claude.com/en/articles/'
A = 'https://www.anthropic.com/'
Q = {}

Q[1] = [
 ('docs', P + 'test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 'Reduce hallucinations', 'Anthropic\'s own checklist for making invented answers less likely. Use it on your failure log.'),
 ('docs', P + 'build-with-claude/context-windows', 'Context windows', 'What the window holds, and why a bigger window is not perfect recall.'),
 ('docs', P + 'about-claude/glossary', 'Glossary', 'Plain definitions of tokens, context, temperature and the other terms in this course.'),
 ('docs', H + '8114494', 'How up to date is Claude\'s training data?', 'What a knowledge cutoff means for the questions you ask.'),
 ('deep', A + 'research/tracing-thoughts-language-model', 'Tracing the thoughts of a large language model', 'Researchers look inside a model as it answers. Shows that "next word" is not the whole story.'),
 ('deep', A + 'research/language-models-mostly-know-what-they-know', 'Language models (mostly) know what they know', 'When a model can judge its own answer, and where it cannot.'),
 ('deep', A + 'research/towards-understanding-sycophancy-in-language-models', 'Towards understanding sycophancy', 'Why assistants lean toward agreeing with you. Read it before your leading-question test.'),
 ('try', C + 'context-window', 'Explore the context window', 'Watch a real context window fill up, step by step.'),
]

Q[2] = [
 ('docs', H + '8114491', 'Get started with Claude', 'Account, apps and first steps, for the surface you will use most.'),
 ('docs', C + 'overview', 'Claude Code overview', 'What the coding agent is, and where it runs: terminal, IDE, desktop and browser.'),
 ('docs', C + 'platforms', 'Platforms and integrations', 'Which Claude Code surface fits which job.'),
 ('docs', P + 'build-with-claude/overview', 'Features overview (API)', 'Everything the API offers, grouped by what you want to do.'),
 ('docs', H + '14503520', 'Available beta and research preview features', 'What is new, what is plan-limited, and how to check before promising it.'),
 ('deep', A + 'research/claude-code-expertise', 'How Claude Code is used in practice', 'What people really ask a coding agent to do. Useful when you choose a surface.'),
 ('try', H + '13345190', 'Get started with Claude Cowork', 'Set up the surface for multi-step desktop work.'),
 ('try', H + '12012173', 'Get started with Claude in Chrome', 'Try the browser surface on one real web task.'),
 ('try', C + 'quickstart', 'Claude Code quickstart', 'Install it and make your first change in about ten minutes.'),
]

Q[3] = [
 ('docs', P + 'models/overview', 'Models overview', 'Every current model, its tier and its limits, on one page.'),
 ('docs', P + 'about-claude/models/choosing-a-model', 'Choosing a model', 'Anthropic\'s own method for picking a tier. Compare it with your bake-off.'),
 ('docs', P + 'build-with-claude/effort', 'Effort', 'How effort changes thinking and cost. Tune this before switching models.'),
 ('docs', P + 'about-claude/pricing', 'Pricing', 'The numbers behind every cost claim in your model-choice sheet.'),
 ('docs', P + 'about-claude/model-deprecations', 'Model deprecations', 'Check the lifecycle before you depend on a model.'),
 ('docs', H + '8664678', 'Change the model, effort and thinking settings', 'Where the controls live in the app.'),
 ('docs', H + '11095361', 'When to use web search, extended thinking and research', 'Three switches that are easy to confuse.'),
 ('docs', P + 'about-claude/models/optimizing-for-cost-and-intelligence', 'Optimizing for cost and intelligence', 'The trade-off between cheap and capable, with levers to pull.'),
 ('deep', A + 'research/statistical-approach-to-model-evals', 'A statistical approach to model evaluations', 'Why a bake-off needs repeats and error bars before you trust a gap.'),
 ('try', P + 'test-and-evaluate/develop-tests', 'Define success and build evaluations', 'Write the rubric before the bake-off, as the gate sheet asks.'),
]

Q[4] = [
 ('docs', P + 'build-with-claude/prompt-engineering/claude-prompting-best-practices', 'Prompting best practices', 'The official techniques: clear, direct, examples, tags, role, long-context order.'),
 ('docs', P + 'test-and-evaluate/develop-tests', 'Define success and build evaluations', 'Criteria first. This is the page behind your before-and-after scores.'),
 ('docs', P + 'build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5', 'Prompting Claude Sonnet 5.5', 'Model-specific advice. Each model likes slightly different prompts.'),
 ('docs', P + 'build-with-claude/prompt-engineering/prompting-claude-haiku-5-5', 'Prompting Claude Haiku 5.5', 'Smaller models may need more explicit guidance. See what changes.'),
 ('docs', H + '7996853', 'Introduction to prompt design', 'A short, plain primer if the best-practices page feels dense.'),
 ('docs', H + '7996857', 'My prompt isn\'t giving me a helpful answer', 'A troubleshooting list to run before you blame the model.'),
 ('deep', A + 'news/prompt-engineering-for-business-performance', 'Prompt engineering for business performance', 'A real case: few-shot examples and prompt chaining raised accuracy by 20%.'),
 ('deep', A + 'news/prompting-long-context', 'Prompting Claude\'s long context window', 'Quote first, then answer. Two techniques you will use in session 5.'),
 ('try', C + 'prompt-library', 'Prompt library', 'Working prompts to copy, then rewrite against your own criteria.'),
]

Q[5] = [
 ('docs', P + 'build-with-claude/citations', 'Citations', 'How Claude can point to the exact passage it used.'),
 ('docs', P + 'build-with-claude/pdf-support', 'PDF support', 'What happens when you attach a PDF, including limits.'),
 ('docs', P + 'build-with-claude/files', 'Files API', 'Upload once, reuse in many requests.'),
 ('docs', P + 'test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 'Reduce hallucinations', 'Say "I do not know", quote first, then answer.'),
 ('docs', H + '11088861', 'Use research on Claude', 'The research mode, and what it does differently from a plain chat.'),
 ('docs', H + '10684626', 'Enable and use web search', 'Search changes the source, not the model. Test it.'),
 ('docs', H + '11473015', 'Retrieval augmented generation (RAG) for projects', 'How a Project handles more files than fit in one window.'),
 ('deep', A + 'news/prompting-long-context', 'Prompting Claude\'s long context window', 'Extracting quotes before answering improves long-document questions.'),
 ('deep', A + 'research/contextual-retrieval', 'Contextual retrieval', 'Why a retrieved chunk needs its context to be found and used well.'),
]

Q[6] = [
 ('docs', H + '17153992', 'What are artifacts and how do I use them?', 'The panel where docs, apps and visuals take shape.'),
 ('docs', H + '9547008', 'Share artifacts', 'Share what you made, with the right audience and permissions.'),
 ('docs', H + '13979539', 'Custom visuals in chat and Cowork', 'Charts and diagrams from a plain request.'),
 ('docs', H + '16923645', 'Get started with Claude Docs', 'Draft, edit and iterate on long documents.'),
 ('docs', H + '14604416', 'Get started with Claude Design', 'Visual designs from a brief.'),
 ('docs', H + '17454700', 'Get started with Claude Data', 'Sheets and analysis from your own data.'),
 ('docs', H + '14729249', 'Use live artifacts in Claude Cowork', 'Outputs that stay connected to their sources.'),
 ('deep', A + 'research/working-with-ai', 'Working with AI', 'Interviews at 58 companies on how work changes around AI. Useful when you choose what to delegate.'),
 ('try', H + '17457950', 'Use artifacts with a keyboard or screen reader', 'Check that what you make is usable by everyone on your team.'),
]

Q[7] = [
 ('docs', H + '9517075', 'What are projects?', 'Standing instructions and files that every chat in the project shares.'),
 ('docs', H + '9519177', 'How can I create and manage projects?', 'The step-by-step for the Project you build in this session.'),
 ('docs', H + '11817273', 'Use chat search and memory to build on previous context', 'What memory holds and how to read it.'),
 ('docs', H + '12123587', 'Import and export your memory', 'Move memory between tools, or inspect it in plain text.'),
 ('docs', H + '12260368', 'Use incognito chats', 'When to keep a conversation out of memory.'),
 ('docs', H + '11473015', 'RAG for projects', 'Why a Project can hold more than fits in one chat.'),
 ('docs', C + 'memory', 'How Claude remembers your project', 'The coding-agent version of memory: CLAUDE.md and auto memory.'),
 ('deep', A + 'research/components-of-agent-memory', 'The components of agent memory', 'What is worth remembering, and how to correct mistakes.'),
 ('deep', A + 'research/effective-context-engineering-for-ai-agents', 'Effective context engineering for AI agents', 'Context is finite. Decide what stays, what is fetched and what is dropped.'),
]

Q[8] = [
 ('docs', H + '11176164', 'Use connectors to extend Claude\'s capabilities', 'What connectors are, and how to switch them on per conversation.'),
 ('docs', H + '11725091', 'When to use desktop and web connectors', 'Which kind fits which job.'),
 ('docs', H + '10166901', 'Use Google Workspace connectors', 'The Drive, Gmail and Calendar flow used in this session\'s demo.'),
 ('docs', H + '12684923', 'Microsoft 365 connector security guide', 'What the connector can and cannot reach. Read before you connect work data.'),
 ('docs', H + '11175166', 'Get started with custom connectors using remote MCP', 'Connect a tool nobody built a connector for.'),
 ('docs', P + 'agents-and-tools/remote-mcp-servers', 'Remote MCP servers', 'The same idea from the developer side.'),
 ('deep', A + 'news/model-context-protocol', 'Introducing the Model Context Protocol', 'Why one open standard replaced one-off integrations.'),
 ('deep', A + 'research/prompt-injection-defenses', 'Mitigating prompt injections in browser use', 'A real defence against instructions hidden in web pages. Pair it with your injection test.'),
 ('try', C + 'mcp-quickstart', 'Connect to MCP servers', 'Connect your first server from the command line.'),
]

Q[9] = [
 ('docs', H + '12512176', 'What are skills?', 'A recipe card Claude reaches for when the task fits.'),
 ('docs', H + '12512180', 'Use skills in Claude', 'Turn on and use skills.'),
 ('docs', H + '12512198', 'How to create custom skills', 'The step-by-step for your two skills.'),
 ('docs', P + 'agents-and-tools/agent-skills/overview', 'Agent Skills overview', 'Frontmatter, progressive disclosure and where skills run.'),
 ('docs', P + 'agents-and-tools/agent-skills/best-practices', 'Skill authoring best practices', 'Descriptions that trigger, files one level deep, evaluate before you write.'),
 ('docs', C + 'skills', 'Extend Claude with skills', 'Skills in Claude Code, project and personal.'),
 ('docs', H + '15927065', 'Skill and plugin scanning', 'Why you read every file of a skill you did not write.'),
 ('deep', A + 'engineering/equipping-agents-for-the-real-world-with-agent-skills', 'Equipping agents with Agent Skills', 'The design idea behind skills: load detail only when needed.'),
 ('deep', A + 'news/skills', 'Introducing Agent Skills', 'The launch post, with the plain-language definition.'),
 ('try', P + 'agents-and-tools/agent-skills/quickstart', 'Agent Skills quickstart', 'Build and call a skill in the API.'),
]

Q[10] = [
 ('docs', H + '13837440', 'Use plugins in Claude', 'What a plugin bundles and how to install one.'),
 ('docs', H + '14328846', 'Browse skills, connectors and plugins in one directory', 'Find what exists before you build.'),
 ('docs', C + 'plugins/overview', 'Plugins overview', 'Skills, subagents, hooks and servers in one package.'),
 ('docs', C + 'plugins/security', 'Plugin security and trust', 'What to check before you install someone else\'s plugin.'),
 ('docs', H + '13854387', 'Schedule recurring tasks in Claude Cowork', 'Set up your Monday report.'),
 ('docs', H + '13364135', 'Use Claude Cowork safely', 'What a scheduled task is allowed to touch.'),
 ('docs', C + 'routines', 'Automate work with scheduled tasks', 'Where scheduled work runs, in the cloud or on your machine.'),
 ('docs', C + 'plugins/create', 'Create a Claude Code plugin', 'Build and share a small plugin.'),
 ('deep', A + 'news/donating-agent-skills-to-the-agentic-ai-foundation', 'Donating Agent Skills to the Agentic AI Foundation', 'Skills become an open standard, so what you package can travel.'),
 ('try', C + 'plugin-evals', 'Test plugins with evals', 'The failure check from this session, done formally.'),
]

Q[11] = [
 ('docs', P + 'build-with-claude/working-with-messages', 'Using the Messages API', 'The parts of a call: model, max tokens, messages.'),
 ('docs', P + 'build-with-claude/structured-outputs', 'Structured outputs', 'Make the output a shape your next step can rely on.'),
 ('docs', P + 'build-with-claude/batch-processing', 'Batch processing', 'When a workflow does not need an answer right now.'),
 ('docs', P + 'agents-and-tools/tool-use/overview', 'Tool use overview', 'How Claude calls tools inside a workflow.'),
 ('docs', P + 'about-claude/use-case-guides/ticket-routing', 'Ticket routing', 'A worked classify-then-act workflow, close to your welcome-email flow.'),
 ('docs', P + 'about-claude/use-case-guides/customer-support-chat', 'Customer support agent', 'Human approval and escalation in a real design.'),
 ('deep', A + 'engineering/building-effective-agents', 'Building effective AI agents', 'Workflows versus agents, and the five patterns. Start simple.'),
 ('try', P + 'get-started', 'Quickstart', 'Make your first API call.'),
 ('try', P + 'agents-and-tools/tool-use/build-a-tool-using-agent', 'Tutorial: build a tool-using agent', 'A guided build from one call to a loop.'),
]

Q[12] = [
 ('docs', C + 'quickstart', 'Quickstart', 'Install, sign in and make your first change.'),
 ('docs', C + 'how-claude-code-works', 'How Claude Code works', 'The agentic loop and the tools it uses.'),
 ('docs', C + 'best-practices', 'Best practices for Claude Code', 'Give it a check, plan first, keep context short.'),
 ('docs', C + 'memory', 'How Claude remembers your project', 'What belongs in CLAUDE.md and what does not.'),
 ('docs', C + 'common-workflows', 'Common workflows', 'Recipes for bugs, tests, refactors and reviews.'),
 ('docs', C + 'claude-directory', 'Explore the .claude directory', 'Where every setting and file lives.'),
 ('docs', C + 'permission-modes', 'Choose a permission mode', 'How much Claude may do without asking.'),
 ('docs', C + 'checkpointing', 'Checkpointing', 'Undo what Claude changed.'),
 ('deep', A + 'research/claude-code-expertise', 'How Claude Code is used in practice', 'What people actually ask for, and how often it works.'),
 ('try', C + 'prompt-library', 'Prompt library', 'Starter tasks to try in your own repo.'),
]
