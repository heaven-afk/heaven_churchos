# Veyrin Architecture

Current working display name: Heaven Church OS (`src/config/brand.ts`). See
`PRODUCTION_REVIEW.md` for release qualification, OBS setup and known limits.

### Typography and text studio (18 November 2026)

`PresentationSlide.typography` carries validated heading/body/footer styles using
font and colour IDs. Font families and CSS-token colours are resolved centrally
in `src/config/typography.ts`; canvas-relative font sizes keep operator previews
and output windows in proportion. Congregation and livestream share the renderer;
stage monitors retain their confidence layout. Inter, Outfit and Lora are loaded
through next/font and self-hosted, with OFL notices in `public/fonts/licenses/`.

`STYLE_PREVIEW` changes prepared slides only, through presentation actions. Live
slides/queues remain immutable until explicit take-live. Styles travel with the
slide over both browser and local OBS synchronization and are validated on receipt.
Saved service styles are also embedded as `content.presentationAppearance`, so
the existing JSON cloud schema can retain them without a database migration.
The Text studio edits saved text items, preserves drafts across resource tabs,
and stores typography with their text options and generated slides. Operator
startup restores the authenticated organization and its saved service list.

### Local output and Scripture hardening (17 November 2026)

`slides` is the prepared queue; `liveSlides` is captured on take-live. Preparation
does not clear live content or change live navigation. Sync hydration enters via
the `RECEIVE_OUTPUT` action. Ordinary browser outputs use BroadcastChannel and
localStorage. OBS's separate browser uses `/api/output-relay`, a loopback-only
single-process snapshot transport with separate read/write capabilities. No
presentation core logic depends on OBS. This bridge is not a serverless relay.

BibleProvider reads complete, version-specific static JSON books in
`public/bibles/<version>/<book>.json`. It shares in-flight book loads and caches
chapters. Unknown versions and missing verses produce errors. Data provenance,
licenses and input hashes are in `public/bibles/`; no verse text is synthesized.

Song edits persist to browser storage under a product-independent key. The
starter library includes only the public-domain Amazing Grace text. Cloud tenant
scoping and persistent media storage remain release follow-up work.

> Technical architecture reference for contributors and AI agents.

---

## System Boundaries

```
┌─────────────────────────────────────────────┐
│              Operator Workstation            │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│  │ Service  │  │  Preview  │  │ Control  │  │
│  │  Panel   │  │  Panel    │  │  Panel   │  │
│  └──────────┘  └───────────┘  └──────────┘  │
│         └──────────────────────────┘         │
│              Presentation Actions            │
│         ┌──────────────────────────┐         │
│         │    Presentation Store    │         │
│         └──────────────────────────┘         │
├─────────────────────────────────────────────┤
│              Output Windows                  │
│  ┌──────────────────────────────────────┐    │
│  │         PresentationCanvas           │    │
│  │  (congregation / stage / confidence) │    │
│  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## Presentation Action System

All presentation state changes are routed through the action dispatcher:

```
UI Component / Keyboard Hook / Remote (future)
          │
          ▼
   dispatch(action)           ← src/actions/presentation.actions.ts
          │
          ▼
  presentation.store          ← src/store/presentation.store.ts
          │
          ▼
  PresentationCanvas          ← src/components/presentation/PresentationCanvas.tsx
          │
          ▼
     Output Window            ← /presentation route
```

**Rule:** UI components call `dispatch()`. They do not call store methods directly for presentation operations.

---

## State Architecture

State is separated by domain (spec §37):

| Store | Contents |
|---|---|
| `ui.store` | Panel open/close, active modal, control panel tab |
| `service.store` | Current service, selected item, slide index |
| `presentation.store` | Live slide, output status, layout/background overrides |
| `keyboard.store` | Active shortcut context |

---

## Keyboard Architecture

```
Global keydown event
      │
  useKeyboard()           ← src/hooks/useKeyboard.ts
      │
  normaliseKey()          Converts KeyboardEvent → "arrowright", "shift+b", etc.
      │
  findShortcut()          ← src/config/shortcuts.ts
      │
  dispatch(action)        ← src/actions/presentation.actions.ts
```

**Rule:** All shortcut bindings live in `src/config/shortcuts.ts`. No component implements its own keydown logic for shared operations.

---

## Provider / Adapter Pattern

External dependencies are hidden behind interfaces:

```
BibleProvider (interface)
  └── WebBibleProvider (WEB public domain JSON)
  └── (future) ApiBibleProvider
  └── (future) LocalSQLiteProvider

DisplayAdapter (interface)
  └── (future) BrowserWindowAdapter
  └── (future) TauriDisplayAdapter

MediaAdapter (interface)
  └── (future) SupabaseStorageAdapter
  └── (future) LocalFilesystemAdapter (Tauri)
```

**Rule:** UI components never import concrete providers. They use the exported singleton (`bibleProvider`, etc.) or dependency-injected instances.

---

## Data Flow: Scripture Display

```
Operator searches reference
        │
  BibleProvider.searchReference()
        │
  Results shown in search panel
        │
  Operator selects passage
        │
  BibleProvider.getPassage()
        │
  Slides created from verses
        │
  serviceStore.addItem()
        │
  Operator clicks "Send Live"
        │
  dispatch({ type: 'SEND_LIVE', slide })
        │
  presentationStore updates
        │
  PresentationCanvas re-renders
        │
  Congregation display updates
```

---

## Route Structure

```
/                       → redirect to operator workstation
/(operator)/            → operator workstation (shell + panel layout)
/presentation           → presentation output window (full-screen canvas)
```

---

## Future Extension Points

### Desktop (Tauri 2)
- Implement `DisplayAdapter` and `MediaAdapter` using Tauri file system and display APIs
- Add `FileSystemAdapter` for local service/media storage
- Business logic remains unchanged — only adapters change

### Remote Control
- Remote actions call the same `dispatch()` function via WebSocket/Supabase Realtime
- No new business logic required

### AI Suggestions (Phase 6)
- Suggestions are a read-only panel — they never call `dispatch()` directly
- Operator confirms a suggestion → triggers `dispatch()`

### OBS / NDI / Stream Deck (Phase 5)
- External inputs call `dispatch()` — same action system
- Presentation outputs are routed through `DisplayAdapter`
