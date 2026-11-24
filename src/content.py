"""Builds the full course data for the practice app.
Facts come from the session notes, quiz files and model answers in the learner kit.
Tables, vocabulary, cheat sheets, cases and exit prompts are parsed from those files, not retyped.
Teaching cards, checks and exercises are authored here.
"""
import re, json
import os
REF = os.environ.get('Z100_REFERENCES') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'references')
LETTERS = 'ABCDE'

# ---------------------------------------------------------------- markdown parsing
def read(path):
    return open(path, encoding='utf-8').read()

def sections(md):
    out, cur, buf = {}, None, []
    for line in md.split('\n'):
        if line.startswith('## '):
            if cur: out[cur] = '\n'.join(buf).strip('\n')
            cur, buf = line[3:].strip(), []
        elif cur is not None:
            buf.append(line)
    if cur: out[cur] = '\n'.join(buf).strip('\n')
    return out

def cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]

def table(text):
    rows = [cells(l) for l in text.split('\n') if l.strip().startswith('|')]
    rows = [r for r in rows if not all(re.fullmatch(r':?-{3,}:?', c) for c in r)]
    return dict(headers=rows[0], rows=rows[1:])

def bullets(text):
    return [l[2:].strip() for l in text.split('\n') if l.startswith('- ')]

def numbered(text):
    return [re.sub(r'^\d+\.\s*', '', l).strip() for l in text.split('\n') if re.match(r'\d+\.\s', l)]

def blocks(text):
    """Table and list blocks only, in order. Paragraphs are instructor notes and stay out of the sheet."""
    out, kind, buf = [], None, []
    def flush():
        nonlocal kind, buf
        if kind == 'table': out.append(dict(t='table', **table('\n'.join(buf))))
        elif kind in ('list', 'olist'): out.append(dict(t=kind, items=buf))
        kind, buf = None, []
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('|'): k, v = 'table', s
        elif line.startswith('- '): k, v = 'list', line[2:].strip()
        elif re.match(r'\d+\.\s', line): k, v = 'olist', re.sub(r'^\d+\.\s*', '', line).strip()
        elif s.startswith('**') and s.endswith('**') and len(s) < 30:
            flush(); out.append(dict(t='label', text=s.strip('*'))); continue
        else:
            flush(); continue
        if k != kind: flush(); kind = k
        buf.append(v)
    flush()
    return out

def md_session(n): return sections(read(f'{REF}/sessions/s{n:02d}.md'))
def md_answer(n): return sections(read(f'{REF}/answers/s{n:02d}.md'))

# ---------------------------------------------------------------- item helpers
def mc(id, stem, options, ans, why, fixed=False, kicker=None):
    opts = [dict(k=LETTERS[i], t=t) for i, t in enumerate(options)]
    d = dict(id=id, type='mcq', stem=stem, options=opts, key=LETTERS[ans], why=why)
    if fixed: d['fixed'] = True
    if kicker: d['kicker'] = kicker
    return d

def sortq(id, stem, buckets, ans, why):
    return mc(id, stem, buckets, ans, why, fixed=True, kicker='Sort it')

def fillq(id, stem, answers, why=None, numeric=False):
    d = dict(id=id, type='fill', stem=stem, answers=answers)
    if why: d['why'] = why
    if numeric: d['numeric'] = True
    return d

def teach(id, title, paras=None, bullets_=None, table_=None, flow=None, note=None, callout=None, tag=None):
    d = dict(id=id, type='teach', title=title)
    if paras: d['paras'] = paras
    if bullets_: d['bullets'] = bullets_
    if table_: d['table'] = table_
    if flow: d['flow'] = flow
    if note: d['note'] = note
    if callout: d['callout'] = callout
    if tag: d['tag'] = tag
    return d

def order(id, prompt, steps, why):
    return dict(id=id, type='order', prompt=prompt, steps=steps, why=why)

def predict(id, step_no, do, options, ans, shows):
    return mc(id, f'Step {step_no}. {do} What do you expect to see?', options, ans,
              shows + ' You will run this on your own material in the exercise.', kicker='Predict, then see')

def quiz_items(n):
    import build_data
    mcq, fill, match = build_data.parse(n)
    return mcq, fill, match

def flash_cards(n, sec):
    voc = table(sec['Vocabulary'])
    glo = table(sec['Plain-language glossary'])
    hooks = {r[0].lower(): r[2] for r in glo['rows']}
    cards = []
    for i, (term, meaning) in enumerate(voc['rows']):
        c = dict(id=f's{n:02d}-fc{i+1}', type='flash', term=term, meaning=meaning)
        if term.lower() in hooks: c['hook'] = hooks[term.lower()]
        cards.append(c)
    return cards

def closer_of(sec):
    m = re.search(r'\*\*Now question it\.\*\*\s*(.+)', sec['Exit ticket'])
    return m.group(1).strip()

