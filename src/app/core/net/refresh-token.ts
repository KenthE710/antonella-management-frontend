import { HttpClient, HttpContext, HttpHandlerFn, HttpRequest, HttpResponseBase } from '@angular/common/http';
import { APP_INITIALIZER, Injector, Provider } from '@angular/core';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN } from '@delon/auth';
import { BACKEND_API } from '@shared/constant';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { toLogin } from './helper';

let refreshToking = false;
let refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

/**
 * Vuelva a colocar la información del nuevo Token
 *
 * > Dado que una solicitud ya iniciada no volverá a pasar por el proceso `@delon/auth`, es necesario
 * volver a adjuntarla con un nuevo token que tenga en cuenta el caso de negocio.
 */
function reAttachToken(injector: Injector, req: HttpRequest<any>): HttpRequest<any> {
  const token = injector.get(DA_SERVICE_TOKEN).get()?.token;
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function refreshTokenRequest(injector: Injector): Observable<any> {
  const model = injector.get(DA_SERVICE_TOKEN).get();
  return injector.get(HttpClient).post(
    BACKEND_API.users.token.refresh.url(),
    { refresh: model?.['refresh_token'] || '' },
    {
      context: new HttpContext().set(ALLOW_ANONYMOUS, true)
    }
  );
}

/**
 * Actualizar token Método 1: Actualizar token con 401
 */
export function tryRefreshToken(injector: Injector, ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> {
  // 1. Si la petición es una petición de refresco de Token, significa que puede saltar a la página
  // de inicio de sesión directamente refrescando el Token.
  if ([BACKEND_API.users.token.refresh.url()].some(url => req.url.includes(url))) {
    toLogin(injector);
    return throwError(() => ev);
  }
  // 2. Si `refreshToking` es `true`, significa que la petición ya está en el Refresh Token, y
  // todas las peticiones posteriores se pondrán en espera hasta que se devuelva el resultado,
  // entonces se reiniciará la petición.
  if (refreshToking) {
    return refreshToken$.pipe(
      filter(v => !!v),
      take(1),
      switchMap(() => next(reAttachToken(injector, req)))
    );
  }
  // 3. Intenta llamar a Refresh Token.
  refreshToking = true;
  refreshToken$.next(null);

  return refreshTokenRequest(injector).pipe(
    switchMap(res => {
      // Notificar las solicitudes posteriores para continuar
      refreshToking = false;
      refreshToken$.next(res.user);
      // volver a guardar el nuevo token
      injector.get(DA_SERVICE_TOKEN).set({
        ...res.user,
        token: res.user.access_token
      });
      // Reiniciar la solicitud
      return next(reAttachToken(injector, req));
    }),
    catchError(err => {
      refreshToking = false;
      toLogin(injector);
      return throwError(() => err);
    })
  );
}

function buildAuthRefresh(injector: Injector) {
  const tokenSrv = injector.get(DA_SERVICE_TOKEN);
  tokenSrv.refresh
    .pipe(
      filter(() => !refreshToking),
      switchMap(res => {
        console.log(res);
        refreshToking = true;
        return refreshTokenRequest(injector);
      })
    )
    .subscribe({
      next: res => {
        // TODO: Mock expired value
        res.expired = +new Date() + 1000 * 60 * 60;
        refreshToking = false;
        tokenSrv.set(res);
      },
      error: () => toLogin(injector)
    });
}

/**
 * Método Refresh Token 2: Utiliza la interfaz `refresh` de `@delon/auth`, que requiere registrar `provideBindAuthRefresh` en `app.config.ts`.
 */
export function provideBindAuthRefresh(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (injector: Injector) => () => buildAuthRefresh(injector),
      deps: [Injector],
      multi: true
    }
  ];
}
