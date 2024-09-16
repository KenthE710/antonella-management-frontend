import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { LoteFormComponent } from '@forms';
import { LoteService } from '@service/inventory/lote/lote.service';
import { ILote, INoIdLote } from '@service/inventory/lote/schemas/lote.schema';
import { formatErrorMsg, getChangedValues } from '@shared';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'lote-edit-form',
  imports: [LoteFormComponent, NzSpinModule, NzModalModule, I18nPipe],
  standalone: true,
  template: `
    @if (formData) {
      <lote-form [formData]="formData" (submit)="submit($event)" />

      <nz-modal [(nzVisible)]="isVisible" [nzTitle]="'confirm' | i18n" (nzOnCancel)="isVisible = false" (nzOnOk)="handleOk()">
        <ng-container *nzModalContent>
          <h3>{{ 'form.lote.create_anyway.content.title' | i18n }}</h3>
          <p>{{ modalContent }}</p>
        </ng-container>
      </nz-modal>
    } @else {
      <nz-spin [nzSpinning]="true" />
    }
  `
})
export class EditLoteFormComponent implements OnInit {
  private readonly ref = inject(NzDrawerRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly loteService = inject(LoteService);

  @Input({ required: true }) private readonly id!: number;
  @Input() onUpdated?: (lote: ILote) => void;

  formData?: ILote;
  isVisible = false;
  modalContent = '';
  _lote?: INoIdLote;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del lote');
      this.msg.warning(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }
    try {
      this.loteService.get(this.id).subscribe({
        next: _lote => {
          this.formData = _lote;
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.lote.individual.get.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.lote.individual.get.error'), err));
    }
  }

  submit(lote: INoIdLote, force = false) {
    try {
      if (!this._lote) this._lote = lote;
      const update_data = getChangedValues(this.formData, lote);

      if (Object.keys(update_data).length === 0) {
        this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
        return;
      }

      this.loteService.update(this.id, update_data, force).subscribe({
        next: _lote => {
          this.msg.success(this.i18n.getI18Value('services.lote.update.success'));
          this.formData = _lote;
          this.onUpdated?.(_lote);
          this.ref.close();
        },
        error: err => {
          if (force) {
            this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.lote.update.error'), err));
          } else {
            this.modalContent = formatErrorMsg('', err, { show_always: true, hide_msg_separator: true });
            this.isVisible = true;
          }
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.lote.individual.update.error'), err));
    }
  }

  handleOk() {
    this.submit(this._lote!, true);
  }
}
