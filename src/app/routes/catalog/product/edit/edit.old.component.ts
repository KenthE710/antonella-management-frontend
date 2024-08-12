import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { SFButton, SFComponent, SFNumberWidgetSchema, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import type { SFUploadWidgetSchema } from '@delon/form/widgets/upload';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { environment } from '@env/environment';
import { ProductService } from '@service/inventory/product/producto.service';
import { IProducto, ISingleProductoImg } from '@service/inventory/product/schemas';
import { SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { catchError, combineLatest, map, of } from 'rxjs';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

@Component({
  selector: 'app-catalog-product',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './edit.component.html'
})
export class EditProductComponent implements OnInit {
  private readonly msg = inject(NzMessageService);
  private readonly productService = inject(ProductService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input({ required: true }) private readonly id!: number;
  @Input() onUpdate: (data: Partial<IProducto>) => void = () => {};
  @ViewChild('sf', { static: false }) private readonly sf!: SFComponent;

  producto: IProducto | null = null;
  productoCoverFileList: NzUploadFile[] = [];
  productoFileList: NzUploadFile[] = [];
  previewImage: string | undefined = '';
  previewVisible = false;
  productoIsLoading = true;
  formHasChange = false;

  schema: SFSchema = {
    properties: {
      tipo: {
        type: 'string',
        title: this.i18n.getI18Value('form.product.type.label'),
        ui: {
          widget: 'select',
          asyncData: () =>
            this.productService.getProductoTipoSelector().pipe(map(data => data.results.map(pt => ({ label: pt.nombre, value: pt.id }))))
        } as SFSelectWidgetSchema
      },
      marca: {
        type: 'string',
        title: this.i18n.getI18Value('form.product.brand.label'),
        ui: {
          widget: 'select',
          asyncData: () =>
            this.productService.getProductoMarcaSelector().pipe(map(data => data.results.map(pt => ({ label: pt.nombre, value: pt.id }))))
        } as SFSelectWidgetSchema
      },
      nombre: {
        type: 'string',
        title: this.i18n.getI18Value('form.product.name.label')
      },
      sku: {
        type: 'string',
        title: this.i18n.getI18Value('form.product.sku.label')
      },
      precio: { type: 'number', title: this.i18n.getI18Value('form.product.price.label'), ui: { prefix: '$' } as SFNumberWidgetSchema },
      usos_est: {
        type: 'integer',
        title: this.i18n.getI18Value('form.product.uses.label'),
        minimum: 0,
        ui: { precision: 0 } as SFNumberWidgetSchema
      },
      cover: {
        type: 'string',
        title: this.i18n.getI18Value('form.product.cover.label'),
        ui: {
          widget: 'upload',
          text: this.i18n.getI18Value('btn.upload'),
          accept: 'image/*',
          listType: 'picture',
          action: '',
          fileList: this.productoCoverFileList,
          data: {
            is_cover: true
          },
          urlReName: 'imagen',
          // TODO: Ajustar este valor.
          fileSize: 0,
          beforeUpload: () => {
            if (this.productoCoverFileList.length) {
              this.msg.warning(this.i18n.getI18Value('form.product.imgs.cover.upload.max'));
              return false;
            }
            return true;
          },
          customRequest: this.customRequest.bind(this),
          remove: this.removeImg.bind(this),
          preview: this.handlePreview.bind(this),
          change: params => {
            this.productoCoverFileList = params.fileList;
            this.uploadImgChange(params);
          }
        } as SFUploadWidgetSchema
      },
      imgs: {
        type: 'string',
        title: this.i18n.getI18Value('form.product.imgs.label'),
        ui: {
          widget: 'upload',
          text: this.i18n.getI18Value('btn.upload'),
          accept: 'image/*',
          listType: 'picture',
          multiple: true,
          action: '',
          fileList: this.productoFileList,
          data: {
            is_cover: false
          },
          urlReName: 'imagen',
          customRequest: this.customRequest.bind(this),
          remove: this.removeImg.bind(this),
          preview: this.handlePreview.bind(this),
          change: params => {
            this.productoFileList = params.fileList;
            this.uploadImgChange(params);
          }
        } as SFUploadWidgetSchema
      }
    }
  };

  submitButtonOption: SFButton = {
    //edit: this.i18n.getI18Value('btn.update')
  };

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto');
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    for (const key in this.schema.properties!) {
      const property = this.schema.properties![key];
      if (property.ui && typeof property.ui == 'object') {
        property.ui.debug = !environment.production;
      }
    }

    combineLatest([this.productService.getProducto(this.id), this.productService.getProductoImg(this.id)])
      .pipe(map(([prod, prodImg]) => ({ prod, prodImg })))
      .subscribe({
        next: ({ prod, prodImg }) => {
          this.producto = prod;

          for (const key in this.schema.properties!) {
            const default_val = prod[key as keyof IProducto];
            if (default_val) {
              this.schema.properties![key].default = default_val;
              continue;
            }
          }

          for (const img of prodImg) {
            const imgFile: NzUploadFile<ISingleProductoImg> = {
              uid: img.id.toString(),
              status: 'done',
              name: img.name || 'Sin Nombre',
              url: img.url,
              response: img
            };

            if (img.is_cover) {
              this.productoCoverFileList.push(imgFile);
            } else {
              this.productoFileList.push(imgFile);
            }

            /* const property = this.schema.properties![img.is_cover ? 'cover' : 'imgs'];
            property.enum = [];
            if (!property.enum) {
              property.enum = [];
            }
            property.enum.push(imgFile); */
          }
        },
        error: (err: Error) => {
          const i18n_msg = this.i18n.getI18Value('services.product.get.one.error');
          this.msg.error(environment.production ? i18n_msg : `i18n_msg: ${err.message}`);
          this.productoIsLoading = false;
          this.sf.disabled = true;
        },
        complete: () => {
          this.productoIsLoading = false;
          this.sf.refreshSchema();
        }
      });
  }

  formChange() {
    this.formHasChange = true;
  }

  update(value: any) {
    if (!this.producto) {
      throw new Error(this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Producto'));
    }

    if (!this.formHasChange) {
      this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
    }

    const new_data = this.getChangedValues(this.producto, value);
    if (Object.keys(new_data).length === 0) {
      return;
    }
    this.productService.updateProducto(this.producto.id, new_data).subscribe({
      next: prod => {
        this.producto = prod;
      },
      complete: () => {
        this.msg.success(this.i18n.getI18Value('services.product.update.success'));
        this.onUpdate(this.producto!);
      },
      error: err => {
        const errMsg = this.i18n.getI18Value('services.product.update.error');
        this.msg.error(environment.production ? errMsg : `${errMsg}: ${JSON.stringify(err?.error)}`);
      }
    });
  }

  removeImg(file: NzUploadFile<ISingleProductoImg>) {
    return this.productService.deleteProductoImg(file.response.id).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  uploadImgChange({ type }: NzUploadChangeParam): void {
    switch (type) {
      case 'success':
        this.msg.success(this.i18n.getI18Value('services.producto_img.upload.success'));
        break;
      case 'error':
        this.msg.error(this.i18n.getI18Value('services.producto_img.upload.error'));
        break;
      case 'removed':
        this.msg.success(this.i18n.getI18Value('services.producto_img.delete.success'));
        break;
    }
  }

  async handlePreview(file: NzUploadFile) {
    if (!file.url && !file['preview']) {
      file['preview'] = await getBase64(file.originFileObj!);
    }

    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  }

  private getChangedValues(initialValues: Record<string, any> = {}, formValues: Record<string, any> = {}) {
    const changedValues: Record<string, any> = {};
    for (const key in initialValues) {
      if (formValues.hasOwnProperty(key) && formValues[key] !== initialValues[key]) {
        changedValues[key] = formValues[key];
      }
    }
    return changedValues;
  }

  customRequest(args: NzUploadXHRArgs) {
    return this.productService
      .uploadProductoImg({
        producto: this.id,
        imagen: args.postFile,
        is_cover: args.data?.['is_cover']
      })
      .subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total! > 0) {
              (event as any).percent = (event.loaded / event.total!) * 100;
            }
            args.onProgress!(event, args.file);
          } else if (event instanceof HttpResponse) {
            args.onSuccess!(event.body, args.file, event);
          }
        },
        error: (err: Error) => {
          args.onError!(err, args.file);
        }
      });
  }
}
