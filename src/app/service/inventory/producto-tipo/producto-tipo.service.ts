import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/app/core/logger.service';

import {
  IProductoTipo,
  IProductoTipoCreate,
  IProductoTipoUpdate,
  ProductoTipoCreateSchema,
  ProductoTipoSchema,
  ProductoTipoUpdateSchema
} from '../product/schemas';

@Injectable({
  providedIn: 'root'
})
export class ProductoTipoService {
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

  getProductoTipo(id: number): Observable<IProductoTipo> {
    return this.http.get<IProductoTipo>(BACKEND_API.inventory.producto_tipo.url(id)).pipe(
      serviceDefault({
        schema: ProductoTipoSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  createProductoTipo(tipo: IProductoTipoCreate): Observable<IProductoTipo> {
    tipo = ProductoTipoCreateSchema.parse(tipo);
    return this.http.post<IProductoTipo>(BACKEND_API.inventory.producto_tipo.url(), tipo).pipe(
      serviceDefault({
        schema: ProductoTipoSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  deleteProductoTipo(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.inventory.producto_tipo.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  updateProductoTipo(tipo: IProductoTipoUpdate): Observable<IProductoTipo> {
    const { id, ..._tipo } = ProductoTipoUpdateSchema.parse(tipo);
    return this.http.patch<IProductoTipo>(BACKEND_API.inventory.producto_tipo.url(id), _tipo).pipe(
      serviceDefault({
        schema: ProductoTipoSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}
