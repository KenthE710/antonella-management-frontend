import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { LoteService } from '@service/inventory/lote/lote.service';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'lote-delete-form',
  imports: [...SHARED_IMPORTS],
  standalone: true,
  template: `<sf #sf [schema]="schema" (formSubmit)="formSubmit($event)" layout="vertical" />`
})
export class DeleteLoteFormComponent implements OnInit {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly loteService = inject(LoteService);

  @Input({ required: true }) private readonly id!: number;
  @Input() private onSubmit?: (evento: string) => void;

  schema: SFSchema = {
    properties: {
      motivo: {
        type: 'string',
        title: this.i18n.getI18Value('form.lote.delete.motivo.label')
      }
    },
    required: ['motivo'],
    ui: {
      errors: {
        required: this.i18n.getI18Value('form.error.required')
      }
    }
  };

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del lote');
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }
  }

  formSubmit(values: any) {
    try {
      this.loteService.delete(this.id, values.motivo).subscribe({
        complete: () => {
          this.onSubmit?.('deleted');
          this.modal.destroy();
        },
        error: err => {
          this.onSubmit?.('error');
          this.modal.destroy();
        }
      });
    } catch (error: any) {
      this.msg.error(
        formatErrorMsg(this.i18n.getI18ValueTemplate('table.notification.row.deleted.error', `Lote con id ${this.id}`), error)
      );
    }
  }
}
