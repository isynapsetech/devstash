# Current Feature
<!-- Feature Name and Short Description -->
Prisma + Neon PostgreSQL setup — set up Prisma 7 ORM with a Neon serverless Postgres database and the initial schema.

# Status
<!-- Not Started  or In Progress or Completed -->
In Progress

# Goals
<!-- Goals and requirements -->
- Use Neon PostgreSQL (serverless)
- Create the initial schema from the data models in project-overview.md (this will evolve)
- Include the NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes

# Notes
<!-- Any extra notes -->
- Spec: @context/features/database-spec.md
- Initial data models: @context/project-overview.md
- **Use Prisma 7**, which has breaking changes. Read the full upgrade guide first: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Setup guide: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres
- Prisma docs: https://prisma.io/docs (fetch the latest, don't rely on older patterns)
- `DATABASE_URL` points at the Neon **development** branch; production is a separate branch
- **Always create migrations** (`prisma migrate dev`); never `db push` unless told to

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