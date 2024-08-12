import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import {
  BaseServicioRealizadoSchema,
  IBaseServicioRealizado,
  IServicioRealizadoAll,
  IServicioRealizado,
  ServicioRealizadoSchema,
  ServicioRealizadoAllSchema
} from './schemas/servicio_realizado.schema';

@Injectable({
  providedIn: 'root'
})
export class ServicioRealizadoService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  logger = { error: (_: any) => this.msg.error(_) };

  /**
   * ========================================
   * CRUD
   * ========================================
   */
  get(id: number): Observable<IServicioRealizado> {
    return this.http.get<IServicioRealizado>(BACKEND_API.services.servicio_realizado.url(id)).pipe(
      serviceDefault({
        schema: ServicioRealizadoSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  getComplete(id: number): Observable<IServicioRealizadoAll> {
    return this.http.get<IServicioRealizadoAll>(BACKEND_API.services.servicio_realizado.complete.url(id)).pipe(
      serviceDefault({
        schema: ServicioRealizadoAllSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  create(servicioRealizado: IBaseServicioRealizado): Observable<IServicioRealizado> {
    servicioRealizado = BaseServicioRealizadoSchema.passthrough().parse(servicioRealizado);
    return this.http.post<IServicioRealizado>(BACKEND_API.services.servicio_realizado.url(), servicioRealizado).pipe(
      serviceDefault({
        schema: ServicioRealizadoSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.services.servicio_realizado.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}
