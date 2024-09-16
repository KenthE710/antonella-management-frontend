import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { IServicioRealizadoAll } from '@service/services/schemas/servicio_realizado.schema';
import { ServicioRealizadoService } from '@service/services/servicio_realizado.service';
import { formatDateFromString, formatErrorMsg, relativeDateToNowFromString, SHARED_IMPORTS } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'servicio-realizado-view',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    @if (servicioRealizado) {
      <div sv-container [col]="2">
        <sv [label]="'form.id.label' | i18n">{{ servicioRealizado!.id }}</sv>
        <sv [label]="'Cliente'">{{
          servicioRealizado!.cliente ? servicioRealizado!.cliente.nombre.concat(' ').concat(servicioRealizado!.cliente.apellido) : ''
        }}</sv>
        <sv [label]="'Servicio'">{{ servicioRealizado!.servicio ? servicioRealizado!.servicio.nombre : '' }}</sv>
        <sv [label]="'Fecha'" *ngIf="servicioRealizado.fecha">{{ formatDate(servicioRealizado.fecha) }}</sv>
        <sv [label]="'Pagado'" unit="$">{{ servicioRealizado!.pagado }}</sv>
        <sv [label]="'Finalizado'">{{ servicioRealizado!.finalizado }}</sv>
        <nz-divider />
        <sv [label]="'Productos Utilizados'" col="1">
          @for (prod of servicioRealizado!.productos_utilizados; track prod.id) {
            <p>
              {{
                'Se utilizo '
                  .concat(prod.cantidad.toString())
                  .concat(' unidad/es del producto: ')
                  .concat(prod.producto.nombre)
                  .concat(prod.producto.sku ? ''.concat(' (', prod.producto.sku, ')') : '')
              }}
            </p>
          }
        </sv>
      </div>
    } @else {
      <nz-spin />
    }
  `,
  styles: `
    .img-round {
      border-radius: 5%;
    }
  `
})
export class ServicioRealizadoViewComponent implements OnInit {
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly servicioRealizadoService = inject(ServicioRealizadoService);

  @Input({ required: true }) private readonly id!: number;

  servicioRealizado?: IServicioRealizadoAll;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto');
      this.msg.warning(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    this.servicioRealizadoService.getComplete(this.id).subscribe({
      next: _servicioRealizado => {
        this.servicioRealizado = _servicioRealizado;
      },
      error: err => {
        this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.servicio_realizado.individual.get.error'), err));
      }
    });
  }

  formatDate(date?: string | null): string {
    try {
      if (!date) return '';
      const formatDate = formatDateFromString(date);
      const relativeFormatDate = relativeDateToNowFromString(date, this.i18n.getDateLocale());

      return `${formatDate} (${relativeFormatDate})`;
    } catch (error) {
      return '';
    }
  }
}
