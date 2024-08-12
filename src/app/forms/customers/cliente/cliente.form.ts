import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule } from '@delon/form';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { INoIdCliente } from '@service/customers/cliente/schemas/cliente.schema';

@Component({
  selector: 'cliente-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf #sf [schema]="schema" [mode]="formData ? 'edit' : 'default'" [formData]="formData" (formSubmit)="formSubmit($event)" />`
})
export class ClienteFormComponent {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input() formData?: INoIdCliente;
  @Output() private readonly submit = new EventEmitter<INoIdCliente>();

  schema: SFSchema = {
    properties: {
      nombre: {
        type: 'string',
        title: this.i18n.getI18Value('form.client.name.label'),
        maxLength: 50
      },
      apellido: {
        type: 'string',
        title: this.i18n.getI18Value('form.client.lastname.label'),
        maxLength: 50
      }
    }
  };

  formSubmit(values: any) {
    this.submit.emit(values);
  }
}
