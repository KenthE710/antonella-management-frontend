import { Component, inject, Input } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ServicioFormSubmitEvent, ServicioFormComponent } from '@forms';
import { IServicio } from '@service/services/schemas/servicio.schema';
import { ServicioService } from '@service/services/servicio.service';
import { ServicioImgService } from '@service/services/servicio_img.service';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';

@Component({
  selector: 'servicio-add-form',
  imports: [ServicioFormComponent],
  standalone: true,
  template: `<servicio-form (submit)="submit($event)" />`
})
export class AddServicioFormComponent {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly servicioService = inject(ServicioService);
  private readonly servicioImgService = inject(ServicioImgService);

  @Input() onCreated?: (servicio: IServicio) => void;

  submit({ servicio, cover, imgs }: ServicioFormSubmitEvent) {
    try {
      this.servicioService.create(servicio).subscribe({
        next: _servicio => {
          const imgs_id = [...cover, ...imgs].map(img => img.response.id);
          (!imgs_id.length ? of(void 0) : this.servicioImgService.assign_servicio(_servicio.id, imgs_id)).subscribe(() => {
            this.msg.success(this.i18n.getI18Value('services.servicio.create.success'));
            this.onCreated?.(_servicio);
            this.modal.destroy();
          });
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.servicio.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.servicio.create.try'), err));
    }
  }
}
