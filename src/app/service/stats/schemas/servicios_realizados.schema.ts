import { z } from 'zod';

export const Periods = z.enum(['week', 'month', 'year']);
export type IPeriod = z.infer<typeof Periods>;

export const ServiciosRealizadosSchema = z.object({
  total_servicios: z.number(),
  period: z.string()
});

export type IServiciosRealizados = z.infer<typeof ServiciosRealizadosSchema>;
