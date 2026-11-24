# Teaching model: fluency, signature moves and the question-it check

Verified 17 Nov 2026 against Anthropic's tutorials "The AI Fluency Index" and "Getting good at Claude: a research-backed curriculum" (academy.claude.com/tutorials). Features and findings change; re-read the source before quoting numbers.

## The 4D framework

Delegation, Description, Discernment, Diligence. Delegation decides what to hand to Claude. Description says clearly what you want. Discernment judges what comes back. Diligence is responsibility for how the output is used.

## What the Fluency Index found (9,830 conversations, one week in January 2026)

| Behaviour | Share of conversations |
|---|---|
| Iterates and refines | 85.7 percent |
| Clarifies the goal before asking for help | 51.1 percent |
| Gives examples of what good looks like | 41.1 percent |
| Specifies format and structure | 30 percent |
| Sets the interaction mode (for example "push back on my assumptions") | 30 percent |
| Communicates tone and style | 22.7 percent |
| Identifies when the AI might be missing context | 20.3 percent |
| Defines the audience | 17.6 percent |
| Questions the reasoning when it does not hold up | 15.8 percent |
| Consults the AI on approach before executing | 10.1 percent |
| Checks facts and claims that matter | 8.7 percent |

- Conversations that iterate show 2.67 further fluency behaviours on average, against 1.33 for conversations that do not. They are 5.6 times more likely to question the reasoning and 4 times more likely to spot missing context.
- When Claude produces an artifact (12.3 percent of conversations), people direct more (clarifying goals, specifying format, giving examples) but question and verify less: checking facts fell to 5.5 percent from 9.2, identifying missing context to 15.8 from 21, questioning reasoning to 13 from 16.2.
- Anthropic's recommendations to users: stay in the conversation, question polished outputs, and set the terms of collaboration up front.
- Caveat from the report: the sample reflects Claude.ai users in one week, so treat the numbers as a baseline, not a population estimate.

## The curriculum model

1. Teach the signature move first. Chat: iterate. Claude Code and Claude Cowork: clarify the goal before Claude starts.
2. Advance along the Description spectrum.
3. Revisit Discernment at every step. Close each learning experience with a Discernment check: "now question it".

Research behind it: Description skills grow with practice and exposure. Discernment skills do not grow with tenure and do not transfer from feature familiarity. Observational checks (skimming output, reviewing a diff, running a test) catch some errors but miss wrong assumptions, missing context and plausible-but-false claims. If training time is limited, spend it on Discernment.

### Description spectrum, by durability

| Level | What it shapes | Chat | Claude Code | Claude Cowork |
|---|---|---|---|---|
| Basic | One response | Iteration, model choice, file uploads, web search | Prompt clarity, file references, model choice | A self-contained first prompt, model choice, output review |
| Middle | A reusable capability | Artifacts, extended thinking, connectors | Skills, slash commands, MCP | Connectors, plugins, skills |
| Lasting | Every later response | Projects, custom instructions, memory | CLAUDE.md, hooks, subagents | Scheduled workflows, multi-step automations |

### Discernment check by product (Anthropic's wording, condensed)

| Product | Basic | Middle | Lasting |
|---|---|---|---|
| Chat | Is the response usable, or does it need another turn? | Does the reasoning hold, or did Claude just sound confident? | Is the Project supplying the right context, or just more context? |
| Claude Code | Before accepting the diff, ask Claude what it assumed | Test the capability on a case it might get wrong | Audit the configuration: is Claude using it as expected? |
| Claude Cowork | Before using it, ask what would make it wrong | Did the connector pull what was needed, or what was easy to find? | When did you last verify this workflow still produces good work? |

## How this course uses it

Every session ends with a "Now question it" check (the exit-ticket slide). The 24 prompts are listed in `session-closers.md`. A learner who skips the check has skipped the part that does not improve with experience.
