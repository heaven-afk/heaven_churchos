# Heaven Church OS

Text editing: open **Text → Write** for content and **Type & colour** for heading,
body and footer fonts, sizes, colours, weight, italic and line spacing. Preview
updates as you edit; use Take live to change program. Select a saved text item and
choose Edit to update it. For prepared songs or Scripture, use **Design** or the
**Style preview** button, then save the style to the service item when desired.
Inter, Outfit and Lora are self-hosted Google Fonts; notices are in `public/fonts/`.

Repository: [heaven-afk/heaven_churchos](https://github.com/heaven-afk/heaven_churchos).
For Vercel import settings, environment variables and hosted feature limits, see
[DEPLOYMENT.md](DEPLOYMENT.md). Run `npm run check:deploy` before deploying.

Working brand for the church presentation workstation. See
[PRODUCTION_REVIEW.md](PRODUCTION_REVIEW.md) for the current audit, EasyWorship
comparison, verified behavior, and release blockers.

For a local production run: `npm install`, `npm run build`, then
`npm run start:local`. Open http://127.0.0.1:3000. OBS is optional: ordinary
presentation windows work independently. For OBS lower thirds, use Outputs →
Enable OBS output and paste the generated read-only URL into an OBS Browser source
at 1920 × 1080. The relay works only on the local single-process server.

Seven complete translations are included locally: KJV, WEB, ASV, BBE, YLT, WBS,
and open Yoruba (OYCB). NIV, Amplified, and The Message require licensing and are
not installed. See [Bible licenses](public/bibles/LICENSES.md).

> Modern church presentation and live production platform.

Heaven Church OS is a keyboard-first presentation platform designed for church operators. It supports Scripture, lyrics, text, images, video, and announcements from a local workstation.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional for local mode)
cp .env.example .env.local
# Leave Supabase unconfigured for local-only use.
# Hosted cloud use requires the security qualification in PRODUCTION_REVIEW.md.

# 3. Start the development server
npm run dev

# 4. Open the operator workstation
open http://localhost:3000

# 5. Open the presentation output (in a separate window)
open http://localhost:3000/presentation
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── (operator)/         # Operator workstation route group
│   │   ├── layout.tsx      # Operator shell layout
│   │   └── page.tsx        # Main workstation page
│   ├── presentation/       # Presentation output window
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
│
├── actions/                # Presentation action system (spec §8)
│   └── presentation.actions.ts
│
├── components/
│   ├── operator/           # Operator workstation UI components
│   └── presentation/       # Presentation canvas components
│
├── config/                 # Static configuration
│   └── shortcuts.ts        # Keyboard shortcut bindings
│
├── hooks/                  # Custom React hooks
│   └── useKeyboard.ts      # Global keyboard handler
│
├── lib/
│   └── supabase/           # Supabase client factories
│       ├── client.ts       # Browser client
│       └── server.ts       # Server client (RSC / Route Handlers)
│
├── providers/              # Data provider interfaces and implementations
│   ├── bible/              # Scripture data
│   ├── display/            # Display output abstraction
│   └── media/              # Media file abstraction
│
├── store/                  # Zustand state stores
│   ├── ui.store.ts
│   ├── service.store.ts
│   ├── presentation.store.ts
│   └── keyboard.store.ts
│
├── styles/
│   └── tokens.css          # Design token CSS variables
│
└── types/                  # Shared TypeScript types
    ├── service.types.ts
    ├── content.types.ts
    ├── presentation.types.ts
    ├── media.types.ts
    └── bible.types.ts
```

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start:local` | Run production server bound to 127.0.0.1 |
| `npm run verify:outputs` | Check local HTTP output and Bible assets against a running server |
| `npm run bibles:prepare` | Rebuild Bible assets from the documented upstream sources |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Unit tests in watch mode |

---

## Key Architecture Principles

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

**All presentation state changes flow through `src/actions/presentation.actions.ts`.** Never mutate the presentation store directly from UI components.

**All keyboard shortcuts are defined in `src/config/shortcuts.ts`.** Never implement keyboard handler logic inside individual components.

**All Scripture data access goes through the `BibleProvider` interface.** Never import a concrete provider directly in UI components.

---

## Development Phase

This repository implements **Phase 0–2**, with a narrow local OBS Browser Source
bridge requested during hardening. It is a local release candidate; outstanding
production acceptance and hosted security work is listed in PRODUCTION_REVIEW.md.

See [MASTER_BUILD.md](./MASTER_BUILD.md) for the full product specification and roadmap.
