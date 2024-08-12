import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import { BaseParametro, IBaseParametro, IParametro, ParametroSchema } from './schemas/parametro.schema';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  logger = { error: (_: any) => this.msg.error(_) };

  /**
   * ========================================
   * CRUD
   * ========================================
   */

  get(id: number): Observable<IParametro> {
    return this.http.get<IParametro>(BACKEND_API.parameters.parametro.url(id)).pipe(
      serviceDefault({
        schema: ParametroSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.parameters.parametro.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  create(parametro: IBaseParametro): Observable<IParametro> {
    parametro = BaseParametro.parse(parametro);
    return this.http.post<IParametro>(BACKEND_API.parameters.parametro.url(), parametro).pipe(
      serviceDefault({
        schema: ParametroSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  update(id: number, parametro: Partial<IBaseParametro>): Observable<IParametro> {
    parametro = BaseParametro.partial().parse(parametro);
    return this.http.patch<IParametro>(BACKEND_API.parameters.parametro.url(id), parametro).pipe(
      serviceDefault({
        schema: ParametroSchema,
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
}
