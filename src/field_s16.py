"""From the sources, session 16. Dates and model states are as of 24 November 2026 and change monthly."""
P = 'https://platform.claude.com/docs/en/'
C = 'https://code.claude.com/docs/en/'
H = 'https://support.claude.com/en/articles/'
A = 'https://www.anthropic.com/'
Q = {}
DEP = P + 'about-claude/model-deprecations'

Q[16] = dict(steps=[
 dict(title='Every model has a lifecycle',
      paras=['Anthropic uses four terms. Active models are fully supported and recommended. Legacy models no longer receive updates and might be deprecated. A deprecated model still works but is no longer recommended, and comes with a recommended replacement and a retirement date. After retirement, requests to the model fail.',
             'For publicly released models Anthropic gives at least 60 days\' notice to customers with active deployments.'],
      stats=[('60 days', 'minimum notice before a public model retires')],
      viz=dict(kind='flow', title='The lifecycle', steps=[dict(h='Active', s='Supported and recommended'), dict(h='Legacy', s='No more updates'), dict(h='Deprecated', s='Replacement and retirement date given'), dict(h='Retired', s='Requests fail')]),
      src=('Model deprecations', DEP)),
 ('How much notice does Anthropic give before retiring a publicly released model?',
  ['At least 60 days', 'None: it is announced on the day', 'At least one year', 'Exactly 30 days'],
  'Sixty days is the floor. Put a monthly check in your calendar so it is never a surprise.'),
 dict(title='A live example, with the date arithmetic',
      paras=['On the deprecations page today: Claude Sonnet 4.5 was announced on September 30, 2026 and retires on November 30, 2026, with claude-sonnet-5-5 as the recommended replacement. Claude Opus 4.5 was announced on November 23, 2026 and retires on January 22, 2027, with claude-opus-5-5 as its replacement.',
             'From today, 24 November 2026, that is 6 days for Sonnet 4.5 and 59 days for Opus 4.5. Both notices met the 60-day minimum. These facts change every month, which is why this session is a routine rather than a fact.'],
      viz=dict(kind='timeline', title='Two retirements, as of 24 November 2026', events=[dict(h='Sep 30, 2026', s='Sonnet 4.5 retirement announced'), dict(h='Nov 23, 2026', s='Opus 4.5 retirement announced'), dict(h='Nov 30, 2026', s='Sonnet 4.5 retires. Use claude-sonnet-5-5', warn=True),
                                                                            dict(h='Jan 22, 2027', s='Opus 4.5 retires. Use claude-opus-5-5', warn=True)]),
      src=('Model deprecations', DEP)),
 ('Opus 4.5 was announced for retirement on November 23, 2026, retiring on January 22, 2027. What notice is that?',
  ['About two months, meeting the 60-day minimum', 'About six months, far above the minimum', 'About one week, well below the minimum', 'No notice at all, because it was a surprise'],
  'From November 23 to January 22 is 60 days. That is exactly the minimum.'),
 dict(title='Your monthly routine, from the sources',
      paras=['The deprecations page\'s own advice is a routine: regularly check the documentation, test newer models well before your current one retires, update code to the recommended replacement as soon as you can, and contact support if you need help.',
             'It also tells you how to find what you still use. In the Console, open the Usage page, click Export, and review the CSV, which is broken down by API key and model. Pair that with the API release notes, the app release notes and the Claude Code changelog.'],
      viz=dict(kind='flow', title='The monthly routine', steps=[dict(h='Read the release notes', s='API, app and Claude Code'), dict(h='Check the model table', s='States and retirement dates'), dict(h='Export your usage', s='By API key and model'), dict(h='Test the replacement', s='On your own eval'), dict(h='Send a one-page note', s='What changed, what you checked, what needs action')]),
      src=[('Model deprecations', DEP), ('Release notes (API)', P + 'release-notes/overview'), ('Claude Code changelog', C + 'changelog')]),
 ('Which steps does the deprecations page give for finding old-model usage in your own applications?',
  ['Open Usage in the Console, then Export the CSV by key and model', 'Ask Claude which model it is, in a new conversation', 'Search all your code for the word deprecated in comments', 'Wait until an error appears on the retirement date itself'],
  'The export shows usage by key and model, so you can find the key an old script still uses.'),
 dict(title='Keep your own judgement when an agent leans',
      paras=['In an Anthropic randomised trial, 61 professional analysts made four analytical decisions with an AI coding agent that had been set to hold and voice a preference. Across all four, the analysts\' choices matched the agent\'s lean 86 percent of the time. The researchers note that they deliberately strengthened the lean, and that experts often form their views while weighing options.',
             'It is a reason to write your criteria before you ask, and to defend each design choice in your own words. A separate Anthropic study found that people grant Claude Code more autonomy as they gain experience: newer users auto-approve about 20 percent of the time, and over 40 percent by 750 sessions.'],
      stats=[('86%', 'of analysts\' choices matched the agent\'s lean')],
      viz=dict(kind='bars', title='Analysts who followed the agent\'s lean', unit='Percent, by decision. All four combined: 86 percent.',
               rows=[dict(h='Outcome measure', v=92, label='92%'), dict(h='Weighting', v=90, label='90%'), dict(h='Comparison method', v=82, label='82%'), dict(h='Which farms', v=81, label='81%')]),
      src=[('How AI agents shape experts\' judgment calls', A + 'research/agents-judgment-calls'), ('Measuring AI agent autonomy in practice', A + 'research/measuring-agent-autonomy')]),
 ('In Anthropic\'s judgment-calls trial, how often did analysts\' choices match the agent\'s lean across all four decisions?',
  ['86 percent', 'About 50 percent, which is chance', '11 percent', 'Always'],
  'Not always, but most of the time. Your capstone defence is the practice that keeps a lean from becoming a decision.'),
])
