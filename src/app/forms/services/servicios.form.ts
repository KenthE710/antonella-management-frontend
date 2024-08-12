import { Component, inject, Output, EventEmitter, Input, ViewChild, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule, SFNumberWidgetSchema, SFSelectWidgetSchema, SFSchemaEnum, SFComponent } from '@delon/form';
import { SFTimeWidgetSchema } from '@delon/form/widgets/time';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProductService } from '@service/inventory/product/producto.service';
import { INoIdServicio } from '@service/services/schemas/servicio.schema';
import { PersonalService } from '@service/staff/personal.service';
import { delay, lastValueFrom, map, tap, toArray } from 'rxjs';

@Component({
  selector: 'servicio-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf
    #sf
    [schema]="schema"
    [mode]="formData ? 'edit' : 'default'"
    [formData]="data"
    (formSubmit)="formSubmit($event)"
    [loading]="!!itemsloading"
  />`
})
export class ServicioFormComponent {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly PersonalService = inject(PersonalService);
  private readonly productService = inject(ProductService);
  @ViewChild('sf', { static: false }) private sf!: SFComponent;
  @Input() formData?: INoIdServicio;
  @Output() private readonly submit = new EventEmitter<INoIdServicio>();

  formatedFormData?: Record<string, any>;
  itemsloading = 0;

  schema: SFSchema = {
    properties: {
      nombre: {
        type: 'string',
        title: this.i18n.getI18Value('form.servicio.nombre.label')
      },
      descripcion: {
        type: 'string',
        title: this.i18n.getI18Value('form.servicio.descripcion.label')
      },
      precio: {
        type: 'number',
        title: this.i18n.getI18Value('form.servicio.precio.label'),
        minimum: 0,
        ui: {
          prefix: '$',
          precision: 2,
          optional: `(${this.i18n.getI18Value('form.optional.unit.label')})`,
          optionalHelp: this.i18n.getI18Value('form.optionalHelp.unit.text')
        } as SFNumberWidgetSchema
      },
      dias: {
        type: 'number',
        title: this.i18n.getI18Value('form.servicio.days.label'),
        minimum: 0,
        ui: { precision: 0 } as SFNumberWidgetSchema
      },
      time: {
        type: 'string',
        title: this.i18n.getI18Value('form.servicio.time.label'),
        ui: {
          widget: 'time',
          format: `HH:mm`,
          displayFormat: `HH:mm`,
          disabledSeconds: () => [0, 30]
        } as SFTimeWidgetSchema
      },
      encargado: {
        type: 'string',
        title: this.i18n.getI18Value('form.servicio.encargado.label'),
        ui: {
          widget: 'select',
          serverSearch: true,
          searchDebounceTime: 300,
          searchLoadingText: this.i18n.getI18Value('form.search.loading'),
          onSearch: q => {
            if (typeof q === 'number') {
              this.itemsloading++;
            }
            return lastValueFrom(
              (typeof q === 'number'
                ? this.PersonalService.get(q).pipe(
                    toArray(),
                    tap(() => {
                      this.itemsloading--;
                    })
                  )
                : this.PersonalService.search(q)
              ).pipe(map(res => res.map(i => ({ label: `${i.nombre} ${i.apellido}`, value: i.id }) as SFSchemaEnum)))
            );
          }
        } as SFSelectWidgetSchema
      },
      productos: {
        type: 'string',
        title: this.i18n.getI18Value('form.servicio.productos.label'),
        ui: {
          widget: 'select',
          mode: 'multiple',
          serverSearch: true,
          searchDebounceTime: 300,
          searchLoadingText: this.i18n.getI18Value('form.search.loading'),
          onSearch: q => {
            if (Array.isArray(q) && !q.length) return [];
            if (Array.isArray(q)) {
              this.itemsloading++;
            }
            return lastValueFrom(
              (Array.isArray(q)
                ? this.productService.getProductsByIds(q).pipe(
                    tap(() => {
                      this.itemsloading--;
                    })
                  )
                : this.productService.search(q)
              ).pipe(map(res => res.map(i => ({ label: `${i.nombre} (${i.sku})`, value: i.id }) as SFSchemaEnum)))
            );
          }
        } as SFSelectWidgetSchema
      }
    },
    ui: {
      spanLabel: 8
    }
  };

  get data() {
    if (!this.formData) return;

    if (!this.formatedFormData) {
      this.formatedFormData = this.formData;
      const time = this.formData.tiempo_est?.split(' ') ?? ['0', '00:00'];

      if (time.length == 2) {
        this.formatedFormData['dias'] = Number(time[0]);
        this.formatedFormData['time'] = time[1];
      } else if (time.length == 1) {
        this.formatedFormData['time'] = time[0];
      }
    }

    return this.formatedFormData;
  }

  formSubmit(values: any) {
    const servicio: INoIdServicio = {
      ...values,
      tiempo_est: `${values.dias ?? '0'} ${values.time}`,
      precio: String(values.precio)
    };

    this.submit.emit(servicio);
  }
}
