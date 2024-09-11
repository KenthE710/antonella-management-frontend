import { z } from 'zod';

export const ValorInventarioSchema = z.object({
  total: z.number(),
  semanal: z.object({
    actual: z.number(),
    anterior: z.number()
  }),
  mensual: z.object({
    actual: z.number(),
    anterior: z.number()
  }),
  anual: z.object({
    actual: z.number(),
    anterior: z.number()
  })
});

export type IValorInventario = z.infer<typeof ValorInventarioSchema>;
