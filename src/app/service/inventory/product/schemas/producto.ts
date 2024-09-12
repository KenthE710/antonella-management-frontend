import { CreatePaginateResponseSchema } from '@service/schemas';
import { z } from 'zod';

import { ProductoMarcaSchema } from './producto_marca';
import { ProductoTipoSchema } from './producto_tipo';

/**
 * ========================================
 * Modelos
 * ========================================
 */

const _ProductoSchema = {
  id: z.number(),
  tipo: z.number().nullable(),
  marca: z.number().nullable(),
  nombre: z.string(),
  sku: z.string().nullable(),
  precio: z.string().transform(_ => parseInt(_)),
  usos_est: z.number()
};
export const ProductoSchema = z.object(_ProductoSchema);
export const ProductoAllSchema = z.object({
  ..._ProductoSchema,
  tipo: ProductoTipoSchema,
  marca: ProductoMarcaSchema,
  existencias: z.number(),
  usos_restantes: z.number()
});
export const ProductoWithExistenciasSchema = ProductoSchema.extend({ existencias: z.number() });

export const ProductoSelectorSchema = ProductoSchema.pick({ id: true, nombre: true, sku: true });
export const ProductoOfServicioSchema = ProductoSelectorSchema.extend({ existencias: z.number() });
export interface IProducto extends z.infer<typeof ProductoSchema> {}
export type IProductoAll = z.infer<typeof ProductoAllSchema>;
export type IProductoSelector = z.infer<typeof ProductoSelectorSchema>;
export type IProductoOfServicio = z.infer<typeof ProductoOfServicioSchema>;
export type IProductoWithExistencias = z.infer<typeof ProductoWithExistenciasSchema>;

/**
 * ========================================
 * DTOs
 * ========================================
 */

export const CreateProductoDtoSchema = z.object({
  tipo: z.number(),
  marca: z.number(),
  nombre: z.string(),
  sku: z.string(),
  precio: z.number().transform(_ => _.toString()),
  usos_est: z.number()
});
export type ICreateProductoDto = z.infer<typeof CreateProductoDtoSchema>;

const _UpdateProductoDtoSchema = {
  tipo: z.number().optional(),
  marca: z.number().optional(),
  nombre: z.string().optional(),
  sku: z.string().optional(),
  precio: z
    .number()
    .transform(_ => _.toString())
    .optional(),
  usos_est: z.number().optional()
};
export const UpdateProductoDtoSchema = z.object(_UpdateProductoDtoSchema);

export interface IUpdateProductoDto extends z.infer<typeof UpdateProductoDtoSchema> {}

/**
 * ========================================
 * Responses
 * ========================================
 */

export const ProductoPaginateResponseSchema = CreatePaginateResponseSchema(ProductoSchema);
