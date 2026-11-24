"""Field missions: a short branching story per session. The learner makes a call at each step and sees what it costs.

Format (see missions_a.py):
    M(n, title, brief, meters, steps, ends, tip, boss=False)
      meters: 2 or 3 of (label, key, start). Higher is always better.
      steps:  3 steps (5 for a boss mission); each is St(scene, ask, [C, C, C]).
      C(r, text, say, why, **fx):  r is 2 (the strong move), 1 (workable but weak) or 0 (the costly move); fx moves the meters.
      ends:   (great, ok, poor): the closing line for 3, 2 or 1 stars.
Every step has exactly one choice of each rating. The learner sees the choices in a shuffled order.
Stars: 3 for at least 85 percent of the points, 2 for at least 60 percent, otherwise 1. A mission cannot be failed, only replayed.
"""

BOSS_STEPS = 5
STEPS = 3


def C(r, text, say, why, **fx):
    return dict(r=r, t=text, say=say, why=why, fx=fx)


def St(scene, ask, choices):
    return dict(scene=scene, ask=ask, choices=choices)


def M(n, title, brief, meters, steps, ends, tip, boss=False):
    return dict(n=n, title=title, brief=brief, meters=[list(m) for m in meters], steps=steps, ends=list(ends), tip=tip, boss=boss)


def validate(ms):
    errs = []
    nums = sorted(m['n'] for m in ms)
    if nums != list(range(1, 25)): errs.append('need exactly one mission per session 1..24, have %s' % nums)
    longest_best = longest_n = 0
    for m in ms:
        w = 'S%s: ' % m['n']
        want = BOSS_STEPS if m['boss'] else STEPS
        if m['n'] in (3, 7, 11, 16, 24) and not m['boss']: errs.append(w + 'level-end sessions have boss missions')
        if m['n'] not in (3, 7, 11, 16, 24) and m['boss']: errs.append(w + 'only level-end sessions have boss missions')
        if len(m['steps']) != want: errs.append(w + 'needs %d steps, has %d' % (want, len(m['steps'])))
        if not 2 <= len(m['meters']) <= 3: errs.append(w + 'needs 2 or 3 meters')
        keys = [x[1] for x in m['meters']]
        if len(set(keys)) != len(keys): errs.append(w + 'duplicate meter keys')
        for lab, key, start in m['meters']:
            if not 30 <= start <= 80: errs.append(w + 'meter start out of range: ' + key)
        if len(m['ends']) != 3: errs.append(w + 'needs three endings')
        if not 40 <= len(m['brief']) <= 420: errs.append(w + 'brief length %d' % len(m['brief']))
        if len(m['title']) > 40: errs.append(w + 'title too long')
        if not 20 <= len(m['tip']) <= 180: errs.append(w + 'tip length %d' % len(m['tip']))
        for i, st in enumerate(m['steps']):
            ww = w + 'step %d: ' % (i + 1)
            if not 60 <= len(st['scene']) <= 420: errs.append(ww + 'scene length %d' % len(st['scene']))
            if not st['ask'].endswith('?'): errs.append(ww + 'ask should be a question')
            cs = st['choices']
            if len(cs) != 3: errs.append(ww + 'needs 3 choices'); continue
            if sorted(c['r'] for c in cs) != [0, 1, 2]: errs.append(ww + 'ratings must be one each of 2, 1, 0')
            best = [c for c in cs if c['r'] == 2][0]; bad = [c for c in cs if c['r'] == 0][0]
            longest_n += 1
            if len(best['t']) == max(len(c['t']) for c in cs): longest_best += 1
            for c in cs:
                if not 15 <= len(c['t']) <= 150: errs.append(ww + 'choice length %d: %s' % (len(c['t']), c['t'][:30]))
                if not 25 <= len(c['say']) <= 240: errs.append(ww + 'consequence length %d' % len(c['say']))
                if not 25 <= len(c['why']) <= 240: errs.append(ww + 'why length %d' % len(c['why']))
                for k in c['fx']:
                    if k not in keys: errs.append(ww + 'unknown meter ' + k)
            if sum(best['fx'].values()) <= sum(bad['fx'].values()): errs.append(ww + 'the strong move should leave the meters better than the costly one')
            if not any(v > 0 for v in best['fx'].values()): errs.append(ww + 'the strong move should raise something')
            if not any(v < 0 for v in bad['fx'].values()): errs.append(ww + 'the costly move should cost something')
        blob = ' '.join([m['title'], m['brief'], m['tip']] + m['ends'] + [st['scene'] + st['ask'] + ' '.join(c['t'] + c['say'] + c['why'] for c in st['choices']) for st in m['steps']])
        if '—' in blob or '–' in blob or ' -- ' in blob: errs.append(w + 'dash style')
    if longest_n and longest_best / longest_n > 0.55:
        errs.append('the strong move is the longest choice in %d%% of steps; rebalance the wording' % round(100 * longest_best / longest_n))
    return errs


def load():
    import missions_a, missions_b, missions_c
    return {m['n']: m for m in missions_a.MISSIONS + missions_b.MISSIONS + missions_c.MISSIONS}


if __name__ == '__main__':
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    ms = list(load().values())
    e = validate(ms)
    print(len(ms), 'missions;', sum(len(m['steps']) for m in ms), 'steps;', 'errors:' if e else 'ok', *e[:40], sep='\n' if e else ' ')
