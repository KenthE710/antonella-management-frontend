import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, inject, Input, Output, EventEmitter, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { I18NService } from '@core';
import { SFButton, SFComponent, SFLayout, SFNumberWidgetSchema, SFSchema, SFSelectWidgetSchema } from '@delon/form';
import type { SFUploadWidgetSchema } from '@delon/form/widgets/upload';
import { ALAIN_I18N_TOKEN, ModalHelper } from '@delon/theme';
import { environment } from '@env/environment';
import { ProductService } from '@service/inventory/product/producto.service';
import { IProducto, IProductoTipo, ISingleProductoImg } from '@service/inventory/product/schemas';
import { formatErrorMsg, getChangedValues, SHARED_IMPORTS } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { catchError, map, of } from 'rxjs';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export interface ProductFormData extends Partial<IProducto> {
  cover?: Array<NzUploadFile<ISingleProductoImg>>;
  imgs?: Array<NzUploadFile<ISingleProductoImg>>;
}

@Component({
  selector: 'product-form',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './product.form.html',
  styles: [
    `
      nz-divider {
        margin: 4px 0;
      }
      .container {
        display: flex;
        flex-direction: row-reverse;
        flex-wrap: nowrap;
        padding: 8px;
      }
      .add-item {
        flex: 0 0 auto;
        padding: 8px;
        display: block;
      }
    `
  ]
})
export class ProductFormComponent implements OnInit {
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(ModalHelper);
  private readonly productService = inject(ProductService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input() productFormData: ProductFormData | undefined;
  @Input() productoCoverFileList: Array<NzUploadFile<ISingleProductoImg>> = [];
  @Input() productoFileList: Array<NzUploadFile<ISingleProductoImg>> = [];
  @Output() readonly CreateOrUpdateFinish = new EventEmitter<Partial<IProducto>>();

  @ViewChild('sf', { static: false }) private readonly sf!: SFComponent;
  @ViewChild('dropdownRender', { static: true }) private dropdownRender!: TemplateRef<void>;

  layout: SFLayout = 'horizontal';
  producto?: IProducto;
  previewImage: string = '';
  previewVisible = false;
  formHasChange = false;

  schema?: SFSchema;

  submitButtonOption: SFButton = {
    //edit: this.i18n.getI18Value('btn.update')
  };

  get isEdit() {
    return !!this.productFormData;
  }

  refreshSchema() {
    this.sf.refreshSchema();
  }

  addCover(imgFile: NzUploadFile<ISingleProductoImg>) {
    if (!this.productoCoverFileList.length) {
      this.productoCoverFileList.push(imgFile);
    }
  }

  addImgFile(imgFile: NzUploadFile<ISingleProductoImg>) {
    this.productoFileList.push(imgFile);
  }

  addImgFiles(imgsFile: Array<NzUploadFile<ISingleProductoImg>>) {
    this.productoFileList.push(...imgsFile);
  }

  ngOnInit(): void {
    if (this.productFormData) {
      this.layout = 'vertical';
    }

    this.schema = {
      properties: {
        tipo: {
          type: 'string',
          title: this.i18n.getI18Value('form.product.type.label'),
          ui: {
            widget: 'select',
            dropdownRender: this.dropdownRender,
            asyncData: () =>
              this.productService
                .getProductoTipoSelector()
                .pipe(map(data => [...data.results.map(pt => ({ label: pt.nombre, value: pt.id }))]))
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
        precio: {
          type: 'number',
          title: this.i18n.getI18Value('form.product.price.label'),
          minimum: 0,
          ui: {
            prefix: '$',
            precision: 2
          } as SFNumberWidgetSchema
        },
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
            customRequest: this.uploadImgRequest.bind(this),
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
            customRequest: this.uploadImgRequest.bind(this),
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

    for (const key in this.schema.properties!) {
      const property = this.schema.properties![key];
      if (property.ui && typeof property.ui == 'object') {
        property.ui.debug = !environment.production;
      }
    }

    this.sf?.refreshSchema();
  }

  productoTipoModal() {
    /* this.modal
      .create(
        CreateProductoTipoFormComponent,
        {
          onProductoTipoCreated: (productoTipo: IProductoTipo) => {
            const statusProperty = this.sf.getProperty('/tipo')!;
            statusProperty.schema.enum?.push({ label: productoTipo.nombre, value: productoTipo.id });
            this.sf.setValue('/tipo', productoTipo.id);
          }
        },
        {
          modalOptions: {
            nzStyle: {
              padding: '24px'
            }
          }
        }
      )
      .subscribe(); */
  }

  formChange() {
    this.formHasChange = true;
  }

  formSubmit(values: Record<string, unknown>) {
    if (this.isEdit) {
      this.update(values);
    } else {
      this.create(values);
    }
  }

  create(values: Record<string, unknown>) {
    try {
      this.productService.createProducto(values as any).subscribe({
        next: producto => {
          this.producto = producto;
        },
        complete: () => {
          this.msg.success(this.i18n.getI18Value('services.product.create.success'));
          if (!this.productoCoverFileList.length && !this.productoFileList.length) {
            this.CreateOrUpdateFinish.emit(this.producto!);
          }
          this.associateImgs();
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.product.create.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.product.create.try'), err));
    }
  }

  update({ cover, imgs, ...values }: Record<string, unknown>) {
    if (!this.productFormData?.id) {
      this.msg.error(this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto'));
      return;
    }

    if (!this.formHasChange) {
      this.msg.info(this.i18n.getI18Value('form.edit.no-changes'));
    }

    const new_data = getChangedValues(this.productFormData, values);
    if (Object.keys(new_data).length === 0) {
      return;
    }

    try {
      this.productService.updateProducto(this.productFormData!.id, new_data).subscribe({
        next: producto => {
          this.producto = producto;
        },
        complete: () => {
          this.msg.success(this.i18n.getI18Value('services.product.update.success'));
          this.CreateOrUpdateFinish.emit(this.producto!);
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.product.update.error'), err));
        }
      });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.product.update.try'), err));
    }
  }

  // IMPROVE: Evitar que las imágenes anteriores (las que ya están asociadas) se vuelan a enviar
  associateImgs() {
    if (this.producto!.id && (this.productoCoverFileList.length || this.productoFileList.length)) {
      try {
        this.productService
          .associateProductoImg({
            producto_id: this.producto!.id,
            imgs_id: [...this.productoCoverFileList, ...this.productoFileList].map(_ => _.response!.id)
          })
          .subscribe({
            complete: () => {
              this.msg.success(this.i18n.getI18Value('services.producto_img.many.asociate.success'));
              this.CreateOrUpdateFinish.emit(this.producto!);
            },
            error: err => {
              this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.producto_img.many.asociate.error'), err));
            }
          });
      } catch (err: any) {
        this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.product.img.upload.try'), err));
      }
    }
  }

  removeImg(file: NzUploadFile<ISingleProductoImg>) {
    try {
      return this.productService.deleteProductoImg(file.response.id).pipe(
        map(() => true),
        catchError(() => of(false))
      );
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.product.img.remove.try'), err));
      return false;
    }
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

  uploadImgRequest(args: NzUploadXHRArgs) {
    return this.productService
      .uploadProductoImg({
        imagen: args.postFile,
        producto: this.productFormData?.id,
        is_cover: args.data?.['is_cover'],
        is_temp: this.isEdit
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
