import { z } from 'zod';

export const CursorSchema = z.string().or(z.null());
export type ICursor = z.infer<typeof CursorSchema>;

export const CreateCursorResponseSchema = <ItemType extends z.ZodTypeAny>(itemSchema: ItemType) =>
  z.object({
    next: CursorSchema,
    previous: CursorSchema,
    results: z.array(itemSchema)
  });
export interface ICursorResponse<T> {
  next: ICursor;
  previous: ICursor;
  results: T[];
}
