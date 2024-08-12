import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '@shared';

import { graphProductosPorMarcaComponent } from './graphs/productos_por_marca.component';
import { graphTotalProductosPorTipoComponent } from './graphs/total_productos_por_tipo.component';
import { graphValorInventarioComponent } from './graphs/valor_inventario.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [...SHARED_IMPORTS, graphTotalProductosPorTipoComponent, graphProductosPorMarcaComponent, graphValorInventarioComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.style.less'
})
export class DashboardComponent {}
