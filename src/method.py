"""Applies the learning method to the built course.
Each session becomes: Warm-up (dynamic, from session 2) -> Guess first -> Learn 1 -> Learn 2 -> See it -> Apply (hints)
-> Practice -> Mixed practice -> Recall -> Mastery check -> Exercise -> Case -> Exit ticket -> Level checkpoint (gate sessions)."""
import learn_content as LC
import deep as DP

LETTERS = 'ABCD'


def mcq(item_id, tup, kicker, **extra):
    stem, opts, why, o, hint = tup
    it = dict(id=item_id, type='mcq', stem=stem, options=[dict(k=LETTERS[i], t=t) for i, t in enumerate(opts)],
              key='A', why=why, kicker=kicker, o=o, core=True)
    if hint: it['hint'] = hint
    it.update(extra)
    return it


def node(k, kind, title, blurb, items=None, **kw):
    d = dict(k=k, kind=kind, title=title, blurb=blurb, items=items or [])
    d.update(kw)
    return d


def apply(sessions):
    Q = LC.load()
    counts = {s['n']: len(s['outcomes']) for s in sessions}
    errs = LC.validate(Q, counts)
    assert not errs, errs[:5]
    DQ = DP.load()
    derrs = DP.validate(DQ)
    assert not derrs, derrs[:5]
    for s in sessions:
        n, sid, q = s['n'], s['id'], Q[s['n']]
        by = {nd['k']: nd for nd in s['nodes']}

        # the situation, the transfer action and the bridge to the next session
        dq = DQ[n]
        s['hook'] = dict(title=dq['hook'][0], text=dq['hook'][1])
        s['today'] = dq['today']
        s['bridge'] = dq['bridge']
        # sessions 4 to 24: authored worked example and case replace the generated ones
        if 'demo' in dq:
            W0 = by['W']
            W0['items'] = [W0['items'][0]] + [
                dict(id='%s-W-%d' % (sid, i + 2), type='mcq', stem=stem,
                     options=[dict(k=LETTERS[j], t=t) for j, t in enumerate(opts)], key='A', why=why, kicker='Predict, then see')
                for i, (stem, opts, why) in enumerate(dq['demo'])]
            W0['blurb'] = 'A worked example. Read each situation, predict what happens, then see why.'
            by['C']['case'] = dict(dq['case'])
        for need in ('L1', 'L2', 'W', 'P1', 'P2', 'R'):
            assert need in by, (sid, need)
        nout = len(s['outcomes'])

        # pictures: first diagram after the opening item of Learn 1, the rest at the top of Learn 2
        dg = q['dg']
        def pic(i, d):
            return dict(id='%s-%s-pic%d' % (sid, 'L1' if i == 0 else 'L2', i), type='teach', title='The picture: ' + d['title'], blocks=[dict(t='diagram', **d)])
        by['L1']['items'].insert(1, pic(0, dg[0]))
        for j, d in enumerate(dg[1:]):
            by['L2']['items'].insert(j, pic(j + 1, d))
        s['sheet'].insert(0, dict(title='The pictures', blocks=[dict(t='diagram', **d) for d in dg]))

        # guess first
        pre = [mcq('%s-PR-%d' % (sid, i + 1), t, 'Guess first', predict=True) for i, t in enumerate(q['pre'])]
        PR = node('PR', 'pretest', 'Guess first',
                  'Two questions on what this session teaches. Guess before you learn it. A wrong guess still helps you remember the answer.', pre)

        # apply with hints
        ap = [mcq('%s-AP-%d' % (sid, i + 1), t, 'Apply it, hint available') for i, t in enumerate(q['apply'])]
        AP = node('AP', 'apply', 'Apply it',
                  'Two scenarios. You saw the worked steps; now use them. A hint is there if you need it and costs half the XP.', ap)

        # mastery check: one question per outcome, the guess-first questions again, then explain it
        ck = [mcq('%s-CK-%d' % (sid, i + 1), t, 'Mastery check') for i, t in enumerate(q['check'])]
        post = [mcq('%s-CK-p%d' % (sid, i + 1), t, 'Guess-first question, again', src=pre[i]['id'], post=True, core=False) for i, t in enumerate(q['pre'])]
        for p in post: p.pop('o', None)
        prompt, model, points = q['tb']
        ex = dict(id='%s-CK-x' % sid, type='explain', prompt=prompt, model=model, points=points, kicker='Teach it back')
        graded = len(ck) + len(post)
        need = -(-graded * 4 // 5)
        CK = node('CK', 'master', 'Mastery check',
                  'One question per outcome, the two guess-first questions again, then explain it in your own words. Pass mark: %d of %d right on the first try.' % (need, graded),
                  ck + post + [ex], need=need, graded=graded)

        by['P2']['title'] = 'Mixed practice' if n > 1 else 'Practice 2'
        if n > 1:
            by['P2']['blurb'] = 'Five more questions. Three are from this session and two come from earlier ones, mixed in so you practise choosing the method, not only recalling it.'
            by['P2']['mixed'] = True

        order = []
        if n > 1:
            order.append(node('U', 'warmup', 'Warm-up',
                              'Retrieval before anything new: questions from earlier sessions that are due again. Answer from memory, then rate how sure you were.', dyn='warmup'))
        order += [PR, by['L1'], by['L2'], by['W'], AP, by['P1'], by['P2'], by['R'], CK]
        for k in ('X', 'C', 'Q'):
            if k in by: order.append(by[k])
        if s['kind_gate']:
            order.append(node('CP', 'checkpoint', 'Level checkpoint',
                              'Ten questions mixed from every session of this level, taken before the gate. What you miss comes back in later warm-ups.', dyn='checkpoint'))
        extra = [k for k in by if k not in {'L1', 'L2', 'W', 'P1', 'P2', 'R', 'X', 'C', 'Q'}]
        assert not extra, (sid, extra)
        s['nodes'] = order
    return sessions
