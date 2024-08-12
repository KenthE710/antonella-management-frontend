import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule } from '@delon/form';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { INoIdPersonal } from '@service/staff/schemas/personal.schema';

@Component({
  selector: 'personal-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf #sf [schema]="schema" [mode]="formData ? 'edit' : 'default'" [formData]="formData" (formSubmit)="formSubmit($event)" />`
})
export class PersonalFormComponent {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input() formData?: INoIdPersonal;
  @Output() private readonly submit = new EventEmitter<INoIdPersonal>();

  schema: SFSchema = {
    properties: {
      nombre: {
        type: 'string',
        title: this.i18n.getI18Value('form.staff.name.label'),
        maxLength: 50
      },
      apellido: {
        type: 'string',
        title: this.i18n.getI18Value('form.staff.lastname.label'),
        maxLength: 50
      },
      cedula: {
        type: 'string',
        title: this.i18n.getI18Value('form.staff.card.label'),
        maxLength: 10
      }
    }
  };

  formSubmit(values: any) {
    this.submit.emit(values);
  }
}
