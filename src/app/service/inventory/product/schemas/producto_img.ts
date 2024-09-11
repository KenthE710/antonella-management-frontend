import { recursive_optional } from '@shared';
import { z } from 'zod';

/**
 * ========================================
 * Modelos
 * ========================================
 */

const _ProductoImgSchema = {
  id: z.number(),
  producto: z.number().nullable().optional(),
  imagen: z.string().nullable().optional(),
  url_imagen_externa: z.string().nullable().optional(),
  is_cover: z.boolean(),
  is_temp: z.boolean()
};

export const ProductoImgSchema = z.object(_ProductoImgSchema);
export type IProductoImg = z.infer<typeof ProductoImgSchema>;
export const SingleProductoImgSchema = z.object({
  id: z.number(),
  is_cover: z.boolean(),
  url: z.string(),
  name: z.string().nullable()
});
export type ISingleProductoImg = z.infer<typeof SingleProductoImgSchema>;

/**
 * ========================================
 * DTOs
 * ========================================
 */

export const PartialProductoImgSchema = z.object({
  id: z.number(),
  producto: z.number().optional(),
  imagen: z.string().or(z.null()).optional(),
  url_imagen_externa: z.string().optional(),
  is_cover: z.boolean().optional(),
  is_temp: z.boolean().optional()
});
export type IPartialProductoImg = z.infer<typeof PartialProductoImgSchema>;

export const AssociateProductoImgSchema = z.object({
  producto_id: z.number(),
  imgs_id: z.array(z.number())
});

export type IAssociateProductoImg = z.infer<typeof AssociateProductoImgSchema>;

export const ProductoImgUploadDtoSchema = z.object({
  producto: z.number().optional(),
  imagen: z.any(),
  is_cover: z.boolean().optional(),
  is_temp: z.boolean().optional()
});
export type IProductoImgUploadDto = z.infer<typeof ProductoImgUploadDtoSchema>;

/**
 * ========================================
 * Responses
 * ========================================
 */

export const SingleProductoImgResponseSchema = z.array(SingleProductoImgSchema);
export type ISingleProductoImgResponse = z.infer<typeof SingleProductoImgResponseSchema>;
