import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule, SFSelectWidgetSchema, SFNumberWidgetSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { INoIdLote } from '@service/inventory/lote/schemas/lote.schema';
import { ProductService } from '@service/inventory/product/producto.service';
import { map } from 'rxjs';

@Component({
  selector: 'lote-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf #sf [schema]="schema" [mode]="formData ? 'edit' : 'default'" [formData]="formData" (formSubmit)="formSubmit($event)" />`
})
export class LoteFormComponent {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly productService = inject(ProductService);

  @Input() formData?: INoIdLote;
  @Output() private readonly submit = new EventEmitter<INoIdLote>();

  schema: SFSchema = {
    properties: {
      producto: {
        type: 'string',
        title: this.i18n.getI18Value('form.lote.product.label'),
        ui: {
          widget: 'select',
          asyncData: () =>
            this.productService
              .getProductoSelector()
              .pipe(map(data => data.map(pt => ({ label: `${pt.nombre} (${pt.sku})`, value: pt.id }))))
        } as SFSelectWidgetSchema
      },
      fe_compra: {
        type: 'string',
        title: this.i18n.getI18Value('form.lote.purchase_date.label'),
        format: 'date-time'
      },
      fe_exp: {
        type: 'string',
        title: this.i18n.getI18Value('form.lote.exp_date.label'),
        format: 'date-time'
      },
      cant: {
        type: 'number',
        title: this.i18n.getI18Value('form.lote.qty.label'),
        minimum: 1,
        ui: {
          precision: 0
        } as SFNumberWidgetSchema
      },
      costo: {
        type: 'number',
        title: this.i18n.getI18Value('form.lote.cost.label'),
        minimum: 0,
        ui: {
          prefix: '$',
          precision: 2,
          optional: `(${this.i18n.getI18Value('form.optional.unit.label')})`
        } as SFNumberWidgetSchema
      }
    }
  };

  formSubmit(values: any) {
    const lote: INoIdLote = {
      ...values,
      costo: String(values.costo)
    };
    this.submit.emit(lote);
  }
}
