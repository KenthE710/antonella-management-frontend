import { z } from 'zod';

export const BaseParametro = z.object({
  codigo: z.string().max(25),
  valor: z.string().max(100).nullable().optional(),
  descripcion: z.string().max(225).nullable().optional()
});
export const ParametroSchema = BaseParametro.extend({
  id: z.number().positive()
});
export const ParametroSimpleSchema = ParametroSchema.omit({ descripcion: true });

export type IBaseParametro = z.infer<typeof BaseParametro>;
export type IParametro = z.infer<typeof ParametroSchema>;
export type IParametroSimple = z.infer<typeof ParametroSimpleSchema>;