def exit_prompt_of(sec):
    m = re.search(r'^> (.+)$', sec['Exit ticket'], flags=re.M)
    return m.group(1).strip()

def case_of(n, sec, checks):
    ans = md_answer(n)
    scen = [l for l in sec['Case to attempt'].split('\n') if l.strip() and not l.startswith('Attempt')][0]
    return dict(scenario=scen, model=ans['Model answer'].strip(), checks=checks)

LIMITS = ['Prediction', 'Knowledge', 'Working memory', 'Steerability', 'Context size']

# ---------------------------------------------------------------- session 1
def session1():
    n = 1; sec = md_session(n); mcq, fill, match = quiz_items(n); p = 's01'
    L1 = [
      teach(f'{p}-L1-1', 'A model writes one token at a time',
            ['A token is a small piece of text, roughly syllable-sized and not always a whole word. The model reads your text as tokens and writes its answer the same way.'],
            flow=numbered(sec['How a model produces an answer'])[:3],
            note=numbered(sec['How a model produces an answer'])[3] + ' It is built to produce plausible next text.',
            callout='Fluent does not mean true.'),
      mc(f'{p}-L1-2', 'Which step in the loop checks that the answer is true?',
         ['Scoring the next token', 'Adding the pick to the text', 'None of them. The loop only produces plausible text', 'Cutting the text into tokens'], 2,
         'Nothing in this loop checks whether the result is true. A confident answer is the expected output whether or not it is right.'),
      teach(f'{p}-L1-3', 'Where a model gets its content',
            ['Three sources feed every answer. Training is a student who stopped studying on one day. Context is the papers open on a desk. An instruction is a brief to a new colleague.'],
            table_=table(sec['Where a model gets its content']),
            callout='Name one failure of each source from your own experience.'),
      mc(f'{p}-L1-4', 'Claude states a price as current, but the price changed after its training stopped. Which source of content failed?',
         ['Training', 'Context', 'Instructions', 'None. It is a random glitch'], 0,
         'Training holds patterns learned up to the cutoff, so it states old facts as current.'),
      teach(f'{p}-L1-5', 'Training stops at a cutoff',
            ['Knowledge comes from training and stops at a cutoff date. The current models list a June 2026 cutoff. Anything newer needs search or files.',
             'Ask about a recent event with search off, then on. The answer changes because the source changed, not the model.']),
      mc(f'{p}-L1-6', 'A question about an event after the cutoff gets a vague answer with search off and a precise one with search on. Why?',
         ['The model got smarter between the two runs', 'The source changed: search supplied what training lacks', 'Search switches on a bigger model', 'Training was updated in the middle of the chat'], 1,
         'Search supplied what training lacks. The model did not change.'),
      teach(f'{p}-L1-7', 'Working memory is the context window',
            ['Context is everything the model can see right now: your messages, files and results. The four current API models list a 1M-token window, but everything in it competes for attention.',
             'A long context is not perfect recall. A detail from the middle of a long document can be missed.'],
            callout='One chat per task. Carry a short summary into the next one.'),
      mc(f'{p}-L1-8', 'A chat has run for days across five different tasks and the answers drift. What is the best first fix?',
         ['Keep going, because the model weights everything equally', 'Start a new chat for this task and carry a short summary', 'Switch to a bigger model', 'Add more instructions to every prompt'], 1,
         'Old text competes for attention. A new chat per task keeps the window clean.'),
    ]
    L2 = [
      teach(f'{p}-L2-1', 'Five limits explain most failures',
            ['The five limits are prediction, knowledge, working memory, steerability and context size. Each has a test you can run in minutes.'],
            table_=table(sec['Five failure tests'])),
      mc(f'{p}-L2-2', 'Claude gives a confident citation. You search for the paper and it does not exist. Which limit?',
         LIMITS, 0, 'It writes what a citation looks like. It predicts, it does not look up.', fixed=True, kicker='Name the limit'),
      mc(f'{p}-L2-3', 'You give two contradictory instructions and Claude follows one of them. Which limit?',
         LIMITS, 3, 'It follows the instructions it is given. A contradictory request is a coin toss.', fixed=True, kicker='Name the limit'),
      teach(f'{p}-L2-4', '4D: the habits around the model',
            ['Decide, describe, check, own. Place each step of your last AI task under a D.'],
            table_=table(sec['The 4D framework'])),
      mc(f'{p}-L2-5', 'You decide Claude may draft the client email, but the decision to drop the client stays with you. Which D is this?',
         ['Delegation', 'Description', 'Discernment', 'Diligence'], 0,
         'Delegation: should AI do this task, and which part?', fixed=True, kicker='Name the D'),
      teach(f'{p}-L2-6', 'Delegate, co-work or keep',
            ['Reliability belongs to the task, not the model. The same model is strong at summarising text you gave it and weak at recalling an obscure figure.',
             'Match the check to the stakes: spot-check a draft, verify every number in a contract summary.'],
            callout='Sort the next three tasks.'),
      sortq(f'{p}-L2-7', 'Summarise a document you pasted into the chat.', ['Delegate', 'Co-work', 'Keep'], 0,
            'Strong at summarising text you gave it. You still check the claims that matter.'),
      sortq(f'{p}-L2-8', 'Decide whether to drop a client.', ['Delegate', 'Co-work', 'Keep'], 2,
            'The decision is yours. Claude can help you think, but you own it.'),
      sortq(f'{p}-L2-9', 'Draft a contract summary where one wrong number matters.', ['Delegate', 'Co-work', 'Keep'], 1,
            'Claude drafts and you verify every number against the contract.'),
      teach(f'{p}-L2-10', 'Four mistakes to avoid', table_=table(sec['Common mistakes'])),
      mc(f'{p}-L2-11', 'Which fix goes with treating a fluent answer as true?',
         ['Ask for the source, open it, compare', 'Make the prompt longer', 'Switch to a bigger model', 'Ask Claude whether it is sure'], 0,
         'A confident tone can hide a guess. The source decides.'),
    ]
    demo_steps = [
      ('Ask Claude for three sources on a narrow topic, then open each one.',
       ['All three exist, because Claude looks them up', 'Real-looking titles, some of which may not exist', 'Claude refuses to give sources', 'The sources exist but have the wrong year'], 1,
       'Real-looking titles may not exist. The model predicts what a citation looks like. It does not look it up.'),
      ('Ask about an event after the cutoff with search off, then on.',
       ['The same answer both times', 'The answer changes because the source changed, not the model', 'Search makes the model smarter', 'Claude refuses with search on'], 1,
       'The answer changes because the source changed, not the model.'),
      ('Paste a long document and ask about a detail in its middle.',
       ['It always finds the detail, because the window is large', 'It can miss the detail: a long window is not perfect recall', 'It refuses long documents', 'It only reads the first page'], 1,
       'A long window is not perfect recall.'),
      ('Ask a question with a false premise built in.',
       ['It challenges the premise every time', 'It tends to continue the premise instead of challenging it', 'It refuses to answer', 'It asks you for a source'], 1,
       'It tends to continue the premise instead of challenging it.'),
    ]
    W = [predict(f'{p}-W-{i+1}', i + 1, d, o, a, s) for i, (d, o, a, s) in enumerate(demo_steps)]
    P1 = mcq[:5]; P2 = mcq[5:]
    R = flash_cards(n, sec) + fill + [match]
    task = dict(
      title='Break it, then sort your week',
      brief=['You run these in Claude on your own material. Log what happened in your own words. The app does not write your entries.'],
      parts=[
        dict(id='p1', kind='rows', title='Break it five ways',
             intro='For each test, record what you asked and what Claude produced, what went wrong, and which of the five limits explains it.',
             rows=[dict(label='Ask for a source, then check that it exists', expect=['Prediction']),
                   dict(label='Ask about a recent event with search off, then on', expect=['Knowledge']),
                   dict(label='Paste a long document and ask about a detail from its middle', expect=['Working memory', 'Context size']),
                   dict(label='Give two contradictory instructions', expect=['Steerability']),
                   dict(label='Ask a leading question whose premise is false', expect=['Prediction'])],
             fields=[dict(k='did', label='What you asked and what Claude produced', type='area', min=4),
                     dict(k='wrong', label='What went wrong', type='area', min=3),
                     dict(k='limit', label='Limit that explains it', type='select', options=LIMITS)],
             calc='limit'),
        dict(id='p2', kind='rows', title='Delegation sort',
             intro='Take ten tasks from your own week. Sort each one and give a one-line reason.',
             count=10, rowlabel='Task',
             fields=[dict(k='task', label='Task from your week', type='text', min=2),
                     dict(k='d', label='Decision', type='select', options=['Delegate', 'Co-work', 'Keep']),
                     dict(k='why', label='One-line reason', type='text', min=3)]),
      ])
    case = case_of(n, sec, [
      'I named working memory and context size as the limits',
      'I asked Claude to quote the clause and its heading',
      'I listed the contract headings and confirmed with the document\'s own search'])
    return dict(id=p, n=n, title='How AI models work and fail', deliverable='Failure log with five entries', points=8,
      nodes=[
        dict(k='L1', kind='learn', title='Core ideas', forgiving=True, blurb='Four short lessons on how a model works, each followed by a check. No hearts in this step.', items=L1),
        dict(k='L2', kind='learn', title='Limits and 4D', forgiving=True, blurb='The five limits, the 4D habits and how to sort a task. No hearts in this step.', items=L2),
        dict(k='W', kind='demo', title='Break it on purpose', forgiving=True, blurb='The worked demo. Predict what Claude will do, then see what it shows. No hearts in this step.', items=W),
        dict(k='P1', kind='practice', title='Practice', blurb='Five questions. Five hearts.', items=P1),
        dict(k='P2', kind='practice', title='Practice 2', blurb='Five more questions. Five hearts.', items=P2),
        dict(k='R', kind='recall', title='Recall', blurb='Flashcards, then typed answers and a matching round.', items=R),
        dict(k='X', kind='task', title='Do it in Claude', task=task),
        dict(k='C', kind='case', title='Case', case=case),
        dict(k='Q', kind='question', title='Now question it', closer=closer_of(sec), exit=exit_prompt_of(sec)),
      ], sheet=sheet_of(n, sec, ['Plain-language glossary', 'How a model produces an answer', 'Where a model gets its content', 'Five failure tests', 'The 4D framework', 'Common mistakes']))

