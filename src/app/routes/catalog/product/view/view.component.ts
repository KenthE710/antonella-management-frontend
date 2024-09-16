import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18NService } from '@core';
import { SVModule } from '@delon/abc/sv';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { ProductService } from '@service/inventory/product/producto.service';
import { IProductoAll, ISingleProductoImg } from '@service/inventory/product/schemas';
import { formatErrorMsg } from '@shared';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'product-view',
  standalone: true,
  imports: [
    SVModule,
    NzButtonModule,
    NzRadioModule,
    NzToolTipModule,
    FormsModule,
    NzSpinModule,
    NzDividerModule,
    NzImageModule,
    NzGridModule,
    NzTypographyModule,
    I18nPipe
  ],
  templateUrl: './view.component.html',
  styles: `
    .img-round {
      border-radius: 5%;
    }
  `
})
export class ViewProductComponent implements OnInit {
  private readonly msg = inject(NzMessageService);
  private readonly productService = inject(ProductService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input({ required: true }) private readonly id!: number;

  producto: IProductoAll | undefined;
  cover: ISingleProductoImg | undefined;
  imgs: ISingleProductoImg[] = [];

  bordered = true;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto');
      this.msg.warning(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    combineLatest([this.productService.getProductoComplete(this.id), this.productService.getProductoImg(this.id)])
      .pipe(map(([producto, productoImg]) => ({ producto, productoImg })))
      .subscribe({
        next: ({ producto, productoImg }) => {
          this.producto = producto;

          for (const img of productoImg) {
            if (img.is_cover) {
              this.cover = img;
            } else {
              this.imgs.push(img);
            }
          }
        },
        error: err => {
          this.msg.warning(formatErrorMsg(this.i18n.getI18Value('services.product.get.one.error'), err));
        }
      });
  }
}
