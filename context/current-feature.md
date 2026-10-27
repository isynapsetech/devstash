# Current Feature
<!-- Feature Name and Short Description -->
Dashboard items — replace the mock item data in the dashboard main area (pinned items and recent items) with real data from the Neon database via Prisma.

# Status
<!-- Not Started  or In Progress or Completed -->
Completed

# Goals
<!-- Goals and requirements -->
- Create `src/lib/db/items.ts` with the data fetching functions
- Fetch items directly in the server component
- Pinned items and recent items both come from the database
- If there are no pinned items, the pinned section doesn't display at all
- Item card icon and border color derived from the item type
- Display the item's tags and everything else currently shown (title, description, pin/favorite markers, date)
- Keep the current design (see the screenshot)
- Update the stats display (items and favorite items stats, still on mock data)

# Notes
<!-- Any extra notes -->
- Spec: @context/features/dashboard-items-spec.md
- Reference: @context/screenshots/dashboard-ui-main.png (layout and design already exist)
- Current item rows: `src/components/dashboard/ItemRow.tsx`, rendered by `src/app/dashboard/page.tsx` with data from `src/lib/dashboard.ts` / `src/lib/mock-data.ts`
- Follow the pattern from dashboard collections: `getCurrentUserId()` (demo user until auth), async server components behind `<Suspense>` with skeletons
- Seeded data has no pinned or favorite items and no tags, so the pinned section will be hidden and tags will be empty
- Schema changes (if any) go through `prisma migrate dev`, never `db push`

# History
<!-- Keep this updated. Earliest to latest -->

## 2026-10-26 — Initial Next.js setup
- Created Next.js project with App Router, TypeScript, Tailwind CSS v4 and Turbopack
- Removed default boilerplate (SVGs, AGENTS.md, default page/styles)
- Added CLAUDE.md and context files (project-overview, coding-standards, ai-interaction, current-feature)
- Committed and pushed to https://github.com/isynapsetech/devstash.git

## 2026-10-26 — Mock data for dashboard UI
- Added `src/lib/mock-data.ts` with user, item types, collections and items, used until the database is in place

## 2026-10-26 — Dashboard UI Phase 1
- Initialized shadcn/ui (base-nova preset) and added the `button` and `input` components
- Added the `/dashboard` route with a layout: sidebar placeholder, top bar and main area
- Dark mode by default (`dark` class on `<html>`), Geist fonts wired into the theme
- Top bar with search input (⌘K hint) and New Item button (display only)

## 2026-10-26 — Dashboard UI Phase 2
- Added shadcn `sidebar`, `avatar` and `collapsible` components (plus sheet, tooltip, separator, skeleton)
- Sidebar with item type links to `/items/[slug]`, favorite and recent collections, and user avatar area
- Collapses to icons on desktop, always a drawer on mobile; toggle button in the top bar (also Ctrl/⌘+B)
- Recent collections ordered by latest item `updatedAt` (mock collections have no timestamp)
- Rewrote the generated `use-mobile` hook with `useSyncExternalStore` to fix a lint error

## 2026-10-26 — Dashboard UI Phase 3
- Added shadcn `card` and `badge` components
- Main dashboard area: 4 stats cards, recent collections grid, pinned items and 10 recent items
- Extracted shared mock-data queries into `src/lib/dashboard.ts` and a `TypeIcon` component, reused by the sidebar
- Added two mock items so the recent items list has 10 entries
- Total items stat sums per-type counts to match the sidebar; favorite counts come from the sample item list

## 2026-10-27 — Prisma 7 + Neon PostgreSQL setup
- Installed Prisma 7.10 with `@prisma/adapter-neon`; client generated to `src/generated/prisma` (gitignored) via `postinstall`
- `prisma.config.ts` loads `.env` with dotenv and uses `DIRECT_URL` for migrations; app client in `src/lib/prisma.ts` uses pooled `DATABASE_URL`
- Initial schema from the project overview, incl. Auth.js models, indexes (incl. `[userId, isFavorite]`, `[userId, updatedAt]` on Item) and cascade deletes
- Initial migration `20261027084116_init` applied to the Neon development branch (migrations only, never `db push`)
- Seed script `prisma/seed.ts` (`npm run db:seed`): 7 system item types and a demo user with the mock collections, items and tags
- Database smoke test `scripts/test-db.ts` (`npm run db:test`): connection, tables, counts, write/read and cascade delete

## 2026-10-27 — Seed data
- Rewrote `prisma/seed.ts` per the seed spec: demo user `demo@devstash.io` (bcryptjs, 12 rounds, free plan, email verified)
- 7 lowercase system item types; types from the previous seed are renamed in place (case-insensitive match), not duplicated
- 5 collections with 18 items: React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources (real URLs for links)
- Seed is re-runnable and removes the previous `john@example.com` seed user
- `npm run db:test` now also verifies the seeded types, demo user (incl. password) and per-collection item types against the spec
- Added `bcryptjs` dependency

## 2026-10-27 — Dashboard collections from the database
- Added `src/lib/db/collections.ts`: recent collections (by `updatedAt`, limit 6) with per-type item counts, and collection stats (total, favorites)
- Added `src/lib/db/user.ts`: temporary `getCurrentUserId()` returning the seeded demo user until auth exists (React `cache()` dedupes per request)
- Collection card border color comes from the most-used item type; card shows icons of all types in the collection
- `RecentCollections` and `StatsCards` are async server components streamed behind `<Suspense>` with skeletons; `/dashboard` is now partially prerendered
- `await connection()` before DB access, since the Neon driver's randomness isn't allowed during prerendering with `cacheComponents`
- Collections and favorite collections stats come from the DB; item stats, pinned/recent items and the sidebar still use mock data
- Added `src/types/collections.ts` for the dashboard collection shapes

## 2026-10-27 — Dashboard items from the database
- Added `src/lib/db/items.ts`: pinned items, recent items (by `updatedAt`, limit 10) with type and tags, and item stats (total, favorites)
- New `PinnedItems` / `RecentItems` async server components behind `<Suspense>`; pinned section renders nothing (no fallback) when there are no pinned items
- `ItemRow` uses database items; icon and border color come from the item type, tags shown as badges
- All four dashboard stats now come from the database
- Removed the unused mock item/stats helpers from `src/lib/dashboard.ts` (now only feeds the sidebar)
- Added `src/types/items.ts`; sidebar still uses mock data