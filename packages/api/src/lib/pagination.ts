import { z } from 'zod';

export const DEFAULT_LIST_LIMIT = 15;
export const MAX_LIST_LIMIT = 100;

export const listPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_LIST_LIMIT)
    .optional()
    .default(DEFAULT_LIST_LIMIT),
});

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    perPage: limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
