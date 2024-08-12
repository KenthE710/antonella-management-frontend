import { Routes } from '@angular/router';

import { LoteTableComponent } from './lote/lote.component';
import { CatalogProductComponent } from './product/product.component';
import { ProductoMarcaTableComponent } from './producto-marca/producto-marca.component';
import { CatalogProductoTipoComponent } from './producto_tipo/producto-tipo.component';

export const routes: Routes = [
  { path: 'product', component: CatalogProductComponent },
  { path: 'lote', component: LoteTableComponent },
  { path: 'producto-tipo', component: CatalogProductoTipoComponent },
  { path: 'producto-marca', component: ProductoMarcaTableComponent }
];
