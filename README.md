# Auragika Universe

> Travel plans. Culinary adventures. Productivity systems. Two people. One universe.

Anurag & Ruchika's shared corner of the internet — a Hugo-powered landing page for everything they explore, build, and share together. Named **Auragika** (Anurag + Ruchika).

Live at [auragika.netlify.app](https://auragika.netlify.app)

---

## Preview

```
┌─────────────────────────────────────────┐
│  AU✦                                    │
│  Home · Travel · Kitchen · Productivity │
│  Universe · Connect                     │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   ✦  Ruchika & Anurag's World  ✦  │  │
│  │                                   │  │
│  │   Auragika Universe               │  │
│  │                                   │  │
│  │   Travel plans. Culinary          │  │
│  │   adventures. Productivity        │  │
│  │   systems. Two people.            │  │
│  │   One universe.                   │  │
│  │                                   │  │
│  │   [Ruchika]   ✦   [Anurag]        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ✈ Travel  🍳 Kitchen  ⚡ Productivity  │
└─────────────────────────────────────────┘
```

---

## Sections

| Section | Icon | Content |
|---|---|---|
| **Home** | ✦ | Hero with animated glitch title, person cards (Ruchika & Anurag), about tag strip |
| **Travel** | ✈ | Destination cards — mountain escapes, beaches, cultural journeys, hidden gems |
| **Kitchen** | 🍳 | Featured recipe highlight + recipe card grid with cook time and difficulty |
| **Productivity** | ⚡ | Links to live tools (Finance Tracker, Routine & Todo) + upcoming tools (Travel Planner, Goals Dashboard) |
| **Universe** | ✦ | The Auragika story — profile cards, bios, and social links for both |
| **Connect** | 💬 | Social links (Instagram, YouTube, Website) + contact form |

---

## Features

- **Animated custom cursor** — dot + ring that follows the pointer on desktop
- **Glitch title effect** — CSS glitch animation on the hero heading
- **Glass card design** — frosted-glass cards with backdrop blur throughout
- **Tilt cards** — `data-tilt` person cards on the hero
- **Smooth scroll navigation** — navbar links scroll to sections with offset
- **Mobile menu** — full-screen overlay nav for small screens
- **Page loader** — animated progress bar on initial load
- **Contact form** — sends messages directly from the page
- **Alternating section layout** — image-left and image-right alternating cards
- **Dark design** — dark background with violet and cyan accent palette

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Site generator | Hugo 0.163.3 | Zero-config static output |
| Styling | CSS custom properties | Dark palette with glass morphism |
| Deploy | Netlify | Auto-deploy on push |

**No build pipeline.** Zero npm, zero bundler. All logic is plain vanilla JavaScript.

---

## Project Structure

```
auragika-universe/
├── assets/
│   ├── css/
│   │   └── app.css          ← Full site styles: hero, sections, glass cards, cursor, animations
│   └── js/
│       └── app.js           ← Cursor, scroll behavior, tilt effect, mobile menu, contact form
├── layouts/
│   └── _default/
│       ├── baseof.html      ← HTML shell: meta, Hugo pipes, Open Graph
│       └── index.html       ← Full single-page site with all 6 sections
├── static/
│   └── images/              ← Section background images, profile photos
├── config.toml              ← Hugo config (Auragika Universe, anurag & ruchika)
└── netlify.toml             ← Build command + Hugo version
```

---

## Local Development

```bash
hugo server
```

Open `http://localhost:1313`.

---

## Deploy to Netlify

**1. Import the repo** — [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git → select `anuragdevon/auragika-universe`.

**2. Build settings** (from `netlify.toml`):

| Setting | Value |
|---|---|
| Build command | `hugo --minify` |
| Publish directory | `public` |
| Hugo version | `0.163.3` |

**3. Deploy** — every push to `main` triggers a redeploy.

---

## Roadmap

- [ ] Fill in actual travel destinations and itineraries
- [ ] Add real recipe content
- [ ] Wire Productivity section links to live apps
- [ ] Integrate contact form with email service (EmailJS / Formspree)
- [ ] Add photo gallery for travel and food sections

---

## About the Name

**Auragika** = **Anurag** + Ruch**ika** — the name they use for everything they build and share together.
