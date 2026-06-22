import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { healthCheck } from "../controllers/health.controller.js";

// export default async function (app: FastifyInstance, options: FastifyPluginOptions) {
//   app.get("/health", healthCheck);
// }

const healthRoutes = async (
  app: FastifyInstance,
  options: FastifyPluginOptions,
) => {
  app.get("/health", healthCheck);
};

export default healthRoutes;
