import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ClienteFormComponent } from '@forms';
import { ClienteService } from '@service/customers/cliente/cliente.service';
import { ICliente, INoIdCliente } from '@service/customers/cliente/schemas/cliente.schema';
import { formatErrorMsg, getChangedValues } from '@shared';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'cliente-edit-form',
  imports: [ClienteFormComponent, NzSpinModule],
  standalone: true,
  template: `
    @if (formData) {
      <cliente-form [formData]="formData" (submit)="submit($event)" />
    } @else {
      <nz-spin [nzSpinning]="true" />
    }
  `
})
export class EditClienteFormComponent implements OnInit {
  private readonly ref = inject(NzDrawerRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly clienteService = inject(ClienteService);

  @Input({ required: true }) private readonly id!: number;
  @Input() onUpdated?: (cliente: ICliente) => void;

  formData?: INoIdCliente;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del cliente');
      this.msg.warning(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }
    try {
      this.clienteService.getCliente(this.id).subscribe({
        next: _cliente => {
          this.formData = _cliente;
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.client.individual.get.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.client.individual.get.error'), err));
    }
  }

  submit(cliente: INoIdCliente) {
    try {
      const update_data = getChangedValues(this.formData, cliente);

      if (Object.keys(update_data).length === 0) {
        this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
        return;
      }

      this.clienteService.updateCliente(this.id, update_data).subscribe({
        next: _cliente => {
          this.msg.success(this.i18n.getI18Value('services.client.update.success'));
          this.formData = _cliente;
          this.onUpdated?.(_cliente);
          this.ref.close();
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.client.update.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.client.individual.update.error'), err));
    }
  }
}
