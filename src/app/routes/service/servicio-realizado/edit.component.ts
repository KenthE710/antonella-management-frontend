import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ServicioRealizadoFormComponent } from '@forms';
import { INoIdServicio, IServicio } from '@service/services/schemas/servicio.schema';
import { IBaseServicioRealizado, IServicioRealizado } from '@service/services/schemas/servicio_realizado.schema';
import { ServicioService } from '@service/services/servicio.service';
import { ServicioRealizadoService } from '@service/services/servicio_realizado.service';
import { ServicioRealizadoProductoService } from '@service/services/servicio_realizado_producto.service';
import { formatErrorMsg, getChangedValues } from '@shared';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'servicio-edit-form',
  imports: [ServicioRealizadoFormComponent, NzSpinModule],
  standalone: true,
  template: `
    @if (formData) {
      <servicio-realizado-form [formData]="formData" (submit)="submit($event)" />
    } @else {
      <nz-spin [nzSpinning]="true" />
    }
  `
})
export class ServicioRealizadoEditFormComponent implements OnInit {
  private readonly ref = inject(NzDrawerRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly servicioRealizadoService = inject(ServicioRealizadoService);
  private readonly servicioRealizadoProductoService = inject(ServicioRealizadoProductoService);

  @Input({ required: true }) private readonly id!: number;
  @Input() onUpdated?: (servicio: IServicioRealizado) => void;

  formData?: any;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del servicio');
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }
    try {
      combineLatest([this.servicioRealizadoService.get(this.id), this.servicioRealizadoProductoService.byServicioRealizado(this.id)])
        .pipe(map(([servicioRealizado, servicioRealizadoProductos]) => ({ servicioRealizado, servicioRealizadoProductos })))
        .subscribe({
          next: ({ servicioRealizado, servicioRealizadoProductos }) => {
            this.formData = {
              ...servicioRealizado,
              productos: servicioRealizadoProductos.map(p => ({ producto: p.producto, cantidad: p.cantidad }))
            };
          },
          error: err => {
            this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.servicio.individual.get.error'), err));
          }
        });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.servicio.individual.get.error'), err));
    }
  }

  submit(servicio: IBaseServicioRealizado) {
    try {
      const update_data = getChangedValues(this.formData, servicio);

      if (Object.keys(update_data).length === 0) {
        this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
        return;
      }

      /*
      this.servicioService.update(this.id, update_data).subscribe({
        next: _servicio => {
          this.msg.success(this.i18n.getI18Value('services.servicio.update.success'));
          this.formData = _servicio;
          this.onUpdated?.(_servicio);
          this.ref.close();
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.servicio.update.error'), err));
        }
      });
      */
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.servicio.individual.update.error'), err));
    }
  }
}
