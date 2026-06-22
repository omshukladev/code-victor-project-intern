# Session Log

## 2026-06-22

### Completed
- Verified project specifications and confirmed the layout is set up for Fastify, PostgreSQL raw SQL, and Cursor Pagination.
- Checked all project documents to verify that no Prisma ORM references exist.
- Inspected the initialized Fastify + TypeScript boilerplate workspace under `backend/`.
- Verified installation of packages (`fastify`, `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`, `pg`, `zod`, `dotenv` and dev dependencies).
- Confirmed the health check route controller and unit/integration tests (`src/__tests__/health.test.ts`) compile and run successfully.
- Configured PostgreSQL connection string via `.env`.
- Created SQL schema migration (`backend/src/db/migrations/0001_create_products.sql`) to define the `products` table and the composite index `(category, created_at DESC, id DESC)`.
- Executed migrations (`npm run migrate`) to instantiate database tables and indexes.
- Wrote database-native seeding script (`backend/src/db/seed.ts`) utilising `generate_series()` to populate products dynamically.
- Executed seeding (`npm run seed`) and successfully populated 200,000 products in **1.903 seconds**.
- Built validation schema logic (`backend/src/schemas/validation.ts`) using **Zod** to validate endpoint query strings (`category`, `limit` default of 10 and max 100, and optional base64 `cursor`).
- Implemented base64 cursor serialization and deserialization utilities (`encodeCursor`/`decodeCursor` in `backend/src/schemas/validation.ts`) to manage cursor pagination tokens securely.
- Built products catalog endpoint controller handler (`backend/src/controllers/products.controller.ts`) executing parameterized raw SQL queries with Keyset pagination rules `(created_at < $1 OR (created_at = $1 AND id < $2))`.
- Integrated lookahead slicing (+1 limit database checks) into the query logic to identify the existence of subsequent pages without secondary COUNT scans.
- Hooked up and registered products route `/products` under Fastify prefix `/api` in `backend/src/app.ts`.
- Created comprehensive integration and unit test suite (`backend/src/__tests__/products.test.ts`) covering Zod parameter validation limits, malformed cursors, category filters, and cursor-based sequential pagination.
- Implemented consistency tests under concurrent insertions, verifying that items inserted mid-browse are not skipped or duplicated.
- Executed test suites via Vitest (`npm run test`) and identified that compiled files in `dist/` were being run in parallel with the source `src/` files, causing concurrent database row mutations and race condition failures.
- Created Vitest configuration (`backend/vitest.config.ts`) to exclude the compiled `dist/` directory, resolving test file duplication and ensuring a clean, race-free single-run test execution (8 tests passed).
- Created a comprehensive root `README.md` detailing the project architecture, tech stack, codebase structure, execution parameters, local setup instructions, test commands, and database benchmarks.
- Created the Next.js client-side interface (`frontend/app/page.tsx`) incorporating horizontal category pill controls, a cursor-pagination-driven "Load More" trigger, animated placeholder skeletons, and a Render cold-start connection warning banner.
- Integrated a Light/Dark theme mode selector on the client UI using a sun/moon icon layout. The configuration is persisted in browser `localStorage` and synchronizes with Tailwind CSS v4 class-based overrides (`dark:` variables) across all elements (header, cards, skeletons, pills, banners, and footer).
- Configured local client-side environment configurations (`frontend/.env`) pointing `NEXT_PUBLIC_API_URL` to the local backend address on port 4000.
- Configured manual selector-based dark mode in Tailwind CSS v4 inside `frontend/app/globals.css` using the `@custom-variant dark (&:where(.dark, .dark *))` directive, and rebound CSS variables (`--background` and `--foreground`) to the `.dark` class to resolve conflicts with system media queries.
- Resolved React hydration mismatches causing theme toggle freezes by adding `suppressHydrationWarning` to the `<html>` element in `frontend/app/layout.tsx` and adding a `mounted` state check in `frontend/app/page.tsx` to delay client-interactive rendering until hydration is complete.
- Refactored the theme toggling behavior to remove the nested page wrapper and apply the `dark` class directly to the `<html>` document element, resolving body background mismatch bugs.
- Updated the pre-mounting skeleton loader to use standard Tailwind CSS utility colors (`text-[#171717] dark:text-[#ededed]` and `bg-white dark:bg-[#101010]`) so that it seamlessly renders in the user's preferred theme during hydration.
- Audited pagination queries via `EXPLAIN ANALYZE` and verified that they use the B-Tree composite index `idx_products_pagination` successfully with an execution plan time of **0.059 ms**.
- Executed production build (`npm run build` inside `frontend/`) and verified that the TS compilation and static page generation compile successfully with zero Turbopack or TypeScript compilation errors.
- Updated `docs/TASKS.md` to check off Phase 1 through Phase 9, Phase 11's README, and the optional frontend bonus tasks as completed.

