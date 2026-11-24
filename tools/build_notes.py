"""Builds src/notes.json: an in-app "source note" for every reference on a shelf, extracted from the page itself.

The app never links out. Learners read these notes inside the app, so each note holds the page's own structure and short extracts:
a lead line, then the key sections, each with its first sentence or two. Nothing is a link. Provenance is kept as plain text.

Usage:   python3 tools/build_notes.py [cache_dir]
It fetches each page once (curl, needs network), keeps the raw text in cache_dir (default tools/.cache, ignored by git), and writes
src/notes.json. Re-run it monthly with the link check. Pages that cannot be fetched keep their previous note if there is one.
"""
import os, re, sys, json, hashlib, subprocess
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'src'))
import refs

CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools', '.cache')
OUT = os.path.join(ROOT, 'src', 'notes.json')
os.makedirs(CACHE, exist_ok=True)

SKIP_HEADS = re.compile(r'(next steps|authors?|acknowledg|footnote|related|further reading|availability|api support|data handling|contributors|citation|want to learn|getting started with|get started$|appendix)', re.I)
PUB = [('platform.claude.com/docs', 'Claude API documentation'), ('code.claude.com/docs', 'Claude Code documentation'), ('support.claude.com', 'Claude Help Center'),
       ('anthropic.com/engineering', 'Anthropic Engineering'), ('anthropic.com/research', 'Anthropic Research'), ('anthropic.com/news', 'Anthropic News'), ('anthropic.com/features', 'Anthropic')]


class Text(HTMLParser):
    SKIP = {'script', 'style', 'nav', 'header', 'footer', 'svg', 'noscript', 'form', 'button'}

    def __init__(self):
        super().__init__(); self.o = []; self.skip = 0

    def handle_starttag(self, tag, a):
        if tag in self.SKIP: self.skip += 1
        if tag in ('h1', 'h2', 'h3', 'h4'): self.o.append('\n' + '#' * int(tag[1]) + ' ')
        elif tag == 'li': self.o.append('\n- ')
        elif tag in ('p', 'pre', 'tr', 'br', 'div', 'blockquote'): self.o.append('\n')

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.skip: self.skip -= 1

    def handle_data(self, d):
        if not self.skip: self.o.append(d)


def slug(u): return re.sub(r'[^a-z0-9]+', '_', u.replace('https://', '').lower()).strip('_')[:120]


nid = refs.nid

# Pages whose extract would be a random fragment (a changelog's latest entry): the lead line says what the page is, and that is all.
NO_PTS = {'code.claude.com/docs/en/changelog'}

# Lead lines for pages whose automatic lead would mislead: an index page whose first sentence belongs to one post, an author byline,
# a plan-availability sentence. Each one restates something the page itself says (see that note's sections).
LEAD_FIX = {
    'www.anthropic.com/engineering': "Anthropic's engineering blog: how its own teams build, test and run Claude-based systems. The posts extracted here cover source control at scale, harness design for long-running agentic coding, and evaluations that Claude keeps beating.",
    'code.claude.com/docs/en/changelog': 'Claude Code\'s version-by-version changelog. Longer releases are grouped by type of change, with long lists of improvements and bug fixes collapsed.',
    'support.claude.com/en/articles/17457950': 'How to move in and out of an artifact with the keyboard or a screen reader: Tab moves you into an artifact, and Escape moves you back out to the artifact panel.',
    'www.anthropic.com/research/working-with-ai': 'A study built on 66 face-to-face interviews about how businesses reorganise work around AI, and where the bottlenecks are.',
    'code.claude.com/docs/en/skills': 'How skills work in Claude Code: custom commands and bundled skills, the frontmatter fields, and where skills load from.',
    'platform.claude.com/docs/en/build-with-claude/structured-outputs': 'Get validated JSON results from agent workflows by giving the API a JSON schema. The page also lists the schema features that are not supported.',
}


def publisher(u):
    for k, v in PUB:
        if k in u: return v
    return 'Anthropic'


