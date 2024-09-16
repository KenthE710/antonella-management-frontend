import { Component, inject, Input } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ClienteFormComponent } from '@forms';
import { ClienteService } from '@service/customers/cliente/cliente.service';
import { ICliente, INoIdCliente } from '@service/customers/cliente/schemas/cliente.schema';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'cliente-add-form',
  imports: [ClienteFormComponent],
  standalone: true,
  template: `<cliente-form (submit)="submit($event)" />`
})
export class AddClienteFormComponent {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly clienteService = inject(ClienteService);

  @Input() onCreated?: (cliente: ICliente) => void;

  submit(cliente: INoIdCliente) {
    try {
      this.clienteService.createCliente(cliente).subscribe({
        next: _cliente => {
          this.msg.success(this.i18n.getI18Value('services.client.create.success'));
          this.onCreated?.(_cliente);
          this.modal.destroy();
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.client.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.client.create.try'), err));
    }
  }
}
