// Checks a production build in public/ (run `hugo --minify` first; CI and Deploy do):
//   - the files a Netlify upload needs are there
//   - static/_headers carries a strict CSP and the cache rules
//   - no inline scripts or event handlers, so the CSP can stay strict
//   - every local CSS/JS file is fingerprinted and has SRI, and /images/ files are fingerprinted,
//     because _headers caches those paths forever and the service worker serves them cache-first
//   - inline style attributes only set custom properties (the --d reveal delays)
// Zero dependencies: `node tools/check-build.mjs`.
import fs from 'node:fs';
import path from 'node:path';

const PUB = 'public';
const problems = [];
const read = f => fs.readFileSync(path.join(PUB, f), 'utf8');
const exists = f => fs.existsSync(path.join(PUB, f));

for (const f of ['index.html', '404.html', '_headers', 'sw.js', 'manifest.json', 'robots.txt']) {
  if (!exists(f)) problems.push(`public/${f} is missing`);
}

// ---- headers
if (exists('_headers')) {
  const headers = read('_headers');
  const csp = (headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m) || [])[1] || '';
  if (!csp) problems.push('_headers has no Content-Security-Policy');
  for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'none'"]) {
    if (!csp.includes(d)) problems.push(`CSP lacks ${d}`);
  }
  const scriptSrc = (csp.match(/script-src ([^;]+)/) || [])[1] || '';
  if (!scriptSrc.startsWith("'self'")) problems.push("CSP script-src must start with 'self'");
  if (/'unsafe-(inline|eval)'|\*/.test(scriptSrc)) problems.push("CSP script-src must not allow 'unsafe-inline', 'unsafe-eval' or wildcards");
  for (const h of ['X-Frame-Options: DENY', 'X-Content-Type-Options: nosniff', 'Referrer-Policy:', 'Permissions-Policy:']) {
    if (!headers.includes(h)) problems.push(`_headers lacks ${h}`);
  }
  for (const dir of ['css', 'js', 'images']) {
    if (!new RegExp(`^/${dir}/\\*\\s*\\n\\s*Cache-Control: public, max-age=31536000, immutable`, 'm').test(headers)) {
      problems.push(`_headers lacks the immutable cache rule for /${dir}/*`);
    }
  }
  if (!/^\/sw\.js\s*\n\s*Cache-Control: no-cache/m.test(headers)) problems.push('_headers lacks Cache-Control: no-cache for /sw.js');
}

// ---- pages
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`)) || []).slice(1).find(v => v !== undefined);
const HASHED = /\.[0-9a-f]{32,}\.(css|js)$/;
const pages = fs.readdirSync(PUB, { recursive: true }).filter(f => f.endsWith('.html'));

for (const page of pages) {
  const html = read(page);
  for (const tag of html.match(/<script\b[^>]*>/g) || []) {
    const src = attr(tag, 'src');
    if (!src) { problems.push(`${page}: inline <script> (move it to assets/js)`); continue; }
    if (src.startsWith('/')) {
      if (!HASHED.test(src)) problems.push(`${page}: ${src} isn't fingerprinted`);
      if (!attr(tag, 'integrity')) problems.push(`${page}: ${src} has no integrity (SRI)`);
    }
  }
  for (const tag of html.match(/<link\b[^>]*>/g) || []) {
    const href = attr(tag, 'href') || '';
    if (attr(tag, 'rel') !== 'stylesheet' || !href.startsWith('/')) continue;
    if (!HASHED.test(href)) problems.push(`${page}: ${href} isn't fingerprinted`);
    if (!attr(tag, 'integrity')) problems.push(`${page}: ${href} has no integrity (SRI)`);
  }
  for (const m of html.matchAll(/\s(?:src|href)=["']?(\/images\/[^"'\s>]+)/g)) {
    if (!/_hu_?[0-9a-f]+|\.[0-9a-f]{32,}\./.test(m[1])) problems.push(`${page}: ${m[1]} isn't fingerprinted (process it with Hugo)`);
  }
  if (/<[a-z][^>]*\son[a-z]+=/i.test(html)) problems.push(`${page}: inline event handler (on…=); add a listener in assets/js/app.js`);
  for (const m of html.matchAll(/\sstyle=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    const decls = (m[1] ?? m[2] ?? m[3]).split(';').map(s => s.trim()).filter(Boolean);
    if (decls.some(d => !d.startsWith('--'))) problems.push(`${page}: style="${m[1] ?? m[2] ?? m[3]}" sets more than custom properties; use a class in app.css`);
  }
}

if (problems.length) {
  console.error('check-build: ' + problems.length + ' problem(s)\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log(`check-build: ok (${pages.length} pages, headers in place, no inline scripts)`);
