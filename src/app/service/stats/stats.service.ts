import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import { IProductosMasUtilizados, ProductosMasUtilizadosSchema } from './schemas/productos_mas_utilizados.schema';
import { IProductosPorMarca, ProductosPorMarcaSchema } from './schemas/productos_por_marca.schema';
import { ITotalProductosPorTipo, TotalProductosPorTipoSchema } from './schemas/total_productos_por_tipo.schema';
import { IValorInventario, ValorInventarioSchema } from './schemas/valor_inventario.schema';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  logger = { error: (_: any) => this.msg.error(_) };

  getTotalProductosPorTipo(): Observable<ITotalProductosPorTipo[]> {
    return this.http.get<ITotalProductosPorTipo[]>(BACKEND_API.inventory.stats.total_productos_por_tipo.url()).pipe(
      serviceDefault({
        schema: TotalProductosPorTipoSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.stats.producto_por_tipo.get.error'),
        logger: this.logger
      })
    );
  }
  getProductosPorMarca(): Observable<IProductosPorMarca[]> {
    return this.http.get<IProductosPorMarca[]>(BACKEND_API.inventory.stats.productos_por_marca.url()).pipe(
      serviceDefault({
        schema: ProductosPorMarcaSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.stats.producto_por_marca.get.error'),
        logger: this.logger
      })
    );
  }
  getValorInventario(): Observable<IValorInventario> {
    return this.http.get<IValorInventario>(BACKEND_API.inventory.stats.valor_inventario.url()).pipe(
      serviceDefault({
        schema: ValorInventarioSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.stats.valor_inventario.get.error'),
        logger: this.logger
      })
    );
  }
  getProductosMasUtilizados(): Observable<IProductosMasUtilizados[]> {
    return this.http.get<IProductosMasUtilizados[]>(BACKEND_API.inventory.stats.productos_mas_utilizados.url()).pipe(
      serviceDefault({
        schema: ProductosMasUtilizadosSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}
