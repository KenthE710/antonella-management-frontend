import { z } from 'zod';

import { MessageResponseSchema } from './message_response';

export const ValidationErrorResponseSchema = <ItemType extends z.ZodTypeAny>(itemSchema: ItemType) =>
  MessageResponseSchema.extend({
    validations: itemSchema.optional()
  });
export type IValidationErrorResponse = z.infer<ReturnType<typeof ValidationErrorResponseSchema>>;
