import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ServicioFormSubmitEvent, ServicioFormComponent } from '@forms';
import { IBaseServicioImg, IServicio } from '@service/services/schemas/servicio.schema';
import { ServicioService } from '@service/services/servicio.service';
import { ServicioImgService } from '@service/services/servicio_img.service';
import { formatErrorMsg, getChangedValues } from '@shared';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'servicio-edit-form',
  imports: [ServicioFormComponent, NzSpinModule],
  standalone: true,
  template: `
    @if (formData) {
      <servicio-form [formData]="formData" [coverFileList]="cover" [imgFileList]="images" (submit)="submit($event)" />
    } @else {
      <nz-spin [nzSpinning]="true" />
    }
  `
})
export class EditServicioFormComponent implements OnInit {
  private readonly ref = inject(NzDrawerRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly servicioService = inject(ServicioService);
  private readonly servicioImgService = inject(ServicioImgService);

  @Input({ required: true }) private readonly id!: number;
  @Input() onUpdated?: (servicio: IServicio) => void;

  formData?: IServicio;
  cover: any = [];
  images: any = [];

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del servicio');
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }
    try {
      combineLatest([this.servicioService.get(this.id), this.servicioImgService.by_servicio(this.id)])
        .pipe(map(([servicio, servicioImgs]) => ({ servicio, servicioImgs })))
        .subscribe({
          next: ({ servicio, servicioImgs }) => {
            this.formData = servicio;
            this.cover = servicioImgs
              .filter(img => img.is_cover)
              .map(
                img =>
                  ({
                    uid: img.id.toString(),
                    status: 'done',
                    url: img.imagen,
                    name: img.name || 'Sin Nombre',
                    response: img
                  }) as NzUploadFile<IBaseServicioImg>
              );
            this.images = servicioImgs
              .filter(img => !img.is_cover)
              .map(
                img =>
                  ({
                    uid: img.id.toString(),
                    status: 'done',
                    url: img.imagen,
                    name: img.name || 'Sin Nombre',
                    response: img
                  }) as NzUploadFile<IBaseServicioImg>
              );
          },
          error: err => {
            this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.servicio.individual.get.error'), err));
          }
        });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.servicio.individual.get.error'), err));
    }
  }

  submit({ servicio }: ServicioFormSubmitEvent) {
    try {
      const update_data = getChangedValues(this.formData, servicio);

      if (Object.keys(update_data).length === 0) {
        this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
        return;
      }

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
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.servicio.individual.update.error'), err));
    }
  }
}
