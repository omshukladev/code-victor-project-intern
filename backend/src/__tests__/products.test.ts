import { test, expect, describe, afterAll } from "vitest";
import app from "../app.js";
import pool from "../db/pool.js";

describe("GET /api/products", () => {
  // Clean up any test products created during testing
  afterAll(async () => {
    await pool.query("DELETE FROM products WHERE name LIKE 'Test Product %'");
  });

  describe("Validation", () => {
    test("should return 400 if limit is less than 1", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/products?limit=0",
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().success).toBe(false);
    });

    test("should return 400 if limit is greater than 100", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/products?limit=101",
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().success).toBe(false);
    });

    test("should return 400 if cursor is malformed", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/products?cursor=not-base64-json-token",
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().success).toBe(false);
      expect(res.json().error).toContain("Malformed base64 tracking cursor token.");
    });
  });

  describe("Pagination and Filtering", () => {
    test("should return products list with default limit and meta", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/products",
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toBeDefined();
      expect(body.meta.limit).toBe(10);
    });

    test("should filter products by category correctly", async () => {
      const category = "Electronics";
      const res = await app.inject({
        method: "GET",
        url: `/api/products?category=${category}&limit=5`,
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBeLessThanOrEqual(5);
      body.data.forEach((p: any) => {
        expect(p.category).toBe(category);
      });
    });

    test("should paginate sequentially using nextCursor", async () => {
      // Fetch Page 1
      const res1 = await app.inject({
        method: "GET",
        url: "/api/products?limit=5",
      });
      expect(res1.statusCode).toBe(200);
      const body1 = res1.json();
      expect(body1.data.length).toBe(5);

      if (body1.meta.hasNextPage && body1.meta.nextCursor) {
        // Fetch Page 2 using nextCursor
        const res2 = await app.inject({
          method: "GET",
          url: `/api/products?limit=5&cursor=${body1.meta.nextCursor}`,
        });
        expect(res2.statusCode).toBe(200);
        const body2 = res2.json();
        expect(body2.data.length).toBe(5);

        // Verify there is no overlap in items between page 1 and page 2
        const page1Ids = new Set(body1.data.map((p: any) => p.id));
        body2.data.forEach((p: any) => {
          expect(page1Ids.has(p.id)).toBe(false);
        });
      }
    });
  });

  describe("Pagination Consistency under Concurrent Inserts", () => {
    test("should not skip or duplicate records when new records are added concurrently", async () => {
      // 1. Fetch Page 1 of products
      const limit = 5;
      const res1 = await app.inject({
        method: "GET",
        url: `/api/products?limit=${limit}`,
      });
      expect(res1.statusCode).toBe(200);
      const body1 = res1.json();
      expect(body1.data.length).toBe(limit);
      const nextCursor = body1.meta.nextCursor;
      expect(nextCursor).not.toBeNull();

      // 2. Simulate concurrent insertion of 5 new products at the top (with recent timestamps)
      // These products have NOW() timestamp so they are "newer" than the page 1 cursor boundary
      const tempCategory = "Electronics";
      await pool.query(`
        INSERT INTO products (name, category, price, created_at, updated_at)
        VALUES 
          ('Test Product A', '${tempCategory}', 99.99, NOW(), NOW()),
          ('Test Product B', '${tempCategory}', 19.99, NOW(), NOW()),
          ('Test Product C', '${tempCategory}', 49.99, NOW(), NOW()),
          ('Test Product D', '${tempCategory}', 129.99, NOW(), NOW()),
          ('Test Product E', '${tempCategory}', 5.99, NOW(), NOW())
      `);

      // 3. Fetch Page 2 using the original nextCursor from step 1
      const res2 = await app.inject({
        method: "GET",
        url: `/api/products?limit=${limit}&cursor=${nextCursor}`,
      });
      expect(res2.statusCode).toBe(200);
      const body2 = res2.json();

      // 4. Assertions:
      // - Page 2 must not contain any of the 5 newly inserted test products (because they are newer than Page 1's boundary)
      const page2Ids = body2.data.map((p: any) => p.id);
      const page1Ids = body1.data.map((p: any) => p.id);

      body2.data.forEach((p: any) => {
        expect(p.name).not.toContain("Test Product");
      });

      // - Page 2 must not duplicate any products from Page 1
      body2.data.forEach((p: any) => {
        expect(page1Ids).not.toContain(p.id);
      });

      // 5. Verify database records integrity:
      // Fetch products directly from db that are older than Page 1's cursor element to see if Page 2 matched them perfectly
      const lastItemOfPage1 = body1.data[body1.data.length - 1];
      const dbRes = await pool.query(
        `SELECT id FROM products 
         WHERE (created_at < $1 OR (created_at = $1 AND id < $2)) 
         ORDER BY created_at DESC, id DESC 
         LIMIT $3`,
        [lastItemOfPage1.created_at, lastItemOfPage1.id, limit]
      );
      const dbIds = dbRes.rows.map((r) => r.id);

      expect(page2Ids).toEqual(dbIds);
    });
  });
});
