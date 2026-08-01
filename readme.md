# Kryvasis — Cybersecurity Assurance

Premium dark-themed website for Kryvasis, an exclusive cybersecurity consultancy. Vanilla HTML/CSS/JS — no frameworks, no build tools.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home — hero with interactive Three.js particles, trust bar, services teaser, clients section |
| `service.html` | Services — threat-modelling, remediation engineering, audit, incident response |
| `team.html` | Leadership — team profiles |
| `til.html` | Tilak Sadhukhan profile |
| `nil.html` | Nilotpal Guha profile |
| `booking.html` | Booking form — Supabase integration with country code phone input |
| `privacy.html` | GDPR-compliant privacy policy |
| `404.html` | Branded error page |

## Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — zero dependencies
- **Three.js v0.160.0** — Kerr accretion disk particle swarm with bloom post-processing
- **Supabase** — form submissions (booking)
- **Google Fonts** — Cinzel (headings), Inter (body)

## Features

- Dark/light theme toggle (localStorage persistence)
- Cursor-reactive particle background (Google Antigravity-inspired hover pattern)
- Skeleton loader with bone-shimmer animation
- Mobile-responsive hamburger nav with CTA
- Active page indicator in navbar
- Back-to-top floating button
- Scroll-reveal animations
- Print stylesheet
- `prefers-reduced-motion` support
- Focus-visible accessibility styles
- SEO metadata, OG/Twitter cards, canonical URLs
- SVG icons (shield, settings) — no icon font

## Project Structure

```
├── index.html
├── service.html
├── team.html
├── til.html
├── nil.html
├── booking.html
├── privacy.html
├── 404.html
├── package.json
├── .gitignore
└── assets/
    ├── css/
    │   └── style.css          # Design system + all component styles
    ├── js/
    │   ├── main.js            # Skeleton, navbar, mobile menu, theme, back-to-top
    │   ├── particles.js       # Three.js particle swarm with cursor hover
    │   ├── blackhole.js       # Three.js Kerr black hole animation
    │   └── booking.js         # Supabase form handler
    └── img/
        ├── favicon.png
        └── logo.png
```

## Getting Started

```bash
npm install
npm start
```

Opens at `http://localhost:3000`.

## Design Tokens

| Token | Value |
|-------|-------|
| `--carbon` | `#050505` |
| `--graphite` | `#121212` |
| `--gunmetal` | `#3a3a3a` |
| `--silver` | `#C0C0C0` |
| `--platinum` | `#E5E5E5` |

## Environment

The Supabase anon key is embedded in `booking.js` for client use and protected by Row Level Security (RLS) policies. Do not expose the Supabase URL or anon key in public repositories.

## License

Private — Kryvasis. All rights reserved.
