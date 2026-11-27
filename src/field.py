"""Loads and validates the "From the sources" content: lesson cards and questions built from the reference pages.
Each session has `steps`: dicts are lesson cards, tuples are questions (stem, [correct, wrong, wrong, wrong], why).
Card keys: title, paras, bullets, stats [(number, label)], quote (text, by), viz (a diagram spec), src (title, url).
Rule: every card's src url must be on the same session's reference shelf (src/refs_a.py, refs_b.py).
Run `python3 src/field.py` to check it on its own."""
import importlib.util, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import refs as RF

DG_KINDS = {'flow', 'loop', 'stack', 'compare', 'bars', 'tree', 'quad', 'swim', 'rings', 'delta', 'matrix', 'ladder', 'timeline', 'tokens', 'window', 'cache', 'curve', 'cost', 'trifecta', 'scene'}


def _load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + '.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.Q


def load():
    Q = {}
    for fn in sorted(f for f in os.listdir(HERE) if f.startswith('field_') and f.endswith('.py')):
        for k, v in _load(fn[:-3]).items():
            assert k not in Q, 'duplicate session %s' % k
            Q[k] = v
    return Q


def _dg(n, v, errs):
    k = v.get('kind')
    if k not in DG_KINDS: errs.append('S%d: diagram kind %s' % (n, k)); return
    need = {'swim': ('lanes', 'msgs'), 'rings': ('layers',), 'delta': ('rows',), 'matrix': ('cols', 'rows'), 'ladder': ('steps',), 'timeline': ('events',),
            'flow': ('steps',), 'loop': ('steps',), 'stack': ('parts',), 'compare': ('left', 'right'), 'bars': ('rows',), 'tree': ('root', 'kids'), 'quad': ('cells',),
            'tokens': ('prompt', 'variants'), 'window': ('fixed', 'turn'), 'cache': ('blocks', 'scenarios'), 'curve': ('title',), 'cost': ('models',), 'trifecta': ('legs', 'presets'), 'scene': ('nodes', 'steps')}[k]
    for f in need:
        if not v.get(f): errs.append('S%d: %s diagram missing %s' % (n, k, f))
    if k == 'swim':
        if len(v['lanes']) not in (2, 3): errs.append('S%d: swim needs 2 or 3 lanes' % n)
        for m in v['msgs']:
            if not (0 <= m['from'] < len(v['lanes']) and 0 <= m['to'] < len(v['lanes'])) or m['from'] == m['to']: errs.append('S%d: swim lane index' % n)
            if len(m['t']) > (30 if len(v['lanes']) == 2 else 22): errs.append('S%d: swim label too long: %s' % (n, m['t']))
    if k == 'matrix':
        for r in v['rows']:
            if len(r['v']) != len(v['cols']) or any(x not in (0, 1, 2) for x in r['v']): errs.append('S%d: matrix row %s' % (n, r['h']))
    if k == 'ladder' and 'mark' in v and not 0 <= v['mark'] < len(v['steps']): errs.append('S%d: ladder mark' % n)


def validate(Q, R=None):
    R = R or RF.load()
    errs = []
    for n, q in sorted(Q.items()):
        steps = q.get('steps', [])
        cards = [s for s in steps if isinstance(s, dict)]
        checks = [s for s in steps if isinstance(s, tuple)]
        if not 3 <= len(cards) <= 6: errs.append('S%d: %d cards (want 3 to 6)' % (n, len(cards)))
        if len(checks) != 4: errs.append('S%d: %d questions (want 4)' % (n, len(checks)))
        if not any('viz' in c for c in cards): errs.append('S%d: no diagram' % n)
        urls = {e[1] for e in R[n]}
        texts = []
        for c in cards:
            if not c.get('title') or not c.get('src'): errs.append('S%d: card needs title and src' % n); continue
            for sr in (c['src'] if isinstance(c['src'], list) else [c['src']]):
                if sr[1] not in urls: errs.append('S%d: src not on the shelf: %s' % (n, sr[1]))
            if not (c.get('paras') or c.get('bullets')): errs.append('S%d: card %s has no text' % (n, c['title']))
            if 'viz' in c: _dg(n, c['viz'], errs)
            texts += [c['title']] + c.get('paras', []) + c.get('bullets', []) + [x for s in c.get('stats', []) for x in s] + list(c.get('quote', ()))
            for p in c.get('paras', []):
                if len(p.split()) > 70: errs.append('S%d: paragraph too long in %s' % (n, c['title']))
        for ch in checks:
            if len(ch) != 3: errs.append('S%d: question shape' % n); continue
            stem, opts, why = ch
            if len(opts) != 4 or len(set(opts)) != 4: errs.append('S%d: question needs 4 distinct options: %s' % (n, stem[:40]))
            texts += [stem, why] + list(opts)
        for t in texts:
            if '—' in t or ' -- ' in t: errs.append('S%d: dash style in "%s"' % (n, t[:40]))
        if steps and isinstance(steps[0], tuple): errs.append('S%d: start with a card' % n)
    return errs


if __name__ == '__main__':
    Q = load()
    errs = validate(Q) if Q else ['no content yet']
    longest = total = 0
    for q in Q.values():
        for s in q['steps']:
            if isinstance(s, tuple):
                total += 1
                if max(s[1], key=len) == s[1][0]: longest += 1
    print('sessions', len(Q), 'questions', total, 'correct-is-longest %d%%' % (100 * longest // max(total, 1)), 'errors', len(errs))
    for e in errs: print(' ', e)
