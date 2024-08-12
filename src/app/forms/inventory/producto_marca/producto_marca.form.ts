import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule } from '@delon/form';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { INoIdProductoMarca } from '@service/inventory/product/schemas';

@Component({
  selector: 'producto-marca-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf
    #sf
    [schema]="schema"
    [mode]="productoMarcaFormData ? 'edit' : 'default'"
    [formData]="productoMarcaFormData"
    (formSubmit)="formSubmit($event)"
  />`
})
export class ProductoMarcaFormComponent {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input() productoMarcaFormData?: INoIdProductoMarca;
  @Output() private readonly productoMarcaSubmit = new EventEmitter<INoIdProductoMarca>();

  schema: SFSchema = {
    properties: {
      nombre: {
        type: 'string',
        title: this.i18n.getI18Value('form.product_brand.name.label'),
        maxLength: 50
      }
    }
  };

  formSubmit(values: any) {
    this.productoMarcaSubmit.emit(values);
  }
}
