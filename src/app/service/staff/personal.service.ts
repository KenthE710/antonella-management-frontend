import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import {
  INoIdPersonal,
  IPersonal,
  IPersonalFull,
  IPersonalState,
  NoIdPersonalSchema,
  PersonalFullSchema,
  PersonalSchema,
  PersonalStateSchema
} from './schemas/personal.schema';

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
        i18nErrorMessage: this.i18n.getI18Value('services.staff.individual.get.error'),
        logger: this.logger
      })
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.staff.personal.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.staff.delete.error'),
        logger: this.logger
      })
    );
  }
  create(personal: INoIdPersonal): Observable<IPersonal> {
    personal = NoIdPersonalSchema.parse(personal);
    return this.http.post<IPersonal>(BACKEND_API.staff.personal.url(), personal).pipe(
      serviceDefault({
        schema: PersonalSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.staff.create.error'),
        logger: this.logger
      })
    );
  }
  update(id: number, personal: Partial<INoIdPersonal>): Observable<IPersonal> {
    personal = NoIdPersonalSchema.partial().parse(personal);
    return this.http.patch<IPersonal>(BACKEND_API.staff.personal.url(id), personal).pipe(
      serviceDefault({
        schema: PersonalSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.staff.update.error'),
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
        i18nErrorMessage: this.i18n.getI18Value('services.staff.get.search.error'),
        logger: this.logger
      })
    );
  }

  getStates(): Observable<IPersonalState[]> {
    return this.http.get<IPersonalState[]>(BACKEND_API.staff.personal.state.url()).pipe(
      serviceDefault({
        schema: PersonalStateSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.staff.get.states.error'),
        logger: this.logger
      })
    );
  }

  complete(id: number): Observable<IPersonalFull> {
    return this.http.get<IPersonalFull>(BACKEND_API.staff.personal.complete.url(id)).pipe(
      serviceDefault({
        schema: PersonalFullSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.staff.get.error'),
        logger: this.logger
      })
    );
  }
}
