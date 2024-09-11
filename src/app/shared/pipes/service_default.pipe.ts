import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, pipe } from 'rxjs';
import type { identity } from 'rxjs';
import { z, ZodType } from 'zod';

import { formatErrorMsg } from '../utils/format_error_msg';
import { parseResponse } from '../utils/parse-response.operator';

const serviceDefaultOptions = z.object({
  schema: z.instanceof(ZodType).optional(),
  i18nErrorMessage: z.string().optional(),
  logger: z
    .object({
      error: z.function().args(z.string()).returns(z.void()).optional()
    })
    .optional()
});

interface IServiceDefaultOptions extends z.infer<typeof serviceDefaultOptions> {}

export function serviceDefault(options: IServiceDefaultOptions): typeof identity {
  const { schema, i18nErrorMessage, logger } = serviceDefaultOptions.parse(options);

  const pipes = [];

  if (schema && logger?.error) {
    pipes.push(parseResponse(schema, logger.error));
  }
  if (i18nErrorMessage && logger?.error) {
    pipes.push(
      catchError(err => {
        if (err instanceof z.ZodError) throw err;

        if (
          !(err instanceof HttpErrorResponse) ||
          (err instanceof HttpErrorResponse && (environment?.errors?.http?.[err.status] ?? true))
        ) {
          logger.error?.(formatErrorMsg(i18nErrorMessage, err.error ?? err));
        }

        throw err;
      })
    );
  }

  // @ts-ignore
  return pipe(...pipes);
}
