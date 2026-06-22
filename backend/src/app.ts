import fastify from "fastify";
import dotenv from "dotenv";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";

dotenv.config();

import healthRoutes from "./routes/health.routes.js";

const app = fastify({
  logger: {
    transport: {
      target: "pino-pretty", // Makes local development terminal logs human-readable
    },
  },
});

app.register(helmet);
app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

app.get("/", async (request, reply) => {
  return { hello: "world" };
});

app.register(healthRoutes, { prefix: "/api" });

export default app;
