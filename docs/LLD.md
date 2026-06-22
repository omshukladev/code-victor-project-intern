# Low Level Design (LLD)

# Project

CodeVector Product Catalog API

Version: 1.0

---

# 1. Architecture Overview

The system consists of:

1. Fastify Server
2. Product Route
3. Validation Layer
4. PostgreSQL Database
5. Seed Script

Flow:

Client
↓
Fastify Route
↓
Zod Validation
↓
Product Service
↓
PostgreSQL
↓
Response

---

# 2. Folder Structure

```text
codevector-backend/

src/
│
├── db/
│   ├── database.ts
│   └── seed.ts
│
├── routes/
│   └── products.ts
│
├── services/
│   └── product.service.ts
│
├── schemas/
│   └── product.schema.ts
│
├── utils/
│   └── cursor.ts
│
├── types/
│   └── product.types.ts
│
└── server.ts

.env
package.json
tsconfig.json
README.md
```

---

# 3. Database Design

## products

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
```

---

# 4. Index Design

Primary Index

```sql
PRIMARY KEY(id)
```

Cursor Pagination Index

```sql
CREATE INDEX idx_products_cursor
ON products(created_at DESC, id DESC);
```

Filter + Pagination Index

```sql
CREATE INDEX idx_products_category_cursor
ON products(category, created_at DESC, id DESC);
```

Purpose:

* Fast sorting
* Fast filtering
* Avoid table scans

---

# 5. Seed Strategy

Generate 200,000 products.

Implementation:

```sql
generate_series(1,200000)
```

Fields Generated:

* id
* name
* category
* price
* created_at
* updated_at

Categories:

* Electronics
* Clothing
* Books
* Sports
* Home & Kitchen

Reason:

Database-side generation is significantly faster than inserting rows individually.

---

# 6. API Design

## GET /api/products

Purpose:

Fetch products.

Query Parameters:

```typescript
{
  category?: string;
  limit?: number;
  cursor?: string;
}
```

Example:

```http
GET /api/products
```

```http
GET /api/products?limit=20
```

```http
GET /api/products?category=Electronics
```

```http
GET /api/products?cursor=abc123
```

---

# 7. Request Validation

File:

```text
schemas/product.schema.ts
```

Schema:

```typescript
import { z } from "zod";

export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional()
});
```

Validation Rules:

* limit >= 1
* limit <= 100
* category optional
* cursor optional

---

# 8. Cursor Design

Cursor Structure

```json
{
  "createdAt": "2026-06-22T10:00:00Z",
  "id": 150
}
```

Encoded Form

```text
base64(cursor)
```

Example

```text
eyJjcmVhdGVkQXQiOiIyMDI2LTA2LTIyVDEwOjAwOjAwWiIsImlkIjoxNTB9
```

---

# 9. Cursor Utilities

File

```text
utils/cursor.ts
```

Functions

```typescript
encodeCursor()
decodeCursor()
```

Responsibilities

* Convert object → base64
* Convert base64 → object

---

# 10. Pagination Logic

First Request

```http
GET /api/products?limit=20
```

SQL

```sql
SELECT *
FROM products
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Last Item

```json
{
  "id": 20,
  "created_at": "2026-06-22T09:45:00Z"
}
```

Generate Cursor

```json
{
  "createdAt":"2026-06-22T09:45:00Z",
  "id":20
}
```

---

# 11. Next Page Query

Incoming Cursor

```json
{
  "createdAt":"2026-06-22T09:45:00Z",
  "id":20
}
```

SQL

```sql
SELECT *
FROM products
WHERE
(
 created_at < $1
 OR
 (
   created_at = $1
   AND id < $2
 )
)
ORDER BY created_at DESC, id DESC
LIMIT $3;
```

Parameters

```text
$1 = createdAt
$2 = id
$3 = limit
```

Result:

Only older products returned.

No duplicates.

No missing records.

---

# 12. Category + Cursor Query

SQL

```sql
SELECT *
FROM products
WHERE category = $1
AND (
    created_at < $2
    OR
    (
      created_at = $2
      AND id < $3
    )
)
ORDER BY created_at DESC,id DESC
LIMIT $4;
```

Parameters

```text
$1 category
$2 createdAt
$3 id
$4 limit
```

---

# 13. Product Service Layer

File

```text
services/product.service.ts
```

Responsibilities

* Build SQL
* Execute queries
* Generate next cursor
* Return response

Methods

```typescript
getProducts()
```

---

# 14. Response Format

Success

```json
{
  "success": true,
  "data": [],
  "nextCursor": "encoded_cursor"
}
```

Empty Result

```json
{
  "success": true,
  "data": [],
  "nextCursor": null
}
```

Error

```json
{
  "success": false,
  "message": "Invalid cursor"
}
```

---

# 15. Server Initialization

File

```text
server.ts
```

Responsibilities

* Create Fastify instance
* Register routes
* Start server

Example

```typescript
fastify.register(productRoutes);

fastify.listen({
  port: 3000
});
```

---

# 16. Error Handling

Database Error

```http
500 Internal Server Error
```

Invalid Cursor

```http
400 Bad Request
```

Invalid Query

```http
400 Bad Request
```

Unknown Route

```http
404 Not Found
```

---

# 17. Testing Strategy

Test Cases

## Pagination

* First page works
* Second page works
* Last page works

## Filtering

* Category filter works
* Invalid category handled

## Consistency

Scenario:

1. User loads page 1
2. Insert 50 new products
3. User loads page 2

Expected:

* No duplicates
* No skipped products

## Performance

Measure:

```sql
EXPLAIN ANALYZE
```

Verify index usage.

---

# 18. Deployment Architecture

Client
↓
Render
↓
Fastify Server
↓
Neon PostgreSQL

Environment Variables

```env
DATABASE_URL=
PORT=
NODE_ENV=production
```

---

# 19. Interview Questions Expected

Why not OFFSET pagination?

Answer:

OFFSET can skip or duplicate records when rows are inserted or updated.

---

Why use created_at + id?

Answer:

created_at alone may not be unique.

id acts as tie-breaker.

---

Why composite index?

Answer:

Supports filtering and sorting simultaneously.

---

Why generate_series?

Answer:

Fastest method for generating 200,000 records inside PostgreSQL.

---

# 20. MVP Checklist

* Database created
* Seed script created
* 200k products generated
* Product endpoint implemented
* Category filter implemented
* Cursor pagination implemented
* Validation implemented
* Tests written
* Hosted on Render
* README completed
* GitHub repository published
