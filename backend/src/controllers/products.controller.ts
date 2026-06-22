import  type { FastifyRequest, FastifyReply } from "fastify";
import pool from "../db/pool.js";
import { productQuerySchema, decodeCursor, encodeCursor } from "../schemas/validation.js";

export async function getProductsHandler(request: FastifyRequest, reply: FastifyReply) {
  // 1. Validate query strings via our Zod schema configurations
  const parsedQuery = productQuerySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    return reply.status(400).send({ 
      success: false, 
      error: parsedQuery.error.format() 
    });
  }

  const { category, limit, cursor } = parsedQuery.data;

  let queryConditions: string[] = [];
  let queryParams: any[] = [];
  let paramIndex = 1;

  // 2. Dynamic optional matching constraint for category filters
  if (category) {
    queryConditions.push(`category = $${paramIndex++}`);
    queryParams.push(category);
  }

  // 3. Multi-column snapshot tracking evaluations (The Cursor Core)
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (!decoded) {
      return reply.status(400).send({ 
        success: false, 
        error: "Malformed base64 tracking cursor token." 
      });
    }
    
    // Keyset pagination matching order pattern: created_at DESC, id DESC
    queryConditions.push(`(created_at < $${paramIndex} OR (created_at = $${paramIndex} AND id < $${paramIndex + 1}))`);
    queryParams.push(decoded.createdAt, decoded.id);
    paramIndex += 2;
  }

  // Assemble dynamic raw WHERE logic blocks
  const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(" AND ")}` : "";
  
  // Lookahead fetch parameter trick (+1 row checks) to see if a next page exists natively
  const limitPlaceholder = `$${paramIndex}`;
  queryParams.push(limit + 1);

  const sqlQuery = `
    SELECT id, name, category, price, created_at, updated_at 
    FROM products
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT ${limitPlaceholder};
  `;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sqlQuery, queryParams);
    
    // Lookahead slicing: determine if there's a next page context to hand out
    const hasNextPage = rows.length > limit;
    const data = hasNextPage ? rows.slice(0, limit) : rows;

    // Generate the next cursor pointer token using the tracking data of the final entry
    let nextCursor: string | null = null;
    if (hasNextPage && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = encodeCursor(new Date(lastItem.created_at), lastItem.id);
    }

    return reply.send({
      success: true,
      data,
      meta: {
        nextCursor,
        hasNextPage,
        limit,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ 
      success: false, 
      error: "Internal database query execution failure." 
    });
  } finally {
    client.release();
  }
}