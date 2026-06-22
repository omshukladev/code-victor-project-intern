import fastify from "fastify";
import dotenv from "dotenv";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

dotenv.config();

import healthRoutes from "./routes/health.routes.js";
import { productRoutes } from "./routes/products.routes.js";

const app = fastify({
  logger: {
    transport: {
      target: "pino-pretty", // Makes local development terminal logs human-readable
    },
  },
});
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

app.register(helmet);
app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

app.get("/", async (request, reply) => {
  return { hello: "world" };
});

app.register(healthRoutes, { prefix: "/api" });
app.register(productRoutes, { prefix: "/api" });

export default app;
