import { z } from 'zod';

export const MostPerformedServicesSchema = z.object({
  servicio__nombre: z.string(),
  total_servicios: z.number()
});

export type IMostPerformedServices = z.infer<typeof MostPerformedServicesSchema>;
