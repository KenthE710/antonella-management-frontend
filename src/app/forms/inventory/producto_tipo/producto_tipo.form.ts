import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule } from '@delon/form';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { IProductoTipo } from '@service/inventory/product/schemas';

@Component({
  selector: 'producto-tipo-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf
    #sf
    [schema]="schema"
    [mode]="productoTipoFormData ? 'edit' : 'default'"
    [formData]="productoTipoFormData"
    (formSubmit)="formSubmit($event)"
  />`
})
export class ProductoTipoFormComponent {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input() productoTipoFormData?: IProductoTipo;
  @Output() private readonly productoTipoSubmit = new EventEmitter<IProductoTipo>();

  schema: SFSchema = {
    properties: {
      nombre: {
        type: 'string',
        title: this.i18n.getI18Value('form.product_type.name.label'),
        maxLength: 50
      },
      descripcion: {
        type: 'string',
        title: this.i18n.getI18Value('form.product_type.description.label'),
        maxLength: 225
      }
    }
  };

  formSubmit(values: any) {
    this.productoTipoSubmit.emit(values);
  }
}
