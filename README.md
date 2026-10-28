# Auragika

> Two people. One universe.

Ruchika & Anurag's corner of the internet: the apps we build, the places we go and what we cook. Named **Auragika** (**A**n**urag** + **Ru**ch**ika**).

Live at [auragika.com](https://auragika.com)

---

## Sections

| Section | Content |
|---|---|
| **Hero** | The Auragika wordmark, how the name is made, and the two main actions |
| **Apps** | Every live app, with QuizClash featured; driven by `data/apps.yaml` |
| **Next** | What's on the way (travel journal, our kitchen) |
| **Us** | Ruchika and Anurag, with LinkedIn and portfolio links; driven by `data/people.yaml` |

To add or change an app or a person, edit the YAML file; the page picks it up.

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

The theme is toggled with the button in the app bar and stored in `localStorage` (`au_theme`). A tiny script in `<head>` applies it before first paint, so there's no flash.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Site generator | Hugo 0.163.3 | Data-driven sections, image processing, CSS/JS fingerprinting |
| Styling | Auragika theme + plain CSS | No framework, no build step beyond Hugo |
| Scripts | One small vanilla JS file | Theme toggle, scroll reveal, card spotlight, service worker |
| Deploy | Netlify | Builds on push; preview on every PR |

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
│   └── js/app.js            ← Theme toggle, reveal, spotlight, service worker
├── data/
│   ├── apps.yaml            ← The apps grid
│   └── people.yaml          ← The two of us
├── layouts/
│   ├── _default/
│   │   ├── baseof.html      ← HTML shell: head, theme pre-paint, CSS/JS
│   │   └── index.html       ← The one-page site
│   ├── partials/icon.html   ← Line icons
│   └── 404.html
├── static/                  ← manifest, service worker, app icons
├── config.toml
└── netlify.toml             ← Build command, Hugo version, headers
```

---

## Local Development

```bash
hugo server
```

Open `http://localhost:1313`.

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
