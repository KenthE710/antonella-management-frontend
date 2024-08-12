import { CreatePaginateResponseSchema } from '@service/schemas/index';
import { z } from 'zod';

export const ProductoGridSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  tipo: z.object({
    id: z.number(),
    nombre: z.string()
  }),
  sku: z.string(),
  cover: z.string()
});
export interface IProductoGrid extends z.infer<typeof ProductoGridSchema> {}

export const ProductoGridPaginateResponseSchema = CreatePaginateResponseSchema(ProductoGridSchema);
