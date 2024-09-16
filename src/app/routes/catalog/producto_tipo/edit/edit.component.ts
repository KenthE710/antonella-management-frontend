import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProductoTipoFormComponent } from '@forms';
import { IProductoTipo } from '@service/inventory/product/schemas';
import { ProductoTipoService } from '@service/inventory/producto-tipo/producto-tipo.service';
import { formatErrorMsg, getChangedValues } from '@shared';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'producto-tipo-edit-form',
  imports: [ProductoTipoFormComponent, NzSpinModule],
  standalone: true,
  template: `
    @if (productoTipo) {
      <producto-tipo-form [productoTipoFormData]="productoTipo" (productoTipoSubmit)="submit($event)" />
    } @else {
      <nz-spin [nzSpinning]="true" />
    }
  `
})
export class EditProductoTipoFormComponent implements OnInit {
  private readonly ref = inject(NzDrawerRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly productoTipoService = inject(ProductoTipoService);

  @Input({ required: true }) private readonly id!: number;
  @Input() onProductoTipoUpdated?: (productoTipo: IProductoTipo) => void;

  productoTipo?: IProductoTipo;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto tipo');
      this.msg.warning(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }
    try {
      this.productoTipoService.getProductoTipo(this.id).subscribe({
        next: _tipo => {
          this.productoTipo = _tipo;
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.product_type.individual.get.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.product_type.individual.get.error'), err));
    }
  }

  submit(productoTipo: IProductoTipo) {
    try {
      const update_data = getChangedValues(this.productoTipo, productoTipo);

      if (Object.keys(update_data).length === 0) {
        this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
        return;
      }

      this.productoTipoService.updateProductoTipo({ ...update_data, id: this.id! }).subscribe({
        next: _tipo => {
          this.msg.success(this.i18n.getI18Value('services.product_type.update.success'));
          this.productoTipo = _tipo;
          this.onProductoTipoUpdated?.(_tipo);
          this.ref.close();
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.product_type.update.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.warning(formatErrorMsg(this.i18n.getI18Value('form.product_type.individual.update.error'), err));
    }
  }
}
