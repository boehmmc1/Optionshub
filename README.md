# Optionshub

Sammlung von Tools rund um Optionsbewertung und Stillhalter-Strategien.

Live: [optionshub.net](https://optionshub.net)

## Tools

- **Options Calculator** – Black-Scholes-Bewertung mit Greeks und Auszahlungsprofil

## Tech Stack

- Vite + React 18
- Tailwind CSS 3
- Recharts 2 (Visualisierungen)
- Deployment via Vercel

## Lokale Entwicklung

```bash
# Dependencies installieren (einmalig)
npm install

# Dev-Server starten
npm run dev
# → http://localhost:5173

# Production-Build erstellen (Vercel macht das automatisch)
npm run build
```

## Projektstruktur

```
optionshub/
├── public/              # statische Assets (Favicon etc.)
├── src/
│   ├── main.jsx         # React-Einstiegspunkt
│   ├── App.jsx          # Root-Komponente (später: Routing)
│   ├── index.css        # Tailwind-Imports
│   └── tools/
│       └── OptionsCalculator.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Neue Tools hinzufügen

1. Neue Komponente in `src/tools/` anlegen, z.B. `WheelPlanner.jsx`
2. In `App.jsx` importieren und rendern (oder Routing einbauen)
3. `git push` – Vercel deployed automatisch

## Lizenz

Privat / proprietär.
