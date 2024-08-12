import { ProductoSelectorSchema } from '@service/inventory/product/schemas';
import { z } from 'zod';

export const BaseServicioRealizadoProductoSchema = z.object({
  servicio_realizado: z.number(),
  cantidad: z.number(),
  producto: z.number(),
  lote: z.number()
});
export const ServicioRealizadoProductoSchema = BaseServicioRealizadoProductoSchema.extend({ id: z.number() });
export const ServicioRealizadoProductoSimpleSchema = ServicioRealizadoProductoSchema.omit({
  servicio_realizado: true,
  producto: true
}).extend({
  producto: ProductoSelectorSchema
});

export type IBaseServicioRealizadoProducto = z.infer<typeof BaseServicioRealizadoProductoSchema>;
export type IServicioRealizadoProducto = z.infer<typeof ServicioRealizadoProductoSchema>;
export type IServicioRealizadoProductoSimple = z.infer<typeof ServicioRealizadoProductoSimpleSchema>;
