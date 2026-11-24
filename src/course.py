"""Assembles the whole course: five levels, 24 sessions, gates. Sessions 1 to 3 are authored in content.py, 4 to 24 are built in generic.py."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import re, json
import content as C
import generic as G
import method as M
import cards as CD

LEVEL_NAMES = {1: 'Foundations', 2: 'Practitioner', 3: 'Builder', 4: 'Operator', 5: 'Expert'}
RUBRIC = {1: 'Gate rubric', 2: 'Gate rubric', 3: 'Gate rubric', 4: 'Capstone rubric', 5: 'Expert rubric'}

def strip_hearts(t):
    t = re.sub(r'\s*No hearts in this step\.', '', t)
    t = t.replace('Five questions. Five hearts.', 'Five questions. A missed question returns once and joins your review list.')
    t = t.replace('Five more questions. Five hearts.', 'Five more questions. Stars for first-try accuracy.')
    return t

def build():
    levels_meta, sess_meta = G.parse_gate_meta()
    sessions = []
    for n in range(1, 25):
        meta = sess_meta[n]
        if n <= 3:
            s = {1: C.session1, 2: C.session2, 3: C.session3}[n]()
            s['points'] = meta['worth']
            sec = C.md_session(n)
            s['goal'] = ''
            s['outcomes'] = C.bullets(sec['Goal and outcomes'])
            for node in s['nodes']:
                node['blurb'] = strip_hearts(node.get('blurb', ''))
                node.pop('forgiving', None)
            # hand-authored sessions keep their own sheet
        else:
            s = G.build_session(n, meta)
            sec = C.md_session(n)
            s['outcomes'] = C.bullets(sec['Goal and outcomes'])
        s['level'] = int(meta['level'][1])
        s['kind_gate'] = meta['gate']
        sessions.append(s)
    sessions = M.apply(sessions)
    levels = []
    for lm in levels_meta:
        gate_session = [s for s in sessions if s['level'] == lm['n'] and s['kind_gate']][0]
        m = re.match(r'(.+?)\s*\(session (\d+)\)', lm['gate_text'])
        title = m.group(1).strip() if m else lm['gate_text']
        crit = G.rubric_rows(RUBRIC[lm['n']])
        levels.append(dict(id=f'L{lm["n"]}', n=lm['n'], name=LEVEL_NAMES[lm['n']], range=lm['range'],
                           sessions=[f's{x:02d}' for x in lm['sessions']],
                           gate=dict(id=f'gate-L{lm["n"]}', session=gate_session['id'], title=title[0].upper() + title[1:],
                                     brief=('' if G.you(gate_session['deliverable']).strip().lower() == (title[0].upper() + title[1:]).strip().lower() else G.you(gate_session['deliverable'])), rubric=RUBRIC[lm['n']], criteria=crit,
                                     lead=('You supply the project. The examiner supplies a new input on the day.' if lm['n'] == 4 else
                                           'Evidence must come from your own running system, not from description.' if lm['n'] == 5 else ''))))
    for s in sessions:
        # the old pointers to pages outside the app are replaced by the in-app source notes
        s['sheet'] = [sh for sh in s['sheet'] if sh['title'] != 'Study sources']
    for s in sessions:
        s['search'] = ' '.join(
            [s['title'], s['deliverable']] + [b.get('text', '') + ' '.join(b.get('items', [])) + ' '.join(' '.join(r) for r in b.get('rows', []))
                                              for sh in s['sheet'] for b in sh['blocks']] + [sh['title'] for sh in s['sheet']]
            + [r['t'] + ' ' + r['w'] for r in s.get('refs', [])]).lower()
    def walk(o, key=None):
        if isinstance(o, str): return o if key == 'search' else G.you(o)
        if isinstance(o, list): return [walk(x) for x in o]
        if isinstance(o, dict): return {k: walk(v, k) for k, v in o.items()}
        return o
    levels = walk(levels); sessions = walk(sessions)
    d = dict(levels=levels, sessions=sessions)
    notes = {n['id']: n for n in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'notes.json'), encoding='utf-8'))['notes']}
    for s in sessions:
        for r in s['refs']: assert r['id'] in notes, ('shelf entry without a note', s['id'], r['t'])
        for nd in s['nodes']:
            for it in nd.get('items', []):
                for b in it.get('blocks', []) or []:
                    if b.get('t') == 'src': assert b['id'] in notes, ('source line without a note', it['id'])
    d['notes'] = notes
    cards = CD.load()
    cerrs = CD.validate(cards)
    assert not cerrs, cerrs[:5]
    d['cards'] = cards
    ids = set()
    for s in sessions:
        for n in s['nodes']:
            for it in n.get('items', []):
                if 'type' not in it:
                    it['type'] = 'mcq' if 'options' in it else 'fill' if 'answers' in it else 'match' if 'pairs' in it else None
                assert it['type'], it['id']
                if it['type'] == 'mission': ids.add(it['id']); continue
                assert it['id'] not in ids, 'duplicate id ' + it['id']
                ids.add(it['id'])
                if it['type'] == 'mcq':
                    assert it['key'] in [o['k'] for o in it['options']], it['id']
                    assert len({o['t'] for o in it['options']}) == len(it['options']), ('dup option', it['id'])
                if it['type'] == 'fill':
                    assert it['stem'].count('____') == len(it['answers']), it['id']
    return d

if __name__ == '__main__':
    d = build()
    blob = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
    print('sessions', len(d['sessions']), 'bytes', len(blob.encode()))
    for lv in d['levels']: print(lv['id'], lv['name'], lv['range'], lv['sessions'], lv['gate']['title'], len(lv['gate']['criteria']))
    nodes = sum(len(s['nodes']) for s in d['sessions']); print('nodes', nodes, '+ gates 5')
