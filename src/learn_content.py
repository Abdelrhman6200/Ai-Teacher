"""Loads the authored learning content for all 24 sessions and validates it against the course."""
import importlib.util, os
HERE = os.path.dirname(os.path.abspath(__file__))

def _load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + '.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m.Q

def load():
    Q = {}
    for n in ['lc1', 'lc2', 'lc3', 'lc4', 'lc5', 'lc6']:
        for k, v in _load(n).items():
            assert k not in Q, 'duplicate session %s' % k
            Q[k] = v
    return Q

KINDS = {'flow', 'loop', 'stack', 'compare', 'bars', 'tree', 'quad'}

def validate(Q, outcome_counts):
    """outcome_counts: {session_number: number_of_outcomes}"""
    errs = []
    assert sorted(Q) == list(range(1, 25)), 'missing sessions: %s' % sorted(set(range(1, 25)) - set(Q))
    for s, q in sorted(Q.items()):
        n = outcome_counts.get(s)
        def chk_item(it, where, need_o=True):
            if len(it) != 5: errs.append('S%d %s: tuple length %d' % (s, where, len(it))); return
            stem, opts, why, o, hint = it
            if len(opts) != 4: errs.append('S%d %s: %d options' % (s, where, len(opts)))
            if len(set(opts)) != len(opts): errs.append('S%d %s: duplicate options' % (s, where))
            if not stem.strip() or not why.strip(): errs.append('S%d %s: empty stem/why' % (s, where))
            if n is not None and not (0 <= o < n): errs.append('S%d %s: outcome %s out of range (%s)' % (s, where, o, n))
            for t in opts + [stem, why]:
                if '—' in t or ' -- ' in t: errs.append('S%d %s: dash style in text' % (s, where))
        if len(q['pre']) != 2: errs.append('S%d: pre count %d' % (s, len(q['pre'])))
        if len(q['apply']) != 2: errs.append('S%d: apply count %d' % (s, len(q['apply'])))
        for i, it in enumerate(q['pre']): chk_item(it, 'pre%d' % i)
        for i, it in enumerate(q['apply']):
            chk_item(it, 'apply%d' % i)
            if not it[4]: errs.append('S%d apply%d: missing hint' % (s, i))
        if n is not None and len(q['check']) != n: errs.append('S%d: %d checks for %d outcomes' % (s, len(q['check']), n))
        for i, it in enumerate(q['check']):
            chk_item(it, 'check%d' % i)
            if it[3] != i: errs.append('S%d check%d: outcome %s should be %d' % (s, i, it[3], i))
        tb = q['tb']
        if len(tb) != 3 or len(tb[2]) < 3: errs.append('S%d: teach-back shape' % s)
        if not (1 <= len(q['dg']) <= 3): errs.append('S%d: diagram count' % s)
        for d in q['dg']:
            if d['kind'] not in KINDS: errs.append('S%d: diagram kind %s' % (s, d['kind']))
    return errs

if __name__ == '__main__':
    Q = load()
    import sys
    counts = {}
    try:
        sys.path.insert(0, HERE)
        import course
        data = course.build()
        for s in data['sessions']:
            counts[s['n'] if 'n' in s else s['id']] = len(s['outcomes'])
    except Exception as e:
        print('course not loaded:', e)
    errs = validate(Q, counts)
    print('sessions', len(Q), 'errors', len(errs))
    for e in errs: print(' ', e)
