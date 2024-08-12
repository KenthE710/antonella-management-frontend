import { z } from 'zod';

export const ProductosPorMarcaSchema = z.object({
  marca: z.string(),
  total: z.number()
});

export type IProductosPorMarca = z.infer<typeof ProductosPorMarcaSchema>;