# ---------------------------------------------------------------- session 2
SURF = ['Claude app', 'Delegated task', 'Claude Code', 'Claude Platform', 'Shared or proactive agent']
def session2():
    n = 2; sec = md_session(n); mcq, fill, match = quiz_items(n); p = 's02'
    L1 = [
      teach(f'{p}-L1-1', 'A surface is a door into the same building',
            ['A surface is a place where you work with Claude. The Claude app on web, desktop and mobile is where most people work. Since 16 September 2026 everything Cowork does is available from any conversation, and Claude Design, Slides and Docs produce designs, decks and documents in any conversation.',
             'Chats, tasks, Projects, connectors and skills carry across surfaces, so the question is where the work should run, not which product to buy.'],
            table_=table(sec['Plain-language glossary'])),
      mc(f'{p}-L1-2', 'Someone on the Free plan wants to make an interactive one-page tool. Can they use artifacts?',
         ['No, artifacts need a paid plan', 'Yes, artifacts are on every plan, including Free', 'Only on Enterprise', 'Only in Claude Code'], 1,
         'Artifacts are available on every plan, including Free.'),
      teach(f'{p}-L1-3', 'Which surface for which job',
            ['Name the job first, then pick the surface. Use the least engineering that meets the need.'],
            table_=table(sec['Which surface for which job']),
            flow=['Chat in the Claude app', 'A delegated or scheduled task', 'Claude Code', 'The Claude Platform'],
            note='Move down the list only when the job needs it.'),
      sortq(f'{p}-L1-4', 'Ask for a plain-language summary of a policy PDF.', SURF, 0,
            'You ask, write or analyse. That is the Claude app, with no code needed.'),
      sortq(f'{p}-L1-5', 'Rename a function across a repository and run its tests.', SURF, 2,
            'The work is in a codebase. Claude Code reads the folder, edits files and runs commands.'),
      sortq(f'{p}-L1-6', 'Build a support assistant into your own mobile app.', SURF, 3,
            'You build Claude into your own product. That is the Platform.'),
      sortq(f'{p}-L1-7', 'Compile a monthly summary from files spread across several folders.', SURF, 1,
            'The work spans several files and runs for a while. That is a delegated task.'),
      sortq(f'{p}-L1-8', 'Let a whole team put questions to Claude inside their Slack channel.', SURF, 4,
            'The work lives in a team channel. @Claude in Slack is a shared agent.'),
    ]
    L2 = [
      teach(f'{p}-L2-1', 'Three ways to build on the Platform',
            ['Pick the route by how much of the loop you want to own. Session 14 returns to these routes.'],
            table_=table(sec['Three ways to build on the Platform'])),
      sortq(f'{p}-L2-2', 'You want full control over one simple call to the API.', ['Client SDK', 'Agent SDK', 'Managed Agents'], 0,
            'The Client SDK calls the API directly. You write the tool loop or use the tool runner.'),
      sortq(f'{p}-L2-3', 'You want Claude Code\'s agent inside a Python app that you operate.', ['Client SDK', 'Agent SDK', 'Managed Agents'], 1,
            'The Agent SDK embeds Claude Code\'s agent in your own Python or TypeScript app.'),
      sortq(f'{p}-L2-4', 'You want Anthropic to host the agent loop.', ['Client SDK', 'Agent SDK', 'Managed Agents'], 2,
            'Managed Agents is a hosted agent harness.'),
      teach(f'{p}-L2-5', 'Before you promise a feature',
            ['Features change monthly. Rollouts are gradual and many features start in beta or on specific plans. The release notes are the source of truth for what exists this month.'],
            callout='Run this check on one feature you have seen in a video.'),
      order(f'{p}-L2-6', 'Put the check in order.',
            ['Open the release notes and find the date of the change', 'Check whether it is beta or limited to certain plans', 'Look for it in your own account', 'If it is missing, assume the rollout has not reached you or your plan excludes it, and do not reinstall'],
            'Date first, then plan, then your own account. A missing feature means the rollout has not reached you or your plan excludes it.'),
      teach(f'{p}-L2-7', 'Newer shared and proactive agents',
            ['These surfaces are new. Check your plan before you promise any of them.'],
            table_=dict(headers=['Surface', 'What it does', 'Status in the course notes'], rows=[
              ['Claude Tag', 'Puts @Claude in a Slack channel as a shared teammate', 'Beta on Team and Enterprise, launched 23 June 2026'],
              ['Claude Duet', 'A proactive agent app that waits for your approval when it matters', 'Research preview, waitlist for US Pro and Max, 21 October 2026'],
              ['Claude Meetings', 'Joins Google Meet calls and builds notes and artifacts', 'Beta on Team and Enterprise, 12 November 2026']]),
            tag='As recorded in the course notes. Check the release notes for today\'s status.'),
      mc(f'{p}-L2-8', 'A colleague wants you to promise Claude Meetings to their team next week. What do you do first?',
         ['Promise it, since it has launched', 'Check the release notes and your plan, since it is a beta on specific plans', 'Reinstall the app', 'Build it on the API'], 1,
         'Rollouts are gradual and some features are beta or plan-limited. Check before you promise.'),
    ]
    demo = [
      ('Take this job: summarise a 200-page report.', ['The Claude app: attach the file and ask', 'Claude Code', 'A support chatbot on the Platform', 'A scheduled task'], 0,
       'The app: attach the file and ask. No code needed.'),
      ('Take this job: fix a bug in a repository.', ['The Claude app', 'Claude Code', 'A scheduled task', 'Managed Agents'], 1,
       'Claude Code reads the folder and runs the tests.'),
      ('Take this job: a report that must arrive every morning.', ['A chat someone must remember to open', 'Claude Code', 'A scheduled task', 'The Client SDK'], 2,
       'A scheduled task (session 10), not a chat someone must remember to open.'),
      ('Take this job: a support chatbot inside a company app.', ['The Claude app', 'A scheduled task', 'Claude Code', 'The Platform: your own code calls Claude'], 3,
       'The Platform: your own code calls Claude.'),
    ]
    W = [predict(f'{p}-W-{i+1}', i + 1, d, o, a, s).copy() for i, (d, o, a, s) in enumerate(demo)]
    for w in W: w['stem'] = w['stem'].replace(' What do you expect to see?', ' Which surface fits?'); w['kicker'] = 'Pick the surface'
    task = dict(
      title='Set up, then choose surfaces',
      brief=['Set up your accounts first, then map six jobs to a surface with a reason. The app does not choose for you.'],
      parts=[
        dict(id='p1', kind='checks', title='Setup',
             intro='Tick each one when you have done it yourself.',
             items=['Create the account', 'Install the desktop app', 'Open a chat', 'Open a Project', 'Open the Code tab']),
        dict(id='p2', kind='rows', title='Surface chooser',
             intro='Name the job, pick a surface, and write the reason. Keep the surface table from the lesson in view.',
             rows=[dict(label='A quick question'), dict(label='Summarising a 200-page report'), dict(label='A deck for tomorrow'),
                   dict(label='A bug in a repository'), dict(label='A report that must arrive every morning'),
                   dict(label='A support chatbot inside a company app')],
             fields=[dict(k='s', label='Surface', type='select', options=SURF),
                     dict(k='why', label='Reason', type='text', min=4)]),
      ])
    case = case_of(n, sec, [
      'I chose a scheduled task in the Claude app',
      'I named the Drive and Gmail connectors',
      'I said when to move to the API: only if the clinic needs its own interface'])
    return dict(id=p, n=n, title='The Claude landscape', deliverable='Surface chooser sheet', points=8,
      nodes=[
        dict(k='L1', kind='learn', title='Surfaces', forgiving=True, blurb='What each surface is for, then five jobs to sort. No hearts in this step.', items=L1),
        dict(k='L2', kind='learn', title='Building and checking', forgiving=True, blurb='The three ways to build, the feature check and the newer agents. No hearts in this step.', items=L2),
        dict(k='W', kind='demo', title='Choose for four jobs', forgiving=True, blurb='The worked demo. Pick a surface for each job, then see the course answer. No hearts in this step.', items=W),
        dict(k='P1', kind='practice', title='Practice', blurb='Five questions. Five hearts.', items=mcq[:5]),
        dict(k='P2', kind='practice', title='Practice 2', blurb='Five more questions. Five hearts.', items=mcq[5:]),
        dict(k='R', kind='recall', title='Recall', blurb='Flashcards, then typed answers and a matching round.', items=flash_cards(n, sec) + fill + [match]),
        dict(k='X', kind='task', title='Do it in Claude', task=task),
        dict(k='C', kind='case', title='Case', case=case),
        dict(k='Q', kind='question', title='Now question it', closer=closer_of(sec), exit=exit_prompt_of(sec)),
      ], sheet=sheet_of(n, sec, ['Plain-language glossary', 'Which surface for which job', 'Three ways to build on the Platform', 'Before you promise a feature', 'Common mistakes']))

