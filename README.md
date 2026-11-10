# Auragika

> Two people. One universe.

Ruchika & Anurag's corner of the internet: the apps we build, the places we go and what we cook. Named **Auragika** (**A**n**urag** + **Ru**ch**ika**).

Live at [auragika.com](https://auragika.com)

---

## Sections

| Section | Content |
|---|---|
| **Hero** | The Auragika wordmark, how the name is made, and the two main actions |
| **Apps** | Our apps, with QuizClash featured; driven by `data/apps.yaml`. Apps in testing (`beta: true`) show an "In beta · Coming soon" banner, aren't links and aren't counted as live |
| **Next** | What's on the way (travel journal, our kitchen); driven by `data/soon.yaml` |
| **Us** | Ruchika and Anurag, with LinkedIn and portfolio links; driven by `data/people.yaml` |

To add or change an app, an upcoming item or a person, edit the YAML file; the page picks it up. Icons are keys from `layouts/_partials/icon.html`.

**Featured app layout:** on wide screens the featured app is a 2×2 block in a three-column grid, so **one featured app plus five others** fills it exactly. With a different count, check the grid for a lone card in the last row.

---

## Theming

The site uses the shared **Auragika theme**, the same system QuizClash uses: dark first with a matching light theme, **one** accent colour, layered surfaces, Inter for text and JetBrains Mono for numbers.

| File | What it is | Edit it? |
|---|---|---|
| `assets/css/auragika.css` | The shared theme (tokens and generic components), copied unchanged from the `auragika-theme` skill | **No.** Update it by replacing the whole file with the latest copy |
| `assets/css/app.css` | This site: the accent override (top of the file) and the site's own components, built only from theme tokens | Yes |

Hugo concatenates the two (theme first), then minifies and fingerprints the result, so browsers and the service worker never serve a stale stylesheet.

**Rules that keep it looking right**

- **Accent:** violet. To change it, edit all four `--accent*` tokens plus `--bg-glow` in **both** theme blocks at the top of `app.css`. The light theme needs the darker shade.
- Use theme tokens (`--surface`, `--text-2`, `--accent-soft` …), never raw colours.
- Use one `.btn-primary` per view and `.mono` for numbers.
- Green and red are only for success and error.
- Motion stays small and honours `prefers-reduced-motion`.
- The one site-specific type token is `--font-serif` (Instrument Serif italic). It's used only for the hero tagline.
- Before merging a visual change, check it at 375 px and desktop width, in light and dark, with no horizontal scroll.

The theme is toggled with the button in the app bar and stored in `localStorage` (`au_theme`). `assets/js/theme-init.js` loads as a blocking script in `<head>` and applies it before first paint, so there's no flash. It's an external file rather than inline so the CSP can forbid inline scripts.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Site generator | Hugo 0.163.3 | Data-driven sections, image processing, CSS/JS fingerprinting |
| Styling | Auragika theme + plain CSS | No framework, no build step beyond Hugo |
| Scripts | Two small vanilla JS files | `theme-init.js` (pre-paint) and `app.js` (toggle, reveal, spotlight, install strip, service worker) |
| CI | GitHub Actions | On demand (`run-ci` label): build with no warnings, build checks, headless Chrome with the real CSP |
| Deploy | GitHub Releases → Netlify | CI publishes a release per `main`; Deploy and Rollback are manual; Netlify doesn't build from git |
| Security | Headers in `static/_headers` | CSP with no inline scripts, Google Fonts as the only third party; SRI on our own CSS/JS |

**No npm, no bundler.** Hugo is the only build tool; the checks are zero-dependency Node scripts.

---

## Project Structure

```
auragika/
├── assets/
│   ├── css/
│   │   ├── auragika.css     ← Shared theme (don't edit, replace)
│   │   └── app.css          ← Accent + site components
│   ├── images/              ← Profile photos (resized by Hugo)
│   └── js/
│       ├── theme-init.js    ← Applies the saved theme before first paint
│       └── app.js           ← Theme toggle, reveal, spotlight, install strip, service worker
├── data/
│   ├── apps.yaml            ← The apps grid
│   ├── soon.yaml            ← "What we're making next"
│   └── people.yaml          ← The two of us
├── layouts/
│   ├── baseof.html          ← Page shell: head, header, main, footer, scripts
│   ├── home.html            ← The one-page site
│   ├── 404.html
│   └── _partials/           ← head, header, footer, section-head, app-card, person-card, icon
├── static/
│   ├── _headers             ← Security (CSP) and cache headers, applied by Netlify
│   └── …                    ← favicon, app icons, manifest, service worker
├── tools/check-build.mjs    ← Checks public/: headers, no inline scripts, SRI, fingerprints
├── tests/browser/           ← The build in headless Chrome with the real headers
├── scripts/                 ← Deploy helpers: Netlify upload, live and previous release, summary
├── .github/workflows/       ← CI (run-ci label; releases on main), Deploy and Rollback (manual), PR title
├── hugo.toml
├── netlify.toml             ← Tells Netlify not to build from git
├── CLAUDE.md                ← Notes for Claude Code
└── CONTRIBUTING.md          ← Branches, commits, PRs, checks
```
---

## Local Development

Needs [Hugo](https://gohugo.io/installation/) 0.146 or later (CI and Deploy use 0.163.3, extended).

```bash
hugo server
```

Open `http://localhost:1313`. `hugo server` doesn't apply `static/_headers`, so run the same checks as CI before a PR. They need Node 22+ and Chrome:

```bash
hugo --minify --panicOnWarning           # production build; any warning fails
node tools/check-build.mjs                # headers, no inline scripts, SRI and fingerprints
node --test "tests/browser/*.test.mjs"    # phone + desktop, dark + light, real CSP, 404, theme toggle
```

---

## Deploy

Netlify doesn't build from git (`netlify.toml` has `ignore = "exit 0"`). The same model as QuizClash: **merging to `main` doesn't deploy.** CI builds each `main` once into a release, and a deploy ships a release as it is.

1. **Merge** PRs to `main`. Each push to `main` runs CI. When every check passes, the `release` job builds the site once and publishes a **GitHub Release**:
   - tag `vYYYY.MM.DD-N` (UTC date and CI run number, e.g. `v2026.11.11-31`)
   - notes listing the merged PRs
   - asset `site.zip`, the exact build that was checked
2. **Deploy:** GitHub → Actions → **Deploy** → Run workflow. Leave the tag empty for the latest release, or enter one. It uploads that release's `site.zip` to Netlify unchanged, so what goes live is exactly what CI built and tested.
3. **Where a release shows:**
   - the site's footer, as a pill (hover it for the commit), and its `auragika-build` meta tag
   - the Netlify deploy title, e.g. "v2026.11.11-31 (update, by …)"
   - the repo's **Deployments** list (environment `production`)
   - the run summary: the release, commit, what was live, who deployed, how long it took, the live URL and this deploy's permalink, and **what's new** since the release that was live (or, on a rollback, what's no longer live)
4. **Roll back:** Actions → **Rollback** → Run workflow. It redeploys the release that was **actually live** before the current one, found in Netlify's deploy history (most releases never reach production). Run it again to step further back. To go to a specific release, run Deploy with its tag.

Deploys from before releases carry `build-N` tags; those have no `site.zip`, so they can't be redeployed.

**Setup (once):** the repo needs two Actions secrets, `NETLIFY_AUTH_TOKEN` (Netlify → User settings → Applications → Personal access tokens) and `NETLIFY_SITE_ID` (the site's Site configuration → Site details → Site ID).

Changes reach `main` only through pull requests (see [CONTRIBUTING.md](CONTRIBUTING.md)), and a PR can merge only with a green `ci-passed`.
