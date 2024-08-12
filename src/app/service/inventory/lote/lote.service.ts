import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import { ILote, ILoteView, INoIdLote, LoteSchema, LoteViewSchema, NoIdLoteSchema } from './schemas/lote.schema';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  logger = { error: (_: any) => this.msg.error(_) };

  /**
   * ========================================
   * CRUD
   * ========================================
   */

  get(id: number): Observable<ILote> {
    return this.http.get<ILote>(BACKEND_API.inventory.lote.url(id)).pipe(
      serviceDefault({
        schema: LoteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  view(id: number): Observable<ILoteView> {
    return this.http.get<ILoteView>(BACKEND_API.inventory.lote.view.url(id)).pipe(
      serviceDefault({
        schema: LoteViewSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.inventory.lote.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  create(lote: INoIdLote): Observable<ILote> {
    lote = NoIdLoteSchema.parse(lote);
    return this.http.post<ILote>(BACKEND_API.inventory.lote.url(), lote).pipe(
      serviceDefault({
        schema: LoteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  update(id: number, lote: Partial<INoIdLote>): Observable<ILote> {
    lote = NoIdLoteSchema.partial().parse(lote);
    return this.http.patch<ILote>(BACKEND_API.inventory.lote.url(id), lote).pipe(
      serviceDefault({
        schema: LoteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}
