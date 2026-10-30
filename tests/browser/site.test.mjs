// The production build (public/) in headless Chrome, served with the real static/_headers
// (CSP enforced), at phone and desktop width in dark and light. Run `hugo --minify` first,
// then `node --test "tests/browser/*.test.mjs"`. Needs Chrome (CHROME_PATH on Linux) and Node 22+.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const { launch, sleep } = createRequire(import.meta.url)('./cdp.cjs');

const SITE = path.resolve('public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain', '.xml': 'application/xml',
};

// ---- static server applying _headers the way Netlify does (a path gets every matching block)
function parseHeaders() {
  const rules = [];
  for (const line of fs.readFileSync(path.join(SITE, '_headers'), 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) rules.push({ pattern: line.trim(), headers: [] });
    else { const i = line.indexOf(':'); rules.at(-1).headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
  }
  return rules.map(r => ({ ...r, re: new RegExp('^' + r.pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$') }));
}

function serve() {
  const rules = parseHeaders();
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(SITE, url.endsWith('/') ? url + 'index.html' : url);
    let status = 200;
    if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { file = path.join(SITE, '404.html'); status = 404; }
    for (const r of rules) if (r.re.test(url)) for (const [k, v] of r.headers) res.setHeader(k, v);
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.writeHead(status);
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Records CSP violations on the page before any of its scripts run.
const WATCH_CSP = `window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI));`;
const problems = p => p.logs.filter(l => /EXCEPTION|\berror:/i.test(l));

let server, browser, origin;
before(async () => {
  server = await serve();
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await launch(9300 + Math.floor(Math.random() * 600), fs.mkdtempSync(path.join(os.tmpdir(), 'auragika-chrome-')));
});
after(() => { browser?.close(); server?.close(); });

async function open(name, width, height, mobile, url = '/') {
  const p = await browser.newPage(name, width, height, mobile);
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: WATCH_CSP }, p.sessionId);
  await p.goto(origin + url);
  await p.waitFor("document.readyState === 'complete'");
  return p;
}

for (const [size, width, height, mobile] of [['phone', 375, 812, true], ['desktop', 1280, 900, false]]) {
  test(`home at ${size} width: no overflow, every section revealed, no errors or CSP violations`, async () => {
    const p = await open(size, width, height, mobile);
    for (const theme of ['dark', 'light']) {
      await p.eval(`document.documentElement.dataset.theme = '${theme}'; scrollTo(0, 0); true`);
      await sleep(200);
      // clientWidth, not innerWidth: desktop Chrome on Linux draws a classic scrollbar inside innerWidth.
      assert.equal(await p.eval('document.documentElement.scrollWidth - document.documentElement.clientWidth'), 0, `horizontal overflow in ${theme}`);
    }
    // Scroll through the page so the IntersectionObserver reveals everything.
    await p.eval(`(async () => { for (let y = 0; y <= document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } })()`);
    await p.waitFor("[...document.querySelectorAll('.reveal')].every(e => e.classList.contains('is-in'))", 5000);
    assert.ok(await p.eval("document.querySelectorAll('.apps > li').length > 0"), 'the apps grid is empty');
    assert.deepEqual(await p.eval('window.__csp'), [], 'CSP violations');
    assert.deepEqual(problems(p), [], 'console errors');
    await p.close();
  });
}

test('404 page renders with the header and theme toggle', async () => {
  const p = await open('404', 375, 812, true, '/no-such-page');
  assert.match(await p.eval("document.querySelector('.not-found')?.textContent || ''"), /Lost in the universe/);
  assert.ok(await p.eval("!!document.getElementById('theme-btn')"), 'no theme button on the 404 page');
  assert.deepEqual(await p.eval('window.__csp'), [], 'CSP violations');
  assert.deepEqual(problems(p), [], 'console errors');
  await p.close();
});

test('theme toggle persists across a reload', async () => {
  const p = await open('toggle', 1280, 900, false);
  await p.eval("localStorage.removeItem('au_theme'); document.documentElement.dataset.theme = 'dark'; true");
  await p.eval("document.getElementById('theme-btn').click(); true");
  assert.equal(await p.eval('document.documentElement.dataset.theme'), 'light');
  await p.goto(origin + '/');
  await p.waitFor("document.readyState === 'complete'");
  assert.equal(await p.eval('document.documentElement.dataset.theme'), 'light', 'theme not restored after reload');
  assert.equal(await p.eval("localStorage.getItem('au_theme')"), 'light');
  assert.deepEqual(problems(p), [], 'console errors');
  await p.close();
});
