import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/app/core/logger.service';

import { IServicioRealizadoProducto, ServicioRealizadoProductoSchema } from './schemas/servicio_realizado_producto.schema';

@Injectable({
  providedIn: 'root'
})
export class ServicioRealizadoProductoService {
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
  byServicioRealizado(id: number): Observable<IServicioRealizadoProducto[]> {
    return this.http.get<IServicioRealizadoProducto[]>(BACKEND_API.services.servicio_realizado_producto.by_servicio_realizado.url(id)).pipe(
      serviceDefault({
        schema: ServicioRealizadoProductoSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}
