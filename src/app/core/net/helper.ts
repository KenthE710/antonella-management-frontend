import { HttpHeaders, HttpResponseBase } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export interface ReThrowHttpError {
  body: any;
  _throw: boolean;
}

export const CODEMESSAGE: { [key: number]: string } = {
  200: 'El servidor ha devuelto correctamente los datos solicitados.',
  201: 'Los datos nuevos o modificados se han procesado correctamente.',
  202: 'Se ha puesto en cola una solicitud en segundo plano (tarea asíncrona).',
  204: 'Se han borrados los datos correctamente.',
  400: 'Se ha producido un error en la solicitud enviada y el servidor no ha realizado una operación de datos nuevos o modificados.',
  401: 'El usuario no tiene privilegios (token, nombre de usuario, contraseña erróneos).',
  403: 'El usuario está autorizado, pero el acceso está prohibido.',
  404: 'La solicitud enviada era para un registro inexistente, y el servidor no realizó ninguna acción.',
  406: 'El formato de la solicitud no está disponible.',
  410: 'El recurso solicitado se elimina permanentemente y no volverá a estar disponible.',
  422: 'Se produce un error de validación al crear un objeto.',
  500: 'Se ha producido un error en el servidor, por favor compruebe el servidor.',
  502: 'Error de puerta de enlace.',
  503: 'El servicio no está disponible, el servidor está temporalmente sobrecargado o en mantenimiento.',
  504: 'Tiempo de espera de la puerta de enlace.'
};

export function goTo(injector: Injector, url: string): void {
  setTimeout(() => injector.get(Router).navigateByUrl(url));
}

let toLoginHasShown = false;
export function toLogin(injector: Injector): void {
  if (!toLoginHasShown) {
    injector.get(NzNotificationService).error(`No ha iniciado sesión o su nombre de usuario ha caducado, vuelva a iniciar sesión.`, ``);
    toLoginHasShown = true;
  }
  goTo(injector, injector.get(DA_SERVICE_TOKEN).login_url!);
}

export function getAdditionalHeaders(headers?: HttpHeaders): { [name: string]: string } {
  const res: Record<string, string> = {};
  const lang = inject(ALAIN_I18N_TOKEN).currentLang;
  const token = inject(DA_SERVICE_TOKEN).get()?.token;
  if (!headers?.has('Accept-Language') && lang) {
    res['Accept-Language'] = lang;
  }
  /* if (!headers?.has('Authorization') && token) {
    res['Authorization'] = `Bearer ${token}`;
  } */

  return res;
}

export function checkStatus(injector: Injector, ev: HttpResponseBase): void {
  if ((ev.status >= 200 && ev.status < 300) || ev.status === 400 || ev.status === 401) {
    return;
  }

  const errortext = CODEMESSAGE[ev.status] || ev.statusText;
  injector.get(NzNotificationService).error(`Error de solicitud ${ev.status}: ${ev.url}`, errortext);
}
