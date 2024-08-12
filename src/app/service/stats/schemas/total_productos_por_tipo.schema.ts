import { z } from 'zod';

export const TotalProductosPorTipoSchema = z.object({
  tipo: z.string(),
  total: z.number()
});

export type ITotalProductosPorTipo = z.infer<typeof TotalProductosPorTipoSchema>;
