import { HttpResponseBase } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, pipe, tap, throwError } from 'rxjs';
import type { MonoTypeOperatorFunction } from 'rxjs';
import { ZodError, ZodType } from 'zod';

export function parseResponse<T>(schema: ZodType, log = (_: any) => console.log(_)): MonoTypeOperatorFunction<T> {
  return pipe(
    tap<T>({
      next: (value: any) => {
        if ((typeof value == 'object' && value.hasOwnProperty('type')) || value instanceof HttpResponseBase) return;

        if (!environment.production) {
          // Throw in development so we're aware of the error
          schema.parse(value);
        } else {
          const parsed = schema.safeParse(value);
          if (!parsed.success) {
            // Log to service to be informed
            console.log(parsed.error);
          }
        }
      }
    }),
    catchError((error: ZodError<T>) => {
      if (!environment.production && error instanceof ZodError) {
        error?.issues?.forEach(issue => {
          if (issue.path?.length && issue.message) {
            log(`Error en ${issue.path.join('.')}: ${issue.message}`);
          }
        });
      }
      return throwError(() => error);
    })
  );
}
