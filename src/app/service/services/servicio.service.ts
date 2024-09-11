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
  ServicioSelectorSchema,
  IServicioState,
  ServicioStateSchema,
  IServicioView,
  ServicioViewSchema
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
        i18nErrorMessage: this.i18n.getI18Value('services.servicio.individual.get.error'),
        logger: this.logger
      })
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.services.servicio.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.servicio.delete.error'),
        logger: this.logger
      })
    );
  }
  create(servicio: INoIdServicio): Observable<IServicio> {
    servicio = NoIdServicioSchema.parse(servicio);
    return this.http.post<IServicio>(BACKEND_API.services.servicio.url(), servicio).pipe(
      serviceDefault({
        schema: ServicioSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.servicio.create.error'),
        logger: this.logger
      })
    );
  }
  update(id: number, servicio: Partial<INoIdServicio>): Observable<IServicio> {
    servicio = NoIdServicioSchema.partial().parse(servicio);
    return this.http.patch<IServicio>(BACKEND_API.services.servicio.url(id), servicio).pipe(
      serviceDefault({
        schema: ServicioSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.servicio.update.error'),
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
        i18nErrorMessage: this.i18n.getI18Value('services.servicio.get.selector.error'),
        logger: this.logger
      })
    );
  }
  getStates(): Observable<IServicioState[]> {
    return this.http.get<IServicioState[]>(BACKEND_API.services.servicio.state.url()).pipe(
      serviceDefault({
        schema: ServicioStateSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.servicio.get.states.error'),
        logger: this.logger
      })
    );
  }
  delete_batch(ids: number[]): Observable<void> {
    return this.http.post<void>(BACKEND_API.services.servicio.delete_batch.url(), { ids }).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.servicio.delete_batch.error'),
        logger: this.logger
      })
    );
  }
  view(id: number): Observable<IServicioView> {
    return this.http.get<IServicioView>(BACKEND_API.services.servicio.view.url(id)).pipe(
      serviceDefault({
        schema: ServicioViewSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.servicio.view.error'),
        logger: this.logger
      })
    );
  }
}
