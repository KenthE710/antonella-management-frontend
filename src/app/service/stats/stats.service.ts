import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ILoteAll, LoteAllSchema } from '@service/inventory/lote/schemas/lote.schema';
import { BACKEND_API } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

import { IMostPerformedServices, MostPerformedServicesSchema } from './schemas/most_performed_services.schema';
import { IPerformanceServicesProducts, PerformanceServicesProductsSchema } from './schemas/performance_services_products.schema';
import { IProductosMasUtilizados, ProductosMasUtilizadosSchema } from './schemas/productos_mas_utilizados.schema';
import { IProductosPorMarca, ProductosPorMarcaSchema } from './schemas/productos_por_marca.schema';
import { IPeriod, IServiciosRealizados, Periods, ServiciosRealizadosSchema } from './schemas/servicios_realizados.schema';
import { ITotalProductosPorTipo, TotalProductosPorTipoSchema } from './schemas/total_productos_por_tipo.schema';
import { IValorInventario, ValorInventarioSchema } from './schemas/valor_inventario.schema';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly settingService = inject(SettingsService);

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
  getProductosMasUtilizados(period: IPeriod = 'month', limit?: number): Observable<IProductosMasUtilizados[]> {
    try {
      let params = new HttpParams().set('period', Periods.parse(period));

      try {
        params = params.set(
          'limit',
          limit ? limit.toString() : this.settingService.app.dashboard.productos_mas_utilizados.limit.toString()
        );
      } catch (err) {
        params = params.set('limit', 5);
      }

      return this.http.get<IProductosMasUtilizados[]>(BACKEND_API.inventory.stats.productos_mas_utilizados.url(), params).pipe(
        serviceDefault({
          schema: ProductosMasUtilizadosSchema.array(),
          i18nErrorMessage: this.i18n.getI18Value('services.stats.productos_mas_utilizados.get.error'),
          logger: this.logger
        })
      );
    } catch (err) {
      console.error(err);
      throw new Error(this.i18n.getI18Value('services.stats.productos_mas_utilizados.get.error'));
    }
  }

  serviciosRealizados(period: IPeriod = 'month') {
    const params = new HttpParams().set('period', Periods.parse(period));
    return this.http.get<IServiciosRealizados[]>(BACKEND_API.services.stats.servicios_realizados.url(), params).pipe(
      serviceDefault({
        schema: ServiciosRealizadosSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.stats.serviciosRealizados.get.error'),
        logger: this.logger
      })
    );
  }

  mostPerformedServices(period: IPeriod = 'month', limit?: number) {
    try {
      let params = new HttpParams().set('period', Periods.parse(period));

      try {
        params = params.set(
          'limit',
          limit ? limit.toString() : this.settingService.app.dashboard.servicios_mas_realizados.limit.toString()
        );
      } catch (err) {
        params = params.set('limit', 5);
      }

      return this.http.get<IMostPerformedServices[]>(BACKEND_API.services.stats.most_performed_services.url(), params).pipe(
        serviceDefault({
          schema: MostPerformedServicesSchema.array(),
          i18nErrorMessage: this.i18n.getI18Value('services.stats.most_performed_services.get.error'),
          logger: this.logger
        })
      );
    } catch (err) {
      console.error(err);
      throw new Error(this.i18n.getI18Value('services.stats.most_performed_services.get.error'));
    }
  }

  lotesCercaDeExpirar(umbral: number = 30) {
    const params = new HttpParams().set('umbral', umbral.toString());
    return this.http.get<ILoteAll[]>(BACKEND_API.inventory.stats.lotes_cerca_de_expirar.url(), params).pipe(
      serviceDefault({
        schema: LoteAllSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.stats.lotes_cerca_de_expirar.get.error'),
        logger: this.logger
      })
    );
  }

  performanceServicesProducts(limit?: number) {
    try {
      let params = new HttpParams();

      try {
        params = params.set(
          'limit',
          limit ? limit.toString() : this.settingService.app.dashboard.rendimiento_servicios_productos.limit.toString()
        );
      } catch (err) {
        params = params.set('limit', 5);
      }

      return this.http.get<IPerformanceServicesProducts[]>(BACKEND_API.services.stats.performance_services_products.url(), params).pipe(
        serviceDefault({
          schema: PerformanceServicesProductsSchema.array(),
          i18nErrorMessage: this.i18n.getI18Value('services.stats.performance_services_products.get.error'),
          logger: this.logger
        })
      );
    } catch (err) {
      console.error(err);
      throw new Error(this.i18n.getI18Value('services.stats.performance_services_products.get.error'));
    }
  }
}
