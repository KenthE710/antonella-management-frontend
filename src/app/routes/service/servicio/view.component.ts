import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { IServicio, IServicioImg, IServicioView } from '@service/services/schemas/servicio.schema';
import { ServicioService } from '@service/services/servicio.service';
import { ServicioImgService } from '@service/services/servicio_img.service';
import { formatDurationRelative, formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'servicio-view',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    @if (servicio) {
      <div nz-row [nzGutter]="24">
        <div nz-col nzSpan="8" *ngIf="!!cover && !!cover.imagen">
          <img nz-image class="img-round" width="100%" [nzSrc]="cover.imagen" alt="{{ cover.name }}" />
        </div>
        <div nz-col [nzSpan]="!!cover && !!cover.imagen ? 16 : 24">
          <div sv-container col="2">
            <sv [label]="'form.id.label' | i18n">{{ servicio.id }}</sv>
            <sv [label]="'table.servicio.nombre.label' | i18n">{{ servicio.nombre }}</sv>
            <sv [label]="'table.servicio.state.label' | i18n" *ngIf="servicio.estado" [type]="getColTypeByState(servicio.estado.nombre)">{{
              servicio.estado.nombre
            }}</sv>
            <sv [label]="'table.servicio.precio.label' | i18n" *ngIf="servicio.precio">{{ '$'.concat(servicio.precio.toString()) }}</sv>
            <sv [label]="'table.servicio.tiempo_est.label' | i18n" *ngIf="servicio.tiempo_est">{{
              formatTiempoEst(servicio.tiempo_est)
            }}</sv>
            <sv [label]="'table.servicio.available.label' | i18n" [type]="servicio.disponibilidad ? 'success' : 'danger'">{{
              ((servicio.disponibilidad ? 'yes' : 'no') | i18n).toUpperCase()
            }}</sv>
            <sv [label]="'table.servicio.encargado.label' | i18n" *ngIf="servicio.encargado">{{
              servicio.encargado.nombre.concat(' ', servicio.encargado.apellido)
            }}</sv>
            <sv [label]="'form.servicio.especialidades.label' | i18n" *ngIf="servicio.especialidades.length">{{
              getEspecialidadesLabel(servicio)
            }}</sv>
            <sv [label]="'table.servicio.descripcion.label' | i18n" col="1" *ngIf="servicio.descripcion">{{ servicio.descripcion }}</sv>
          </div>
        </div>
      </div>
      @if (servicio.productos?.length) {
        <nz-divider />
        <div sv-container col="1">
          <sv-title>{{ 'view.servicio.products.title' | i18n }}</sv-title>
          @for (prod of servicio.productos; track prod.id) {
            <sv [type]="prod.existencias > 0 ? undefined : 'danger'">
              {{
                '- '
                  .concat(prod.nombre, prod.sku ? ''.concat(' (', prod.sku, ')') : '')
                  .concat(' - ', prod.existencias.toString(), ' ', ('stocks' | i18n).toLowerCase())
              }}
            </sv>
          }
        </div>
      }
      @if (imgs.length) {
        <nz-divider />
        <h3 nz-typography>{{ ('view.product.gallery.title' | i18n).concat(': ') }}</h3>
        <div nz-row>
          @for (img of imgs; track img.id) {
            <div nz-col nzSpan="6">
              <img nz-image width="100%" nzSrc="{{ img.imagen }}" alt="{{ img.name }}" />
            </div>
          }
        </div>
      }
    } @else {
      <nz-spin />
    }
  `,
  styles: `
    .img-round {
      border-radius: 5%;
    }
    .sv-description {
      margin-top: 10px;
    }
  `
})
export class ViewServicioComponent implements OnInit {
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly servicioService = inject(ServicioService);
  private readonly servicioImgService = inject(ServicioImgService);

  @Input({ required: true }) private readonly id!: number;

  servicio?: IServicioView;
  cover?: IServicioImg;
  imgs: IServicioImg[] = [];

  bordered = true;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del servicio');
      this.msg.warning(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    combineLatest([this.servicioService.view(this.id), this.servicioImgService.by_servicio(this.id)])
      .pipe(map(([servicio, servicioImgs]) => ({ servicio, servicioImgs })))
      .subscribe({
        next: ({ servicio, servicioImgs }) => {
          this.servicio = servicio;
          this.cover = servicioImgs.find(img => img.is_cover);
          this.imgs = servicioImgs.filter(img => !img.is_cover);
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.product.get.one.error'), err));
        }
      });
  }

  formatTiempoEst(tiempoEst: string): string {
    return formatDurationRelative(tiempoEst, this.i18n.getDateLocale());
  }

  getColTypeByState(state: string): 'primary' | 'success' | 'danger' | 'warning' | undefined {
    switch (state.toUpperCase()) {
      case 'ACTIVO':
        return 'success';
      case 'INACTIVO':
        return 'danger';
      default:
        return void 0;
    }
  }

  getEspecialidadesLabel(servicio: IServicioView) {
    return servicio.especialidades.map(_ => _.nombre).join(', ');
  }
}
