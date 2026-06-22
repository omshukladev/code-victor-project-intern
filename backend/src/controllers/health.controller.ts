import type { FastifyReply, FastifyRequest } from "fastify";

export const healthCheck = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  return reply
    .status(200)
    .send({
      status: "ok",
      message: "Health check passed",
      timestamp: new Date().toISOString(),
    });
};
