import { environment } from '@env/environment';
import { ZodError } from 'zod';

export function formatErrorMsg(msg: string, error: Error): string {
  if (error.message && !environment.production) {
    if (error instanceof ZodError) {
      return `${msg}: \n`.concat(
        error.issues
          .filter(issue => issue.path?.length && issue.message)
          .map(issue => `- Error en ${issue.path.join('.')}: ${issue.message}`)
          .join('\n')
      );
    }

    return `${msg} - ${error.message}`;
  }

  return msg;
}
