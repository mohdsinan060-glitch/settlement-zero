# SETTLEMENT ZERO

**Cinematic Sci-Fi Survival Website** — An interactive narrative experience built with React, Three.js, and GSAP.

Earth is gone. Colony Transport *Arcadia-9* has crash-landed on uncharted exoplanet **Proxima-Zero**. As commanding officer, you guide scout drone **Z-01** through a survival campaign to establish humanity's second home.

---

## Chapters

| # | Chapter | Description |
|---|---------|-------------|
| 01 | **Orbital Arrival** | Cinematic planetary descent with procedural 3D alien world |
| 02 | **Crash Site Contact** | Investigate and salvage the Arcadia-9 wreckage |
| 03 | **Planetary Scan** | Interactive topographic map with 4 points of interest |
| 04 | **Life Support Critical** | Sequential oxygen emergency diagnostics |
| 05 | **Colony Command Center** | Build infrastructure & establish Settlement Zero |

---

## Tech Stack

- **React 19** + **TypeScript**
- **Three.js** via **@react-three/fiber** & **@react-three/drei**
- **GSAP** — scroll-driven camera choreography
- **Zustand** — single-source-of-truth game state
- **Lucide React** — icon system
- **Vite 8** — build tool

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build

```bash
npm run build
npm run preview
```

---

## Architecture

```
src/
├── components/
│   ├── canvas/       # Three.js scene: AlienPlanet, CrashedShip, StarField, CameraRig, ...
│   ├── effects/      # Screen overlays: Vignette, Grain
│   ├── mascot/       # Z-01 SVG artwork & companion HUD
│   ├── sections/     # Interactive chapters: CrashSite, PlanetaryScan, LifeSupport, CommandCenter
│   └── ui/           # Nav, Preloader
├── store/
│   └── useSettlementStore.ts   # Zustand global state
└── index.css         # Design tokens & all styles (no Tailwind)
```

---

## Features

- Procedural alien planet shader with fBm terrain, atmospheric rim & terminator
- Scroll-driven cinematic camera waypoints with mouse parallax
- Official **Z-01** mascot with 6 moods, animated antennae, reactor pulse & dialogue
- Interactive wreckage salvage & planetary POI scanning
- Oxygen drain simulation with sequential diagnostic repair
- Orbital shuttle resupply flight animation
- Colony infrastructure construction with prerequisite gating
- Settlement establishment victory sequence with live mission summary
- Responsive layout with keyboard focus indicators & `prefers-reduced-motion` support

---

*Settlement Zero — Humanity survives.*
