"""Rule cards: the collectible layer. One short, true rule per card, taken from what the session teaches.

Each session has a core card (earned when the session is complete) and a drop card (found in chests and the shop's mystery chest).
Each level has an epic card, earned when its gate is handed in. The album doubles as a revision deck: flip a card to read the rule.

Tuple layout:  (session number or level number, kind, rarity, icon, name, rule)
kind: 'core' | 'drop' | 'epic'   rarity: 'common' | 'rare' | 'epic'
"""

CARDS = [
    (1, 'core', 'common', 'search', 'Fluent is not true', 'A fluent answer is a prediction, not a fact. Check anything that would hurt you if it were wrong.'),
    (1, 'drop', 'common', 'layers', 'The four Ds', 'Delegation, Description, Discernment, Diligence: decide what to hand over, say it clearly, judge the result and own the outcome.'),
    (2, 'core', 'common', 'flag', 'Surface for the job', 'Choose the surface by the job, then check the release notes for what is new and what your plan includes.'),
    (2, 'drop', 'common', 'doc', 'Notes before promises', 'Before you promise a feature to your team, check the release notes and your plan. Many features are beta or plan-limited.'),
    (3, 'core', 'common', 'bolt', 'Cost per finished task', 'Compare models on cost per finished task, not price per token. Retries and tokenizer differences change the maths.'),
    (3, 'drop', 'common', 'target', 'Rubric first', 'Write the scoring rubric before you run the bake-off, so the result cannot bend your criteria.'),
    (4, 'core', 'common', 'target', 'Criteria first', 'Write the success criteria before the prompt. You cannot tell whether a prompt works until you know what working means.'),
    (4, 'drop', 'common', 'pen', 'Fix the right layer', 'Decide whether the weakness is the prompt, the effort level or the model. Fixing the wrong layer wastes the most time.'),
    (5, 'core', 'common', 'search', 'Three piles', 'Keep three piles apart: what the source says, what Claude infers and what lies outside the document.'),
    (5, 'drop', 'common', 'check', 'Verification table', 'Track every claim: claim, source, checked by, status. An unchecked claim stays marked as unchecked.'),
    (6, 'core', 'common', 'doc', 'Format first', 'Pick the format for the job before you prompt: doc, deck, sheet, design or a plain file.'),
    (6, 'drop', 'common', 'search', 'Facts before polish', 'Check content against sources before you polish the formatting. A beautiful deck can carry a wrong number.'),
    (7, 'core', 'common', 'layers', 'Where it lives', 'Know where context lives: chat history, Project instructions and files, memory or an attached file. Each lasts differently.'),
    (7, 'drop', 'common', 'refresh', 'Chat, new chat or Project', 'Decide per task whether to stay in the chat, start a new one or use a Project, and review what memory holds.'),
    (8, 'core', 'common', 'lock', 'Access, not procedure', 'A connector gives Claude access, not procedure. Tell it how the work should be done.'),
    (8, 'drop', 'common', 'gate', 'Approve what writes', 'Require approval on anything that writes, sends or deletes, and set permissions by risk.'),
    (9, 'core', 'common', 'layers', 'Skill or not', 'Decide whether the need calls for a skill, Project instructions, a connector or just a prompt before you build anything.'),
    (9, 'drop', 'common', 'flag', 'Trigger-ready description', 'A skill\'s description decides when Claude reaches for it, so write it to trigger: what it does and when to use it.'),
    (10, 'core', 'common', 'chest', 'A plugin is a bundle', 'A plugin bundles several components, such as skills, agents, hooks and connectors, so a team installs one thing. Check where each part works.'),
    (10, 'drop', 'common', 'warmup', 'Unwatched work', 'A scheduled task runs without you watching. Decide where it runs and what it may touch before you schedule it.'),
    (11, 'core', 'common', 'gate', 'Human before send', 'Put human approval before anything in a workflow that sends or writes.'),
    (11, 'drop', 'common', 'check', 'Validate before use', 'Validate structured output before the next step relies on it, and decide what happens when it is bad.'),
    (12, 'core', 'common', 'check', 'Pass or fail', 'Give Claude Code a check that passes or fails, and ask for the evidence rather than a promise.'),
    (12, 'drop', 'rare', 'doc', 'CLAUDE.md stays short', 'Put only what Claude cannot see in CLAUDE.md, and keep it under 200 lines.'),
    (13, 'core', 'common', 'lock', 'Scope the subagent', 'Give each subagent only the tools and the model it needs.'),
    (13, 'drop', 'rare', 'bolt', 'Hooks always run', 'Use a hook when something must happen every time. It blocks or checks deterministically, which an instruction cannot promise.'),
    (14, 'core', 'common', 'refresh', 'An agent is a loop', 'An agent plans its own steps and calls tools in a loop. If the steps are fixed, a workflow is simpler.'),
    (14, 'drop', 'rare', 'flag', 'Choose the SDK on purpose', 'Choose between the Client SDK, the Agent SDK, the Claude Code CLI and Managed Agents deliberately, not by habit.'),
    (15, 'core', 'common', 'target', 'Measurable or it is a hope', 'Write measurable success criteria and a 20-case eval with edge cases before you trust a change.'),
    (15, 'drop', 'rare', 'lock', 'Guardrails are code', 'Add deterministic guardrails for injection and permission risks. Do not rely on the prompt alone.'),
    (16, 'core', 'common', 'medal', 'Defend every choice', 'Be ready to defend each design choice: model, effort, skills, connectors and permissions.'),
    (16, 'drop', 'rare', 'refresh', 'Monthly routine', 'Run a monthly update routine: release notes, model lifecycle, prices and your own failure log.'),
    (17, 'core', 'common', 'layers', 'Context budget', 'Budget context: what is always loaded, what is fetched on demand and what is dropped.'),
    (17, 'drop', 'rare', 'bolt', 'Stable prefix first', 'Put the stable part of the prompt first and place the cache breakpoint after it. Check cache_read_input_tokens to confirm hits.'),
    (18, 'core', 'common', 'target', 'Measure, do not default', 'Set effort and max_tokens from measured results, not from defaults.'),
    (18, 'drop', 'rare', 'check', 'Valid by construction', 'Use structured outputs or strict tool use when the next step needs guaranteed-valid JSON.'),
    (19, 'core', 'common', 'search', 'Failures become tests', 'Turn each real production failure into a new eval case, and keep a held-out set.'),
    (19, 'drop', 'rare', 'user', 'Test the grader', 'Test an LLM grader against human judgments before you trust its scores.'),
    (20, 'core', 'common', 'layers', 'Simplest pattern', 'Choose the simplest pattern that passes the eval: a single call, then a workflow, then an agent.'),
    (20, 'drop', 'rare', 'flag', 'Long-horizon work', 'For long-horizon work keep a progress file, checkpoints and a handoff note.'),
    (21, 'core', 'common', 'lock', 'Minimum scopes', 'Secure an MCP server with token validation and minimum scopes, and never pass a client\'s token through.'),
    (21, 'drop', 'rare', 'chest', 'Version before you ship', 'Package, evaluate and version skills and plugins before you distribute them to a team.'),
    (22, 'core', 'common', 'lock', 'Threat-model first', 'Threat-model an agent: the untrusted inputs, the powerful tools and the data they can reach.'),
    (22, 'drop', 'rare', 'gate', 'Defence in layers', 'Enforce defences with permissions, sandboxing, hooks and managed settings, not with prompt wording alone.'),
    (23, 'core', 'common', 'bolt', 'Free wins first', 'Cut cost with the free wins before the trade-offs, and build a cost model per run and per month.'),
    (23, 'drop', 'rare', 'refresh', 'Migrate by eval', 'Migrate to a new model by running your eval, not by trusting the name.'),
    (24, 'core', 'common', 'medal', 'Runbook before incident', 'Write the runbook before the incident: how to find, contain and fix a live failure.'),
    (24, 'drop', 'rare', 'user', 'Teach it', 'Teaching one session of the course shows you exactly what you still do not understand.'),
    (1, 'epic', 'epic', 'star', 'The Foundations Rule', 'Know what the model is doing, choose it on evidence and write the criteria before the work.'),
    (2, 'epic', 'epic', 'star', 'The Practitioner Rule', 'Criteria first, evidence for every claim, and context placed where it belongs.'),
    (3, 'epic', 'epic', 'star', 'The Integrator\'s Rule', 'Access with approval where it writes, procedure in skills, and a check on every output.'),
    (4, 'epic', 'epic', 'star', 'The Operator\'s Rule', 'A pass-or-fail check, a scoped agent and a measured cost before it runs unattended.'),
    (5, 'epic', 'epic', 'star', 'The Expert\'s Rule', 'The simplest pattern that passes the eval, defended in layers and changed only by evidence.'),
]

