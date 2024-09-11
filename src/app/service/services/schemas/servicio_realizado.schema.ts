import { ClienteSchema } from '@service/customers/cliente/schemas/cliente.schema';
import { z } from 'zod';

import { ServicioSelectorSchema } from './servicio.schema';
import { ServicioRealizadoProductoSimpleSchema } from './servicio_realizado_producto.schema';

export const BaseServicioRealizadoSchema = z.object({
  cliente: z.number(),
  servicio: z.number(),
  fecha: z.string().nullable().optional(),
  pagado: z.string().optional(),
  finalizado: z.boolean().nullable().optional()
});
export const ServicioRealizadoSchema = BaseServicioRealizadoSchema.extend({ id: z.number() });
export const ServicioRealizadoAllSchema = ServicioRealizadoSchema.omit({ cliente: true, servicio: true }).extend({
  cliente: ClienteSchema,
  servicio: ServicioSelectorSchema,
  productos_utilizados: ServicioRealizadoProductoSimpleSchema.array()
});

export type IBaseServicioRealizado = z.infer<typeof BaseServicioRealizadoSchema>;
export type IServicioRealizado = z.infer<typeof ServicioRealizadoSchema>;
export type IServicioRealizadoAll = z.infer<typeof ServicioRealizadoAllSchema>;
