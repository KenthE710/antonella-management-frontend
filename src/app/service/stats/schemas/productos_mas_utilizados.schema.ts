import { ProductoSchema } from '@service/inventory/product/schemas';
import { z } from 'zod';

export const ProductosMasUtilizadosSchema = ProductoSchema;

export type IProductosMasUtilizados = z.infer<typeof ProductosMasUtilizadosSchema>;
