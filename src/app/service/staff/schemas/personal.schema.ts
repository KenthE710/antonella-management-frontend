import { z } from 'zod';

export const BasePersonalStateSchema = z.object({
  name: z.string().max(50)
});

export const BaseServicioStateSchema = z.object({
  id: z.number(),
  nombre: z.string().max(100)
});

export const PersonalStateSchema = BasePersonalStateSchema.extend({ id: z.number() });

export const PersonalSchema = z.object({
  id: z.number(),
  nombre: z.string().max(50),
  apellido: z.string().max(50),
  cedula: z.string().max(20).nullable().optional(),
  email: z.string().max(100).nullable().optional(),
  telefono: z.string().max(15).nullable().optional(),
  direccion: z.string().max(255).nullable().optional(),
  fecha_nacimiento: z.string().nullable().optional(),
  estado: z.number().nullable().optional(),
  especialidades: z.number().array().nullable().optional()
});
export const NoIdPersonalSchema = PersonalSchema.omit({ id: true });
export const PersonalFullSchema = PersonalSchema.extend({
  estado: PersonalStateSchema.nullable().optional(),
  especialidades: BaseServicioStateSchema.array()
});

export const PersonalNamesSchema = PersonalSchema.pick({ id: true, nombre: true, apellido: true });

export type IPersonal = z.infer<typeof PersonalSchema>;
export type INoIdPersonal = z.infer<typeof NoIdPersonalSchema>;
export type IPersonalState = z.infer<typeof PersonalStateSchema>;
export type IBasePersonalState = z.infer<typeof BasePersonalStateSchema>;
export type IPersonalFull = z.infer<typeof PersonalFullSchema>;
