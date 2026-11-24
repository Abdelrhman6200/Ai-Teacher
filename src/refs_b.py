"""Reference shelves, sessions 13 to 24. Same shape as refs_a.py."""
P = 'https://platform.claude.com/docs/en/'
C = 'https://code.claude.com/docs/en/'
H = 'https://support.claude.com/en/articles/'
A = 'https://www.anthropic.com/'
Q = {}

Q[13] = [
 ('docs', C + 'sub-agents', 'Create custom subagents', 'The frontmatter fields, tools and model for your reviewer.'),
 ('docs', C + 'hooks-guide', 'Automate actions with hooks', 'A guided path to your first hook.'),
 ('docs', C + 'hooks', 'Hooks reference', 'Every event, input and exit code. Look up PreToolUse and Stop here.'),
 ('docs', C + 'headless', 'Run Claude Code programmatically', 'The -p flag, output formats and limits.'),
 ('docs', C + 'cli-reference', 'CLI reference', 'Every flag, including --max-turns and --max-budget-usd.'),
 ('docs', C + 'skills', 'Extend Claude with skills', 'Project skills and what they cost in context.'),
 ('docs', C + 'mcp', 'Connect Claude Code to tools via MCP', 'Add a server, then see what it adds to context.'),
 ('docs', C + 'worktrees', 'Run parallel sessions with worktrees', 'Isolate sessions so they cannot collide.'),
 ('deep', A + 'news/enabling-claude-code-to-work-more-autonomously', 'Enabling Claude Code to work more autonomously', 'Checkpoints and why rewind makes autonomy safer.'),
 ('deep', A + 'research/claude-code-auto-mode', 'How we built Claude Code auto mode', 'Users approve 93% of prompts. How classifiers reduce approval fatigue.'),
]

Q[14] = [
 ('docs', C + 'agent-sdk/overview', 'Agent SDK overview', 'What the SDK gives you that a plain API call does not.'),
 ('docs', C + 'agent-sdk/quickstart', 'Agent SDK quickstart', 'The bug-fixing agent from this session\'s demo.'),
 ('docs', C + 'agent-sdk/agent-loop', 'How the agent loop works', 'The cycle of think, call a tool, read the result.'),
 ('docs', C + 'agent-sdk/subagents', 'Subagents in the SDK', 'Add a read-only helper with its own tools.'),
 ('docs', C + 'agent-sdk/permissions', 'Configure permissions', 'Allow, deny and ask rules for an agent.'),
 ('docs', C + 'agent-sdk/hooks', 'Intercept and control agent behavior with hooks', 'Log every tool call, or block one.'),
 ('docs', C + 'agent-sdk/custom-tools', 'Give Claude custom tools', 'Add the one tool your agent needs.'),
 ('docs', C + 'agent-sdk/cost-tracking', 'Track cost and usage', 'Know what each run cost.'),
 ('deep', A + 'engineering/building-agents-with-the-claude-agent-sdk', 'Building agents with the Claude Agent SDK', 'Design lessons from the team that built it.'),
 ('deep', A + 'engineering/building-effective-agents', 'Building effective AI agents', 'Start with the simplest pattern that works.'),
 ('deep', A + 'research/trustworthy-agents', 'Trustworthy agents in practice', 'Five principles, with defences at model, harness, tools and environment.'),
]

