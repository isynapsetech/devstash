# Current Feature
<!-- Feature Name and Short Description -->
Dashboard UI Phase 2 — build the collapsible sidebar (item types, favorite and recent collections, user avatar area) using mock data. Phase 2 of 3.

# Status
<!-- Not Started  or In Progress or Completed -->
In Progress

# Goals
<!-- Goals and requirements -->
- Collapsible sidebar
- Items/types with links to `/items/TYPE` (e.g. `/items/snippets`)
- Favorite collections
- Most recent collections
- User avatar area at the bottom
- Drawer icon to open/close sidebar
- Always a drawer on mobile view

# Notes
<!-- Any extra notes -->
- Spec: @context/features/dashboard-phase-2-spec.md
- Import data directly from @src/lib/mock-data.ts until the database is in place
- References: @context/screenshots/dashboard-ui-main.png, @context/project-overview.md
- Other phases: @context/features/dashboard-phase-1-spec.md, @context/features/dashboard-phase-3-spec.md

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