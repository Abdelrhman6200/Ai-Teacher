// Accessibility check with axe-core: plays scenes from tests/test_driver.js in light and dark and reports violations.
// Optional, not part of tests/run.sh. Needs Playwright and axe-core:  npm i playwright axe-core
// usage:  node tests/axe_check.js smoke you2 library note case_rev     (scene names are listed in tests/test_driver.js)
// env:    WIDTHS=420,1100  (default 420)
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const scenes = process.argv.slice(2);
if (!scenes.length) { console.log('usage: node tests/axe_check.js <scene> [<scene> ...]'); process.exit(2); }

(async () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const drv = fs.readFileSync(path.join(__dirname, 'test_driver.js'), 'utf8');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'z100-axe-')), 'page.html');
  // a function replacement, so "$$" and "$'" in the driver are not read as replacement patterns
  fs.writeFileSync(file, html.replace('</body>', () => '<script>' + drv + '</script></body>'));
  const browser = await chromium.launch();
  let bad = 0;
  for (const w of (process.env.WIDTHS || '420').split(',').map(Number)) {
    for (const flag of ['', ':dark']) {
      for (const sc of scenes) {
        const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
        const page = await ctx.newPage();
        await page.goto('file://' + file + '#' + sc + flag);
        try {
          await page.waitForFunction(() => { const t = document.getElementById('testout'); return t && /(OK|FAIL)/.test(t.textContent); }, null, { timeout: 60000 });
        } catch (e) { console.log('TIMEOUT', w, sc + flag); bad++; await ctx.close(); continue; }
        const res = await page.evaluate(async (src) => {
          const s = document.createElement('script'); s.textContent = src; document.head.appendChild(s);
          document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); // a screen caught mid-animation would report blended colours
          const r = await axe.run({ exclude: [['#testout']] }, { resultTypes: ['violations'] });
          return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, ex: v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1, 3).join(' | ').slice(0, 220)) }));
        }, AXE);
        const tag = (flag || ':light') + ' ' + w + ' ' + sc;
        if (!res.length) console.log(tag + ' => clean');
        for (const v of res) { bad++; console.log(tag + ' => ' + v.id + ' [' + v.impact + '] x' + v.n + ' ' + v.help); v.ex.forEach(e => console.log('      ' + e)); }
        await ctx.close();
      }
    }
  }
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
