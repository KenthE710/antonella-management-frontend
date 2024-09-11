import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import { ClienteSchema, ICliente, INoIdCliente, NoIdClienteSchema } from './schemas/cliente.schema';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  logger = { error: (_: any) => this.msg.error(_) };

  getCliente(id: number): Observable<ICliente> {
    return this.http.get<ICliente>(BACKEND_API.customers.cliente.url(id)).pipe(
      serviceDefault({
        schema: ClienteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }
  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.customers.cliente.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }
  createCliente(cliente: INoIdCliente): Observable<ICliente> {
    cliente = NoIdClienteSchema.parse(cliente);
    return this.http.post<ICliente>(BACKEND_API.customers.cliente.url(), cliente).pipe(
      serviceDefault({
        schema: ClienteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }
  updateCliente(id: number, cliente: Partial<INoIdCliente>): Observable<ICliente> {
    cliente = NoIdClienteSchema.partial().parse(cliente);
    return this.http.patch<ICliente>(BACKEND_API.customers.cliente.url(id), cliente).pipe(
      serviceDefault({
        schema: ClienteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  /**
   * ========================================
   * OPERACIONES
   * ========================================
   */

  selector(): Observable<ICliente[]> {
    return this.http.get<ICliente[]>(BACKEND_API.customers.cliente.selector.url()).pipe(
      serviceDefault({
        schema: ClienteSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  complete(id: number): Observable<ICliente> {
    return this.http.get<ICliente>(BACKEND_API.customers.cliente.complete.url(id)).pipe(
      serviceDefault({
        schema: ClienteSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.cliente.complete.error'),
        logger: this.logger
      })
    );
  }
}
