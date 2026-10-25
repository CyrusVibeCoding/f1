# APEX // Timing

A premium F1 live timing and race visualization prototype built with React, TypeScript, and Vite.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` in a browser.

## Available commands

- `npm run dev` starts the Vite development server.
- `npm run build` runs the TypeScript check and production build.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.

## Prototype scope

The interface includes a deterministic demo session with an SVG Circuit of the Americas-inspired layout, 20 animated directional driver markers, synchronized leaderboard selection, play/pause/reset controls, playback speed, race-control messages, and selected-driver telemetry.

Historical mode can browse meetings and sessions from OpenF1 and load real driver, position, interval, lap, and race-control data where the public API has coverage. OpenF1 documents historical access from 2023 onward without authentication; real-time data requires a paid subscription. No credentials are stored in this repository.

OpenF1 car locations are provider-local coordinates and are not mapped onto the authored SVG circuit. Historical mode therefore shows an honest map-unavailable state instead of placing cars inaccurately. Live polling is not enabled until authenticated real-time access and track-specific calibration are available.
