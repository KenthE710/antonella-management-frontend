import { z } from 'zod';

export const CreatePaginateResponseSchema = <ItemType extends z.ZodTypeAny>(itemSchema: ItemType) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema)
  });
export interface IPaginateResponse<T> extends z.infer<ReturnType<typeof CreatePaginateResponseSchema>> {
  results: T[];
}
