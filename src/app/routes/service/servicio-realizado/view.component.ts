import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18NService } from '@core';
import { SVModule } from '@delon/abc/sv';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { ProductService } from '@service/inventory/product/producto.service';
import { IProductoAll, ISingleProductoImg } from '@service/inventory/product/schemas';
import { IServicioRealizadoAll } from '@service/services/schemas/servicio_realizado.schema';
import { ServicioRealizadoService } from '@service/services/servicio_realizado.service';
import { formatErrorMsg } from '@shared';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'servicio-realizado-view',
  standalone: true,
  imports: [
    SVModule,
    NzButtonModule,
    NzRadioModule,
    NzToolTipModule,
    FormsModule,
    NzSpinModule,
    NzDividerModule,
    NzImageModule,
    NzGridModule,
    NzTypographyModule,
    I18nPipe
  ],
  template: `
    <nz-spin [nzSpinning]="!servicioRealizado">
      <div sv-container [col]="2">
        <sv [label]="'form.id.label' | i18n">{{ servicioRealizado!.id }}</sv>
        <sv [label]="'Cliente'">{{
          servicioRealizado!.cliente ? servicioRealizado!.cliente.nombre.concat(' ').concat(servicioRealizado!.cliente.apellido) : ''
        }}</sv>
        <sv [label]="'Servicio'">{{ servicioRealizado!.servicio ? servicioRealizado!.servicio.nombre : '' }}</sv>
        <sv [label]="'Fecha'">{{ servicioRealizado!.fecha }}</sv>
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
                  .concat(' (')
                  .concat(prod.producto.sku)
                  .concat(')')
              }}
            </p>
          }
        </sv>
      </div>
    </nz-spin>
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
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    this.servicioRealizadoService.getComplete(this.id).subscribe({
      next: _servicioRealizado => {
        this.servicioRealizado = _servicioRealizado;
      },
      error: err => {
        this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.servicio_realizado.individual.get.error'), err));
      }
    });
  }
}
