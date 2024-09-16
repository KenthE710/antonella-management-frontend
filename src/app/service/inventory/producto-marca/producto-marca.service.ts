import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/app/core/logger.service';

import { INoIdProductoMarca, IProductoMarca, NoIdProductoMarcaSchema, ProductoMarcaSchema } from '../product/schemas';

@Injectable({
  providedIn: 'root'
})
export class ProductoMarcaService {
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

  createProductoMarca(marca: INoIdProductoMarca): Observable<IProductoMarca> {
    marca = NoIdProductoMarcaSchema.parse(marca);
    return this.http.post<IProductoMarca>(BACKEND_API.inventory.producto_marca.url(), marca).pipe(
      serviceDefault({
        schema: ProductoMarcaSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  getProductoMarca(id: number): Observable<IProductoMarca> {
    return this.http.get<IProductoMarca>(BACKEND_API.inventory.producto_marca.url(id)).pipe(
      serviceDefault({
        schema: ProductoMarcaSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  deleteProductoMarca(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.inventory.producto_marca.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  updateProductoMarca(id: number, marca: Partial<INoIdProductoMarca>): Observable<IProductoMarca> {
    marca = NoIdProductoMarcaSchema.partial().parse(marca);
    return this.http.patch<IProductoMarca>(BACKEND_API.inventory.producto_marca.url(id), marca).pipe(
      serviceDefault({
        schema: ProductoMarcaSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}
