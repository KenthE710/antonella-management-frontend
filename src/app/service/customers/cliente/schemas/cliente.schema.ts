import { z } from 'zod';

/**
 * ========================================
 * Modelos
 * ========================================
 */
export const ClienteSchema = z.object({
  id: z.number(),
  nombre: z.string().max(50),
  apellido: z.string().max(50)
});
export const NoIdClienteSchema = ClienteSchema.omit({ id: true });

export type ICliente = z.infer<typeof ClienteSchema>;
export type INoIdCliente = z.infer<typeof NoIdClienteSchema>;

/**
 * ========================================
 * DTOs
 * ========================================
 */