Q[15] = [
 ('docs', P + 'test-and-evaluate/develop-tests', 'Define success and build evaluations', 'Specific, measurable criteria and how to grade them.'),
 ('docs', P + 'test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks', 'Mitigate jailbreaks and prompt injections', 'Screens and checks to add to your eval.'),
 ('docs', P + 'test-and-evaluate/strengthen-guardrails/reduce-prompt-leak', 'Reduce prompt leak', 'Keep instructions private when you must.'),
 ('docs', P + 'test-and-evaluate/strengthen-guardrails/increase-consistency', 'Increase output consistency', 'Make results repeatable enough to grade.'),
 ('docs', P + 'build-with-claude/token-counting', 'Token counting', 'Estimate cost before you send.'),
 ('docs', P + 'about-claude/pricing', 'Pricing', 'The per-million-token prices behind every cost note.'),
 ('docs', C + 'costs', 'Manage costs effectively', 'Caps and habits that keep spend predictable.'),
 ('deep', A + 'engineering/demystifying-evals-for-ai-agents', 'Demystifying evals for AI agents', 'Graders, trials and how to grow a suite from real failures.'),
 ('deep', A + 'research/statistical-approach-to-model-evals', 'A statistical approach to model evaluations', 'Why 20 cases need error bars, and how to compare two models fairly.'),
 ('deep', A + 'research/many-shot-jailbreaking', 'Many-shot jailbreaking', 'A long-context attack worth a case in your adversarial set.'),
 ('try', P + 'about-claude/use-case-guides/content-moderation', 'Content moderation', 'A worked guide with its own eval.'),
]

Q[16] = [
 ('docs', P + 'release-notes/overview', 'Release notes (API)', 'The first stop of your monthly routine.'),
 ('docs', H + '12138966', 'Claude app release notes', 'App changes that affect your clients\' workflows.'),
 ('docs', C + 'changelog', 'Claude Code changelog', 'Version-by-version changes.'),
 ('docs', P + 'models/overview', 'Models overview', 'Check names, tiers and limits against your handover doc.'),
 ('docs', P + 'about-claude/model-deprecations', 'Model deprecations', 'What retires, and when.'),
 ('docs', P + 'about-claude/models/migration-guide', 'Upgrade between model versions', 'How to move without breaking things.'),
 ('docs', P + 'about-claude/additional-resources', 'Additional resources', 'Where else Anthropic publishes.'),
 ('deep', A + 'engineering', 'Anthropic engineering blog', 'Subscribe to this for your monthly routine.'),
 ('deep', A + 'research/measuring-agent-autonomy', 'Measuring AI agent autonomy in practice', 'What real use of agents looks like across millions of interactions.'),
 ('deep', A + 'research/agents-judgment-calls', 'How AI agents shape experts\' judgment calls', 'In a trial, analysts followed the agent\'s favoured option 86% of the time. Why you defend your own choices.'),
]

Q[17] = [
 ('docs', P + 'build-with-claude/prompt-caching', 'Prompt caching', 'Breakpoints, lifetime and the usage fields that prove a hit.'),
 ('docs', P + 'build-with-claude/cache-diagnostics', 'Cache diagnostics', 'Find out why a cache missed.'),
 ('docs', P + 'build-with-claude/context-windows', 'Context windows', 'How much fits and what the model does when it fills.'),
 ('docs', P + 'build-with-claude/context-editing', 'Context editing', 'Clear stale tool results automatically.'),
 ('docs', P + 'build-with-claude/compaction', 'Compaction', 'Summarise old turns to keep a long task going.'),
 ('docs', P + 'agents-and-tools/tool-use/memory-tool', 'Memory tool', 'Store notes outside the window.'),
 ('docs', P + 'agents-and-tools/tool-use/tool-use-with-prompt-caching', 'Tool use with prompt caching', 'Keep tool definitions inside the cached prefix.'),
 ('docs', C + 'prompt-caching', 'How Claude Code uses prompt caching', 'A real system built around the prefix rule.'),
 ('deep', A + 'research/effective-context-engineering-for-ai-agents', 'Effective context engineering for AI agents', 'Compaction, notes and sub-agents as context strategies.'),
 ('deep', A + 'research/contextual-retrieval', 'Contextual retrieval', 'Fetch the right chunk, with its context, on demand.'),
 ('try', C + 'context-window', 'Explore the context window', 'See what loads and when.'),
]

