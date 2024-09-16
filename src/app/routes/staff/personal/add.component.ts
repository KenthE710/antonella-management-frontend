import { Component, inject, Input } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { PersonalFormComponent } from '@forms';
import { PersonalService } from '@service/staff/personal.service';
import { INoIdPersonal, IPersonal } from '@service/staff/schemas/personal.schema';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'personal-add-form',
  imports: [PersonalFormComponent],
  standalone: true,
  template: `<personal-form (submit)="submit($event)" />`
})
export class AddPersonalFormComponent {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly personalService = inject(PersonalService);

  @Input() onCreated?: (personal: IPersonal) => void;

  submit(personal: INoIdPersonal) {
    try {
      this.personalService.create(personal).subscribe({
        next: _personal => {
          this.msg.success(this.i18n.getI18Value('services.personal.create.success'));
          this.onCreated?.(_personal);
          this.modal.destroy();
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.personal.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.staff.create.try'), err));
    }
  }
}
