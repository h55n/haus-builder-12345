# Haus Builder

> **Design your home. Instantly.** — AI-powered 3D architectural design tool built with Next.js 14, React Three Fiber, and Mistral AI.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-0.167-black?logo=three.js)
![Mistral AI](https://img.shields.io/badge/Mistral-AI-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **AI Mode** — 5–7 question quiz → Mistral Large generates a complete, furnished `DesignSpec` → Interactive 3D viewer
- **Builder Mode** — Drag rooms and furniture onto a blank canvas → View in 3D → Optional AI refinement
- **4 View Modes** — 3D orbit · Exploded view · X-Ray · 2D top-down
- **9 Architect Styles** — Modernist · Japandi · Industrial · Mediterranean · Scandinavian · Brutalist · Mid-Century · Craftsman · Biophilic
- **Undo/Redo** — Full history via Zustand
- **Export PNG** — Downloads canvas screenshot

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router + TypeScript strict |
| 3D Rendering | React Three Fiber · Three.js · Drei |
| AI | Mistral AI (Small for quiz, Large for architect agent) |
| State | Zustand (quiz / design / viewer / builder stores) |
| Validation | Zod (schema validation on all AI output) |
| Drag & Drop | @dnd-kit/core |
| Animation | @react-spring/three (exploded view) · Framer Motion |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Mistral AI](https://console.mistral.ai/) API key

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/haus-builder.git
cd haus-builder

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

Open `.env.local` and add your key:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

```bash
# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MISTRAL_API_KEY` | Primary Mistral AI API key from [console.mistral.ai](https://console.mistral.ai/) | ✅ Yes* |
| `MISTRAL_KEY` | Legacy fallback variable name (used if `MISTRAL_API_KEY` is not set) | ✅ Yes* |

> **Security:** Never commit `.env.local` or any file containing real API keys. The `.gitignore` excludes all `.env*` files except `.env.example`.
>
> \* Configure at least one of `MISTRAL_API_KEY` or `MISTRAL_KEY`.

---

## Project Structure

```
haus-builder/
├── src/
│   └── app/
│       ├── api/          # API routes (Mistral AI calls)
│       ├── builder/      # Builder mode page
│       └── ...
├── .env.example          # Template — copy to .env.local
├── .gitignore
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Keep defaults:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
4. In **Settings → Environment Variables**, add:
   - `MISTRAL_API_KEY` (or `MISTRAL_KEY`) for Production / Preview / Development as needed
5. Deploy
6. Verify:
   - `npm run build` passes locally before pushing
   - Vercel deployment logs show successful `next build`

---

## Controls

| Action | Control |
|---|---|
| Select room/furniture | Click |
| Remove selected item | Delete |
| Undo | Cmd/Ctrl+Z |
| Redo | Cmd/Ctrl+Shift+Z |
| Export PNG | Export button |
| Toggle grid snapping | SNAP button |

---

## View Modes

| Mode | Description |
|---|---|
| 3D | Orbit, zoom, pan — default view |
| Exploded | Floors separate with spring animation + floor labels |
| X-Ray | Walls transparent, furniture fully visible |
| 2D | Top-down orthographic, room labels |

---

## License

MIT © Haus Builder
