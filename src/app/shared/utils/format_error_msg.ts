import { environment } from '@env/environment';
import { ZodError } from 'zod';

export function formatErrorMsg(msg: string, error: Error | string, show_always = false): string {
  if (environment.production && !show_always) return msg;

  if (typeof error === 'string') {
    return `${msg}: ${error}`;
  }

  if (error.message) {
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
