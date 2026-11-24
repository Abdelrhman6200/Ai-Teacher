"""Builds sessions 4 to 24 from the course files.
Teaching text, tables, vocabulary, quizzes, cases, exercises and exit prompts are parsed from the learner kit.
Checks are generated from those same tables, key points and steps, never invented.
"""
import re, random
import content as C
from content import (sections, table, bullets, numbered, read, md_session, md_answer, REF, LETTERS,
                     teach, mc, fillq, order, flash_cards, closer_of, exit_prompt_of)

# ---------------------------------------------------------------- voice: third person to second person
VERB = {'is': 'are', 'has': 'have', 'does': 'do', 'goes': 'go', 'tries': 'try', 'applies': 'apply', 'carries': 'carry'}
def _base(v):
    if v in VERB: return VERB[v]
    if v.endswith('ies'): return v[:-3] + 'y'
    if re.search(r'(sh|ch|x|ss|z)es$', v): return v[:-2]
    if v.endswith('s') and not v.endswith('ss') and v not in ('this', 'its'): return v[:-1]
    return v

def you(s):
    if not re.search(r'learner', s, flags=re.I): return s
    s = re.sub(r"\b([Tt])he learner's\b", lambda m: 'Your' if m.group(1) == 'T' else 'your', s)
    s = re.sub(r"\b([Tt])he learner (\w+)", lambda m: ('You ' if m.group(1) == 'T' else 'you ') + _base(m.group(2)), s)
    s = re.sub(r"\b([Tt])he learners?\b", lambda m: 'You' if m.group(1) == 'T' else 'you', s)
    s = re.sub(r"\btheir\b", 'your', s)
    return s

def sent(s):
    s = s.strip()
    return s if s.endswith(('.', '!', '?', ')')) else s + '.'

# ---------------------------------------------------------------- blocks that keep paragraphs
def rich(text):
    out, kind, buf = [], None, []
    def flush():
        nonlocal kind, buf
        if kind == 'table': out.append(dict(t='table', **table('\n'.join(buf))))
        elif kind in ('list', 'olist'): out.append(dict(t=kind, items=buf))
        elif kind == 'p': out.append(dict(t='p', text=' '.join(buf)))
        kind, buf = None, []
    for line in text.split('\n'):
        s = line.strip()
        if not s: flush(); continue
        if s.startswith('|'): k, v = 'table', s
        elif line.startswith('- '): k, v = 'list', line[2:].strip()
        elif re.match(r'\d+\.\s', line): k, v = 'olist', re.sub(r'^\d+\.\s*', '', line).strip()
        elif s.startswith('**') and s.endswith('**') and len(s) < 30:
            flush(); out.append(dict(t='label', text=s.strip('*'))); continue
        else: k, v = 'p', you(s)
        if k != kind: flush(); kind = k
        buf.append(v)
    flush()
    return out

def tbl_ok(t):
    return t and len(t['headers']) >= 2 and len(t['rows']) >= 2

# ---------------------------------------------------------------- auto checks
def clean(s): return s.replace('`', '').replace('**', '').strip()