# ---------------------------------------------------------------- session 3
TIERS = ['Fable 5.2', 'Opus 5.5', 'Sonnet 5.5', 'Haiku 5.5']
def session3():
    n = 3; sec = md_session(n); mcq, fill, match = quiz_items(n); p = 's03'
    AS_OF = 'As of the course notes, 16 November 2026. Check the models overview and pricing pages before you rely on it.'
    L1 = [
      teach(f'{p}-L1-1', 'Four tiers, four jobs',
            ['All four list a 1M context window, 128K max output, text and image input, vision and tool use. Fable 5.2 and Mythos 5.2 are the same underlying model. Mythos is available through verification programs, and Fable carries safeguards for cybersecurity and biology.'],
            table_=dict(headers=['Tier', 'Positioned for'], rows=[
              ['Fable 5.2', 'Demanding reasoning and long-horizon agentic work'],
              ['Opus 5.5', 'Long-running agentic coding and knowledge work. Where most workloads start'],
              ['Sonnet 5.5', 'The best combination of speed and intelligence'],
              ['Haiku 5.5', 'High-volume, latency-sensitive work: classification, extraction and routing']]),
            tag=AS_OF),
      sortq(f'{p}-L1-2', 'Route incoming tickets to the right team, thousands a day.', TIERS, 3,
            'High-volume, latency-sensitive routing is what Haiku 5.5 is positioned for.'),
      sortq(f'{p}-L1-3', 'A long-running agentic coding session on a large repository.', TIERS, 1,
            'Opus 5.5 is positioned for long-running agentic coding and knowledge work.'),
      sortq(f'{p}-L1-4', 'A general assistant that needs both speed and intelligence.', TIERS, 2,
            'Sonnet 5.5 is the best combination of speed and intelligence.'),
      sortq(f'{p}-L1-5', 'A hard research task that runs for hours and needs the deepest reasoning.', TIERS, 0,
            'Fable 5.2 is for demanding reasoning and long-horizon agentic work.'),
      teach(f'{p}-L1-6', 'Two ways to start',
            ['Both are valid. What matters is that moving up or down is triggered by scores, not intuition.'],
            table_=table(sec['Two ways to start'])),
      mc(f'{p}-L1-7', 'You want the lowest cost and will upgrade only where a specific gap appears. Which starting approach?',
         ['Capability-first, starting at Fable 5.2', 'Capability-first, starting at Opus 5.5', 'Efficiency-first, starting at Haiku 5.5', 'Start with Sonnet 5.5 and never test'], 2,
         'Efficiency-first starts with Haiku 5.5 and upgrades only where there is a specific capability gap.'),
      teach(f'{p}-L1-8', 'What it costs',
            ['Work the maths for one job: 10,000 tokens in and 1,000 tokens out. Think in cost per finished task, not cost per token. A cheaper model that needs retries can cost more overall.',
             'Newer tokenizers can produce more tokens for the same text, so count tokens on your own text.'],
            table_=table(sec['A worked cost example']),
            tag=AS_OF),
      fillq(f'{p}-L1-9', 'Opus 5.5 costs $____ per 1,000 requests of this job.', ['60'],
            '$0.04 in plus $0.02 out is $0.06 a request, so $60 per 1,000.', numeric=True),
      fillq(f'{p}-L1-10', 'At these list prices the job costs ____ times more on Fable 5.2 than on Haiku 5.5.', ['80'],
            '$120 divided by $1.50 is 80.', numeric=True),
    ]
    L2 = [
      teach(f'{p}-L2-1', 'Effort before model',
            ['Effort trades intelligence for latency and cost within one model. The docs say tuning it is often a better lever than switching models. If a model overthinks, lower the effort rather than adding instructions.',
             'API defaults: high for Fable 5.2 and Sonnet 5.5, medium for Opus 5.5 and Haiku 5.5. Confirm on the model page.']),
      order(f'{p}-L2-2', 'Put the tuning routine in order.',
            ['Write success criteria and a small eval set', 'Run at the default effort', 'Move the effort one step and rerun: lower if good but slow or costly, higher if short', 'Still short: change model, then rerun'],
            'Criteria and eval first. Then default effort. Then tune effort. Change the model last.'),
      mc(f'{p}-L2-3', 'A model scores well on your eval but is slow and costly. What do you try first?',
         ['Switch to a larger model', 'Lower the effort and rerun', 'Add step-by-step instructions', 'Raise max output tokens'], 1,
         'Scores good but slow or costly: lower the effort and rerun.'),
      teach(f'{p}-L2-3b', 'Model lifecycle',
            ['Read the status from the List Models endpoint: lifecycle, deprecated_at and retires_at. The retires_at date can be revised, and a past date on a deprecated model means retirement is overdue, not done.'],
            table_=table(sec['Model lifecycle'])),
      mc(f'{p}-L2-4', 'A deprecated model shows a retires_at date that has already passed. What does that mean?',
         ['The model is safe to keep using', 'Retirement is overdue, not done, so plan the switch now', 'The date is a typo', 'The model was upgraded in place'], 1,
         'A past date on a deprecated model means retirement is overdue, not done. Anything pinned may stop working.'),
      teach(f'{p}-L2-5', 'Combine tiers',
            ['Two patterns. Executor and advisor: the executor does the work on a cheaper model and escalates hard decisions to the advisor. Orchestrator and workers: a stronger model hands bulk work to cheaper workers.']),
      mc(f'{p}-L2-6', 'A cheap model needs three retries per job. What should you compare against the stronger model?',
         ['Price per token', 'Cost per finished task, including retries', 'The model names', 'Context window size'], 1,
         'A cheaper model that needs retries can cost more overall. Compare cost per finished task.'),
      mc(f'{p}-L2-7', 'What should trigger moving a task to a different tier?',
         ['A newer model name', 'A higher price', 'Scores on your own test set', 'A video review'], 2,
         'Both starting approaches are valid. Moving up or down is triggered by scores, not intuition.'),
    ]
    demo = [
      ('Write a 1 to 5 rubric first: accuracy, completeness, format, usable without edits.',
       ['So the style of an output cannot sway the score', 'Because the models need it to run', 'To make the outputs longer', 'It is optional and changes nothing'], 0,
       'Criteria come before outputs, so style cannot sway the score.'),
      ('Run one real task on Haiku 5.5, Sonnet 5.5 and Opus 5.5.',
       ['Change the prompt for each model', 'Keep the same prompt and input, so only the model changes', 'Use a different task for each model', 'Run it once on the largest model'], 1,
       'Same prompt, same input, nothing changed except the model.'),
      ('Score blind where possible and note the tokens used. Two models tie.',
       ['Pick the more expensive one', 'The cheaper model wins', 'Pick the newest one', 'Rerun until they differ'], 1,
       'If scores tie, the cheaper model wins.'),
      ('Rerun the best model at lower and higher effort.',
       ['Effort is often a better lever than switching models', 'Effort never changes the score', 'It proves you chose the wrong model', 'It only changes the output length'], 0,
       'Effort is often a better lever than switching models.'),
    ]
    W = [predict(f'{p}-W-{i+1}', i + 1, d, o, a, s) for i, (d, o, a, s) in enumerate(demo)]
    W[0]['stem'] = 'Step 1. Write a 1 to 5 rubric first: accuracy, completeness, format, usable without edits. Why write it before you see any output?'
    W[1]['stem'] = 'Step 2. Run one real task on Haiku 5.5, Sonnet 5.5 and Opus 5.5. What must you keep the same?'
    W[2]['stem'] = 'Step 3. Score blind where possible and note the tokens used. Two models tie. What wins?'
    W[3]['stem'] = 'Step 4. Rerun the best model at lower and higher effort. What does it show?'
    for w in W: w['kicker'] = 'Predict, then see'
    TASKS5 = ['Summarise', 'Extract a table', 'Rewrite for tone', 'Reason through a problem', 'Plan a multi-step task']
    task = dict(
      title='Run your bake-off',
      brief=['Write your 1 to 5 rubric before you run anything: accuracy, completeness, format, usable without edits. Run each task on the tiers, score blind where you can, and log your own scores here.'],
      parts=[
        dict(id='p1', kind='rows', title='Bake-off scores',
             intro='One real task from your job for each type. Score 1 to 5. Fable 5.2 is optional, for the hardest task where your plan allows.',
             rows=[dict(label=t) for t in TASKS5],
             fields=[dict(k='haiku', label='Haiku 5.5', type='score'), dict(k='sonnet', label='Sonnet 5.5', type='score'),
                     dict(k='opus', label='Opus 5.5', type='score'), dict(k='fable', label='Fable 5.2 (optional)', type='score', optional=True),
                     dict(k='note', label='How you scored it, in one line', type='text', min=3)],
             calc='tier'),
        dict(id='p2', kind='rows', title='Effort rerun',
             intro='Rerun one task on the same model at lower and higher effort.',
             count=1, rowlabel='Task',
             fields=[dict(k='task', label='Task and model', type='text', min=2), dict(k='lo', label='Score at lower effort', type='score'),
                     dict(k='def', label='Score at default effort', type='score'), dict(k='hi', label='Score at higher effort', type='score')]),
        dict(id='p3', kind='rows', title='Lifecycle check',
             intro='Pick one model that your tools call. Find its status and its replacement.',
             count=1, rowlabel='Model',
             fields=[dict(k='model', label='Model your tools call', type='text', min=1),
                     dict(k='status', label='Status', type='select', options=['Active', 'Deprecated', 'Retired']),
                     dict(k='rep', label='Replacement or retirement date', type='text', min=1)]),
        dict(id='p4', kind='rows', title='Escalation rule',
             intro='State when you move up or down a tier, based on evidence.',
             count=1, rowlabel='Rule',
             fields=[dict(k='rule', label='Your escalation rule', type='area', min=12)]),
      ])
    case = case_of(n, sec, [
      'I chose Haiku 5.5 to classify the inbound emails',
      'I chose Sonnet 5.5 to draft the replies',
      'I chose Opus 5.5 for the weekly analysis',
      'I chose Fable 5.2 as orchestrator for the hard research task',
      'I verify each with a scored sample before committing'])
    return dict(id=p, n=n, title='Choosing models and effort', deliverable='Model-choice sheet', points=9,
      nodes=[
        dict(k='L1', kind='learn', title='Tiers and cost', forgiving=True, blurb='The four tiers, the two starting points and the cost maths. No hearts in this step.', items=L1),
        dict(k='L2', kind='learn', title='Effort and lifecycle', forgiving=True, blurb='Tune effort first, read the lifecycle, combine tiers. No hearts in this step.', items=L2),
        dict(k='W', kind='demo', title='A scored bake-off', forgiving=True, blurb='The worked demo. Predict each step, then see what it shows. No hearts in this step.', items=W),
        dict(k='P1', kind='practice', title='Practice', blurb='Five questions. Five hearts.', items=mcq[:5]),
        dict(k='P2', kind='practice', title='Practice 2', blurb='Five more questions. Five hearts.', items=mcq[5:]),
        dict(k='R', kind='recall', title='Recall', blurb='Flashcards, then typed answers and a matching round.', items=flash_cards(n, sec) + fill + [match]),
        dict(k='X', kind='task', title='Do it in Claude', task=task),
        dict(k='C', kind='case', title='Case', case=case),
        dict(k='Q', kind='question', title='Now question it', closer=closer_of(sec), exit=exit_prompt_of(sec)),
      ], sheet=sheet_of(n, sec, ['Plain-language glossary', 'Two ways to start', 'A worked cost example', 'Effort before model', 'Model lifecycle', 'Common mistakes']))

