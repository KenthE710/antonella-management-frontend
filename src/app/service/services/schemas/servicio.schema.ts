import { ProductoOfServicioSchema, ProductoSelectorSchema } from '@service/inventory/product/schemas';
import { PersonalNamesSchema } from '@service/staff/schemas/personal.schema';
import { z } from 'zod';

export const BaseServicioStateSchema = z.object({
  nombre: z.string().max(100),
  descripcion: z.string().max(225).nullable().optional()
});

export const ServicioStateSchema = BaseServicioStateSchema.extend({ id: z.number() });
export const ServicioStateSimpleSchema = ServicioStateSchema.pick({ id: true, nombre: true });

export const ServicioSchema = z.object({
  id: z.number(),
  nombre: z.string().max(100),
  descripcion: z.string().max(225).nullable().optional(),
  precio: z.string().optional(),
  tiempo_est: z.string().nullable().optional(),
  encargado: z.number().nullable().optional(),
  productos: z.number().array().nullable().optional(),
  estado: z.number().nullable().optional()
});

export const ServicioViewSchema = ServicioSchema.omit({ encargado: true, productos: true, estado: true }).extend({
  encargado: PersonalNamesSchema.nullable().optional(),
  productos: ProductoOfServicioSchema.array().optional(),
  estado: ServicioStateSimpleSchema.nullable().optional(),
  disponibilidad: z.boolean()
});

export const BaseServicioImgSchema = z.object({
  servicio: z.number().nullable(),
  imagen: z.string().nullable(),
  is_cover: z.boolean(),
  is_tmp: z.boolean(),
  name: z.string().nullable().optional()
});

export const NoIdServicioSchema = ServicioSchema.omit({ id: true });
export const ServicioSelectorSchema = ServicioSchema.pick({ id: true, nombre: true });
export const servicioImgSchema = BaseServicioImgSchema.extend({ id: z.number() });

export type IServicio = z.infer<typeof ServicioSchema>;
export type INoIdServicio = z.infer<typeof NoIdServicioSchema>;
export type IServicioSelector = z.infer<typeof ServicioSelectorSchema>;
export type IServicioState = z.infer<typeof ServicioStateSchema>;
export type IBaseServicioImg = z.infer<typeof BaseServicioImgSchema>;
export type IServicioImg = z.infer<typeof servicioImgSchema>;
export type IServicioView = z.infer<typeof ServicioViewSchema>;
