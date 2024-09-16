import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, I18nPipe, ModalHelper } from '@delon/theme';
import { LoteFormComponent } from '@forms';
import { LoteService } from '@service/inventory/lote/lote.service';
import { ILote, INoIdLote } from '@service/inventory/lote/schemas/lote.schema';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'lote-add-form',
  imports: [LoteFormComponent, NzModalModule, I18nPipe],
  standalone: true,
  template: `<lote-form (submit)="submit($event)" />

    <nz-modal [(nzVisible)]="isVisible" [nzTitle]="'confirm' | i18n" (nzOnCancel)="isVisible = false" (nzOnOk)="handleOk()">
      <ng-container *nzModalContent>
        <h3>{{ 'form.lote.create_anyway.content.title' | i18n }}</h3>
        <p>{{ modalContent }}</p>
      </ng-container>
    </nz-modal>`
})
export class AddLoteFormComponent {
  private readonly modal = inject(ModalHelper);
  private readonly modalRef = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly loteService = inject(LoteService);
  @Input() onCreated?: (lote: ILote) => void;

  isVisible = false;
  modalContent = '';
  _lote?: INoIdLote;

  submit(lote: INoIdLote, force = false) {
    try {
      if (!this._lote) this._lote = lote;

      this.loteService.create(lote, force).subscribe({
        next: _lote => {
          this.msg.success(this.i18n.getI18Value('services.lote.create.success'));
          this.onCreated?.(_lote);
          this.modalRef.destroy();
        },
        error: err => {
          if (force) {
            this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.lote.create.error'), err));
          } else {
            this.modalContent = formatErrorMsg('', err, { show_always: true, hide_msg_separator: true });
            this.isVisible = true;
          }
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.lote.create.try'), err));
    }
  }

  handleOk() {
    this.submit(this._lote!, true);
  }
}
