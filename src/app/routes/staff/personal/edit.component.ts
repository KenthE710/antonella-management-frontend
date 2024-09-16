import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { PersonalFormComponent } from '@forms';
import { PersonalService } from '@service/staff/personal.service';
import { INoIdPersonal, IPersonal } from '@service/staff/schemas/personal.schema';
import { formatErrorMsg, getChangedValues } from '@shared';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'personal-edit-form',
  imports: [PersonalFormComponent, NzSpinModule],
  standalone: true,
  template: `
    @if (formData) {
      <personal-form [formData]="formData" (submit)="submit($event)" />
    } @else {
      <nz-spin [nzSpinning]="true" />
    }
  `
})
export class EditPersonalFormComponent implements OnInit {
  private readonly ref = inject(NzDrawerRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly personalService = inject(PersonalService);

  @Input({ required: true }) private readonly id!: number;
  @Input() onUpdated?: (personal: IPersonal) => void;

  formData?: IPersonal;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del personal');
      this.msg.warning(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }
    try {
      this.personalService.get(this.id).subscribe({
        next: _personal => {
          this.formData = _personal;
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.staff.individual.get.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.staff.individual.get.error'), err));
    }
  }

  submit(personal: INoIdPersonal) {
    try {
      const update_data = getChangedValues(this.formData, personal);

      if (Object.keys(update_data).length === 0) {
        this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
        return;
      }

      this.personalService.update(this.id, update_data).subscribe({
        next: _personal => {
          this.msg.success(this.i18n.getI18Value('services.staff.update.success'));
          this.formData = _personal;
          this.onUpdated?.(_personal);
          this.ref.close();
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.staff.update.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.staff.individual.update.error'), err));
    }
  }
}
