import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { CUSTOM_ERROR, IGNORE_BASE_URL, RAW_BODY, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, of, throwError, mergeMap, catchError } from 'rxjs';

import { ReThrowHttpError, checkStatus, getAdditionalHeaders, toLogin } from './helper';
import { tryRefreshToken } from './refresh-token';

function handleData(injector: Injector, ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> {
  // checkStatus(injector, ev);
  // Procesamiento empresarial: algunas operaciones genéricas
  switch (ev.status) {
    case 200:
      // Manejo de errores a nivel de negocio, a continuación se asume que restful tiene un formato de
      // salida unificado (independientemente de si es exitoso o no, tiene un formato de datos correspondiente)
      // para el manejo
      // Por ejemplo, el contenido de la respuesta:
      // Contenido del error: { status: 1, msg: 'Parámetro inválido' }
      // Contenido correcto: { status: 0, response: { } }
      // Entonces, el siguiente fragmento de código se puede aplicar directamente
      // if (ev instanceof HttpResponse) {
      //   const body = ev.body;
      //   if (body && body.status !== 0) {
      //     const customError = req.context.get(CUSTOM_ERROR);
      //     if (customError) injector.get(NzMessageService).error(body.msg);
      //     return customError ? throwError(() => ({ body, _throw: false }) as ReThrowHttpError) : of({});
      //   } else {
      //     // Devolver el cuerpo de la respuesta original
      //     if (req.context.get(RAW_BODY) || ev.body instanceof Blob) {
      //       return of(ev);
      //     }
      //     // Modificar el contenido de body a response, en la mayoría de los casos no es necesario preocuparse por el código de estado del negocio
      //     // return of(new HttpResponse({ ...ev, body: body.response } as any));
      //     // O mantener el formato completo
      //     return of(ev);
      //   }
      // }
      break;
    case 401:
      if (environment.api.refreshTokenEnabled && environment.api.refreshTokenType === 're-request') {
        return tryRefreshToken(injector, ev, req, next);
      }
      toLogin(injector);
      break;
    case 403:
    case 404:
    case 500:
      // goTo(injector, `/exception/${ev.status}?url=${req.urlWithParams}`);
      break;
    default:
      if (ev instanceof HttpErrorResponse) {
        console.warn(
          'Error desconocido, causado principalmente porque el backend no admite CORS entre dominios o porque la configuración no es válida, consulte https://ng-alain.com/docs/server Resolución de problemas entre dominios',
          ev
        );
      }
      break;
  }
  if (ev instanceof HttpErrorResponse) {
    return throwError(() => ev);
  } else if ((ev as unknown as ReThrowHttpError)._throw === true) {
    return throwError(() => (ev as unknown as ReThrowHttpError).body);
  } else {
    return of(ev);
  }
}

export const defaultInterceptor: HttpInterceptorFn = (req, next) => {
  // Añadir uniformemente el prefijo del lado del servidor
  let url = req.url;
  if (!req.context.get(IGNORE_BASE_URL) && !url.startsWith('https://') && !url.startsWith('http://')) {
    const { baseUrl } = environment.api;
    url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
  }
  const newReq = req.clone({ url, setHeaders: getAdditionalHeaders(req.headers) });
  const injector = inject(Injector);

  return next(newReq).pipe(
    mergeMap(ev => {
      // Permitir un tratamiento uniforme de los errores en las solicitudes
      if (ev instanceof HttpResponseBase) {
        return handleData(injector, ev, newReq, next);
      }
      // Si todo va bien, las operaciones posteriores
      return of(ev);
    }),
    catchError((err: HttpErrorResponse) => handleData(injector, err, newReq, next))
  );
};
