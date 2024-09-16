import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { z, ZodError } from 'zod';

const OpcionSchema = z.object({
  show_always: z.boolean().optional(),
  use_html: z.boolean().optional(),
  hide_msg_separator: z.boolean().optional()
});

export function formatErrorMsg(msg: string, error: Error | string, opcion: z.infer<typeof OpcionSchema> = {}): string {
  if (!environment.production) console.log('[formatErrorMsg]', { msg, error });

  const { show_always = false, use_html = false, hide_msg_separator = false } = OpcionSchema.parse(opcion);

  if (environment.production && !show_always) return msg;

  const msg_separator = hide_msg_separator ? '' : ':';

  if (typeof error === 'string') {
    return `${msg}${msg_separator} ${error}`;
  }

  if (error instanceof ZodError) {
    return `${msg}${msg_separator} \n`.concat(
      error.issues
        .filter(issue => issue.path?.length && issue.message)
        .map(issue => `- Error en ${issue.path.join('.')}: ${issue.message}`)
        .join('\n')
    );
  }

  if (error instanceof HttpErrorResponse) {
    if (environment?.errors?.http?.[error.status] ?? true) {
      if ('msg' in error.error) {
        return `${msg}${msg_separator} ${error.error.msg}`;
      } else {
        const errors = error.error;
        /*const errors: any = {
          err1: ['err1, a', 'err1, b'],
          err2: ['err2, a', 'err2, b']
        };*/

        const error_keys = Object.keys(errors);

        if (!use_html) {
          const error_str = error_keys.map(key => `${key}: ${Array.from(errors[key]).join(', ')}`).join('\n');
          return `${msg}\n${error_str}`;
        } else {
          let tableHTML = '<table border="0" cellspacing="0" cellpadding="5"><tbody>';

          error_keys.forEach(key => {
            tableHTML += `<tr><td>${key}</td><td>${Array.from(errors[key]).join('<br/>')}</td></tr>`;
          });

          tableHTML += '</tbody></table>';

          return `${msg}<br/>${tableHTML}`;
        }
      }
    }
  }

  if ('message' in error) {
    return `${msg} - ${error.message}`;
  }

  return msg;
}
