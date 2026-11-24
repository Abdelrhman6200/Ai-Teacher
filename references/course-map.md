# Course map

Contents: levels and points, sessions table, goals and outcomes by session.

## Levels

| Level | Sessions | Points per deliverable | Gate |
|---|---|---|---|
| Level 1: Foundations (0 to 25) | 1, 2, 3 | 8, 8, 9 | Model-choice sheet (session 3) |
| Level 2: Practitioner (25 to 50) | 4, 5, 6, 7 | 6, 6, 6, 7 | Working Project with the doc, deck, sheet and verification log (session 7) |
| Level 3: Builder (50 to 75) | 8, 9, 10, 11 | 6, 6, 6, 7 | The workflow running on a schedule (session 11) |
| Level 4: Operator (75 to 100) | 12, 13, 14, 15, 16 | 5 each | Capstone and handover doc (session 16) |
| Level 5: Expert (beyond 100) | 17, 18, 19, 20, 21, 22, 23, 24 | Pass or fail | Production system, runbook and postmortem (session 24) |

Levels 1 to 4 are worth 25 points each, so passing all four reaches 100. Level 5 is the expert track beyond 100 and is pass or fail. A level is not passed until its gate deliverable passes, whatever the point total. The instructor grades; nothing in this plugin awards points.

## Sessions

| # | Level | Session | Deliverable | Worth | Gate |
|---|---|---|---|---|---|
| 1 | L1 | How AI models work and fail | Failure log with five entries. | 8 points |  |
| 2 | L1 | The Claude landscape | Surface chooser sheet. | 8 points |  |
| 3 | L1 | Choosing models and effort | Model-choice sheet: default model per task type, escalation rule, scored evidence. | 9 points | GATE |
| 4 | L2 | Prompting that meets success criteria | Prompt library: 5 before and after pairs with criteria and scores. | 6 points |  |
| 5 | L2 | Documents, research and verification | Research brief with its verification table. | 6 points |  |
| 6 | L2 | Producing docs, decks, sheets and designs | Doc, deck and sheet from one brief. | 6 points |  |
| 7 | L2 | Projects, memory and context | Working Project for the learner's real job, plus the doc, deck, sheet and verification log from sessions 5 and 6. | 7 points | GATE |
| 8 | L3 | Connectors and MCP | Cross-app task run and the injection test log. | 6 points |  |
| 9 | L3 | Skills | Two tested skills with their trigger matrix and baseline scores. | 6 points |  |
| 10 | L3 | Plugins, Cowork and scheduled work | A packaged plugin and one scheduled recurring task with its failure check. | 6 points |  |
| 11 | L3 | Claude inside workflows | The workflow running on a schedule, with the skills of session 9 and the plugin of session 10. | 7 points | GATE |
| 12 | L4 | Claude Code fundamentals | A small project shipped with tests and a CLAUDE.md. | 5 points |  |
| 13 | L4 | Claude Code extended | A .claude folder with one subagent and one hook, plus a log of one headless run. | 5 points |  |
| 14 | L4 | Agents and the Agent SDK | A working SDK agent and a one-page team design. | 5 points |  |
| 15 | L4 | Evals, safety and cost | A 20-case eval, an injection test log and a cost note. | 5 points |  |
| 16 | L4 | Capstone and staying current | Capstone and handover doc. | 5 points | GATE |
| 17 | L5 | Context engineering and prompt caching | A one-page context budget and a cache test showing the usage fields before and after. | pass or fail, no points |  |
| 18 | L5 | Reasoning control, structured outputs and tool design | An effort test table, a schema-enforced extractor and a tested tool set. | pass or fail, no points |  |
| 19 | L5 | Production evals and observability | An eval suite with a held-out score, an LLM-grader check and a tracing setup. | pass or fail, no points |  |
| 20 | L5 | Agent architectures and orchestration | An architecture decision record and one orchestrated task with enforced limits and a tested handoff. | pass or fail, no points |  |
| 21 | L5 | MCP servers, skills and plugins at scale | A tested MCP server with authentication, and a versioned plugin with skill evaluations. | pass or fail, no points |  |
| 22 | L5 | Security and governance | A threat model, an injection test report, managed settings and a rollout plan. | pass or fail, no points |  |
| 23 | L5 | Cost, latency and reliability engineering | A cost model, a before-and-after optimisation table, a reliability test and a model upgrade decision. | pass or fail, no points |  |
| 24 | L5 | Expert capstone: ship, drill, teach | A production system, runbook, postmortem and a taught session. | pass or fail, no points | GATE |

