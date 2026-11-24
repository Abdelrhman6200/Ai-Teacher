# Now question it: the closing check for each session

Contents: why it exists, the 24 prompts.

## Why it exists

Anthropic's curriculum research finds that Description skills grow with practice but Discernment does not grow with tenure. Every session therefore ends by questioning what Claude produced. A good answer names a specific check you would run, not "I would double-check".

## The prompts

| Session | Name | Now question it |
|---|---|---|
| 1 | How AI models work and fail | Which of your five failures would you have missed if the answer had looked polished? Name the check that would have caught it. |
| 2 | The Claude landscape | Which choice did you make because a surface was familiar, not because it fits? Ask Claude what would make your pick wrong. |
| 3 | Choosing models and effort | Which row of your sheet rests on a model name, not a score? Re-run one cell blind. |
| 4 | Prompting that meets success criteria | Ask Claude what it assumed in each prompt. Which assumption was wrong, and which criterion would have caught it? |
| 5 | Documents, research and verification | Take the claim you trust most and try to disprove it from the source. Did the source say it? |
| 6 | Producing docs, decks, sheets and designs | Before you send it, ask what would make this document wrong. Check that one thing. |
| 7 | Projects, memory and context | Is the Project supplying the right context or just more context? Remove one file and see whether the output changes. |
| 8 | Connectors and MCP | Did the connector pull what you needed or what was easy to find? Check one record against the source app. |
| 9 | Skills | Test the skill on a case it might get wrong. What did it do? |
| 10 | Plugins, Cowork and scheduled work | When did you last verify that this task still produces good work? Open the latest output and judge it. |
| 11 | Claude inside workflows | Which step would fail silently? Add a check there, then break it on purpose. |
| 12 | Claude Code fundamentals | Before accepting the diff, ask Claude what it assumed. Which assumption would your tests not catch? |
| 13 | Claude Code extended | Audit your configuration: is Claude using the subagent and the hook as you expect? Show the log line that proves it. |
| 14 | Agents and the Agent SDK | Which decision does the agent make without evidence? Make it show the evidence, then check it. |
| 15 | Evals, safety and cost | Which of your 20 cases would a lucky wrong answer still pass? Tighten that grader. |
| 16 | Capstone and staying current | Hand the doc to someone else. Where do they get stuck? That is your next fix. |
| 17 | Context engineering and prompt caching | Which part of your stable prefix changes more often than you think? Find it with cache diagnostics. |
| 18 | Reasoning control, structured outputs and tool design | Did higher effort improve the score on your cases, or only the length? Show the table. |
| 19 | Production evals and observability | Which failure in real traffic would your held-out set have missed? |
| 20 | Agent architectures and orchestration | What does your decision record say you rejected, and what evidence would change your mind? |
| 21 | MCP servers, skills and plugins at scale | What can your server do that a caller should not be able to ask for? Try it. |
| 22 | Security and governance | Which control in your report is advice and not enforcement? Replace it or accept the risk in writing. |
| 23 | Cost, latency and reliability engineering | Which saving did you measure and which did you assume? Mark the assumed ones. |
| 24 | Expert capstone: ship, drill, teach | What did the drill teach you that your tests did not? Add it to the suite. |
