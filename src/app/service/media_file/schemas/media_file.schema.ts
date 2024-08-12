import { CreatePaginateResponseSchema } from '@service/schemas';
import { z } from 'zod';

/**
 * ========================================
 * Modelos
 * ========================================
 */

export const MediaFileSchema = z.object({
  id: z.number(),
  file: z.string(),
  is_temp: z.boolean()
});
export type IMediaFile = z.infer<typeof MediaFileSchema>;

/**
 * ========================================
 * Responses
 * ========================================
 */

export const MediaFilePaginateResponseSchema = CreatePaginateResponseSchema(MediaFileSchema);
