# Daniel Nates — Journal

Source for **danielnates.com** — an authored, editorial journal presenting the work, thinking, and projects of chef **Daniel Nates**.

The site is designed as a **scroll-based narrative** rather than a traditional website. It prioritises reading, pacing, and authorship over UI conventions.

---

## Concept

The journal presents Daniel's work in first person, structured as a continuous document:

- A central authored statement
- Project chapters (Olivea, Fritanguita, Maizal — and any new project)
- Field Notes as a living archive
- Daily Brief, Diario (journal), Arte (art), Press kit, Press mentions

The design draws inspiration from contemporary editorial and studio sites, emphasising:
- restraint
- typographic authority
- subtle motion
- content-first composition

---

## Stack

### Web
- **Astro 6** (server output, Vercel adapter)
- React 19 islands scoped to `/admin/**`
- Custom CSS — editorial layout, GSAP + Lenis motion, single AnimationDirector
- Bilingual ES/EN routing (`/` ES, `/en/*` EN; asymmetric slugs translated by `switchLocale`)

### CMS — custom Supabase admin (no Sanity)
- **Supabase** Postgres + Storage + Auth (magic-link)
- Postgres RLS — public reads only `published`, admin writes via `is_admin()` against an `admin_emails` whitelist
- Custom `/admin/**` portal with React islands per content type
- Page builder with 20 block types (`@dnd-kit/sortable` for drag-drop)

### Hosting
- **Vercel** — serverless functions (`@astrojs/vercel`), default OG card via `/og.png`

---

## Project Structure

```
/
├─ web/                          # Astro app (frontend + admin)
│  ├─ src/
│  │  ├─ pages/                  # Public + /admin + /api routes
│  │  ├─ components/
│  │  │  ├─ admin/               # Admin React forms + block editors
│  │  │  ├─ blocks/              # Public block renderers (20 types)
│  │  │  ├─ scenes/              # Home page film scenes
│  │  │  └─ layout/              # BaseLayout, MenuOverlay, TopDock
│  │  ├─ lib/
│  │  │  ├─ supabase.ts          # Anon, service-role, server clients
│  │  │  ├─ queries.ts           # Public read helpers
│  │  │  ├─ admin-helpers.ts     # requireAdmin guard, textToBlocks
│  │  │  ├─ blocks-meta.ts       # Block-builder registry
│  │  │  ├─ types.ts             # Supabase row shapes
│  │  │  └─ i18n.ts              # ES/EN helpers, asymmetric route map
│  │  └─ styles/                 # Tokens, fonts, layout, admin CSS
│  ├─ public/
│  └─ package.json
│
├─ supabase/
│  ├─ schema.sql                 # Idempotent schema snapshot
│  └─ migrations/                # Timestamped DDL changes
│
└─ README.md
```

---

## Local development

```bash
cd web
nvm use 22                       # Node ≥ 22.12 required by Astro
npm install
cp .env.example .env             # Fill in Supabase URL + keys
npm run dev                      # http://localhost:4321
```

Required env vars (`web/.env`):
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

To get into `/admin` you must be a magic-link-authenticated user whose email is in the `admin_emails` table.

## Schema changes

Edit `supabase/schema.sql` to keep the snapshot current, and add a timestamped file under `supabase/migrations/` for the actual DDL the running DB needs. Apply via the Supabase dashboard SQL editor.
