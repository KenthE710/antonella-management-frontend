import { Component, inject, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { SFSchema, DelonFormModule, SFLayout } from '@delon/form';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { INoIdProductoMarca } from '@service/inventory/product/schemas';

@Component({
  selector: 'producto-marca-form',
  standalone: true,
  imports: [DelonFormModule],
  template: ` <sf #sf [schema]="schema" [formData]="productoMarcaFormData" (formSubmit)="formSubmit($event)" [layout]="layout" />`
})
export class ProductoMarcaFormComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input() productoMarcaFormData?: INoIdProductoMarca;
  @Output() private readonly productoMarcaSubmit = new EventEmitter<INoIdProductoMarca>();

  layout: SFLayout = 'horizontal';

  schema: SFSchema = {
    properties: {
      nombre: {
        type: 'string',
        title: this.i18n.getI18Value('form.product_brand.name.label'),
        maxLength: 50
      }
    }
  };

  ngOnInit(): void {
    if (this.productoMarcaFormData) {
      this.layout = 'vertical';
    }
  }

  formSubmit(values: any) {
    this.productoMarcaSubmit.emit(values);
  }
}
