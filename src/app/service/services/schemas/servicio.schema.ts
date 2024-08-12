import { z } from 'zod';

export const ServicioSchema = z.object({
  id: z.number(),
  nombre: z.string().max(100),
  descripcion: z.string().max(225).nullable().optional(),
  precio: z.string(),
  tiempo_est: z.string().nullable().optional(),
  encargado: z.number().nullable().optional(),
  productos: z.number().array()
});
export const NoIdServicioSchema = ServicioSchema.omit({ id: true });
export const ServicioSelectorSchema = ServicioSchema.pick({ id: true, nombre: true });

export type IServicio = z.infer<typeof ServicioSchema>;
export type INoIdServicio = z.infer<typeof NoIdServicioSchema>;
export type IServicioSelector = z.infer<typeof ServicioSelectorSchema>;