def numopts(v, suf):
    v = int(v)
    if v >= 20: c = [v, v * 2, max(1, v // 2), v * 5, v + 10]
    elif v >= 10: c = [v, v * 2, v // 2, v + 5, v - 5]
    else: c = [v, v + 1, max(1, v - 1), v + 2, v * 2]
    out = []
    for x in c:
        if x > 0 and x not in out: out.append(x)
    return [f'{x}{suf}' for x in out[:4]]

NUM = re.compile(r'(?<![\w.,/-])(\d{1,4})(k|K|M)?(?=\s+(?:percent|lines|days|hours|minutes|cases|tokens|months|turns|steps|seconds|rows|items|examples|files|runs)\b|\b(?:k|K|M)\b)')

def _sentences(t):
    return re.split(r'(?<=[.!?])\s+(?=[A-Z`*"“])', t.strip())

def focus(blank_text, full_text):
    """When a key point holds several sentences, ask only about the sentence that holds the gap."""
    parts = _sentences(blank_text); fulls = _sentences(full_text)
    if len(parts) > 1 and len(parts) == len(fulls) and len(blank_text) > 110:
        idx = next((i for i, p in enumerate(parts) if '____' in p), None)
        if idx is not None: return parts[idx], fulls[idx]
    return blank_text, full_text

def cloze(bullet, pool_ticks, pool_bold, pid, rnd):
    """One fill-the-gap multiple choice from a key point, or None."""
    # backticked names
    toks = [t for t in re.findall(r'`([^`]+)`', bullet) if 2 < len(t) <= 36]
    for tok in toks:
        others = sorted({o for o in pool_ticks if o != tok and tok not in o and o not in tok and len(o) <= 40})
        if len(others) >= 3:
            d = rnd.sample(others, 3)
            stem, why = focus(clean(bullet.replace(f'`{tok}`', '____', 1)), clean(bullet))
            return mc(pid, stem, [tok] + d, 0, why, kicker='Fill the gap')
    bold = [t for t in re.findall(r'\*\*([^*]+)\*\*', bullet) if 2 < len(t) <= 36 and not t.endswith(('.', ':'))]
    for tok in bold:
        others = sorted({o for o in pool_bold if o != tok and tok not in o and o not in tok})
        if len(others) >= 3:
            d = rnd.sample(others, 3)
            stem, why = focus(clean(bullet.replace(f'**{tok}**', '____', 1)), clean(bullet))
            return mc(pid, stem, [tok] + d, 0, why, kicker='Fill the gap')
    m = NUM.search(bullet)
    if m:
        v, suf = m.group(1), (m.group(2) or '')
        if not (1900 <= int(v) <= 2100):
            opts = numopts(v, suf)
            if len(opts) == 4:
                stem, why = focus(clean(bullet[:m.start()] + '____' + bullet[m.end():]), clean(bullet))
                return mc(pid, stem, opts, 0, why, kicker='Fill the gap')
    return None

def shuffle_correct(item, rnd):
    """Spread the key so it is not always A. The app shuffles again at display time, this keeps the data honest."""
    return item

def table_checks(t, title, pid, rnd, extra_pool=None, limit=2):
    if not tbl_ok(t): return []
    h = t['headers']
    if h[0].lower() in ('step', '#', 'score', 'term') or len(t['rows']) < 3: return []
    ncol = len(h); rows = t['rows']
    cols = [1] if ncol == 2 else [1, ncol - 1]
    out = []; used = set()
    order_idx = list(range(len(rows))); rnd.shuffle(order_idx)
    for c in cols:
        if len(out) >= limit: break
        for ri in order_idx:
            if (ri, c) in used or any(u[0] == ri for u in used): continue
            key = clean(rows[ri][c]); q = clean(rows[ri][0])
            if not key or not q or len(key) > 120 or len(q) > 110: continue
            pool = {clean(r[c]) for i, r in enumerate(rows) if i != ri and clean(r[c]) and clean(r[c]) != key and len(clean(r[c])) <= 120}
            pool = {p for p in pool if p not in key and key not in p}
            if len(pool) < 3: continue
            d = rnd.sample(sorted(pool), 3)
            lens = [len(x) for x in d]
            if len(key) > 1.9 * max(lens) or len(key) * 1.9 < min(lens): continue
            stem = f'Under “{clean(h[c])}” in “{title}”, which goes with “{q}”?'
            out.append(mc(f'{pid}-{len(out)+1}', stem, [key] + d, 0, f'{q}: {key}', kicker='From the table'))
            used.add((ri, c)); break
    return out


def vocab_check(row, rows, pid, rnd):
    term, meaning = clean(row[0]), clean(row[1])
    pool = sorted({clean(r[0]) for r in rows if clean(r[0]) != term and len(clean(r[0])) <= 60})
    pool = [x for x in pool if x not in term and term not in x]
    if len(pool) < 3 or len(meaning) > 190: return None
    return mc(pid, f'Which term is this? “{meaning}”', [term] + rnd.sample(pool, 3), 0, f'{term}: {meaning}', kicker='Which term?')

def hook_checks(gl, pid_fn, rnd, limit=2):
    rows = [r for r in gl['rows'] if len(r) >= 3 and clean(r[2]) and len(clean(r[2])) <= 120]
    rnd.shuffle(rows); out = []
    for r in rows:
        term = clean(r[0]); pool = sorted({clean(x[0]) for x in gl['rows'] if clean(x[0]) != term and clean(x[0]) not in term and term not in clean(x[0])})
        if len(pool) < 3: continue
        out.append(mc(pid_fn(len(out)), f'Which term fits this picture? “{clean(r[2])}”', [term] + rnd.sample(pool, 3), 0, f'{term}: {clean(r[1])}', kicker='Which term?'))
        if len(out) >= limit: break
    return out

def list_pair_check(items, title, pid, rnd):
    pairs = []
    for it in items:
        m = re.match(r'(.{2,30}?):\s+(.{4,120})$', clean(it))
        if m: pairs.append((m.group(1), m.group(2)))
    if len(pairs) < 4 or len(pairs) != len(items): return None
    i = rnd.randrange(len(pairs)); key = pairs[i][1]
    pool = [b for j, (a, b) in enumerate(pairs) if j != i and b != key and b not in key and key not in b]
    if len(pool) < 3: return None
    d = rnd.sample(pool, 3)
    if len(key) > 1.9 * max(len(x) for x in d) or len(key) * 1.9 < min(len(x) for x in d): return None
    return mc(pid, f'In “{title}”, which goes with “{pairs[i][0]}”?', [key] + d, 0, f'{pairs[i][0]}: {key}', kicker='From the list')

def overlap(a, b):
    w = lambda s: {x for x in re.findall(r'[a-z0-9]{4,}', s.lower())}
    return len(w(a) & w(b))

def order_check(items, title, pid):
    steps = [clean(i) for i in items]
    if not (3 <= len(steps) <= 6) or any(len(s) > 150 for s in steps): return None
    return order(pid, f'Put “{title}” in order.', steps, 'This is the order the course uses: ' + ' Then '.join(s[0].lower() + s[1:] if s[0].isupper() and not s[:2].isupper() else s for s in steps[:2]) + ' and so on.')

# ---------------------------------------------------------------- session assembly
def parse_gate_meta():
    cm = read(f'{REF}/course-map.md')
    levels = []
    t = table(cm.split('## Levels')[1].split('## Sessions')[0])
    for r in t['rows']:
        m = re.match(r'Level (\d): (\w+) \((.+)\)', r[0])
        levels.append(dict(n=int(m.group(1)), title=m.group(2), range=m.group(3), sessions=[int(x) for x in re.findall(r'\d+', r[1])], gate_text=r[3]))
    sess = {}
    st = table(cm.split('## Sessions')[1].split('## Goals')[0])
    for r in st['rows']:
        sess[int(r[0])] = dict(level=r[1], title=r[2], deliverable=r[3].rstrip('.'), worth=r[4], gate=r[5].strip() == 'GATE')
    return levels, sess

def rubric_rows(head):
    rb = read(f'{REF}/rubrics.md')
    sec = sections(rb)
    for k in sec:
        if k.startswith(head):
            return [[r[0], you(r[1])] for r in table(sec[k])['rows']]
    return []

def build_session(n, meta):
    rnd = random.Random(1000 + n)
    p = f's{n:02d}'; sec = md_session(n)
    md_all = read(f'{REF}/sessions/s{n:02d}.md')
    pool_ticks = sorted(set(re.findall(r'`([^`]+)`', md_all)))
    pool_bold = sorted({b for b in re.findall(r'\*\*([^*]+)\*\*', md_all) if not b.endswith(('.', ':')) and b not in ('Know', 'Do')})
    keys = list(sec.keys())
    custom = []
    for k in keys[keys.index('Plain-language glossary') + 1:]:
        if k.startswith('Worked demo'): break
        custom.append(k)
    demo_key = next(k for k in keys if k.startswith('Worked demo'))
    gl = table(sec['Plain-language glossary'])

    # ---- Learn 1: goal, key points, glossary
    goal_txt = sec['Goal and outcomes']
    outcomes = bullets(goal_txt)
    kp = bullets(sec['Key points'])
    voc = table(sec['Vocabulary'])['rows']
    L1 = [dict(id=f'{p}-L1-1', type='teach', title='What you will be able to do', blocks=[
        dict(t='p', text=f'Deliverable: {meta["deliverable"]} ({meta["worth"]}).'),
        dict(t='label', text='By the end of this session you can'), dict(t='list', items=outcomes)])]
    nch = max(1, -(-len(kp) // 4)); size = -(-len(kp) // nch)
    chunks = [kp[i:i + size] for i in range(0, len(kp), size)]
    cid = 2; used_vocab = set()
    for ci, ch in enumerate(chunks):
        L1.append(dict(id=f'{p}-L1-{cid}', type='teach', title=f'Key points {ci + 1} of {len(chunks)}', blocks=[dict(t='list', items=ch)])); cid += 1
        got = 0
        for bl in ch:
            q = cloze(bl, pool_ticks, pool_bold, f'{p}-L1-{cid}', rnd)
            if q: L1.append(q); cid += 1; got += 1; break
        want = 2 if len(chunks) == 1 else (1 if got == 0 else 0)
        txt = ' '.join(ch)
        ranked = sorted([i for i in range(len(voc)) if i not in used_vocab], key=lambda i: -overlap(voc[i][0] + ' ' + voc[i][1], txt))
        for i in ranked:
            if want <= 0: break
            q = vocab_check(voc[i], voc, f'{p}-L1-{cid}', rnd)
            if q: L1.append(q); cid += 1; used_vocab.add(i); want -= 1
    L1.append(dict(id=f'{p}-L1-{cid}', type='teach', title='Plain-language glossary', blocks=[
        dict(t='p', text='Each term in everyday words. The last column is a picture to remember it by.'), dict(t='table', **gl)])); cid += 1
    for q in hook_checks(gl, lambda k: f'{p}-L1-{cid + k}', rnd): L1.append(q); cid += 1

    # ---- Learn 2: the teaching sections
    L2 = []; cid = 1
    for k in custom:
        blks = rich(sec[k])
        L2.append(dict(id=f'{p}-L2-{cid}', type='teach', title=k, blocks=blks)); cid += 1
        tbls = [b for b in blks if b['t'] == 'table']
        chk = []
        for tb in tbls:
            chk += table_checks(tb, k, 'tmp', rnd, limit=2 if len(tbls) == 1 else 1)
        for b in blks:
            if b['t'] == 'list' and len(chk) < 2:
                q = list_pair_check(b['items'], k, 'tmp', rnd)
                if q: chk.append(q)
        for b in blks:
            if b['t'] == 'olist':
                o = order_check(b['items'], k, 'tmp')
                if o: chk = chk[:1] + [o]
                break
        for q in chk[:2]:
            q = dict(q); q['id'] = f'{p}-L2-{cid}'; cid += 1; L2.append(q)
    cm = table(sec['Common mistakes'])
    L2.append(dict(id=f'{p}-L2-{cid}', type='teach', title='Common mistakes', blocks=[dict(t='table', **cm)])); cid += 1
    cmq = table_checks(cm, 'Common mistakes', 'tmp', rnd, limit=2)
    for q in cmq:
        q = dict(q); q['id'] = f'{p}-L2-{cid}'; cid += 1; L2.append(q)

    # ---- Demo: predict
    dt = table(sec[demo_key]); rows = dt['rows']
    W = [dict(id=f'{p}-W-1', type='teach', title=demo_key.split(':', 1)[1].strip().capitalize(), blocks=[
        dict(t='p', text='You will run this yourself in the exercise. For now, read what you do at each step and predict what it shows.'),
        dict(t='olist', items=[clean(r[1]) for r in rows])])]
    shows = [clean(r[2]) for r in rows]
    for i, r in enumerate(rows):
        key = shows[i]
        pool = [s for j, s in enumerate(shows) if j != i and s != key]
        pool = [s for s in pool if s not in key and key not in s]
        if len(pool) < 1: continue
        opts = [key] + rnd.sample(pool, min(3, len(pool)))
        W.append(mc(f'{p}-W-{i + 2}', f'Step {r[0]}: {sent(clean(r[1]))} What is this step meant to show?', opts, 0, sent(key), kicker='Predict, then see'))

    # ---- Practice
    mcq, fill, match = quiz_items_safe(n)
    P1, P2 = mcq[:5], mcq[5:10]

    # ---- Recall
    fcs = flash_cards(n, sec)[:6]
    R = fcs + fill
    if match: R.append(match)
    else:
        pairs = [[clean(r[0]), clean(r[2])] for r in cm['rows'][:4]]
        R.append(dict(id=f'{p}m', type='match', prompt='Match each common mistake to its fix.', pairs=pairs))

    # ---- Task
    ex = numbered(sec['Exercises'])
    parts = []
    for i, e in enumerate(ex):
        e = you(e)
        m = re.match(r'([^.:]{2,40})\.\s+(.*)', e)
        if m: title, intro = m.group(1), m.group(2)
        else:
            head = re.split(r'[:;]|\.\s', e)[0].strip().rstrip('.,;:')
            title = head if 3 <= len(head) <= 58 else f'Exercise {i + 1}'
            if title[0].islower(): title = title[0].upper() + title[1:]
            intro = e
        parts.append(dict(id=f'e{i + 1}', kind='rows', title=(title if title.startswith('Exercise ') else f'{i + 1}. {title}'), intro=intro, count=1, rowlabel=title,
                          fields=[dict(k='did', label='What you did and what Claude produced', type='area', min=4),
                                  dict(k='found', label='What worked and what failed', type='area', min=3),
                                  dict(k='next', label='What you would change next time', type='text', min=3)]))
    gate_rows = {r[0]: r[1] for r in rubric_rows('Gate rubric')}
    parts.append(dict(id='ready', kind='checks', title='Before you hand it in', intro='Tick only what is true. Your instructor grades the deliverable against the rubric.',
                      items=[f'{k}: {gate_rows[k]}' for k in ('Real task', 'Criteria first', 'Evidence', 'Own explanation')]))
    task = dict(title=f'Do it: {meta["deliverable"]}',
                brief=[f'Deliverable: {meta["deliverable"]} ({meta["worth"]}), graded by your instructor.',
                       'You run these in Claude on your own material. Log what happened in your own words. The app does not write your entries and does not grade them.'],
                parts=parts)

    # ---- Case
    ans = md_answer(n)['Model answer'].strip()
    scen = [l for l in sec['Case to attempt'].split('\n') if l.strip() and not l.startswith('Attempt')][0].strip().strip('"')
    case = dict(scenario=scen, model=ans, checks=clause_checks(ans))

    nodes = [
        dict(k='L1', kind='learn', title='Core ideas', blurb='The goal, the key points and the plain-language terms, each followed by a quick check.', items=L1),
        dict(k='L2', kind='learn', title='In practice', blurb='The methods, tables and common mistakes for this session.', items=L2),
        dict(k='W', kind='demo', title=demo_key.split(':', 1)[1].strip().capitalize(), blurb='The worked demo. Predict what each step shows, then see the answer.', items=W),
        dict(k='P1', kind='practice', title='Practice', blurb='Five questions. A missed question returns once and joins your review list.', items=P1),
        dict(k='P2', kind='practice', title='Practice 2', blurb='Five more questions.', items=P2),
        dict(k='R', kind='recall', title='Recall', blurb='Flashcards, then typed answers and a matching round.', items=R),
        dict(k='X', kind='task', title='Do it in Claude', task=task),
        dict(k='C', kind='case', title='Case', case=case),
        dict(k='Q', kind='question', title='Now question it', closer=closer_of(sec), exit=exit_prompt_of(sec)),
    ]
    sheet = sheet2(sec, custom)
    return dict(id=p, n=n, title=meta['title'], deliverable=meta['deliverable'], points=meta['worth'], nodes=nodes, sheet=sheet, goal=outcomes[0] if outcomes else '')

def clause_checks(ans):
    sents = [s.strip() for s in re.split(r'(?<=[.!?])\s+', ans) if s.strip()]
    out = []
    for s in sents:
        s = s.rstrip('.')
        if s.count(',') >= 2:
            for part in re.split(r',\s+(?:and\s+)?', s):
                part = part.strip()
                if part: out.append(part)
        else: out.append(s)
    out = [o for o in out if len(o) > 6][:6]
    return ['My answer covered: ' + (o if o[:2].isupper() or o.split()[0] in ('I', 'A', 'CLAUDE.md') else o[0].lower() + o[1:]) for o in out]

def quiz_items_safe(n):
    import build_data
    mcq, fill, match = build_data.parse(n)
    for q in mcq: q['type'] = 'mcq'
    for f in fill:
        f['type'] = 'fill'
        if all(re.fullmatch(r'[\d,.]+', a.replace('$', '')) for a in f['answers']): f['numeric'] = True
    if match: match['type'] = 'match'
    return mcq, fill, match

def sheet2(sec, custom):
    s = []
    cs = sec['Cheat sheet']
    know = bullets(cs.split('**Do**')[0]); do = bullets(cs.split('**Do**')[1])
    s.append(dict(title='Cheat sheet', blocks=[dict(t='label', text='Know'), dict(t='list', items=know), dict(t='label', text='Do'), dict(t='list', items=do)]))
    s.append(dict(title='Plain-language glossary', blocks=rich(sec['Plain-language glossary'])))
    for t in custom + ['Common mistakes']:
        s.append(dict(title=t, blocks=rich(sec[t])))
    s.append(dict(title='Vocabulary', blocks=rich(sec['Vocabulary'])))
    s.append(dict(title='Score ladder', blocks=rich(sec['Score ladder (what your work looks like at each level)'])))
    s.append(dict(title='Going further', blocks=rich(sec['Going further'])))
    s.append(dict(title='Check yourself', blocks=rich(sec['Self-check questions'])))
    s.append(dict(title='Study sources', blocks=rich(sec['Study sources'])))
    return s
