import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import { INoIdPersonal, IPersonal, NoIdPersonalSchema, PersonalSchema } from './schemas/personal.schema';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  logger = { error: (_: any) => this.msg.error(_) };

  /**
   * ========================================
   * CRUD
   * ========================================
   */
  get(id: number): Observable<IPersonal> {
    return this.http.get<IPersonal>(BACKEND_API.staff.personal.url(id)).pipe(
      serviceDefault({
        schema: PersonalSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.staff.personal.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  create(personal: INoIdPersonal): Observable<IPersonal> {
    personal = NoIdPersonalSchema.parse(personal);
    return this.http.post<IPersonal>(BACKEND_API.staff.personal.url(), personal).pipe(
      serviceDefault({
        schema: PersonalSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
  update(id: number, personal: Partial<INoIdPersonal>): Observable<IPersonal> {
    personal = NoIdPersonalSchema.partial().parse(personal);
    return this.http.patch<IPersonal>(BACKEND_API.staff.personal.url(id), personal).pipe(
      serviceDefault({
        schema: PersonalSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  /**
   * ========================================
   * OPERATIONS
   * ========================================
   */
  search(query = ''): Observable<IPersonal[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<IPersonal[]>(BACKEND_API.staff.personal.search.url(), params).pipe(
      serviceDefault({
        schema: PersonalSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}