Q[18] = [
 ('docs', P + 'build-with-claude/effort', 'Effort', 'The setting you test at low, medium and high.'),
 ('docs', P + 'build-with-claude/thinking', 'Thinking', 'How reasoning tokens work and what they cost.'),
 ('docs', P + 'build-with-claude/thinking-steering-and-cost', 'Steering and cost control', 'Keep reasoning useful without overspending.'),
 ('docs', P + 'build-with-claude/structured-outputs', 'Structured outputs', 'Valid JSON by construction.'),
 ('docs', P + 'agents-and-tools/tool-use/strict-tool-use', 'Strict tool use', 'Guarantee tool inputs match the schema.'),
 ('docs', P + 'agents-and-tools/tool-use/define-tools', 'Define tools', 'Names, descriptions and schemas that get picked correctly.'),
 ('docs', P + 'agents-and-tools/tool-use/parallel-tool-use', 'Parallel tool use', 'Run independent calls at once.'),
 ('docs', P + 'agents-and-tools/tool-use/troubleshooting-tool-use', 'Troubleshooting tool use', 'When Claude picks the wrong tool.'),
 ('deep', A + 'engineering/writing-tools-for-agents', 'Writing effective tools for AI agents', 'Evaluate tools with real tasks, then rewrite descriptions.'),
 ('deep', A + 'engineering/advanced-tool-use', 'Introducing advanced tool use', 'Tool search and programmatic calling for large tool sets.'),
 ('deep', A + 'research/april-23-postmortem', 'An update on Claude Code quality reports', 'A lower default effort made users feel the tool was less capable. Measure before you move a default.'),
 ('deep', A + 'engineering/claude-think-tool', 'The "think" tool', 'A scratchpad that helps in long tool chains.'),
 ('try', P + 'agents-and-tools/tool-use/build-a-tool-using-agent', 'Tutorial: build a tool-using agent', 'Practice tool design end to end.'),
]

Q[19] = [
 ('docs', P + 'test-and-evaluate/develop-tests', 'Define success and build evaluations', 'Criteria, graders and test cases.'),
 ('docs', P + 'manage-claude/opentelemetry', 'OpenTelemetry', 'Traces for requests and tools.'),
 ('docs', P + 'manage-claude/usage-cost-analytics-api', 'Usage and Cost Analytics API', 'Spend and tokens, by model and key.'),
 ('docs', C + 'monitoring-usage', 'Monitoring', 'Metrics and events from Claude Code.'),
 ('docs', C + 'agent-sdk/observability', 'Observability with OpenTelemetry', 'Trace every tool call of your agent.'),
 ('docs', C + 'analytics', 'Track team usage with analytics', 'Adoption and productivity dashboards.'),
 ('deep', A + 'engineering/demystifying-evals-for-ai-agents', 'Demystifying evals for AI agents', 'Held-out sets, graders and turning failures into tests.'),
 ('deep', A + 'engineering/infrastructure-noise', 'Infrastructure noise in agentic coding evals', 'Why the same model scores differently on different setups.'),
 ('deep', A + 'research/statistical-approach-to-model-evals', 'A statistical approach to model evaluations', 'Error bars for honest comparisons.'),
 ('deep', A + 'research/april-23-postmortem', 'An update on Claude Code quality reports', 'A prompt change that weeks of testing missed. A broader suite found a 3 percent drop.'),
 ('deep', A + 'engineering/a-postmortem-of-three-recent-issues', 'A postmortem of three recent issues', 'How quality problems hid until users noticed.'),
 ('try', C + 'plugin-evals', 'Test plugins with evals', 'A suite for something you built.'),
]

