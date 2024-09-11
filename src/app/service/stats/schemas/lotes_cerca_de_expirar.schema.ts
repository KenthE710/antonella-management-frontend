import { z } from 'zod';

export const UmbralPeriods = z.enum(['day', 'week', 'month', 'year']);
export type IUmbralPeriod = z.infer<typeof UmbralPeriods>;
