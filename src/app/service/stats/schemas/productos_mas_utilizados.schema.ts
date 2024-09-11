import { ProductoSchema } from '@service/inventory/product/schemas';
import { z } from 'zod';

export const ProductosMasUtilizadosSchema = ProductoSchema.pick({ id: true, nombre: true, sku: true }).extend({ usos: z.number() });

export type IProductosMasUtilizados = z.infer<typeof ProductosMasUtilizadosSchema>;
