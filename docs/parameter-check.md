Here is a comprehensive checklist markdown file (`CHECKLIST.md`) designed to evaluate whether your final code lines up perfectly with the CodeVector assignment rules. You can keep this in your project root directory to self-grade your work before submitting it.

---

# 📋 CodeVector Assignment Checklist (`CHECKLIST.md`)

This markdown document serves as the absolute verification criteria to ensure your backend implementation matches the exact performance and architectural guidelines expected by the founders.

---

## ⚡ 1. Data Ingestion & Seeding Layer (The 200,000 Constraint)

The objective is to seed a large volume of fake data instantly without causing performance bottlenecks.

* [ ] **NO JavaScript loops (`for`, `while`, `forEach`):** Your seeder file must not call individual database insert statements inside an iterative JS loop. Doing this creates massive network latency and timeouts.
* [ ] **Uses Native SQL Execution (`generate_series`):** The seeder script delegates generation entirely to the database engine using `generate_series(1, 200000)` so it runs locally in memory.
* [ ] **Execution Boundary Speed:** Running `npm run seed` must completely wipe old states, recreate schemas, apply indices, and ingest all 200,000 lines in **under 3 seconds total**.
* [ ] **Dynamic Column Variance:** The seed query cleanly spreads items across the required categories (`Electronics`, `Clothing`, `Books`, `Sports`, `Home & Kitchen`) and generates realistic random prices.
* [ ] **Dynamic Timestamp Intervals:** Timestamps for `created_at` are distinctively spread backwards (e.g., subtracting `i || ' minutes'`). *If elements share the exact same millisecond row value, chronological sorting breaks!*

---

## 📈 2. Core Pagination Architecture (Offset vs Keyset)

The core task is to paginate smoothly while records change concurrently.

* [ ] **Banned Words check (`OFFSET`):** Scan your query string buffers. The keyword `OFFSET` must be completely absent from your pagination logic.
* [ ] **Multi-Column Keyset Slicing:** The data extraction query must slice the dataset by evaluating key boundaries via snapshots:
```sql
WHERE (created_at < $1 OR (created_at = $1 AND id < $2))

```


* [ ] **Sorting Consistency:** Results are strictly sequenced **Newest First** matching the primary sorting instruction exactly (`ORDER BY created_at END, id DESC`).
* [ ] **Deterministic Tie-Breaking:** The unique sequential primary key (`id`) must be paired with the timestamp as a fallback boundary constraint. This guarantees your cursor doesn't loop or drop elements if two products share matching millisecond timestamps.
* [ ] **Drift & Shift Invariance:** If 50 new elements are inserted at the very top of the table concurrently, your API must guarantee a browsing user will never see duplicate entries or miss items when fetching the next page token.

---

## 🛡️ 3. Request Validation & Token Serialization

This layer ensures incoming query attributes are properly parsed and handled before executing database operations.

* [ ] **Bouncer Layer Input Control (Zod Schema):** All URL string properties (`?limit=X&category=Y&cursor=Z`) pass through strict validation before reaching any controllers.
* [ ] **Payload Limits Protection:** The `limit` request value is bound by a safe boundary constraint (e.g., maximum `50`) via Zod coercion to prevent users from trying to download massive chunks of the database at once.
* [ ] **Opaque Cursor Encoding:** Internal indexing IDs and raw ISO timestamp strings are masked into an unreadable string format using Base64:
```typescript
Buffer.from(JSON.stringify(payload)).toString("base64")

```


* [ ] **Graceful Exception Management:** Malformed cursor tokens sent by users do not throw server-crashing unhandled rejections; they are caught safely and return a clear status `400 Bad Request`.

---

## 🛢️ 4. Relational Database Tuning & Optimization

Without proper structural optimizations, massive table datasets run slow on sequential lookups.

* [ ] **No Table Scans:** Query planners must execute using target paths rather than standard brute-force row scanning ($O(N)$).
* [ ] **Composite B-Tree Tree Index Implementation:** The database table must explicitly possess this specific index layout:
```sql
CREATE INDEX idx_products_pagination ON products (category, created_at DESC, id DESC);

```


* [ ] **Strict Connection Safety Plugin (Pool Caching):** The application relies on a unified pool instance (`pg.Pool`) configured with realistic safety timeouts, completely avoiding raw single clients (`pg.Client`) that bottleneck concurrent web loops.

---

## 🚀 5. Public Operations & Final Submission Requirements

The final deployment verification before delivering files to the team.

* [ ] **Production Security Plugins Registered:** Fastify modules are actively handling CORS policies (`@fastify/cors`) and applying safe server-side response head configurations (`@fastify/helmet`).
* [ ] **Active Infrastructure Environment Plugins:** Confidential secrets like Neon connection tokens are parsed dynamically (`process.env.DATABASE_URL`) from isolated local files (`.env`), ensuring no secrets are accidentally leaked to GitHub.
* [ ] **Live Public Availability:** The Fastify engine layer runs seamlessly on Render, and data responses are pullable from anywhere globally over public request endpoints.
* [ ] **Learning & Prompts Log Captured:** Our conversation logs are completely ready to export as a text or PDF attachment to claim those explicit bonus assessment points.