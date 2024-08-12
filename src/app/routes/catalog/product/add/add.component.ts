import { Component, inject, Input } from '@angular/core';
import { ProductFormComponent } from '@forms';
import { IProducto } from '@service/inventory/product/schemas';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'product-add-form',
  imports: [ProductFormComponent],
  standalone: true,
  template: `<product-form (CreateOrUpdateFinish)="CreateOrUpdateFinish($event)" />`
})
export class CreateProductFormComponent {
  private readonly modal = inject(NzModalRef);

  @Input() onClose?: (producto: Partial<IProducto>) => void;

  CreateOrUpdateFinish(producto: Partial<IProducto>): void {
    this.modal.destroy();
    this.onClose?.(producto);
  }
}
