"""Builds index.html: one self-contained file (course data, CSS, JS, fonts inline). Run: python3 build.py"""
import sys, os, json, base64
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
sys.path.insert(0, SRC)
import course

def rd(*p): return open(os.path.join(SRC, *p), encoding='utf-8').read()
def b64(*p): return base64.b64encode(open(os.path.join(SRC, *p), 'rb').read()).decode()

d = course.build()
blob = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
css = rd('style.css') + rd('diagrams.css')
js = rd('app.js').replace('/*CHARS*/', rd('chars.js')).replace('/*DIAGRAMS*/', rd('diagrams.js').replace('/*EXPLORE*/', rd('explore.js'))).replace('/*GAME*/', rd('game.js')).replace('/*MISSIONS*/', rd('missions.js')).replace('/*BLITZ*/', rd('blitz.js')).replace('/*FX*/', rd('fx.js')).replace('/*BOOK*/', rd('book.js')).replace('/*SCIENCE*/', rd('science.js'))
assert '</script' not in js.lower()
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%23C00000'/%3E%3Ccircle cx='16' cy='16' r='8.2' fill='none' stroke='white' stroke-width='4.2'/%3E%3Ccircle cx='13.3' cy='14.6' r='1.7' fill='white'/%3E%3Ccircle cx='18.7' cy='14.6' r='1.7' fill='white'/%3E%3C/svg%3E"
head = '''<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Zero to 100 Practice</title>
<link rel="icon" href="''' + ICON + '''">
<style>
@font-face{font-family:'Outfit';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,''' + b64('fonts', 'outfit.woff2') + ''') format('woff2')}
@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,''' + b64('fonts', 'inter.woff2') + ''') format('woff2')}
''' + css + '''
</style>
</head>
<body>
<div id="app"></div>
<div id="toast" class="toast" aria-live="polite"></div>
'''
out = head + '<script type="application/json" id="course-data">' + blob + '</script>\n<script>\n' + js + '\n</script>\n</body>\n</html>\n'
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(out)
print('index.html', len(out.encode()), 'bytes; data', len(blob.encode()))
