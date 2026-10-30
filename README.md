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
| Scripts | Two small vanilla JS files | `theme-init.js` (pre-paint) and `app.js` (toggle, reveal, spotlight, service worker) |
| Deploy | Netlify | Builds on push; preview on every PR |
| Security | Headers in `netlify.toml` | CSP with no inline scripts, Google Fonts as the only third party; SRI on our own CSS/JS |

**No npm, no bundler.** Hugo is the only build tool.

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
│       └── app.js           ← Theme toggle, reveal, spotlight, service worker
├── data/
│   ├── apps.yaml            ← The apps grid
│   ├── soon.yaml            ← "What we're making next"
│   └── people.yaml          ← The two of us
├── layouts/
│   ├── baseof.html          ← Page shell: head, header, main, footer, scripts
│   ├── home.html            ← The one-page site
│   ├── 404.html
│   └── _partials/           ← head, header, footer, section-head, app-card, person-card, icon
├── static/                  ← favicon, app icons, manifest, service worker
├── hugo.toml
├── netlify.toml             ← Build, Hugo version, cache and security headers
├── CLAUDE.md                ← Notes for Claude Code
└── CONTRIBUTING.md          ← Branches, commits, PRs, checks
```
---

## Local Development

Needs [Hugo](https://gohugo.io/installation/) 0.146 or later (Netlify builds with 0.163.3).

```bash
hugo server
```

Open `http://localhost:1313`. `hugo server` doesn't apply the headers in `netlify.toml`; the deploy preview does, so check CSP-sensitive changes there.

---

## Deploy to Netlify

**1. Import the repo**: [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git → select `auragika/auragika`.

**2. Build settings** (from `netlify.toml`):

| Setting | Value |
|---|---|
| Build command | `hugo --minify --baseURL "$URL"` |
| Publish directory | `public` |
| Hugo version | `0.163.3` |

**3. Deploy**: every push to `main` triggers a redeploy, and every PR gets a deploy preview.

Changes reach `main` only through pull requests (see [CONTRIBUTING.md](CONTRIBUTING.md)). The Netlify deploy preview must pass before a PR can merge.
