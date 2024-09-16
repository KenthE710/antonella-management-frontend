import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/app/core/logger.service';

import { ILote, ILoteView, INoIdLote, LoteSchema, LoteViewSchema, NoIdLoteSchema } from './schemas/lote.schema';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
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

  get(id: number): Observable<ILote> {
    return this.http.get<ILote>(BACKEND_API.inventory.lote.url(id)).pipe(
      serviceDefault({
        schema: LoteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.lote.individual.get.error'),
        logger: this.logger
      })
    );
  }
  view(id: number): Observable<ILoteView> {
    return this.http.get<ILoteView>(BACKEND_API.inventory.lote.view.url(id)).pipe(
      serviceDefault({
        schema: LoteViewSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.lote.individual.get.error'),
        logger: this.logger
      })
    );
  }
  delete(id: number, motivo = ''): Observable<void> {
    let params = new HttpParams().set('motivo', motivo);

    return this.http.delete<void>(BACKEND_API.inventory.lote.url(id), params).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.lote.delete.error'),
        logger: this.logger
      })
    );
  }
  create(lote: INoIdLote, force = false): Observable<ILote> {
    lote = NoIdLoteSchema.parse(lote);
    return this.http.post<ILote>(BACKEND_API.inventory.lote.url(), { ...lote, force_save: force }).pipe(
      serviceDefault({
        schema: LoteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.lote.create.error'),
        logger: this.logger
      })
    );
  }
  update(id: number, lote: Partial<INoIdLote>, force = false): Observable<ILote> {
    lote = NoIdLoteSchema.partial().parse(lote);
    return this.http.patch<ILote>(BACKEND_API.inventory.lote.url(id), { ...lote, force_save: force }).pipe(
      serviceDefault({
        schema: LoteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.lote.update.error'),
        logger: this.logger
      })
    );
  }
}