### Decisions
- Standardized the database communication pattern around the raw `pg` connection pool, completely avoiding Prisma or any other ORM to maximize execution speed and maintain transparent SQL control.
- Confirmed using Keyset/Cursor-based pagination to satisfy the assignment requirement of drift-invariant paginated browsing when records are concurrently added/updated.
- Applied a composite B-Tree index on `(category, created_at DESC, id DESC)` to optimize category filtering and cursor sorting execution.
- Subtracted distinct minute offsets (`NOW() - (i || ' minutes')::interval`) during row generation to spread out timestamps and prevent timestamp sorting collisions.
- Encapsulated cursor state as a Base64-encoded string (`{ createdAt: string, id: number }`) to keep internal sorting properties opaque for clients.
- Used a lookahead query limit (`limit + 1`) to verify next-page availability dynamically rather than executing a slow count query.
- Focused the frontend purely on data consumption, category filtering, and keyset-based cursor tracking, avoiding unnecessary database write hooks or simulation route inserts to keep the deployment simple.
- Mitigated Render's cold-start connection delay visually by integrating loading skeletons and a wake-up banner, keeping the user updated on the server boot status.
- Implemented a purely client-side theme selection architecture, utilizing a simple `useEffect` configuration to toggle the `dark` class at the document root to ensure smooth rendering states without flashing or hydrate warnings.
- Explicitly overrode Tailwind CSS v4's default system-media dark variant with a manual selector variant (`.dark` class on root) to guarantee correct and consistent light/dark theme toggles.
- Addressed React hydration mismatch concerns by returning static structural placeholders during SSR and server hydration phases, preventing button event listener failures.
- Decided to target the `html` element (`document.documentElement`) for the `dark` class instead of a page wrapper `div` to ensure that global elements like the body background, scrollbars, and inputs correctly inherit theme styles.

### Problems Encountered
- Observed a test failure race condition during Vitest runs. Because both the source `.ts` files and the compiled `.js` files (in `dist/`) were running in parallel, their database operations collided. Resolved this by adding `vitest.config.ts` to exclude `**/dist/**` from the test runner.
- Resolved an issue where manual theme toggling had no effect because body background styles were bound to the system prefers-color-scheme media query by default, and Tailwind v4 default imports do not watch class selectors automatically. Customizing the CSS variables and variants solved this.
- Identified that manual toggles froze and did not register clicks on systems set to dark mode. This was caused by React hydration failures due to class differences between the server-rendered HTML page and the client state, which prevented event listeners from binding. Adding hydration suppression and mounted checkpoints fixed this.
- Observed that the body background was not transitioning to dark mode because the `dark` class was applied only on an inner page wrapper div inside `page.tsx` instead of the document root element, causing the background to mismatch with the dark text layout. Resolved this by refactoring class-based toggling to target the `document.documentElement` directly.

### Next Steps
- **Phase 10: Deployment**
  - Host the Fastify backend on Render and link the Next.js frontend app context.
- **Phase 11: Documentation**
  - Complete the final email submission note detailing architecture choices, execution metrics, and AI chat histories.
