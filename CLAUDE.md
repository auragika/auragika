# CLAUDE.md

Guidance for Claude Code in this repo.
- **What the site is, theming, structure, deploy:** `README.md`.
- **Branches, commits, PRs and checks:** `CONTRIBUTING.md`.

## Shape

- **Stack:** Hugo 0.146+ layout (`layouts/baseof.html`, `home.html`, `404.html`, `_partials/`), plain CSS, two small vanilla JS files. No npm, no bundler; Hugo is the only build tool. Hugo is pinned in `.github/workflows/ci.yml` and `deploy.yml` (keep them equal).
- **Deploy:** manual and numbered, like Pebble. Actions → Deploy builds a ref with a green `ci-passed` and uploads it to Netlify; Netlify never builds from git. Merging doesn't deploy. Never run Deploy unless the user asks.
- **One page:** `home.html` composes partials; content comes from `data/apps.yaml`, `data/soon.yaml` and `data/people.yaml`. Change content in the YAML, not the templates.
- **Assets:** CSS (`auragika.css` + `app.css`) and JS go through `minify | fingerprint` with SRI. The `immutable` cache headers and the service worker's cache-first rule depend on that hash, so never link an asset under `/css/`, `/js/` or `/images/` without fingerprinting it.

## Theme

- `assets/css/auragika.css` is the shared Auragika theme, copied **unchanged** from the `auragika-theme` skill. Never edit it; to update it, replace the whole file.
- Site styles go in `assets/css/app.css`, built only from theme tokens. The accent (violet) is the four `--accent*` tokens plus `--bg-glow`, in **both** theme blocks at the top.
- Follow the skill's rules: one accent, one `.btn-primary` per view, `.mono` for numbers, green and red only for meaning, small motion that honours `prefers-reduced-motion`.
- The featured app is a 2×2 block in a three-column grid: one featured app plus five others fills it. With another count, check for a lone card in the last row.

## Security

- **CSP** lives in `static/_headers` (`/*` block): `script-src 'self'`, so **no inline `<script>`** and no inline event handlers. The pre-paint theme script is `assets/js/theme-init.js`, loaded blocking in `<head>`.
- Inline `style` attributes are allowed only for CSS custom properties (the `--d` reveal delays).
- A new third-party host (fonts, analytics, CDN) needs a CSP entry in the same PR.
- `hugo server` doesn't send these headers; `tests/browser` serves the build with them. `tools/check-build.mjs` enforces the rules above, so extend it when you add one.

## Add to home screen

The site installs as an app: `static/manifest.json` + icons, the service worker, and the iOS `apple-mobile-web-app-*` tags in `head.html`. The hero's install strip is the theme's `.install-hint`: `app.js` shows one-tap Install on `beforeinstallprompt` (Chrome, Edge, Android) or Share → Add to Home Screen on iPhone/iPad Safari, and hides it when installed or for 30 days after it's dismissed (`au_install_hint`).

## Service worker

`static/sw.js`: network first for pages and un-fingerprinted files, cache first for fingerprinted `/css/`, `/js/`, `/images/`, cross-origin untouched. Bump `CACHE` when its rules change.

## Verify before a PR

Run what CI runs:

```bash
hugo --minify --panicOnWarning && node tools/check-build.mjs && node --test "tests/browser/*.test.mjs"
```

The browser tests cover 375 px and 1280 px in dark and light (no overflow, every `.reveal` shown, no console errors or CSP violations), the 404 page and the theme toggle. They don't look at the page, so for visual changes also take screenshots (the `headless-chrome-verify` skill) and look at them.
- New outbound links should return 200.

## Working rules

- One commit per logical change, Conventional Commits. Never push until the user says so.
- `main` is protected: PR only, squash merge, and the `ci-passed` and `pr-title` checks must pass. CI runs on a PR only when the `run-ci` label is added, and again after each push only if it's re-added. Force-push is blocked, so to update a PR branch, merge `main` into it rather than rebasing.
- Track work on the **Auragika Website** board (org project #2), not the QuizClash board.
