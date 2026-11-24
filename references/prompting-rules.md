# Prompting rules for the Claude 5 family

Verified 17 Nov 2026 against the Claude prompting best practices page (platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices). Models covered: Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5. Recheck the page; model behaviour changes.

## Always

- Be clear and direct. Test: could a colleague with minimal context follow the prompt?
- Use XML tags to separate instructions, context, examples and inputs. Keep tag names consistent and descriptive.
- Use 3 to 5 examples that are relevant and diverse, wrapped in example tags.
- Tell Claude what to do, not what to avoid. Match the style of the prompt to the style you want back: removing markdown from the prompt reduces markdown in the output.
- For inputs over 20k tokens, put the long documents at the top, above the question, instructions and examples. Putting the question at the end can improve quality by up to 30 percent in tests. Wrap each document with source metadata and ask Claude to quote the relevant passages first.
- To get action rather than suggestions, use imperative wording: "change this function", not "can you suggest changes".
- Prefer general instructions such as "think thoroughly" to hand-written step lists.

## Changed on the 5 family

- Prefilling the last assistant turn returns an error from Claude 4.6 and Mythos Preview onward, so on every 5.x model. Earlier models still accept it. Put formatting, preamble and continuation rules in the instructions.
- Use adaptive thinking and the effort setting. A manual thinking budget (`budget_tokens`) returns an error on 4.7 and later.
- Fable 5.2 and Opus 5.5 think regardless of the thinking parameter. To reduce thinking, lower effort; an instruction to answer directly did not stop thinking at medium effort and above on Fable 5.2.
- Sonnet 5.5 and Haiku 5.5 think by default when the parameter is omitted. Select response blocks by type, not position, and leave room in max_tokens.
- On Fable 5.2, Opus 5.5 and Sonnet 5.5, among others, do not ask for reasoning inside thinking tags: the request may be declined, so rely on the model's own thinking. With thinking off, ask for step-by-step reasoning and put the final answer in answer tags.
- Append assistant turns exactly as returned, thinking blocks included. Editing earlier messages, rebuilding the system prompt or tools, or summarising older turns in place invalidates later thinking blocks.
- For any model, add a self-check such as "Before you finish, verify your answer against these criteria". Opus 5 is the exception: it verifies its own work without being told, so remove such lines there. The page lists verification on coding (Sonnet 5.5, Haiku 5.5) and early stopping in long agent prompts (Haiku 5.5) as guide topics without detail. Course advice, not from the page: for Haiku 5.5, state completion criteria in long agent prompts.
- Opus 5 delegates to subagents more readily than earlier models. Say when subagents are and are not worth using. For Fable 5.2 the page lists subagent delegation as a topic but gives no advice.
- Context limits: if compaction will happen, say so and tell Claude not to stop early for token-budget reasons.

## Money and safety

- Anthropic's payments block tells Claude not to release payments itself. It is guidance, not enforcement: require human approval in the tool for anything that moves money.
- Dosing blocks are model-specific. Copy the block for the model you use.

## Before prompt engineering

You need success criteria, a way to test them and a first draft. Prompting fixes only what the prompt controls; some problems need a different model or tool.
