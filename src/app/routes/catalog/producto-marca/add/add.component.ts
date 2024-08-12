import { Component, inject, Input } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProductoMarcaFormComponent } from '@forms';
import { INoIdProductoMarca, IProductoMarca } from '@service/inventory/product/schemas';
import { ProductoMarcaService } from '@service/inventory/producto-marca/producto-marca.service';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'producto-marca-add-form',
  imports: [ProductoMarcaFormComponent],
  standalone: true,
  template: `<producto-marca-form (productoMarcaSubmit)="submit($event)" />`
})
export class AddProductoMarcaFormComponent {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly productoMarcaService = inject(ProductoMarcaService);

  @Input() onCreated?: (productoMarca: IProductoMarca) => void;

  submit(productoMarca: INoIdProductoMarca) {
    try {
      this.productoMarcaService.createProductoMarca(productoMarca).subscribe({
        next: _marca => {
          this.msg.success(this.i18n.getI18Value('services.product_brand.create.success'));
          this.onCreated?.(_marca);
          this.modal.destroy();
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.product_brand.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.product_brand.create.try'), err));
    }
  }
}
