import { Component, inject, Output, EventEmitter, Input, ViewChild, OnInit } from '@angular/core';
import { I18NService } from '@core';
import {
  SFSchema,
  DelonFormModule,
  SFNumberWidgetSchema,
  SFSelectWidgetSchema,
  SFSchemaEnum,
  SFComponent,
  SFArrayWidgetSchema
} from '@delon/form';
import { SFTimeWidgetSchema } from '@delon/form/widgets/time';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ClienteService } from '@service/customers/cliente/cliente.service';
import { ProductService } from '@service/inventory/product/producto.service';
import { INoIdServicio } from '@service/services/schemas/servicio.schema';
import { IBaseServicioRealizado } from '@service/services/schemas/servicio_realizado.schema';
import { ServicioService } from '@service/services/servicio.service';
import { ServicioRealizadoService } from '@service/services/servicio_realizado.service';
import { PersonalService } from '@service/staff/personal.service';
import { delay, lastValueFrom, map, switchMap, tap, toArray } from 'rxjs';

@Component({
  selector: 'servicio-realizado-form',
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
export class ServicioRealizadoFormComponent {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly servicioService = inject(ServicioService);
  private readonly clienteService = inject(ClienteService);
  private readonly PersonalService = inject(PersonalService);
  private readonly productService = inject(ProductService);
  private readonly servicioRealizadoService = inject(ServicioRealizadoService);
  @ViewChild('sf', { static: false }) private sf!: SFComponent;
  @Input() formData?: Partial<IBaseServicioRealizado>;
  @Output() private readonly submit = new EventEmitter<IBaseServicioRealizado>();

  formatedFormData?: Record<string, any>;
  itemsloading = 0;
  productos: Array<{ producto: number; cantidad: number }> = [];

  schema: SFSchema = {
    properties: {
      servicio: {
        type: 'string',
        title: this.i18n.getI18Value('form.servicio_realizado.servicio.label'),
        ui: {
          widget: 'select',
          change: (value, _data) => {
            this.itemsloading++;
            this.servicioService.get(value).subscribe(service => {
              this.itemsloading--;
              //this.productos = service.productos.map(p => ({ producto: p, cantidad: 1 }));
              this.sf.getProperty('/productos')!.setValue(
                service.productos.map(p => ({ producto: p, cantidad: 1 })),
                false
              );
            });
          },
          asyncData: () => this.servicioService.selector().pipe(map(data => data.map(pt => ({ label: pt.nombre, value: pt.id }))))
        } as SFSelectWidgetSchema
      },
      cliente: {
        type: 'string',
        title: this.i18n.getI18Value('form.servicio_realizado.client.label'),
        ui: {
          widget: 'select',
          asyncData: () =>
            this.clienteService.selector().pipe(map(data => data.map(pt => ({ label: `${pt.nombre} ${pt.apellido}`, value: pt.id }))))
        } as SFSelectWidgetSchema
      },
      fecha: {
        type: 'string',
        title: this.i18n.getI18Value('form.servicio_realizado.date.label'),
        format: 'date-time',
        ui: {
          optionalHelp: this.i18n.getI18Value('form.servicio_realizado.date.help.text')
        }
      },
      pagado: {
        type: 'number',
        title: this.i18n.getI18Value('form.servicio_realizado.paid.label'),
        minimum: 0,
        ui: {
          prefix: '$',
          precision: 2
        } as SFNumberWidgetSchema
      },
      finalizado: {
        type: 'boolean',
        title: this.i18n.getI18Value('form.servicio_realizado.finish.label')
      },
      productos: {
        type: 'array',
        title: this.i18n.getI18Value('form.servicio_realizado.products.label'),
        items: {
          type: 'object',
          properties: {
            producto: {
              type: 'string',
              title: this.i18n.getI18Value('form.servicio_realizado.product.label'),
              ui: {
                widget: 'select',
                asyncData: () =>
                  this.productService
                    .getProductoSelector()
                    .pipe(map(data => data.map(pt => ({ label: `${pt.nombre} (${pt.sku})`, value: pt.id }))))
              } as SFSelectWidgetSchema
            },
            cantidad: {
              type: 'number',
              title: this.i18n.getI18Value('form.servicio_realizado.qty.label'),
              minimum: 1,
              ui: {
                precision: 0
              } as SFNumberWidgetSchema
            }
          }
        },
        ui: { grid: { arraySpan: 24 } } as SFArrayWidgetSchema
      }
    },
    ui: {
      spanLabel: 8
    }
  };

  get data() {
    //if (!this.formData) return;
    return this.formData;
  }

  formSubmit(values: any) {
    const data: IBaseServicioRealizado = {
      ...values,
      pagado: String(values.pagado)
    };

    this.submit.emit(data);
  }
}
