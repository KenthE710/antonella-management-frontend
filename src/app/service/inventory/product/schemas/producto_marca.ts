import { CreatePaginateResponseSchema } from '@service/schemas';
import { z } from 'zod';

/**
 * ========================================
 * Modelos
 * ========================================
 */

export const ProductoMarcaSchema = z.object({
  id: z.number(),
  nombre: z.string()
});
export type IProductoMarca = z.infer<typeof ProductoMarcaSchema>;
export const NoIdProductoMarcaSchema = ProductoMarcaSchema.omit({ id: true });
export type INoIdProductoMarca = z.infer<typeof NoIdProductoMarcaSchema>;
export const ProductoMarcaSelectorSchema = ProductoMarcaSchema;
export type IProductoMarcaSelector = z.infer<typeof ProductoMarcaSelectorSchema>;

/**
 * ========================================
 * Responses
 * ========================================
 */

export const ProductoMarcaSelectorPaginateResponseSchema = CreatePaginateResponseSchema(ProductoMarcaSelectorSchema);
