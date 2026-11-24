# Skill authoring rules

Verified 17 Nov 2026 against the Agent Skills best practices page (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices). Check the page for changes.

## Frontmatter and size

- name: up to 64 characters, lowercase letters, numbers and hyphens, no XML tags, and it cannot contain "anthropic" or "claude".
- description: required, up to 1,024 characters, no XML tags.
- The SKILL.md body stays under 500 lines. Move longer material into separate files.

## Naming

- Prefer the gerund form (verb plus -ing), such as processing-pdfs or writing-documentation. A noun phrase or action name is acceptable.
- Avoid vague names (helper, utils, data, files) and reserved words. Keep one pattern across a collection.

## Description

- Write in the third person. The description is injected into the system prompt, so "Processes Excel files and builds charts" works and "I can help you" does not.
- State what the skill does and when to use it, with the trigger words a user would actually say. "Helps with documents" fails.

## Progressive disclosure

- Only the name and description load at startup. Claude reads SKILL.md when the skill is relevant and other files only when needed.
- Keep references one level deep from SKILL.md. Nested references can be read partially.
- Give any reference file over 100 lines a table of contents.
- Organise reference files by domain so Claude loads only the relevant one.
- Use forward slashes in paths.

## Content

- Include only what Claude does not already know. Challenge every paragraph's token cost.
- Match specificity to fragility: give freedom for judgement tasks and exact scripts for fragile operations.
- Offer one default with an escape hatch, not a menu of options.
- Scripts handle errors explicitly. No unexplained constants. For destructive or high-stakes steps use plan, validate, execute, verify.
- Course advice, not from the page: do not put credentials in a skill, because everyone you share it with receives the files.

## Evaluation first

1. Run Claude on representative tasks without the skill and note where it fails.
2. Write at least three evaluation scenarios, each with the query, any files and the expected behaviour.
3. Measure the baseline without the skill.
4. Write the minimum instructions that close the gaps.
5. Compare with the baseline and iterate.

Use one Claude instance to design the skill and a fresh instance to use it, and refine from what the fresh one does.

## Test across models

Test with every model you plan to use. Haiku may need more explicit guidance; Opus may be over-explained by the same text. Test with real tasks, not only synthetic ones.

## Platform differences

On claude.ai a skill can install packages from npm and PyPI; on the Claude API it has no network access and no runtime package installation. List the packages a skill needs and check they exist where it runs. Course advice, not from the page: use only skills you wrote or that come from Anthropic, and read every file of any other skill before use.
