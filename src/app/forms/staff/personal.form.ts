import { Component, inject, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule, SFLayout, SFSelectWidgetSchema, SFValue, FormProperty, PropertyGroup } from '@delon/form';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { PersonalService } from '@service/staff/personal.service';
import { INoIdPersonal } from '@service/staff/schemas/personal.schema';
import { isCedula, isMobile } from '@shared';
import { map } from 'rxjs';

@Component({
  selector: 'personal-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf #sf [schema]="schema" [formData]="formData" (formSubmit)="formSubmit($event)" [layout]="layout" />`
})
export class PersonalFormComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly personalService = inject(PersonalService);
  private settingService = inject(SettingsService);

  @Input() formData?: INoIdPersonal;
  @Output() private readonly submit = new EventEmitter<INoIdPersonal>();

  layout: SFLayout = 'horizontal';

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
        maxLength: 20,
        ui: {
          validator: (value: SFValue, formProperty: FormProperty, form: PropertyGroup) => {
            if (value && !isCedula(value, this.cedulaLimit))
              return [{ keyword: 'cedula', message: this.i18n.getI18Value('form.error.format.cedula') }];
            return [];
          }
        }
      },
      email: {
        type: 'string',
        title: this.i18n.getI18Value('form.staff.mail.label'),
        format: 'email',
        maxLength: 100
      },
      telefono: {
        type: 'string',
        title: this.i18n.getI18Value('form.staff.phone.label'),
        maxLength: 10,
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
        title: this.i18n.getI18Value('form.staff.address.label'),
        maxLength: 225
      },
      fecha_nacimiento: {
        type: 'string',
        title: this.i18n.getI18Value('form.staff.born_date.label'),
        format: 'date'
      },
      estado: {
        type: 'string',
        title: this.i18n.getI18Value('form.staff.state.label'),
        ui: {
          widget: 'select',
          asyncData: () => this.personalService.getStates().pipe(map(data => data.map(pt => ({ label: pt.name, value: pt.id }))))
        } as SFSelectWidgetSchema
      }
    },
    required: ['nombre', 'apellido'],
    ui: {
      errors: {
        required: this.i18n.getI18Value('form.error.required'),
        format: m => {
          if (m.params && m.params['format'] === 'email') return this.i18n.getI18Value('form.error.format.email');
          return this.i18n.getI18Value('form.error.format');
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
