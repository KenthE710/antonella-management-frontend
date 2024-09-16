import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProductoMarcaFormComponent } from '@forms';
import { INoIdProductoMarca, IProductoMarca } from '@service/inventory/product/schemas';
import { ProductoMarcaService } from '@service/inventory/producto-marca/producto-marca.service';
import { formatErrorMsg, getChangedValues } from '@shared';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'producto-marca-edit-form',
  imports: [ProductoMarcaFormComponent, NzSpinModule],
  standalone: true,
  template: `
    @if (productoMarca) {
      <producto-marca-form [productoMarcaFormData]="productoMarca" (productoMarcaSubmit)="submit($event)" />
    } @else {
      <nz-spin [nzSpinning]="true" />
    }
  `
})
export class EditProductoMarcaFormComponent implements OnInit {
  private readonly ref = inject(NzDrawerRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly productoMarcaService = inject(ProductoMarcaService);

  @Input({ required: true }) private readonly id!: number;
  @Input() onUpdated?: (productoMarca: IProductoMarca) => void;

  productoMarca?: IProductoMarca;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto marca');
      this.msg.warning(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }
    try {
      this.productoMarcaService.getProductoMarca(this.id).subscribe({
        next: _marca => {
          this.productoMarca = _marca;
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.product_brand.individual.get.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.product_brand.individual.get.error'), err));
    }
  }

  submit(productoMarca: INoIdProductoMarca) {
    try {
      const update_data = getChangedValues(this.productoMarca, productoMarca);

      if (Object.keys(update_data).length === 0) {
        this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
        return;
      }

      this.productoMarcaService.updateProductoMarca(this.id, update_data).subscribe({
        next: _marca => {
          this.msg.success(this.i18n.getI18Value('services.product_brand.update.success'));
          this.productoMarca = _marca;
          this.onUpdated?.(_marca);
          this.ref.close();
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.product_brand.update.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.product_brand.individual.update.error'), err));
    }
  }
}
