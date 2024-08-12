import { z } from 'zod';

export const PersonalSchema = z.object({
  id: z.number(),
  nombre: z.string().max(50),
  apellido: z.string().max(50),
  cedula: z.string().max(10)
});
export const NoIdPersonalSchema = PersonalSchema.omit({ id: true });

export type IPersonal = z.infer<typeof PersonalSchema>;
export type INoIdPersonal = z.infer<typeof NoIdPersonalSchema>;
