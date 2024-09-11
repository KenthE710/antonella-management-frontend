import { Component, inject, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule, SFLayout, SFValue, FormProperty, PropertyGroup } from '@delon/form';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { INoIdCliente } from '@service/customers/cliente/schemas/cliente.schema';
import { isCedula, isMobile } from '@shared';

@Component({
  selector: 'cliente-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf #sf [schema]="schema" [formData]="formData" (formSubmit)="formSubmit($event)" [layout]="layout" />`
})
export class ClienteFormComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private settingService = inject(SettingsService);

  @Input() formData?: INoIdCliente;
  @Output() private readonly submit = new EventEmitter<INoIdCliente>();

  layout: SFLayout = 'horizontal';

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
      },
      email: {
        type: 'string',
        title: this.i18n.getI18Value('form.client.mail.label'),
        format: 'email',
        maxLength: 100
      },
      telefono: {
        type: 'string',
        title: this.i18n.getI18Value('form.client.phone.label'),
        maxLength: 15,
        ui: {
          validator: (value: string) => {
            if (value && !isMobile(value, this.mobileLimit))
              return [{ keyword: 'mobile', message: this.i18n.getI18Value('form.error.format.mobile') }];
            return [];
          }
        }
      },
      direccion: {
        type: 'string',
        title: this.i18n.getI18Value('form.client.address.label'),
        maxLength: 225
      },
      fecha_nacimiento: {
        type: 'string',
        title: this.i18n.getI18Value('form.client.born_date.label'),
        format: 'date'
      },
      cedula: {
        type: 'string',
        title: this.i18n.getI18Value('form.client.DNI.label'),
        maxLength: 20,
        ui: {
          validator: (value: SFValue, formProperty: FormProperty, form: PropertyGroup) => {
            if (value && !isCedula(value, this.cedulaLimit))
              return [{ keyword: 'cedula', message: this.i18n.getI18Value('form.error.format.cedula') }];
            return [];
          }
        }
      }
    }
  };

  ngOnInit(): void {
    if (this.formData) {
      this.layout = 'vertical';
    }
  }

  formSubmit(values: any) {
    this.submit.emit(values);
  }

  get cedulaLimit(): number {
    return this.settingService.app.validations.cedula_limit;
  }
  get mobileLimit(): number {
    return this.settingService.app.validations.mobile_limit;
  }
}
