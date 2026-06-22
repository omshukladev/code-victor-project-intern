# Technical Requirements Document (TRD)

## Project Name

CodeVector Internship Backend Assignment

## Objective

Build a backend service capable of serving approximately 200,000 products with:

* Fast pagination
* Category filtering
* Consistent results while data changes
* Public deployment

The system must prevent duplicate or missing products when new products are inserted or updated during browsing.

---

# Functional Requirements

## FR-1 Product Storage

The system shall store approximately 200,000 products.

Each product must contain:

* id
* name
* category
* price
* created_at
* updated_at

---

## FR-2 Product Listing API

Provide an API endpoint that returns products ordered by newest first.

Example:

GET /api/products

Response:

{
"data": [],
"nextCursor": ""
}

---

## FR-3 Category Filtering

Users must be able to filter products by category.

Example:

GET /api/products?category=Electronics

---

## FR-4 Pagination

The API must support pagination.

Requirements:

* Fast on large datasets
* No duplicate records
* No missing records
* Stable while new products are inserted

---

## FR-5 Cursor Support

Pagination must use a cursor mechanism.

Cursor should contain:

* created_at
* id

Purpose:

* Maintain stable ordering
* Prevent offset shifting issues

---

## FR-6 Seed Script

A dedicated seed script must generate:

* 200,000 products

Requirements:

* No slow row-by-row insertion
* Use database-native bulk generation

---

# Non-Functional Requirements

## NFR-1 Performance

Page retrieval should remain fast even with:

* 200,000 records
* category filters
* pagination

---

## NFR-2 Consistency

If 50 products are inserted while a user browses:

* no duplicate products
* no skipped products

---

## NFR-3 Security

Use parameterized SQL queries.

Prevent SQL Injection.

---

## NFR-4 Deployability

Backend must be publicly accessible.

Recommended:

* Render
* Railway
* Fly.io

---

# Database Design

Table: products

| Column     | Type                  |
| ---------- | --------------------- |
| id         | BIGSERIAL PRIMARY KEY |
| name       | VARCHAR(255)          |
| category   | VARCHAR(100)          |
| price      | NUMERIC(10,2)         |
| created_at | TIMESTAMPTZ           |
| updated_at | TIMESTAMPTZ           |

---

# Indexing Strategy

Primary Index:

(id)

Pagination Index:

(created_at DESC, id DESC)

Filter + Pagination Index:

(category, created_at DESC, id DESC)

Purpose:

* Fast filtering
* Fast cursor pagination

---

# API Specification

## Endpoint

GET /api/products

### Query Parameters

| Parameter | Required | Description        |
| --------- | -------- | ------------------ |
| limit     | No       | Number of products |
| category  | No       | Category filter    |
| cursor    | No       | Pagination cursor  |

### Success Response

{
"data": [],
"nextCursor": "..."
}

---

# Pagination Strategy

Chosen Strategy:
Cursor / Keyset Pagination

Reason:

Offset pagination can produce duplicates or skipped records when data changes.

Cursor pagination maintains stable navigation.

---

# Technology Stack

Backend:

* Node.js
* Fastify

Database:

* PostgreSQL

Hosting:

* Render

Validation:

* Zod

Testing:

* Vitest

---

# Future Improvements

* Redis caching
* Search endpoint
* Sorting by price
* Full-text search
* Admin dashboard
* Analytics

---

# Risks

1. Offset pagination causing duplicate records.
2. Missing database indexes.
3. Slow seed generation using loops.
4. Incorrect cursor implementation.

---

# Success Criteria

The solution is successful when:

* 200,000 products exist
* Pagination remains fast
* Category filtering works
* No duplicate products appear
* No products are skipped during concurrent inserts
* Public URL is accessible
* Source code is explainable during interview
