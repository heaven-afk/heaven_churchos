# Heaven Church OS — release review

Review date: 17 November 2026. Working brand is configured in `src/config/brand.ts`.

Vercel deployment preparation updated 18 November 2026: see `DEPLOYMENT.md`.
The browser workstation and same-browser outputs can be hosted without Supabase;
this does not qualify cloud account/tenant flows. Hosted OBS guidance uses Window
Capture, and the in-memory relay is explicitly disabled in Vercel environments.

## Release assessment

This is a significantly improved local presentation candidate, not yet a fully
qualified EasyWorship replacement or a production-approved cloud service. The
operator workflow, local Bible corpus, and browser output path can be tested now.
Real OBS capture, projector hardware, and a full service rehearsal are still
required before relying on it in a live service.

## What was already implemented

- Next.js/React workstation with separate service, UI, keyboard, and presentation stores.
- Central action dispatch, keyboard shortcuts, song editing, Scripture parsing,
  text and media content, service ordering and local service persistence.
- Congregation, stage/confidence and livestream rendering with layered backgrounds,
  transitions, alerts, and ordinary browser output windows.
- Supabase auth/schema and organization boundaries, with local fallback mode.
- 100 existing unit/integration tests. Existing tests alone did not establish
  complete Bible coverage or real OBS interoperability.

## Fixed in this pass

- Replaced invented missing Scripture and cross-version substitution with complete,
  attributed assets: KJV, WEB, ASV, BBE, YLT, WBS and open Yoruba (OYCB).
- Load/cache one Bible book at a time; simultaneous requests share one download.
  Failed loads can be retried; invalid/missing ranges fail visibly.
- Output canvases subscribe only to output fields, avoiding store-triggered redraws
  when prepared slides change. Content fades no longer delay replacing the slide.
- Whole-chapter searches now show the whole chapter; stale search results cannot
  be sent live under a newly selected version.
- Added a readable Preview/Program workspace, slide selection grid, resource tabs,
  preparation guidance, panel toggles, and persistent emergency controls.
- Preparing another item preserves the live slide and its navigation queue.
- Freeze prevents navigation/take-live/layout/background changes and pauses videos.
  Black and Clear remain available. Freeze indicators stay on the stage monitor.
- Clear hides full-frame media; real audience output has no “OUTPUT CLEAR” label.
  Livestream Black and Clear reveal the camera by making the overlay transparent.
- Fixed the opaque page wrapper that prevented true alpha-transparent livestreams.
- Added a local HTTP relay for OBS's separate browser context, with scoped read
  links, separate write secrets, sequential publication, polling, session isolation,
  size limits, reconnection, and a held-frame warning on disconnect.
- Fixed the receiver startup race; updates pass through presentation actions.
- Song edits now persist locally. Removed copyrighted demo-song lyrics from the
  distributed starter library; Amazing Grace remains as a public-domain example.
- Configured cloud authentication now fails closed on session verification failure;
  unconfigured local mode still works independently.

## Standalone operation

Install dependencies, run `npm run build`, then `npm run start:local`. Open
http://127.0.0.1:3000. With Supabase left unconfigured, local mode needs no account.
Keep the server running. Use Outputs → Launch Audience Display or Stage Monitor.
Move that window to the projector/monitor and use the browser's fullscreen mode.
No OBS installation is required for this workflow.

All shipped Bible books and saved service text work without internet from the
running local server. External sample media still requires internet. Uploaded
browser object URLs last only for the current browser session. This is not an
installed desktop app or a service-worker-backed offline website.

## OBS setup and verification boundary

1. Run the local production server with `npm run start:local`.
2. Open the workstation at http://127.0.0.1:3000.
3. Choose Outputs → Enable OBS output → Copy OBS URL.
4. In OBS, add a Browser source, turn Local file off, paste the URL, and set
   Width 1920 / Height 1080. Place it above the camera source.
5. Keep “Shutdown source when not visible” and “Refresh browser source when scene
   becomes active” off. Keep the operator browser tab and local server running.
6. Prepare Scripture or lyrics, take live, advance, freeze/unfreeze, Black, and
   Clear. Check the recording for correct text, alpha and timing before service.

The read link is an output capability; keep it private. It cannot publish state.
It is valid only for this local server process and expires after twelve hours
without publication. After restarting the server, generate a new link and update
OBS. Existing session links stop updating when a new session is generated.