# ---------------------------------------------------------------- study sheet
def sheet_of(n, sec, main):
    s = []
    cs = sec['Cheat sheet']
    know = bullets(cs.split('**Do**')[0]); do = bullets(cs.split('**Do**')[1])
    s.append(dict(title='Cheat sheet', blocks=[dict(t='label', text='Know'), dict(t='list', items=know), dict(t='label', text='Do'), dict(t='list', items=do)]))
    for t in main:
        s.append(dict(title=t, blocks=blocks(sec[t])))
    s.append(dict(title='Vocabulary', blocks=blocks(sec['Vocabulary'])))
    s.append(dict(title='Going further', blocks=blocks(sec['Going further'])))
    s.append(dict(title='Score ladder', blocks=blocks(sec['Score ladder (what your work looks like at each level)'])))
    s.append(dict(title='Study sources', blocks=[dict(t='p', text=sec['Study sources'].strip())]))
    return s

GATE = dict(
  title='Model-choice sheet',
  brief='Default model per task type, escalation rule, scored evidence.',
  criteria=[
    ['Real task', 'Done on a task from your own job, not a toy example'],
    ['Criteria first', 'Success criteria written before the work and measurable'],
    ['Evidence', 'A verification log or eval showing the output was checked'],
    ['Safety', 'Permissions scoped, approval before anything is sent or written outside'],
    ['Choices', 'Model, effort and tools justified from results, not from names'],
    ['Own explanation', 'You explain each choice without asking Claude']])

def build():
    d = dict(level=dict(id='L1', title='Foundations', range='0 to 25'),
             sessions=[session1(), session2(), session3()], gate=GATE)
    ids = set()
    for s in d['sessions']:
        for n in s['nodes']:
            for it in n.get('items', []):
                if 'type' not in it:
                    it['type'] = 'mcq' if 'options' in it else 'fill' if 'answers' in it else 'match' if 'pairs' in it else None
                assert it['type'], it['id']
                assert it['id'] not in ids, 'duplicate id ' + it['id']
                ids.add(it['id'])
    return d

if __name__ == '__main__':
    import sys
    d = build()
    for s in d['sessions']:
        print(s['id'], [(x['k'], len(x.get('items', []))) for x in s['nodes']])
    json.dump(d, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'course.json'), 'w'), ensure_ascii=False, indent=1)
