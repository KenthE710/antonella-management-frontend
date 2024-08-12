import { Component, inject, Input } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ServicioRealizadoFormComponent } from '@forms';
import { INoIdServicio, IServicio } from '@service/services/schemas/servicio.schema';
import { IBaseServicioRealizado } from '@service/services/schemas/servicio_realizado.schema';
import { ServicioService } from '@service/services/servicio.service';
import { ServicioRealizadoService } from '@service/services/servicio_realizado.service';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'realizar-servicio-form',
  imports: [ServicioRealizadoFormComponent],
  standalone: true,
  template: `<servicio-realizado-form [formData]="realizarServicioData" (submit)="submit($event)" />`
})
export class RealizarServicioFormComponent {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly servicioRealizadoService = inject(ServicioRealizadoService);
  @Input() data?: IServicio;
  @Input() onCreated?: (servicio: IBaseServicioRealizado) => void;

  _data?: any;

  get realizarServicioData() {
    if (!this.data) return;

    if (!this._data) {
      this._data = {
        servicio: this.data?.id,
        // TODO: evitar que tener que usar any
        productos: (this.data?.productos as any[])?.map(p => ({ producto: p.id, cantidad: 1 }))
      };
    }

    return this._data;
  }

  submit(servicio: IBaseServicioRealizado) {
    try {
      this.servicioRealizadoService.create(servicio).subscribe({
        next: _servicio => {
          this.msg.success(this.i18n.getI18Value('services.servicio_realizado.create.success'));
          this.onCreated?.(_servicio);
          this.modal.destroy();
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.servicio_realizado.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.servicio_realizado.create.try'), err));
    }
  }
}