This relay intentionally serves loopback hosts only, on the same computer as OBS.
It uses an in-memory process-local registry. It is not supported on Vercel,
serverless functions, multiple server processes, remote devices or load-balanced
hosting. Existing same-browser projector windows do not need this relay.

The livestream feed is a text/lyrics/Scripture lower third, not a video/audio
mixer. Browser-uploaded blob media cannot be fetched from OBS's separate browser.
Use OBS Window Capture for the congregation window when capturing local media.
OBS WebSocket scene control, stream start/stop, NDI and hardware integrations
remain outside this pass.

Reference: https://obsproject.com/kb/browser-source

## EasyWorship comparison

EasyWorship describes a schedule → preview → live workflow, resources, streaming
integration and native desktop delivery. This project now follows that central
operator workflow but has a narrower verified feature set.

| Area | This project | Gap to close |
| --- | --- | --- |
| Schedule / preview / live | Implemented, with separate preparation and live queues | Full service rehearsal and recovery testing |
| Bible library | Seven complete local versions, including Yoruba | Licensed NIV/AMP/MSG and translation QA |
| OBS | Local Browser Source lower third; normal window capture option | Native OBS capture acceptance test; advanced production adapters |
| Songs | Editor, section navigation, local library persistence | Import/export, licensed catalog integration, backup |
| Media | Browser images/videos and uploads | Durable offline media storage; audio controls and codec/hardware testing |
| Displays | Browser windows and stage monitor | Desktop multi-monitor management and display recovery |
| Distribution | Local Next.js production server | Desktop installer, update system, operational support |

Comparison source: https://easyworship.com/software/features

## Remaining release blockers and follow-up

1. Native OBS recording and projector/stage rehearsal: validate alpha, frame rate,
   Unicode rendering, operator browser throttling, video/audio behavior, reconnection,
   server restart, and a long running service on the actual production computer.
2. Durable media and backups: blob URLs are not portable/persistent. Add media
   storage through adapters, service export/import and a recovery procedure.
3. Cloud security qualification: configured-auth verification now fails closed.
   Review tenant-scoped browser caches, membership enforcement and Supabase RLS with
   separate real organizations before exposing a hosted production installation.
   The local song library is currently per browser, not per cloud tenant.
4. Recovery and persistence: storage quota failures can still fall back to memory
   in the existing service repository. Song storage needs quota/error feedback and
   tenant-aware storage before hosted release. Operator restart resets active
   presentation state; reopen the service and explicitly take content live.
5. Licensing: obtain publisher agreements/data for NIV, AMP and MSG; review all
   church-imported songs/media. OYCB redistribution must retain CC BY-SA notices.
6. Accessibility/responsive qualification: run keyboard and screen-reader checks
   on the complete editor/modal workflow; desktop operation is the primary target.
   Compact screens use panel toggles and horizontal workspace scrolling.
7. Packaging/operations: pinned runtime installation, vulnerability review,
   deployment monitoring, error reporting, release backups and hardware testing.

Phase 0–2 remain the focus. This user's explicit OBS request authorizes the narrow
local Browser Source bridge. Desktop, remote, cloud collaboration and advanced
hardware adapters remain deferred under MASTER_BUILD.md §46.

## Validation record

- `npm run type-check`: passed.
- `npm run lint`: passed.
- `npm run test`: 117 tests passed across 20 files. Includes every book/chapter
  of all seven shipped translations, authentic KJV/Yoruba checks, rejection of
  uninstalled versions, relay access/size/origin checks and presentation regression tests.
- `npm run build`: passed, using Next.js 16.3.5 production output.
- Browser checks against the production server: Yoruba lookup/take-live, full
  Psalm 23 (six verses), standalone audience output, HTTP livestream receiver,
  navigation while preparing another passage, freeze/unfreeze, Black and Clear.
- Livestream computed backgrounds verified transparent at html, body and canvas.
- Compact workstation inspected visually. A requested viewport override did not
  change the in-app browser's physical viewport; a full desktop-size visual pass
  remains part of hardware acceptance.
- OBS did not appear in the app inventory, and obs64.exe was absent from both
  standard Program Files install paths. No native OBS recording test was claimed.
- Repeat the independent HTTP transport smoke check with `npm run verify:outputs`
  while the local server runs (or pass its loopback URL as the first argument).
- Independent HTTP smoke check passed against http://127.0.0.1:3100, sharing no
  browser storage/cookies with the operator. Verified live/frozen/black/clear
  delivery, rejection of writes using read-only credentials, all seven Bible
  assets, and successful standalone output routes.
