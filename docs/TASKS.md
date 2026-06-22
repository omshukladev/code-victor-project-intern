# TASKS.md

# CodeVector Internship Assignment

Project Status: IN PROGRESS

---

# Phase 1 - Project Setup

## Task 1.1 Initialize Project

* [x] Create GitHub repository
* [x] Clone repository locally
* [x] Initialize Node.js project
* [x] Initialize TypeScript
* [x] Configure tsconfig.json

Deliverable:

* Project boots successfully

Commit:

```bash
git commit -m "chore: initialize project"
```

---

## Task 1.2 Install Dependencies

### Production Dependencies

* [x] fastify
* [x] pg
* [x] zod
* [x] dotenv

### Development Dependencies

* [x] typescript
* [x] tsx
* [x] vitest
* [x] @types/node

Deliverable:

* Dependencies installed

Commit:

```bash
git commit -m "chore: install dependencies"
```

---

# Phase 2 - Database Setup

## Task 2.1 Configure PostgreSQL

* [x] Create Neon project
* [x] Obtain DATABASE_URL
* [x] Configure .env

Deliverable:

* Database connection successful

Commit:

```bash
git commit -m "feat: setup database connection"
```

---

## Task 2.2 Create Products Table

* [x] Create products table
* [x] Add primary key
* [x] Add timestamps
* [x] Verify schema

Deliverable:

* Table exists

Commit:

```bash
git commit -m "feat: create products table"
```

---

## Task 2.3 Create Database Indexes

* [x] Create pagination index
* [x] Create category index
* [x] Verify indexes

Deliverable:

* Indexes created

Commit:

```bash
git commit -m "feat: add database indexes"
```

---

# Phase 3 - Seed Script

## Task 3.1 Create Seed Script

* [x] Create seed.ts
* [x] Use generate_series()
* [x] Generate categories
* [x] Generate prices
* [x] Generate timestamps

Deliverable:

* Script executes successfully

Commit:

```bash
git commit -m "feat: add seed script"
```

---

## Task 3.2 Seed Database

* [x] Insert 200,000 products
* [x] Verify row count
* [x] Verify categories
* [x] Verify timestamps

Verification Query

```sql
SELECT COUNT(*) FROM products;
```

Expected

```text
200000
```

Deliverable:

* Database contains 200k records

Commit:

```bash
git commit -m "feat: seed database with 200k products"
```

---

# Phase 4 - Validation Layer

## Task 4.1 Product Query Schema

* [x] Create product schema
* [x] Validate category
* [x] Validate limit
* [x] Validate cursor

Deliverable:

* Validation working

Commit:

```bash
git commit -m "feat: add request validation"
```

---

# Phase 5 - Cursor Utilities

## Task 5.1 Cursor Encoder

* [x] Create encodeCursor()
* [x] Create decodeCursor()
* [x] Test encoding
* [x] Test decoding

Deliverable:

* Cursor utilities working

Commit:

```bash
git commit -m "feat: add cursor utilities"
```

---

# Phase 6 - Product Service

## Task 6.1 First Page Query

* [x] Build newest-first query
* [x] Add limit support
* [x] Return products

Deliverable:

* First page works

Commit:

```bash
git commit -m "feat: add initial product query"
```

---

## Task 6.2 Cursor Query

* [x] Decode cursor
* [x] Apply cursor SQL
* [x] Return next page

Deliverable:

* Pagination working

Commit:

```bash
git commit -m "feat: implement cursor pagination"
```

---

## Task 6.3 Category Filtering

* [x] Add category filtering
* [x] Combine with cursor pagination
* [x] Verify correctness

Deliverable:

* Filtering working

Commit:

```bash
git commit -m "feat: add category filtering"
```

---

# Phase 7 - API Routes

## Task 7.1 Create Products Route

Endpoint

```http
GET /api/products
```

Requirements

* [x] Validation
* [x] Filtering
* [x] Pagination
* [x] Error handling

Deliverable:

* Endpoint functional

Commit:

```bash
git commit -m "feat: add products endpoint"
```

---

# Phase 8 - Response Format

## Task 8.1 Standard Responses

Success

* [x] Return products
* [x] Return nextCursor

Failure

* [x] Return error message
* [x] Return status codes

Deliverable:

* Consistent API responses

Commit:

```bash
git commit -m "feat: standardize api responses"
```

---

# Phase 9 - Testing

## Task 9.1 Validation Tests

* [ ] Invalid limit
* [ ] Invalid cursor
* [ ] Invalid query

Deliverable:

* Validation tested

---

## Task 9.2 Pagination Tests

* [ ] First page
* [ ] Second page
* [ ] Last page

Deliverable:

* Pagination verified

---

## Task 9.3 Consistency Test

Scenario

1. Request page 1
2. Insert 50 products
3. Request page 2

Expected

* [ ] No duplicates
* [ ] No missing records

Deliverable:

* Assignment requirement verified

Commit:

```bash
git commit -m "test: verify pagination consistency"
```

---

## Task 9.4 Performance Test

Run

```sql
EXPLAIN ANALYZE
```

Verify

* [ ] Index scan used
* [ ] No sequential scan
* [ ] Query fast

Deliverable:

* Performance validated

Commit:

```bash
git commit -m "test: verify query performance"
```

---

# Phase 10 - Deployment

## Task 10.1 Deploy Database

* [ ] Neon configured
* [ ] Production database ready

---

## Task 10.2 Deploy Backend

* [ ] Create Render service
* [ ] Configure environment variables
* [ ] Deploy application

Deliverable:

* Public URL available

Commit:

```bash
git commit -m "chore: deploy application"
```

---

# Phase 11 - Documentation

## Task 11.1 README

Include

* [ ] Project overview
* [ ] Setup instructions
* [ ] Environment variables
* [ ] API documentation
* [ ] Deployment URL

Deliverable:

* README completed

Commit:

```bash
git commit -m "docs: add readme"
```

---

## Task 11.2 Submission Note

Write

* [ ] Why PostgreSQL
* [ ] Why Fastify
* [ ] Why Cursor Pagination
* [ ] AI usage
* [ ] Improvements with more time

Deliverable:

* Submission note completed

---

# Phase 12 - Final Review

## Functional Checklist

* [ ] Database connected
* [ ] Products table exists
* [ ] 200,000 records inserted
* [ ] Indexes created
* [ ] Validation implemented
* [ ] Cursor pagination implemented
* [ ] Category filtering implemented
* [ ] API working
* [ ] Tests passing
* [ ] Hosted publicly

---

## Assignment Checklist

* [ ] GitHub repository
* [ ] Public API URL
* [ ] README
* [ ] Submission note
* [ ] AI chat export

---

# Definition of Done

Project is complete when:

* 200,000 products exist
* API returns newest products
* Category filtering works
* Cursor pagination works
* No duplicates occur
* No products are skipped
* Public deployment available
* Code can be explained live in interview
