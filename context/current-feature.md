# Current Feature
<!-- Feature Name and Short Description -->
Collection query performance — stop loading every item in a collection just to count items and find the most-used type.

# Status
<!-- Not Started  or In Progress or Completed -->
Completed

# Goals
<!-- Goals and requirements -->
- `COLLECTION_SELECT` in `src/lib/db/collections.ts` no longer selects `items → item → type`; item count comes from `_count: { select: { items: true } }`
- Per-type tallies come from one grouped query per call (collection ID × type ID → count) for the collections being shown, instead of fetching every item row
- The grouped query only counts the user's own items (`Item.userId = userId`)
- `getRecentCollections` and `getSidebarCollections` return the same `DashboardCollection` shape as now: `itemCount`, and `types` sorted most-used first, ties broken by name
- No visible change: collection cards (border color, type icons) and the sidebar (dot color, item count) look the same

# Notes
<!-- Any extra notes -->
- Source: code-scanner review, 2026-10-29 (finding 3)
- Today `COLLECTION_SELECT` loads every collection item row with its type, and it runs three times per dashboard load (recent cards, sidebar favorites, sidebar recents). The cost grows with the total number of items.
- Prisma `groupBy` can't group by a field on a related table (`ItemCollection.collectionId` + `Item.typeId`), so the tally likely needs `$queryRaw` (or Prisma TypedSQL). Postgres returns `COUNT(*)` as a `bigint`, so convert it to a `number`.
- Type details (name, icon, color) for the tally can come from one `itemType.findMany` over the type IDs that appear in it
- Out of scope: limits on favorites and pinned items (finding 4), "recent" ordering (finding 5)
- No schema change expected; if one is needed, use `prisma migrate dev`, never `db push`

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

## 2026-10-27 — Stats & sidebar from the database
- Added `getSidebarItemTypes()` to `src/lib/db/items.ts`: system types (fixed display order) plus custom types, with the user's item count per type
- Added `getSidebarCollections()` to `src/lib/db/collections.ts`: all favorites plus 5 most recent non-favorites; shared select/mapper with the dashboard cards
- Sidebar types link to `/items/[typename]` (e.g. `/items/snippet`), labels shown capitalized and plural
- Favorite collections: folder icon + star; recent collections: dot colored by the most-used item type on the left, item count on the right
- Added "View all collections" link to `/collections`; Favorites/Recent groups hide when empty
- New `SidebarSections.tsx` with async server components behind `<Suspense>`; fixed-width skeleton rows because shadcn's `SidebarMenuSkeleton` uses `Math.random()`, which can't be prerendered
- Dashboard stats were already on the database; sidebar user area still uses mock data, and `src/lib/dashboard.ts` is now unused (kept pending a decision)

## 2026-10-29 — Collection query performance
- Collection queries in `src/lib/db/collections.ts` no longer load every item; `itemCount` comes from a filtered `_count` (user's own items only)
- New `getTypeSummaries()`: one grouped `$queryRaw` (collection × type, joined with `ItemType`) for all collections shown; the sidebar's favorites and recents share one query
- Tally only counts the user's own items; skipped when there are no collections; same `DashboardCollection` shape and sort order as before
- Verified against the dev database: output identical to the previous implementation for the dashboard cards and both sidebar lists