Q[20] = [
 ('docs', C + 'sub-agents', 'Create custom subagents', 'One job, scoped tools, its own context.'),
 ('docs', C + 'agent-teams', 'Orchestrate teams of Claude Code sessions', 'Several sessions with a lead.'),
 ('docs', C + 'agents', 'Run agents in parallel', 'Fan out independent work.'),
 ('docs', C + 'workflows', 'Orchestrate subagents at scale with dynamic workflows', 'Code that decides who does what.'),
 ('docs', C + 'goal', 'Keep Claude working toward a goal', 'Long tasks with a stated finish line.'),
 ('docs', C + 'agent-sdk/todo-tracking', 'Track todos', 'A task list the agent keeps current.'),
 ('docs', P + 'build-with-claude/task-budgets', 'Task budgets (beta)', 'Cap what a long task may spend.'),
 ('docs', C + 'agent-sdk/subagents', 'Subagents in the SDK', 'Orchestration from code.'),
 ('deep', A + 'engineering/multi-agent-research-system', 'How we built our multi-agent research system', 'Orchestrator and workers, and the lessons learned.'),
 ('deep', A + 'engineering/effective-harnesses-for-long-running-agents', 'Effective harnesses for long-running agents', 'Progress files and clean handoffs across context windows.'),
 ('deep', A + 'research/harness-design-long-running-apps', 'Harness design for long-running apps', 'The structure around the model that keeps long work on track.'),
 ('deep', A + 'research/multiagent-systems', 'Patterns and problems in multiagent systems', 'Coordination failures to design against.'),
 ('deep', A + 'engineering/building-effective-agents', 'Building effective AI agents', 'Choose the simplest pattern that passes the eval.'),
]

Q[21] = [
 ('docs', C + 'mcp', 'Connect Claude Code to tools via MCP', 'Clients, servers, scopes and transports.'),
 ('docs', P + 'agents-and-tools/remote-mcp-servers', 'Remote MCP servers', 'Run a server others can reach.'),
 ('docs', P + 'agents-and-tools/mcp-connector', 'MCP connector', 'Call remote servers from the API.'),
 ('docs', C + 'managed-mcp', 'Control MCP server access for your organization', 'Allow and deny lists for servers.'),
 ('docs', C + 'plugins/create', 'Create a Claude Code plugin', 'Package skills, agents, hooks and servers.'),
 ('docs', C + 'plugins/publish', 'Publish and distribute a plugin', 'Versioning, release and rollback.'),
 ('docs', C + 'plugins/security', 'Plugin security and trust', 'Review before you list.'),
 ('docs', P + 'agents-and-tools/agent-skills/enterprise', 'Skills for enterprise', 'Govern skills across a company.'),
 ('docs', H + '13119606', 'Provision and manage skills for your organization', 'Roll a skill out to a team.'),
 ('deep', A + 'engineering/code-execution-with-mcp', 'Code execution with MCP', 'Cut token cost by letting agents call tools as code.'),
 ('deep', A + 'engineering/desktop-extensions', 'Desktop Extensions', 'One-click packaging for servers.'),
 ('deep', A + 'news/model-context-protocol', 'Introducing the Model Context Protocol', 'The standard in the founders\' words.'),
 ('deep', A + 'news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation', 'Donating MCP to the Agentic AI Foundation', 'Where the standard lives now.'),
]

Q[22] = [
 ('docs', C + 'security', 'Security', 'The security model of Claude Code in one page.'),
 ('docs', C + 'permissions', 'Configure permissions', 'Allow, ask and deny rules.'),
 ('docs', C + 'permission-modes', 'Choose a permission mode', 'How much autonomy, and what it risks.'),
 ('docs', C + 'sandboxing', 'Configure the sandboxed Bash tool', 'Filesystem and network limits that do not depend on the model.'),
 ('docs', C + 'managed-settings', 'Deploy managed settings', 'Org policy that people cannot override.'),
 ('docs', C + 'network-config', 'Enterprise network configuration', 'Proxies, allowlists and egress.'),
 ('docs', C + 'devcontainer', 'Development containers', 'A disposable box for risky work.'),
 ('docs', C + 'agent-sdk/secure-deployment', 'Securely deploying AI agents', 'Isolation and least privilege for agents you ship.'),
 ('docs', C + 'zero-data-retention', 'Zero data retention', 'What it covers and what it does not.'),
 ('docs', H + '13364135', 'Use Claude Cowork safely', 'What a desktop agent can reach.'),
 ('deep', A + 'engineering/claude-code-sandboxing', 'Making Claude Code safer with sandboxing', 'Isolation that cut permission prompts and held up.'),
 ('deep', A + 'research/claude-code-auto-mode', 'How we built Claude Code auto mode', 'Users accept 93 percent of prompts. Classifiers review what Claude reads and does.'),
 ('deep', A + 'research/prompt-injection-defenses', 'Mitigating prompt injections in browser use', 'Defences, measured as an attack success rate.'),
 ('deep', A + 'research/trustworthy-agents', 'Trustworthy agents in practice', 'Defence in depth across the whole system.'),
 ('deep', A + 'news/our-framework-for-developing-safe-and-trustworthy-agents', 'Our framework for safe and trustworthy agents', 'Human control, transparency and security as principles.'),
]

