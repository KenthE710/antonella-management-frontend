import { HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/app/core/logger.service';

import { BaseServicioImgSchema, IBaseServicioImg, IServicioImg, servicioImgSchema } from './schemas/servicio.schema';

@Injectable({
  providedIn: 'root'
})
export class ServicioImgService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  private readonly loggerService = inject(LoggerService);
  logger = { error: (_: any) => this.loggerService.error(_), warn: (_: any, titulo?: string) => this.loggerService.warn(_, titulo) };

  /**
   * ========================================
   * CRUD
   * ========================================
   */
  upload(imagen: any, params: Partial<Omit<IBaseServicioImg, 'imagen'>>): Observable<HttpEvent<IServicioImg>> {
    const { servicio, is_cover, is_tmp } = BaseServicioImgSchema.omit({ imagen: true }).partial().parse(params);

    const formData = new FormData();
    formData.append('imagen', imagen);

    if (servicio !== undefined && servicio !== null) {
      formData.append('servicio', servicio.toString());
    }
    if (is_cover !== undefined && is_cover !== null) {
      formData.append('is_cover', is_cover.toString());
    }
    if (is_tmp !== undefined && is_tmp !== null) {
      formData.append('is_tmp', is_tmp.toString());
    }

    return this.http
      .request<IServicioImg>('POST', BACKEND_API.services.servicio_img.url(), {
        body: formData,
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        serviceDefault({
          schema: servicioImgSchema,
          i18nErrorMessage: this.i18n.getI18Value('services.error'),
          logger: this.logger
        })
      );
  }

  get(id: number): Observable<IServicioImg> {
    return this.http.get<IServicioImg>(BACKEND_API.services.servicio_img.url(id)).pipe(
      serviceDefault({
        schema: servicioImgSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.services.servicio_img.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  update(id: number, params: Partial<Omit<IBaseServicioImg, 'imagen'>>): Observable<IServicioImg> {
    return this.http.patch<IServicioImg>(BACKEND_API.services.servicio_img.url(id), params).pipe(
      serviceDefault({
        schema: servicioImgSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  /**
   * ========================================
   * Others
   * ========================================
   */

  by_servicio(servicio: number): Observable<IServicioImg[]> {
    return this.http.get<IServicioImg[]>(BACKEND_API.services.servicio_img.by_servicio.url(servicio)).pipe(
      serviceDefault({
        schema: servicioImgSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  assign_servicio(servicio_id: number, imgs_id: number[]): Observable<void> {
    return this.http.post<void>(BACKEND_API.services.servicio_img.assign_servicio.url(), { servicio_id, imgs_id }).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }
}
