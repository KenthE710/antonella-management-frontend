import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '@shared';

import { graphLotesCercaDeExpirarComponent } from './graphs/lotesCercaDeExpirar.component';
import { graphMostPerformedServicesComponent } from './graphs/most_performed_services.component';
import { graphPerformanceServicesProductsComponent } from './graphs/performance_services_products.component';
import { graphProductosMasUtilizadosComponent } from './graphs/productos_mas_utilizados.component';
import { graphProductosPorMarcaComponent } from './graphs/productos_por_marca.component';
import { serviciosRealizadosStatsComponent } from './graphs/servicios_realizados.component';
import { graphTotalProductosPorTipoComponent } from './graphs/total_productos_por_tipo.component';
import { graphValorInventarioComponent } from './graphs/valor_inventario.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    graphTotalProductosPorTipoComponent,
    graphProductosPorMarcaComponent,
    graphValorInventarioComponent,
    serviciosRealizadosStatsComponent,
    graphMostPerformedServicesComponent,
    graphLotesCercaDeExpirarComponent,
    graphProductosMasUtilizadosComponent,
    graphPerformanceServicesProductsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.style.less'
})
export class DashboardComponent {}
