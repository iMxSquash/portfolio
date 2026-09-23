<div align="center">

<img src="./public/logo.svg" alt="" align="center" height="72" />

# Elwen - Portfolio

_A portfolio that behaves like a real OS, not a website pretending to be one_

[![Build Status](https://img.shields.io/github/actions/workflow/status/iMxSquash/portfolio/ci.yml?style=flat-square&label=CI)](https://github.com/iMxSquash/portfolio/actions)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://elwen.dev)

[Features](#features) • [Architecture](#architecture) • [Getting started](#getting-started) • [Project structure](#project-structure) • [Deployment](#deployment)

</div>

[elwen.dev](https://elwen.dev) is my personal portfolio. On desktop it reproduces **macOS**, window manager included; on mobile and tablet it switches to an **iOS springboard**. Projects don't sit on a scrolling page, they open as real windows or app icons, each backed by its own subdomain (`photoshop.elwen.dev`, `illustrator.elwen.dev`, ...) running in an iframe or opening as an external link.

> [!NOTE]
> Visual fidelity comes first. The goal is for the site to feel and behave like a genuine macOS/iOS build, down to Liquid Glass materials, native motion curves, and gesture feedback, not like a web page borrowing OS aesthetics. Next.js, Tailwind and React are implementation details the visitor should never notice.

## Features

- **Window manager**: drag, resize, minimize, focus/z-index and stacking, all driven by a single Zustand store
- **macOS desktop UI**: menu bar, dock, traffic lights, desktop icons, boot/login screen
- **iOS mode**: full-screen springboard, status bar, gestures and safe-area handling on mobile/tablet, auto-detected from pointer type and width
- **System apps**: Finder, Notes, Terminal, Trash, Réglages Système, and an "About This Mac" easter egg, each a real component, not a static mockup
- **Project windows**: each showcased project (Photoshop, Illustrator, Premiere Pro, ...) runs on its own subdomain and opens hybrid: embedded `iframe` or `external` tab, picked per project
- **Backoffice** (`/admin`): Supabase-backed CRUD for projects (name, description, tech, logo, display mode), behind a single-account auth
- **Liquid Glass everywhere**: every actionable surface (dock, buttons, sidebars, segmented controls) gets real refraction via [`quick-liquid`](https://www.npmjs.com/package/quick-liquid), centralized in one typed preset registry
- **SEO/GEO built in**: metadata, JSON-LD (`Person`/`WebSite`/`ItemList`), sitemap, robots, server-rendered fallback content for crawlers, and `llms.txt`

## Architecture

Everything lives in one Next.js (App Router) project: the portfolio itself, the `/admin` backoffice, and its API routes.

| Concern         | Approach                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Window state    | One Zustand store (`useWindowStore`): no window position/size ever lives in local component state                                                                       |
| App registry    | `src/lib/apps.ts`: every openable thing (system app, iframe project, external link) is declared once; desktop, dock, Finder and the iOS springboard only read it        |
| Liquid Glass    | `src/lib/glass-presets.ts`: a typed `LiquidGlassConfig` per HIG role (dock, sidebar, title bar, popover, ...), the single source of truth for every translucent surface |
| Managed content | Projects live in Supabase (Postgres + Storage for logos); editorial content (CV notes, trash content) ships in the repo as TypeScript/MDX                               |
| Auth            | Supabase Auth, single admin account, protecting `/admin`                                                                                                                |

Desktop renders the windowed macOS experience; mobile/tablet (detected via `pointer: coarse` + width, not width alone) renders the iOS springboard instead. Finder and Trash are desktop-only. Apps are code-split with `next/dynamic` on first open and stay mounted once minimized.

> [!IMPORTANT]
> Project subdomains embedded in iframes carry their own SEO (the portfolio can't take credit for content it just frames) and must expose real crawlable `<a href>` links. Before adding a new subdomain to the backoffice, it needs to pass the headers/responsiveness/cookie checks a project embedded this way is expected to meet.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 24+
- A [Supabase](https://supabase.com) project (shared with the `adobe-apps` repo), for the `projects` table, Auth and logo storage

### Installation

```bash
git clone https://github.com/iMxSquash/portfolio.git
cd portfolio
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable                        | Description                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (dashboard → Settings → API)                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (same page)                                               |
| `404_URL`                       | Where unknown routes redirect to (the `introuvable` mini-game, server-side only) |

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script                            | Description                     |
| --------------------------------- | ------------------------------- |
| `npm run dev`                     | Start the dev server            |
| `npm run build`                   | Production build                |
| `npm run start`                   | Start the production build      |
| `npm run lint`                    | Run ESLint                      |
| `npm run typecheck`               | Run `tsc --noEmit`              |
| `npm run format` / `format:check` | Format (or check) with Prettier |

## Project structure

```
src/
├── app/            # Routes (App Router): home, /admin backoffice, 404 catch-all
├── components/
│   ├── os/         # Window manager, menu bar, dock, desktop, iOS springboard, boot screen
│   ├── apps/       # System apps (Finder, Notes, Terminal, Trash, Réglages Système, About This Mac) + iframe app shell
│   └── seo/        # Server-rendered fallback content for crawlers
├── lib/            # App registry, glass presets, Supabase clients, SEO/JSON-LD, window types
└── stores/         # Zustand stores (window manager, ...)
supabase/
└── migrations/     # Versioned SQL migrations (projects table, logos bucket)
```

## Deployment

Deployed on [Vercel](https://vercel.com) under `elwen.dev` and its wildcard `*.elwen.dev` (one subdomain per embedded project). Every push to `main` and every pull request runs lint, typecheck, format check and build in CI (`.github/workflows/ci.yml`).
