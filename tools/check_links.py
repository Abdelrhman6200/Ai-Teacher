"""Opens every reference link in src/refs_a.py and src/refs_b.py and reports any that do not answer with 200.
Run monthly, with the rest of the facts check:  python3 tools/check_links.py
Needs curl and network access. Exit code 1 if any link fails."""
import os, sys, subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'src'))
import refs


def check(u):
    try:
        r = subprocess.run(['curl', '-s', '-o', os.devnull, '-L', '-m', '25', '-w', '%{http_code}', u], capture_output=True, text=True, timeout=40)
        return u, r.stdout.strip()
    except Exception as e:
        return u, 'ERR'


if __name__ == '__main__':
    R = refs.load()
    urls = sorted({e[1] for v in R.values() for e in v})
    print(len(urls), 'unique links in', sum(len(v) for v in R.values()), 'entries')
    bad = []
    with ThreadPoolExecutor(8) as ex:
        for u, code in ex.map(check, urls):
            if code != '200': bad.append((u, code))
    for u, code in bad: print('FAIL', code, u)
    print('failed', len(bad))
    sys.exit(1 if bad else 0)
