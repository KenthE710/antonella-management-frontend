import { Component, inject, Input } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ServicioRealizadoFormComponent } from '@forms';
import { INoIdServicio, IServicio } from '@service/services/schemas/servicio.schema';
import { IBaseServicioRealizado } from '@service/services/schemas/servicio_realizado.schema';
import { ServicioService } from '@service/services/servicio.service';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'servicio-realizado-add-form',
  imports: [ServicioRealizadoFormComponent],
  standalone: true,
  template: `<servicio-realizado-form (submit)="submit($event)" />`
})
export class AddServicioRealizadoFormComponent {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly servicioService = inject(ServicioService);

  @Input() data?: INoIdServicio;
  @Input() onCreated?: (servicio: IServicio) => void;

  submit(servicio: IBaseServicioRealizado) {
    /* try {
      this.servicioService.create(servicio).subscribe({
        next: _servicio => {
          this.msg.success(this.i18n.getI18Value('services.servicio.create.success'));
          this.onCreated?.(_servicio);
          this.modal.destroy();
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.servicio.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.servicio.create.try'), err));
    } */
  }
}
