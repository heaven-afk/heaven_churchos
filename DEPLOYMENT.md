# Deploy Heaven Church OS to Vercel

Repository: https://github.com/heaven-afk/heaven_churchos

The repository rename does not change the product name, storage keys, database
tables or routes. The app name stays configured in `src/config/brand.ts`.

## Supported deployment

The Next.js workstation, seven static Bible datasets, song/text/media controls,
and same-browser presentation windows can be hosted on Vercel. A basic deployment
uses browser storage and does not require Supabase or other environment variables.
This browser workspace is public software: it does not provide account security
without cloud authentication, and content is stored in that browser, not shared
between computers. Keep the operator and output windows on the same origin and
browser profile.

The existing OBS HTTP relay is deliberately local-only. It keeps state in a single
server process, so it is disabled on Vercel. The hosted Outputs menu explains the
supported alternative: open the livestream/congregation output window in the
operator browser and use OBS Window Capture. Window Capture is opaque; for alpha
transparent Browser Source compositing, run `npm run start:local` and use its local
OBS URL. Cloud-synchronized OBS Browser Source output needs a persistent shared
transport and remains separate work.

## Vercel import settings

First commit and push the local changes, including `public/bibles/`, to the renamed
repository. Vercel's Git integration deploys committed GitHub content, not unsaved
local changes.

1. In Vercel, choose Add New → Project and import `heaven-afk/heaven_churchos`.
   If an existing Vercel project still points at the old repository, reconnect its
   Git repository under Project Settings → Git.
2. Choose a Vercel project name such as `heaven-churchos`. This controls the Vercel
   project/domain, independently of the GitHub repository name.
3. Set Framework Preset to **Next.js** and Root Directory to the repository root.
4. Set Node.js to **24.x** (also pinned in `package.json` and `.nvmrc`).
5. Install Command: `npm ci`. Build Command: `npm run build`.
   Leave Output Directory at the framework default; do not select a static `out/`
   export or use `npm run start:local` as a Vercel build command.
6. For the browser-only workspace, leave the Supabase variables unset. Deploy.

`vercel.json` declares the framework and commands. The old `@supabase-url` and
`@supabase-anon-key` references were removed: there is no dependency on named
secrets belonging to another Vercel account. `.vercelignore` keeps scratch input
archives, local environment files, dependencies and previous build output out of
CLI uploads. The static Bible assets and their license notices remain included.

## Optional Supabase configuration

Cloud accounts/data require a Supabase project and the checked-in SQL migration:
`supabase/migrations/20260921000000_phase1_schema.sql`. Review and apply it to your
own project. Cloud tenant/RLS qualification is still listed in
`PRODUCTION_REVIEW.md`; successful Vercel deployment does not certify those flows.

In Vercel Project Settings → Environment Variables, configure **both**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project's HTTPS URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Its public anon key |

Never use a Supabase secret/service-role key in a `NEXT_PUBLIC_*` variable. Apply
values to the intended Production/Preview environments and redeploy after changes.
Public environment variables are built into the browser bundle.

In Supabase Authentication → URL Configuration:

- Set Site URL to your deployed HTTPS application origin.
- Add `https://YOUR-DEPLOYMENT-DOMAIN/auth/callback` to Redirect URLs.
- Add each allowed preview/local callback explicitly when needed; avoid broad
  wildcard access across unrelated deployment domains.

No `NEXT_PUBLIC_APP_URL` variable is currently required: the existing callback
derives its origin from the incoming request. Email-confirmation onboarding and
organization provisioning still need real-project acceptance before hosted
multi-user use. For an immediate browser-only deployment, leave Supabase unset.

## Validate before import/redeploy

Use Node.js 24 and run:

```text
npm ci
npm run check:deploy
```

The check runs TypeScript, lint, tests, and a production build with `VERCEL=1`.
It does not log into Vercel or publish a deployment. The runtime tests verify that
the process-local OBS relay rejects requests in Vercel mode.

After deploying, open the workstation and verify:

1. `/` loads, and `/bibles/KJV/JHN.json` and `/bibles/OYCB/JHN.json` return JSON.
2. Scripture lookup → Preview → Take live works; Yoruba diacritics render correctly.
3. Outputs → Launch Audience Display tracks navigation in the same browser.
4. Black/Clear/Freeze work, and the hosted OBS guidance appears instead of an
   unusable Enable OBS output button.
5. Refresh/reopen a saved service and song library. Browser data is specific to
   this deployment's origin; renaming a domain starts a separate browser workspace.

Uploaded blob media is session-only and cannot be shared with another device.
Vercel hosting requires internet to load uncached pages/assets. These deployment
checks do not replace the live-service/hardware rehearsal in the release review.

## Local verification — 18 November 2026

- `npm run check:deploy` passed: TypeScript, ESLint, 119 tests across 21 files,
  and the production build with `VERCEL=1`.
- Checked local import filename casing for Linux compatibility; passed.
- Verified the renamed GitHub repository's `main` branch is reachable and updated
  local `origin` to `https://github.com/heaven-afk/heaven_churchos.git`.
- These checks did not publish a deployment or push local changes. The Vercel
  account configuration and deployed URL still need verification after import.

## Documentation sources

- Next.js on Vercel: https://vercel.com/docs/frameworks/full-stack/nextjs
- Project configuration: https://vercel.com/docs/project-configuration/vercel-json
- Node.js versions: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Supabase redirects: https://supabase.com/docs/guides/auth/redirect-urls
