import { Routes } from '@angular/router';

import { ServicioTableComponent } from './servicio/servicio.component';
import { ServicioRealizadoTableComponent } from './servicio-realizado/servicio-realizado.component';

export const routes: Routes = [
  { path: 'servicio', component: ServicioTableComponent },
  { path: 'servicio-realizado', component: ServicioRealizadoTableComponent }
];
