import { CreatePaginateResponseSchema } from '@service/schemas';
import { JustIdRequired } from 'src/typings';
import { z } from 'zod';

/**
 * ========================================
 * Modelos
 * ========================================
 */
const noIdProductoTipoSchema = {
  nombre: z.string(),
  descripcion: z.string().nullable().optional()
};
export const ProductoTipoSchema = z.object({ id: z.number(), ...noIdProductoTipoSchema });
export type IProductoTipo = z.infer<typeof ProductoTipoSchema>;
export const ProductoTipoSelectorSchema = z.object({
  id: z.number(),
  nombre: z.string()
});
export const ProductoTipoCreateSchema = z.object(noIdProductoTipoSchema);
export const ProductoTipoUpdateSchema = ProductoTipoSchema.partial().required({ id: true });
export type IProductoTipoCreate = z.infer<typeof ProductoTipoCreateSchema>;
export type IProductoTipoUpdate = z.infer<typeof ProductoTipoUpdateSchema>;
export type IProductoTipoSelector = z.infer<typeof ProductoTipoSelectorSchema>;

/**
 * ========================================
 * Responses
 * ========================================
 */

export const ProductoTipoSelectorPaginateResponseSchema = CreatePaginateResponseSchema(ProductoTipoSelectorSchema);