def fetch(u):
    f = os.path.join(CACHE, slug(u) + '.txt')
    if os.path.exists(f) and os.path.getsize(f) > 200: return u, open(f, encoding='utf-8').read()
    target = u + ('.md' if u.startswith(('https://platform.claude.com/', 'https://code.claude.com/', 'https://support.claude.com/')) else '')
    try:
        body = subprocess.run(['curl', '-s', '-L', '-m', '40', target], capture_output=True, text=True, timeout=60).stdout
    except Exception:
        return u, ''
    if '<html' in body[:3000].lower() or '<!doctype' in body[:200].lower():
        p = Text(); p.feed(body); body = re.sub(r'\n{3,}', '\n\n', ''.join(p.o))
    if len(body) > 200: open(f, 'w', encoding='utf-8').write(body)
    return u, body


def clean(t):
    m = re.match(r'---\n(.*?)\n---\n', t, flags=re.S)
    desc = ''
    if m:
        d = re.search(r'^description:\s*(.+)$', m.group(1), flags=re.M)
        if d: desc = re.sub(r'[`*]', '', d.group(1).strip().strip('"\''))
        t = t[m.end():]
    t = re.sub(r'```.*?```', '\n', t, flags=re.S)
    t = re.sub(r'<!--.*?-->', '', t, flags=re.S)
    t = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', t)
    t = re.sub(r'\[([^\]]+)\]\((?:https?:|/|#)[^)]*\)', r'\1', t)
    t = re.sub(r'</?[A-Za-z][^>]*>', '', t)
    t = re.sub(r'\*\*|__|`', '', t)
    t = re.sub(r'\\([_*`#\[\]()|<>~$-])', r'\1', t)
    t = re.sub(r'https?://\S+', '', t)
    return t, desc


def sentences(p):
    p = re.sub(r'\s+', ' ', p).strip()
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\u201c(])', p) if s.strip()]


KEY = re.compile(r'\b(default|limit|limits|must|cannot|can\u2019t|can\'t|only|recommend|recommended|should|never|always|instead|because|means|unlike|require|requires|need|needs|ensure|avoid|best|minimum|maximum|at least|up to|per|percent|faster|cheaper|slower|fail|error|invalid)\b', re.I)
WEAK = re.compile(r'^(the following|below|this (page|guide|section|article)|here|see |for more|learn more|note:|tip:|important:|these |each |you can find)', re.I)


def good(line):
    s = line.strip()
    if len(s) < 40 or len(s) > 600: return False
    if s.startswith(('|', '>', '*Figure', 'Figure', '[', 'Table', '---', '#')): return False
    if re.search(r'(\{\{|\}\}|=>|;\s*$|^\s*(import|from|const|let|var|def|curl|pip|npm)\b|\\n|\\"|\$\w+=)', s): return False
    if s.endswith(':'): return False
    if re.search(r'[|{}<>\\\[\]]|_meta|\s>\s|\.\.\.\s*$|\bv\d+\.\d+\.\d+|^\W', s): return False
    if re.search(r'(Requires (TypeScript|Claude Code|the)|or later\b.*\|)', s): return False
    if sum(c.isalpha() or c == ' ' for c in s) / max(len(s), 1) < 0.82: return False
    if re.search(r'(Skip to main content|\\ Anthropic|View more|Related articles)', s): return False
    return True


def score(s, bullet):
    sc = 0
    if re.search(r'\d', s): sc += 2
    sc += min(3, len(KEY.findall(s)))
    if bullet: sc += 1
    if 60 <= len(s) <= 230: sc += 1
    if WEAK.search(s): sc -= 3
    if s.endswith('?'): sc -= 1
    return sc


def trim(s, n=250):
    s = s.strip()
    if len(s) <= n: return s
    cut = s[:n].rsplit(' ', 1)[0].rstrip(',;:')
    return cut + '\u2026'


def cell(c):
    c = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', c)).strip()
    return c[:70]


def tables(t):
    out = []
    lines = t.split('\n')
    i = 0
    while i < len(lines):
        if lines[i].lstrip().startswith('|'):
            j = i
            while j < len(lines) and lines[j].lstrip().startswith('|'): j += 1
            block = [l.strip().strip('|') for l in lines[i:j]]
            rows = [[cell(c) for c in l.split('|')] for l in block if not re.match(r'^[\s:\-|]+$', l)]
            if len(rows) >= 3 and 2 <= len(rows[0]) <= 4 and all(len(r) == len(rows[0]) for r in rows):
                body = rows[1:9]
                chars = sum(len(c) for r in rows[:9] for c in r)
                if chars < 700 and not any(re.search(r'[{}<>=]', c) for r in rows[:9] for c in r):
                    out.append(dict(h=rows[0], r=body))
            i = j
        else:
            i += 1
    return out


