import { ProductoSelectorSchema } from '@service/inventory/product/schemas';
import { z } from 'zod';

export const LoteSchema = z.object({
  id: z.number(),
  producto: z.number(),
  fe_compra: z.string(),
  fe_exp: z.string(),
  cant: z.number(),
  costo: z.string(),
  retirado: z.boolean().optional()
});
export const NoIdLoteSchema = LoteSchema.omit({ id: true });
export const LoteViewSchema = LoteSchema.omit({ producto: true }).extend({
  producto: ProductoSelectorSchema,
  servicios_Realizados: z.number(),
  servicios_restantes: z.number()
});
export const LoteAllSchema = z.object({
  id: z.number(),
  producto: ProductoSelectorSchema,
  fe_compra: z.string(),
  fe_exp: z.string(),
  cant: z.number(),
  costo: z.string(),
  consumido: z.boolean(),
  retirado: z.boolean(),
  state: z.number()
});

export type ILote = z.infer<typeof LoteSchema>;
export type INoIdLote = z.infer<typeof NoIdLoteSchema>;
export type ILoteView = z.infer<typeof LoteViewSchema>;
export type ILoteAll = z.infer<typeof LoteAllSchema>;
