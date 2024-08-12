import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProductFormComponent, ProductFormData } from '@forms';
import { ProductService } from '@service/inventory/product/producto.service';
import { IProducto, ISingleProductoImg } from '@service/inventory/product/schemas';
import { formatErrorMsg } from '@shared';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'product-add-form',
  imports: [ProductFormComponent, NzSpinModule],
  standalone: true,
  template: ` <nz-spin [nzSpinning]="productoIsLoading">
    <product-form #pf (CreateOrUpdateFinish)="CreateOrUpdateFinish($event)" [productFormData]="productFormData" />
  </nz-spin>`
})
export class EditProductFormComponent implements OnInit {
  private readonly ref = inject(NzDrawerRef);
  private readonly msg = inject(NzMessageService);
  private readonly productService = inject(ProductService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input() onClose: ((producto: Partial<IProducto>) => void) | undefined;
  @Input({ required: true }) private readonly id!: number;

  @ViewChild('pf', { static: false }) private readonly productForm!: ProductFormComponent;

  productFormData: ProductFormData | undefined;
  productoIsLoading = false;

  CreateOrUpdateFinish(producto: Partial<IProducto>): void {
    this.ref.close();
    this.onClose?.(producto);
  }

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto');
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    this.productoIsLoading = true;

    combineLatest([this.productService.getProducto(this.id), this.productService.getProductoImg(this.id)])
      .pipe(map(([prod, prodImg]) => ({ prod, prodImg })))
      .subscribe({
        next: ({ prod, prodImg }) => {
          this.productFormData = prod;

          for (const img of prodImg) {
            const imgFile: NzUploadFile<ISingleProductoImg> = {
              uid: img.id.toString(),
              status: 'done',
              name: img.name || 'Sin Nombre',
              url: img.url,
              response: img
            };

            if (img.is_cover) {
              this.productForm.addCover(imgFile);
            } else {
              this.productForm.addImgFile(imgFile);
            }
          }
        },
        error: (err: Error) => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.product.get.one.error'), err));
          this.productoIsLoading = false;
        },
        complete: () => {
          this.productoIsLoading = false;
        }
      });
  }
}
