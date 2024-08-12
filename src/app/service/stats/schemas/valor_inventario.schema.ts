import { z } from 'zod';

export const ValorInventarioSchema = z.object({
  valor_total: z.number()
});

export type IValorInventario = z.infer<typeof ValorInventarioSchema>;
