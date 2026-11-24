"""Loads the authored depth content (situation, use-it-today, bridge, worked example, case) and validates it.
Run `python3 src/deep.py` to check it on its own."""
import importlib.util, os
HERE = os.path.dirname(os.path.abspath(__file__))


def _load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + '.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.Q


def load():
    Q = {}
    for n in ('deep_a', 'deep_b'):
        for k, v in _load(n).items():
            assert k not in Q, 'duplicate session %s' % k
            Q[k] = v
    return Q


def _bad(t):
    return '—' in t or ' -- ' in t


def validate(Q):
    errs = []
    if sorted(Q) != list(range(1, 25)):
        errs.append('missing sessions: %s' % sorted(set(range(1, 25)) - set(Q)))
    for n, q in sorted(Q.items()):
        h = q.get('hook')
        if not h or len(h) != 2 or not all(x.strip() for x in h): errs.append('S%d: hook' % n)
        elif len(h[1].split()) < 25: errs.append('S%d: hook too thin' % n)
        if not q.get('today', '').strip(): errs.append('S%d: today' % n)
        if n < 24 and not q.get('bridge', '').strip(): errs.append('S%d: bridge' % n)
        texts = [q.get('today', ''), q.get('bridge', '')] + list(h or [])
        if n >= 4:
            d = q.get('demo')
            if not d or len(d) != 3: errs.append('S%d: needs exactly 3 demo items' % n); d = d or []
            for i, it in enumerate(d):
                if len(it) != 3: errs.append('S%d demo%d: shape' % (n, i)); continue
                stem, opts, why = it
                if len(opts) != 4 or len(set(opts)) != 4: errs.append('S%d demo%d: needs 4 distinct options' % (n, i))
                if not stem.strip() or not why.strip(): errs.append('S%d demo%d: empty' % (n, i))
                texts += opts + [stem, why]
            c = q.get('case')
            if not c: errs.append('S%d: case' % n)
            else:
                if len(c.get('checks', [])) != 3: errs.append('S%d: case needs 3 checks' % n)
                if len(c.get('scenario', '').split()) < 20: errs.append('S%d: case scenario too thin' % n)
                if len(c.get('model', '').split()) < 15: errs.append('S%d: case model too thin' % n)
                texts += [c.get('scenario', ''), c.get('model', '')] + list(c.get('checks', []))
        for t in texts:
            if _bad(t): errs.append('S%d: dash style in "%s"' % (n, t[:40]))
    return errs


if __name__ == '__main__':
    Q = load()
    errs = validate(Q)
    longest = total = 0
    for q in Q.values():
        for stem, opts, why in q.get('demo', []):
            total += 1
            if max(opts, key=len) == opts[0]: longest += 1
    print('sessions', len(Q), 'demo items', total, 'correct-is-longest %d%%' % (100 * longest // max(total, 1)), 'errors', len(errs))
    for e in errs: print(' ', e)
