"""Loads the reference shelves and validates them. Run `python3 src/refs.py` to check shape (no network)."""
import importlib.util, os
HERE = os.path.dirname(os.path.abspath(__file__))
KINDS = ('docs', 'deep', 'try')
# hosts allowed on a shelf: Anthropic's own sites only, so every link can be opened and re-checked by tools/check_links.py
HOSTS = ('https://platform.claude.com/', 'https://code.claude.com/', 'https://support.claude.com/', 'https://www.anthropic.com/')


import hashlib


def nid(u):
    """Stable short id of a reference. The id is all the app ships and shows; the address itself is never a link."""
    return hashlib.sha1(u.encode()).hexdigest()[:8]


def _load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + '.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.Q


def load():
    Q = {}
    for n in ('refs_a', 'refs_b'):
        for k, v in _load(n).items():
            assert k not in Q, 'duplicate session %s' % k
            Q[k] = v
    return Q


def validate(Q):
    errs = []
    if sorted(Q) != list(range(1, 25)): errs.append('missing sessions: %s' % sorted(set(range(1, 25)) - set(Q)))
    for n, rows in sorted(Q.items()):
        if not 7 <= len(rows) <= 16: errs.append('S%d: %d references (want 7 to 16)' % (n, len(rows)))
        seen = set()
        kinds = set()
        for e in rows:
            if len(e) != 4: errs.append('S%d: bad entry %s' % (n, str(e)[:50])); continue
            k, u, t, w = e
            kinds.add(k)
            if k not in KINDS: errs.append('S%d: kind %s' % (n, k))
            if not u.startswith(HOSTS): errs.append('S%d: host not allowed %s' % (n, u))
            if u in seen: errs.append('S%d: duplicate %s' % (n, u))
            seen.add(u)
            if not t.strip() or len(t) > 90: errs.append('S%d: title %s' % (n, t[:40]))
            if not w.strip() or len(w) > 150: errs.append('S%d: why too long or empty %s' % (n, t[:40]))
            for x in (t, w):
                if '—' in x or ' -- ' in x: errs.append('S%d: dash style in %s' % (n, t[:40]))
        if 'docs' not in kinds: errs.append('S%d: no Read links' % n)
        if n not in (16,) and 'deep' not in kinds: errs.append('S%d: no Go deeper link' % n)
    return errs


if __name__ == '__main__':
    Q = load()
    errs = validate(Q)
    tot = sum(len(v) for v in Q.values())
    uniq = len({e[1] for v in Q.values() for e in v})
    print('sessions', len(Q), 'entries', tot, 'unique links', uniq, 'errors', len(errs))
    for e in errs: print(' ', e)
