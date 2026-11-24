#!/bin/bash
# Plays the app in headless Chrome through the real DOM and prints the result.
# usage: tests/run.sh <mode> [width] [height] [virtual_time_ms] [timeout_s]
#   modes: full (all 24 sessions, gates, reviews), extras, smoke, duetest
# usage: tests/run.sh shot <scene[:dark]> [width] [height]   -> /tmp/shot_<scene>_<width>.png
# Needs google-chrome (or chromium) on PATH and python3. Run python3 build.py first.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser)}"
[ -z "$CHROME" ] && { echo "Chrome not found. Set CHROME=/path/to/chrome"; exit 1; }
if [ "$1" = "shot" ]; then SHOT=1; shift; fi
mode=$1; w=${2:-420}; h=${3:-900}; b=${4:-900000}; to=${5:-540}
f=/tmp/z100_${mode//:/_}.html
python3 -I - "$ROOT" "$f" <<'PY'
import sys
root,out=sys.argv[1],sys.argv[2]
t=open(root+'/index.html',encoding='utf-8').read()
d=open(root+'/tests/test_driver.js',encoding='utf-8').read()
open(out,'w',encoding='utf-8').write(t.replace('</body>','<script>'+d+'</script></body>'))
PY
if [ -n "$SHOT" ]; then
  png=/tmp/shot_${mode//:/_}_$w.png
  timeout 90 "$CHROME" --headless=new --no-sandbox --disable-gpu --user-data-dir=$(mktemp -d) --window-size=$w,$h --virtual-time-budget=30000 --screenshot=$png "file://$f#$mode" >/dev/null 2>&1
  echo "wrote $png"; exit 0
fi
timeout $to "$CHROME" --headless=new --no-sandbox --disable-gpu --user-data-dir=$(mktemp -d) --window-size=$w,$h --virtual-time-budget=$b --dump-dom "file://$f#$mode" 2>/dev/null | python3 -I -c "
import sys,re,html
h=sys.stdin.read()
m=re.search(r'<pre id=\"testout\"[^>]*>(.*?)</pre>',h,flags=re.S)
print(html.unescape(m.group(1)) if m else 'NO OUTPUT (len %d)'%len(h))"
