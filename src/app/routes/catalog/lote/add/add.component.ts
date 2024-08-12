import { Component, inject, Input } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { LoteFormComponent } from '@forms';
import { LoteService } from '@service/inventory/lote/lote.service';
import { ILote, INoIdLote } from '@service/inventory/lote/schemas/lote.schema';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'lote-add-form',
  imports: [LoteFormComponent],
  standalone: true,
  template: `<lote-form (submit)="submit($event)" />`
})
export class AddLoteFormComponent {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly loteService = inject(LoteService);

  @Input() onCreated?: (lote: ILote) => void;

  submit(lote: INoIdLote) {
    try {
      this.loteService.create(lote).subscribe({
        next: _lote => {
          this.msg.success(this.i18n.getI18Value('services.lote.create.success'));
          this.onCreated?.(_lote);
          this.modal.destroy();
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.lote.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.lote.create.try'), err));
    }
  }
}
