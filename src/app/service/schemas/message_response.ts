import { z } from 'zod';

export const MessageResponseSchema = z.object({
  msg: z.string()
});
export type IMessageResponse = z.infer<typeof MessageResponseSchema>;
