import { z } from 'zod';

/**
 * ========================================
 * Modelos
 * ========================================
 */
export const ClienteSchema = z.object({
  id: z.number(),
  nombre: z.string().max(50),
  apellido: z.string().max(50),
  email: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
  fecha_nacimiento: z.string().nullable().optional(),
  cedula: z.string().nullable().optional(),
  notas: z.string().nullable().optional()
});
export const NoIdClienteSchema = ClienteSchema.omit({ id: true });

export type ICliente = z.infer<typeof ClienteSchema>;
export type INoIdCliente = z.infer<typeof NoIdClienteSchema>;

/**
 * ========================================
 * DTOs
 * ========================================
 */