Q[23] = [
 ('docs', P + 'build-with-claude/batch-processing', 'Batch processing', 'Lower cost for work that can wait.'),
 ('docs', P + 'build-with-claude/prompt-caching', 'Prompt caching', 'The biggest free win for a shared prefix.'),
 ('docs', P + 'test-and-evaluate/strengthen-guardrails/reduce-latency', 'Reducing latency', 'Levers for speed, in order of effort.'),
 ('docs', P + 'build-with-claude/fast-mode', 'Fast mode', 'Pay more for speed when it matters.'),
 ('docs', P + 'api/rate-limits', 'Rate limits', 'Per-minute limits, cache-aware input counting, ramp limits and the monthly spend cap.'),
 ('docs', P + 'api/errors', 'Errors', 'Every status code, the request id and the advice for long requests.'),
 ('docs', P + 'about-claude/pricing', 'Pricing', 'The inputs of your cost model.'),
 ('docs', P + 'build-with-claude/token-counting', 'Token counting', 'Predict spend before you send.'),
 ('docs', P + 'about-claude/models/migration-guide', 'Upgrade between model versions', 'A checklist before you switch.'),
 ('docs', P + 'about-claude/models/optimizing-for-cost-and-intelligence', 'Optimizing for cost and intelligence', 'Where to trade quality for cost.'),
 ('docs', C + 'costs', 'Manage costs effectively', 'Practical limits and habits.'),
 ('deep', A + 'engineering/a-postmortem-of-three-recent-issues', 'A postmortem of three recent issues', 'A reliability story, told plainly.'),
 ('deep', A + 'research/april-23-postmortem', 'An update on Claude Code quality reports', 'Three separate changes behind one complaint.'),
 ('deep', A + 'engineering/infrastructure-noise', 'Infrastructure noise in agentic coding evals', 'Why measurements move for reasons that are not the model.'),
]

Q[24] = [
 ('docs', C + 'agent-sdk/hosting', 'Hosting the Agent SDK', 'Run agents in production.'),
 ('docs', C + 'agent-sdk/secure-deployment', 'Securely deploying AI agents', 'The review list for your security row.'),
 ('docs', C + 'github-actions', 'Claude Code GitHub Actions', 'Run Claude in CI.'),
 ('docs', C + 'admin-setup', 'Set up Claude Code for your organization', 'Rollout steps for a team.'),
 ('docs', C + 'monitoring-usage', 'Monitoring', 'The telemetry your runbook points to.'),
 ('docs', C + 'analytics', 'Track team usage with analytics', 'Evidence for your rollout plan.'),
 ('docs', P + 'about-claude/use-case-guides/overview', 'Use case guides', 'Worked designs to borrow from.'),
 ('deep', A + 'engineering/a-postmortem-of-three-recent-issues', 'A postmortem of three recent issues', 'A model for your own postmortem.'),
 ('deep', A + 'research/april-23-postmortem', 'An update on Claude Code quality reports', 'What happened, what was fixed, what changes.'),
 ('deep', A + 'research/measuring-agent-autonomy', 'Measuring AI agent autonomy in practice', 'Use real numbers when you teach adoption.'),
 ('deep', A + 'research/trustworthy-agents', 'Trustworthy agents in practice', 'Your closing checklist for any system you ship.'),
 ('deep', A + 'research/AI-assistance-coding-skills', 'How AI assistance impacts the formation of coding skills', 'A randomised trial: AI use lowered comprehension unless it was used to build understanding. Read it before you teach.'),
 ('try', C + 'code-review', 'Code Review', 'Add a reviewer to a real pull request.'),
]
