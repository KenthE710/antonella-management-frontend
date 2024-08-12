import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import {
  IServicio,
  INoIdServicio,
  ServicioSchema,
  NoIdServicioSchema,
  IServicioSelector,
  ServicioSelectorSchema
} from './schemas/servicio.schema';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  logger = { error: (_: any) => this.msg.error(_) };

  /**
   * ========================================
   * CRUD
   * ========================================
   */

  get(id: number): Observable<IServicio> {
    return this.http.get<IServicio>(BACKEND_API.services.servicio.url(id)).pipe(
      serviceDefault({
        schema: ServicioSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.services.servicio.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  create(servicio: INoIdServicio): Observable<IServicio> {
    servicio = NoIdServicioSchema.parse(servicio);
    return this.http.post<IServicio>(BACKEND_API.services.servicio.url(), servicio).pipe(
      serviceDefault({
        schema: ServicioSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  update(id: number, servicio: Partial<INoIdServicio>): Observable<IServicio> {
    servicio = NoIdServicioSchema.partial().parse(servicio);
    return this.http.patch<IServicio>(BACKEND_API.services.servicio.url(id), servicio).pipe(
      serviceDefault({
        schema: ServicioSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  /**
   * ========================================
   * OPERACIONES
   * ========================================
   */

  selector(): Observable<IServicioSelector[]> {
    return this.http.get<IServicioSelector[]>(BACKEND_API.services.servicio.selector.url()).pipe(
      serviceDefault({
        schema: ServicioSelectorSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}