KEYS = ('n', 'kind', 'rarity', 'icon', 'name', 'rule')
ICONS = {'learn', 'demo', 'practice', 'recall', 'task', 'case', 'question', 'gate', 'flame', 'bolt', 'star', 'medal', 'flag', 'search', 'doc', 'user', 'target', 'pen', 'layers', 'refresh', 'lock', 'chest', 'warmup', 'pretest', 'check'}


def load():
    """Returns the cards as dicts with ids c01..c53 (core and drop by session, then epic by level)."""
    out = []
    for i, (n, kind, rar, icon, name, rule) in enumerate(CARDS):
        out.append(dict(id='c%02d' % (i + 1), n=n, k=kind, r=rar, i=icon, t=name, w=rule))
    return out


def validate(cards):
    errs = []
    core = [c for c in cards if c['k'] == 'core']
    drop = [c for c in cards if c['k'] == 'drop']
    epic = [c for c in cards if c['k'] == 'epic']
    if sorted(c['n'] for c in core) != list(range(1, 25)): errs.append('need exactly one core card per session 1..24')
    if sorted(c['n'] for c in drop) != list(range(1, 25)): errs.append('need exactly one drop card per session 1..24')
    if sorted(c['n'] for c in epic) != list(range(1, 6)): errs.append('need exactly one epic card per level 1..5')
    names = set()
    for c in cards:
        if c['i'] not in ICONS: errs.append('unknown icon %s on %s' % (c['i'], c['t']))
        if c['t'] in names: errs.append('duplicate name ' + c['t'])
        names.add(c['t'])
        if len(c['t']) > 32: errs.append('name too long: ' + c['t'])
        if not (30 <= len(c['w']) <= 190): errs.append('rule length %d on %s' % (len(c['w']), c['t']))
        if not c['w'].endswith('.'): errs.append('rule should end with a full stop: ' + c['t'])
        if '—' in c['w'] or '–' in c['w'] or ' -- ' in c['w']: errs.append('dash style on ' + c['t'])
        if c['k'] == 'epic' and c['r'] != 'epic': errs.append('epic cards are epic')
        if c['k'] == 'core' and c['r'] != 'common': errs.append('core cards are common')
        if c['k'] == 'drop' and c['r'] not in ('common', 'rare'): errs.append('drop cards are common or rare')
    return errs


if __name__ == '__main__':
    cs = load()
    e = validate(cs)
    print(len(cs), 'cards;', 'errors:' if e else 'ok', *e)