## Goals and outcomes

### Session 1: How AI models work and fail

**Goal.** The learner can predict where a model is reliable and where it will fail, and checks before trusting.

**You will be able to:**
- Explain next-token prediction in one sentence and say what it implies about errors
- Separate what a model knows (training), what it holds right now (context) and what it is told (instructions)
- Name the five limits: prediction, knowledge, working memory, steerability, context size
- Apply the 4D framework: Delegation, Description, Discernment, Diligence

### Session 2: The Claude landscape

**Goal.** The learner picks the right Claude surface for a task and has every account and app set up.

**You will be able to:**
- Name the main surfaces and what each is for
- Map six tasks to the right surface and defend the choice
- Find what is new and what is plan-limited using the release notes

### Session 3: Choosing models and effort

**Goal.** The learner picks a model and effort level from evidence, not from the name.

**You will be able to:**
- Describe each current tier and what Anthropic positions it for
- Choose between the two starting approaches (capability-first from Opus 5.5, efficiency-first from Haiku 5.5) and tune effort before switching model
- Run a scored model bake-off with a rubric written beforehand
- Check a model's lifecycle before depending on it

### Session 4: Prompting that meets success criteria

**Goal.** The learner writes prompts that produce usable output the first time, and tests them against criteria.

**You will be able to:**
- Write success criteria before writing the prompt
- Apply the core techniques: clear and direct, context and motivation, examples, XML structure, role, long-context placement, output format
- Decide whether a problem needs a better prompt, a different effort level or a different model
- Turn a working prompt into a reusable template with variables

### Session 5: Documents, research and verification

**Goal.** The learner turns a pile of sources into a brief in which every claim has been checked.

**You will be able to:**
- Load long documents and ask in a way that surfaces evidence
- Separate what a source says, what Claude infers and what lies outside the sources
- Build a verification table: claim, source, checked by, status
- Catch premise errors and unsupported citations

### Session 6: Producing docs, decks, sheets and designs

**Goal.** From one brief, the learner delivers finished work in the right format.

**You will be able to:**
- Choose the format for the job: doc, deck, sheet, design, whiteboard or a plain file
- Write a brief that yields a usable first version
- Edit, iterate and export
- Check content against sources before formatting

### Session 7: Projects, memory and context

**Goal.** The learner builds a Project that carries their job context, and knows when to start fresh.

**You will be able to:**
- Distinguish chat history, Project instructions and files, memory, and attached files
- Write Project instructions that hold standing context and output rules
- Decide per task: same chat, new chat or Project
- Review and correct what memory holds, and set memory options deliberately

### Session 8: Connectors and MCP

**Goal.** The learner connects Claude to their real tools safely and runs a task across them.

**You will be able to:**
- Explain what a connector gives Claude (access) and what it does not (procedure)
- Add a connector, enable it per conversation and set tool permissions
- Run a cross-app task with approval on anything that writes
- Run an injection test and set permissions by risk

### Session 9: Skills

**Goal.** The learner writes skills that trigger reliably and measurably improve the output.

**You will be able to:**
- Decide whether a need calls for a skill, Project instructions, a connector or just a prompt
- Write a SKILL.md with valid frontmatter and a trigger-ready description
- Add a reference file and a script, then test triggering
- Package, install, share, and review third-party skills for safety

### Session 10: Plugins, Cowork and scheduled work

**Goal.** The learner packages skills and connectors into a plugin and runs recurring work without being present.

**You will be able to:**
- Explain what a plugin bundles and where each component works
- Install, disable, remove and update a plugin safely
- Build and share a small plugin
- Create a scheduled task and decide where it runs

### Session 11: Claude inside workflows

**Goal.** The learner puts Claude into a no-code or low-code workflow with routing, validation and approval, and has made one API call by hand.

**You will be able to:**
- Make an API call and read its parts: model ID, max tokens, messages, effort
- Design a workflow: trigger, classify, draft, human check, act, log
- Validate structured output and handle bad output
- Place human approval before anything that sends or writes

### Session 12: Claude Code fundamentals

**Goal.** The learner ships a small real project with Claude Code, with a check Claude can run on its own work.

**You will be able to:**
- Install Claude Code on one surface and run a first task
- Write a short CLAUDE.md that holds only what Claude cannot see
- Give Claude a pass or fail check and ask for evidence
- Plan first, then build, and keep context under control

### Session 13: Claude Code extended

