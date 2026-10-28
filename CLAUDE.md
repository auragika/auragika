# CLAUDE.md

Guidance for Claude Code in this repo.
- **What the site is, theming, structure, deploy:** `README.md`.
- **Branches, commits, PRs and checks:** `CONTRIBUTING.md`.

## Shape

- **Stack:** Hugo 0.146+ layout (`layouts/baseof.html`, `home.html`, `404.html`, `_partials/`), plain CSS, two small vanilla JS files. No npm, no bundler; Hugo is the only build tool. Netlify builds it (`netlify.toml`, Hugo pinned there).
- **One page:** `home.html` composes partials; content comes from `data/apps.yaml`, `data/soon.yaml` and `data/people.yaml`. Change content in the YAML, not the templates.
- **Assets:** CSS (`auragika.css` + `app.css`) and JS go through `minify | fingerprint` with SRI. The `immutable` cache headers and the service worker's cache-first rule depend on that hash, so never link an asset under `/css/`, `/js/` or `/images/` without fingerprinting it.

## Theme

- `assets/css/auragika.css` is the shared Auragika theme, copied **unchanged** from the `auragika-theme` skill. Never edit it; to update it, replace the whole file.
- Site styles go in `assets/css/app.css`, built only from theme tokens. The accent (violet) is the four `--accent*` tokens plus `--bg-glow`, in **both** theme blocks at the top.
- Follow the skill's rules: one accent, one `.btn-primary` per view, `.mono` for numbers, green and red only for meaning, small motion that honours `prefers-reduced-motion`.
- The featured app is a 2×2 block in a three-column grid: one featured app plus five others fills it. With another count, check for a lone card in the last row.

## Security

- **CSP** lives in `netlify.toml` (`/*` headers): `script-src 'self'`, so **no inline `<script>`** and no inline event handlers. The pre-paint theme script is `assets/js/theme-init.js`, loaded blocking in `<head>`.
- Inline `style` attributes are allowed only for CSS custom properties (the `--d` reveal delays).
- A new third-party host (fonts, analytics, CDN) needs a CSP entry in the same PR.
- `hugo server` doesn't send these headers. Verify CSP-sensitive changes on the Netlify deploy preview, or serve `public/` with the headers applied.

## Service worker

`static/sw.js`: network first for pages and un-fingerprinted files, cache first for fingerprinted `/css/`, `/js/`, `/images/`, cross-origin untouched. Bump `CACHE` when its rules change.

## Verify before a PR

- `hugo --minify` builds with **no warnings**.
- Check in headless Chrome (the `headless-chrome-verify` skill) at 375 px and 1280 px, dark and light:
  - no horizontal overflow
  - no console errors
  - every `.reveal` shown after scrolling
  - the 404 page renders
  - the theme toggle persists across a reload
- Look at the screenshots.
- New outbound links should return 200.

## Working rules

- One commit per logical change, Conventional Commits. Never push until the user says so.
- `main` is protected: PR only, squash merge, the `netlify/auragika/deploy-preview` status must pass, and the branch must be up to date. Force-push is blocked, so to update a PR branch, merge `main` into it rather than rebasing.
- Track work on the **Auragika Website** board (org project #2), not the QuizClash board.