def extract(raw):
    t, desc = clean(raw)
    t = re.sub(r'^.*(Skip to main content|Related articles).*$', '', t, flags=re.M)
    tbls = []
    for tb in tables(t):
        cells = [c for r in [tb['h']] + tb['r'] for c in r]
        avg = sum(len(c) for c in cells) / max(len(cells), 1)
        if re.search(r'(zero data|hipaa|status|item)', ' '.join(tb['h']), re.I): continue
        if avg <= 40 and len(tb['r']) >= 2: tbls.append(tb)
    tbls = tbls[:1]
    secs, cur = [], ['', []]
    for line in t.split('\n'):
        m = re.match(r'(#{1,4})\s+(.*\S)', line)
        if m:
            secs.append(cur); cur = [re.sub(r'\s+', ' ', m.group(2)).strip(' #:'), []]
        else:
            cur[1].append(line)
    secs.append(cur)
    lead = desc.strip() if len(desc) > 40 else ''
    if not lead:
        for h, lines in secs:
            for para in re.split(r'\n\s*\n', '\n'.join(lines)):
                for s in sentences(re.sub(r'^[-*]\s+', '', para.strip())):
                    if good(s) and not WEAK.search(s): lead = trim(s, 260); break
                if lead: break
            if lead: break
    pts, seen = [], set()
    for h, lines in secs:
        if not h or len(h) > 80 or SKIP_HEADS.search(h) or re.search(r'(work with us|join us|apply)', h, re.I) or h.lower() in seen: continue
        body = '\n'.join(lines)
        cands = []
        for b in re.findall(r'^\s*[-*]\s+(.+)$', body, flags=re.M):
            b = re.sub(r'\s+', ' ', b).strip()
            if good(b): cands.append((b, True))
        for para in re.split(r'\n\s*\n', body):
            for s in sentences(re.sub(r'^[-*]\s+.*$', '', para.strip(), flags=re.M)):
                if good(s): cands.append((s, False))
        if not cands: continue
        ranked = sorted(range(len(cands)), key=lambda i: -score(cands[i][0], cands[i][1]))[:(4 if h.lower() == 'abstract' else 2)]
        picked = [trim(cands[i][0]) for i in sorted(ranked) if score(cands[i][0], cands[i][1]) > 0]
        if not picked: continue
        picked = [s for s in picked if s != lead and not lead.startswith(s[:60])]
        if not picked: continue
        seen.add(h.lower()); pts.append([h, picked])
    # keep the sections with the most informative sentences, in page order
    if len(pts) > 7:
        sc = [sum(score(s, False) for s in p[1]) for p in pts]
        keep = sorted(sorted(range(len(pts)), key=lambda i: -sc[i])[:7])
        pts = [pts[i] for i in keep]
    return lead, pts, tbls


def main():
    R = refs.load()
    entries = {}
    for n, rows in R.items():
        for k, u, t, w in rows:
            e = entries.setdefault(u, dict(u=u, t=t, w=w, k=k, s=[]))
            e['s'].append(n)
    old = {}
    if os.path.exists(OUT):
        old = {x['id']: x for x in json.load(open(OUT, encoding='utf-8'))['notes']}
    with ThreadPoolExecutor(8) as ex:
        pages = dict(ex.map(fetch, sorted(entries)))
    notes, thin = [], []
    for u, e in sorted(entries.items()):
        i = nid(u)
        first, pts, tbls = extract(pages.get(u, ''))
        key = re.sub(r'^https://', '', u)
        if key in NO_PTS: pts, tbls = [], []
        if not pts and i in old and key not in NO_PTS:
            notes.append(old[i]); continue
        first = LEAD_FIX.get(key, first)
        if len(pts) < 2: thin.append(u)
        notes.append(dict(id=i, u=re.sub(r'^https://', '', u), t=e['t'], k=e['k'], p=publisher(u), w=e['w'], lead=first, pts=pts, tbl=tbls, s=sorted(set(e['s']))))
    json.dump(dict(built='2026-11-24', notes=notes), open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    chars = sum(len(s) + len(p[0]) for x in notes for p in x['pts'] for s in p[1])
    print(len(notes), 'notes,', chars, 'characters of extracts;', len(thin), 'thin')
    for u in thin: print('  thin:', u)


if __name__ == '__main__':
    main()
