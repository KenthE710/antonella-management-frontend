import { Component, inject, Input } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProductoTipoFormComponent } from '@forms';
import { IProductoTipo } from '@service/inventory/product/schemas';
import { ProductoTipoService } from '@service/inventory/producto-tipo/producto-tipo.service';
import { formatErrorMsg } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'producto-tipo-add-form',
  imports: [ProductoTipoFormComponent],
  standalone: true,
  template: `<producto-tipo-form (productoTipoSubmit)="submit($event)" />`
})
export class AddProductoTipoFormComponent {
  private readonly modal = inject(NzModalRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly productoTipoService = inject(ProductoTipoService);

  @Input() onProductoTipoCreated?: (productoTipo: IProductoTipo) => void;

  submit(productoTipo: IProductoTipo) {
    try {
      this.productoTipoService.createProductoTipo(productoTipo).subscribe({
        next: _tipo => {
          this.msg.success(this.i18n.getI18Value('services.product_type.create.success'));
          this.onProductoTipoCreated?.(_tipo);
          this.modal.destroy();
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.product_type.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.product_type.create.try'), err));
    }
  }
}