**Goal.** The learner configures a project so rules are enforced, work is delegated and runs can happen unattended.

**You will be able to:**
- Write a subagent with scoped tools and a model
- Write a hook that blocks an action and a hook that runs a check
- Run Claude headless with limits
- Add a project skill and an MCP server, and see their cost in context

### Session 14: Agents and the Agent SDK

**Goal.** The learner builds a working agent and can choose the right route to build one.

**You will be able to:**
- Define an agent as something that plans its own steps and calls tools in a loop
- Choose among the Client SDK, the Agent SDK, the Claude Code CLI and Managed Agents
- Build an agent with the Agent SDK that has tools, permissions, a subagent and a hook
- Design a small team: a manager and role agents with scoped tools

### Session 15: Evals, safety and cost

**Goal.** The learner proves the agent works, limits what it can break and knows what it costs.

**You will be able to:**
- Write measurable success criteria and a 20-case eval with edge cases
- Choose a grading method: code, LLM or human
- Run an injection and permission test and add deterministic guardrails
- Estimate and cap cost, and compare models on the eval

### Session 16: Capstone and staying current

**Goal.** The learner ships a capstone and sets up the habit that keeps the skills current.

**You will be able to:**
- Deliver a capstone with its eval, cost note and handover doc
- Defend each design choice: model, effort, skills, connectors, permissions
- Run a monthly update routine

### Session 17: Context engineering and prompt caching

**Goal.** The learner designs a context budget for a long-running workload and cuts its cost and drift with caching, compaction and just-in-time retrieval.

**You will be able to:**
- Design a context budget: what is always loaded, what is fetched on demand and what is dropped
- Place cache breakpoints so the stable prefix is reused, and verify hits from the usage fields
- Choose between context editing, compaction, memory and sub-agents for a task that overflows

### Session 18: Reasoning control, structured outputs and tool design

**Goal.** The learner controls how much Claude thinks, forces machine-readable output and designs tools that an agent picks and uses correctly.

**You will be able to:**
- Set effort and max_tokens for a task from measured results, not from defaults
- Return guaranteed-valid JSON with structured outputs or strict tool use
- Write tool definitions and a tool set that an agent selects correctly

### Session 19: Production evals and observability

**Goal.** The learner builds an eval suite that gates every change and wires tracing so a production failure can be found and turned into a test.

**You will be able to:**
- Build an eval with graded trials, real failures and a held-out set
- Choose graders (code, LLM, human) and test an LLM grader against human grades
- Trace requests, tools and cost, and turn a production failure into a new test

### Session 20: Agent architectures and orchestration

**Goal.** The learner chooses between a workflow and an agent, designs a multi-agent system with enforced limits, and runs long work across context windows.

**You will be able to:**
- Choose the simplest pattern that passes the eval: single call, workflow or agent
- Design an orchestrator with sub-agents, each with its own permissions and budget
- Run long-horizon work with a progress file, checkpoints and a handoff

### Session 21: MCP servers, skills and plugins at scale

**Goal.** The learner builds a secure MCP server, packages skills and a plugin for a team, and evaluates them before release.

**You will be able to:**
- Build an MCP server with tools, resources and prompts over the right transport
- Secure it: token validation, minimum scopes, no token passthrough and a tested rejection
- Package, evaluate and version skills and a plugin for team distribution

### Session 22: Security and governance

**Goal.** The learner threat-models an agent, enforces defences that hold when the model is fooled, and rolls Claude out to a team with policy, monitoring and an audit trail.

**You will be able to:**
- Threat-model an agent: untrusted inputs, powerful tools and the data they can reach
- Enforce defences with permissions, sandboxing, hooks and managed settings
- Plan a team rollout: identity, policy, monitoring, spend limits and an audit trail

### Session 23: Cost, latency and reliability engineering

**Goal.** The learner cuts cost and latency without losing quality, keeps the system working through failures and limits, and upgrades models by test.

**You will be able to:**
- Build a cost model per run and per month, and cut it with free wins before trade-offs
- Keep a system reliable under rate limits, errors and timeouts
- Migrate to a new model by running the eval, not by trusting the name

### Session 24: Expert capstone: ship, drill, teach

**Goal.** The learner ships a production-ready system with eval, tracing, cost, security and a runbook, survives a failure drill and teaches the stack to someone else.

**You will be able to:**
- Deliver a production system with its eval suite, tracing, cost model and security review
- Write a runbook, then find, contain and fix a live failure and write the postmortem
- Lead adoption: teach one session of the course and write a team rollout plan
