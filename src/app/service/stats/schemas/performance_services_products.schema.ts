import { z } from 'zod';

export const PerformanceServicesProductsSchema = z.object({
  servicio: z.string(),
  num_realizados: z.number(),
  variacion_uso: z.number()
});

export type IPerformanceServicesProducts = z.infer<typeof PerformanceServicesProductsSchema>;
