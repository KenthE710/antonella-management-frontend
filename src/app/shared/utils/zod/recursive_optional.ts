import type { ZodType, ZodOptional, ZodTypeAny } from 'zod';

type ISchema<T extends string, P extends ZodTypeAny> = Record<T, P>;

type IOptionalSchema<T extends string, P extends ZodTypeAny> = Record<T, ZodOptional<P>>;

export function recursive_optional<T extends string, P extends ZodTypeAny>(schema: ISchema<T, P>) {
  return Object.entries(schema).reduce<IOptionalSchema<T, P>>(
    (acc, [key, value]) => {
      if (!(value as any).isOptional()) {
        return {
          ...acc,
          [key]: (value as any).optional()
        };
      } else {
        return {
          ...acc,
          [key]: value
        };
      }
    },
    {} as IOptionalSchema<T, P>
  );
}
