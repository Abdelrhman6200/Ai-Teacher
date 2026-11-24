import re, json, sys
import os
REF = os.environ.get('Z100_REFERENCES') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'references')

# Why lines missing from the quiz files, taken from the session notes (key points / matching items).
WHY_PATCH = {
 's01q1': "A model predicts likely text, so a fluent answer is not evidence that it is true.",
 's02q1': "The Agent SDK embeds Claude Code's agent in your own Python or TypeScript app.",
 's02q2': "Rollouts are gradual and many features are beta or plan-limited, so check the release notes and your plan first.",
 's03q1': "Haiku 5.5 is positioned for classification, extraction and routing at volume, where latency matters.",
 's03q3': "Mythos 5.2 offers the same capabilities as Fable 5.2, but only to organizations verified through Anthropic's verification programs.",
 's03q4': "If a model overthinks, lower the effort level rather than adding instructions.",
}

SESSIONS = {
 1: dict(title="How AI models work and fail", deliverable="Failure log with five entries", points=8,
   tips=dict(
     A=["A model writes one token at a time by predicting what comes next. Fluent does not mean true.",
        "Training stops at a cutoff date. Context is what the model can see right now.",
        "A long context is not perfect recall. Everything in the window competes for attention."],
     B=["Five limits explain most failures: prediction, knowledge, working memory, steerability, context size.",
        "The 4D framework: Delegation, Description, Discernment, Diligence."],
     C=["Type the missing word, then match each limit to a failure you would actually see."]),
   closer="Which of your five failures would you have missed if the answer had looked polished? Name the check that would have caught it."),
 2: dict(title="The Claude landscape", deliverable="Surface chooser sheet", points=8,
   tips=dict(
     A=["The Claude app on web, desktop and mobile is where most people work. Artifacts are on every plan, including Free.",
        "Since 16 September 2026, everything Cowork does is available from any conversation.",
        "Claude Code is an agentic coding tool that reads a codebase, edits files and runs commands."],
     B=["The Platform is for building: Client SDK, Agent SDK and Managed Agents.",
        "Rollouts are gradual and many features start in beta or on specific plans."],
     C=["Match each build route to its purpose, then fill in the two facts you will use most."]),
   closer="Which choice did you make because a surface was familiar, not because it fits? Ask Claude what would make your pick wrong."),
 3: dict(title="Choosing models and effort", deliverable="Model-choice sheet", points=9,
   tips=dict(
     A=["Fable 5.2 is for demanding reasoning and long-horizon agentic work. Opus 5.5 is for knowledge work and long-running agentic coding.",
        "Sonnet 5.5 combines speed and intelligence. Haiku 5.5 is for high-volume, latency-sensitive work such as classification, extraction and routing.",
        "Two ways to start. Capability-first begins at Opus 5.5. Efficiency-first begins at Haiku 5.5 and upgrades only where there is a specific gap."],
     B=["Effort trades intelligence for latency and cost within one model. Tune it before you switch models.",
        "Every model has a lifecycle: active, deprecated or retired. A retired model ID stops working.",
        "Test on your own prompts and data, with a rubric written before you run anything."],
     C=["Match each tier to its job, then fill in the starting points."]),
   closer="Which row of your sheet rests on a model name, not a score? Re-run one cell blind."),
}

def parse(n):
    txt = open(f'{REF}/quizzes/s{n:02d}.md').read()
    blocks = re.split(r'^## ', txt, flags=re.M)
    mcq, fill, match = [], [], None
    for b in blocks[1:]:
        head, _, body = b.partition('\n')
        head = head.strip()
        lines = [l.rstrip() for l in body.strip().split('\n')]
        if re.fullmatch(r'Q\d+', head):
            qn = int(head[1:])
            stem = []; opts = []; key = None; why = None
            for l in lines:
                m = re.match(r'- ([A-D])\. (.*)', l)
                if m: opts.append([m.group(1), m.group(2).strip()]); continue
                m = re.match(r'Key: ([A-D])\.(?: Why: (.*))?', l)
                if m: key = m.group(1); why = (m.group(2) or '').strip() or None; continue
                if l.strip(): stem.append(l.strip())
            for o in opts:
                if o[1].endswith('.') and '. ' not in o[1]: o[1] = o[1][:-1]
            qid = f's{n:02d}q{qn}'
            why = why or WHY_PATCH.get(qid)
            assert len(opts) == 4 and key and stem, (qid, opts, key, stem)
            mcq.append(dict(id=qid, stem=' '.join(stem), options=[dict(k=k, t=t) for k, t in opts], key=key, why=why))
        elif head.startswith('Fill'):
            i = 0
            for l in lines:
                if not l.startswith('- '): continue
                s, _, k = l[2:].partition(' Key: ')
                answers = [a.strip() for a in k.split(';')]
                assert s.count('____') == len(answers), (s, answers)
                i += 1
                fill.append(dict(id=f's{n:02d}f{i}', stem=s.strip(), answers=answers))
        elif head == 'Matching':
            prompt = next(l for l in lines if l and not l.startswith('- '))
            pairs = [l[2:].split(' = ', 1) for l in lines if l.startswith('- ') and ' = ' in l]
            match = dict(id=f's{n:02d}m', prompt=prompt, pairs=pairs)
    assert len(mcq) == 10 and fill
    return mcq, fill, match

def build():
    sessions = []
    for n, meta in SESSIONS.items():
        mcq, fill, match = parse(n)
        sessions.append(dict(id=f's{n:02d}', n=n, **meta, mcq=mcq, fill=fill, match=match))
    gate = dict(
      title="Model-choice sheet",
      brief="Default model per task type, escalation rule, scored evidence.",
      criteria=[
        ["Real task", "Done on a task from your own job, not a toy example"],
        ["Criteria first", "Success criteria written before the work and measurable"],
        ["Evidence", "A verification log or eval showing the output was checked"],
        ["Safety", "Permissions scoped, approval before anything is sent or written outside"],
        ["Choices", "Model, effort and tools justified from results, not from names"],
        ["Own explanation", "You explain each choice without asking Claude"]])
    return dict(level=dict(id='L1', title='Foundations', range='0 to 25'), sessions=sessions, gate=gate)

if __name__ == '__main__':
    d = build()
    json.dump(d, open('data.json', 'w'), indent=1, ensure_ascii=False)
    print(sum(len(s['mcq']) for s in d['sessions']), 'mcq;', sum(len(s['fill']) for s in d['sessions']), 'fill;', len(d['sessions']), 'sessions')
    for s in d['sessions']:
        print(s['id'], ''.join(q['key'] for q in s['mcq']), [q['id'] for q in s['mcq'] if not q['why']])
