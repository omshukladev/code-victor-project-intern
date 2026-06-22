import { z } from "zod";

// Validates parameters on GET /api/products
export const productQuerySchema = z.object({
  category: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

// Utilities to cleanly parse pagination bookmark state
export interface CursorState {
  createdAt: string; // ISO string representation
  id: number;
}

export function decodeCursor(cursorBase64: string): CursorState | null {
  try {
    const jsonStr = Buffer.from(cursorBase64, "base64").toString("utf-8");
    const parsed = JSON.parse(jsonStr);
    if (parsed.createdAt && parsed.id) {
      return { createdAt: parsed.createdAt, id: Number(parsed.id) };
    }
    return null;
  } catch {
    return null;
  }
}

export function encodeCursor(createdAt: Date, id: number): string {
  const state: CursorState = { createdAt: createdAt.toISOString(), id };
  return Buffer.from(JSON.stringify(state)).toString("base64");
}