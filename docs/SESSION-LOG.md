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
- Audited pagination queries via `EXPLAIN ANALYZE` and verified that they use the B-Tree composite index `idx_products_pagination` successfully with an execution plan time of **0.059 ms**.
- Created a comprehensive root `README.md` detailing the project architecture, tech stack, codebase structure, execution parameters, local setup instructions, test commands, and database benchmarks.
- Updated `docs/TASKS.md` to check off Phase 1 through Phase 9, as well as Phase 11's README task as completed.

### Decisions
- Standardized the database communication pattern around the raw `pg` connection pool, completely avoiding Prisma or any other ORM to maximize execution speed and maintain transparent SQL control.
- Confirmed using Keyset/Cursor-based pagination to satisfy the assignment requirement of drift-invariant paginated browsing when records are concurrently added/updated.
- Applied a composite B-Tree index on `(category, created_at DESC, id DESC)` to optimize category filtering and cursor sorting execution.
- Subtracted distinct minute offsets (`NOW() - (i || ' minutes')::interval`) during row generation to spread out timestamps and prevent timestamp sorting collisions.
- Encapsulated cursor state as a Base64-encoded string (`{ createdAt: string, id: number }`) to keep internal sorting properties opaque for clients.
- Used a lookahead query limit (`limit + 1`) to verify next-page availability dynamically rather than executing a slow count query.

### Problems Encountered
- Observed a test failure race condition during Vitest runs. Because both the source `.ts` files and the compiled `.js` files (in `dist/`) were running in parallel, their database operations collided. Resolved this by adding `vitest.config.ts` to exclude `**/dist/**` from the test runner.

### Next Steps
- **Phase 10: Deployment**
  - Setup and deploy the Fastify backend publicly on Render.
- **Phase 11: Documentation**
  - Complete the submission note detailing architecture choices, AI audit logs, and development learnings.
