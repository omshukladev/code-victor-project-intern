import { test, expect } from "vitest";
import app from "../app.js";

test("GET /health returns status ok", async () => {
  // this is a unit test
  const response = await app.inject({
    method: "GET",
    url: "/api/health",
  });
  // this is an integration test
  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({
    status: "ok",
    message: "Health check passed",
  });
});
