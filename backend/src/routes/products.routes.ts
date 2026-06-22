import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getProductsHandler } from "../controllers/products.controller.js";

export async function productRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Keep the route file thin by delegating execution entirely to the controller handler
  fastify.get("/products", getProductsHandler);
}