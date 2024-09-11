import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, inject, Output, EventEmitter, Input, ViewChild, OnInit } from '@angular/core';
import { I18NService } from '@core';
import {
  SFSchema,
  DelonFormModule,
  SFNumberWidgetSchema,
  SFSelectWidgetSchema,
  SFSchemaEnum,
  SFComponent,
  SFLayout,
  SFTextareaWidgetSchema
} from '@delon/form';
import { SFTimeWidgetSchema } from '@delon/form/widgets/time';
import { SFUploadWidgetSchema } from '@delon/form/widgets/upload';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProductService } from '@service/inventory/product/producto.service';
import { IBaseServicioImg, INoIdServicio, IServicio } from '@service/services/schemas/servicio.schema';
import { ServicioService } from '@service/services/servicio.service';
import { ServicioImgService } from '@service/services/servicio_img.service';
import { PersonalService } from '@service/staff/personal.service';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { catchError, delay, lastValueFrom, map, of, tap, toArray } from 'rxjs';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export type ServicioFormSubmitEvent = {
  servicio: INoIdServicio;
  cover: Array<NzUploadFile<IBaseServicioImg>>;
  imgs: Array<NzUploadFile<IBaseServicioImg>>;
};

@Component({
  selector: 'servicio-form',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: ` <sf #sf [schema]="schema" [formData]="data" (formSubmit)="formSubmit($event)" [loading]="!!itemsloading" [layout]="layout" />
    <nz-modal [nzVisible]="previewVisible" [nzContent]="modalContent" [nzFooter]="null" (nzOnCancel)="previewVisible = false">
      <ng-template #modalContent>
        <img [src]="previewImage" [ngStyle]="{ width: '100%' }" />
      </ng-template>
    </nz-modal>`
})
export class ServicioFormComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly PersonalService = inject(PersonalService);
  private readonly productService = inject(ProductService);
  private readonly servicioService = inject(ServicioService);
  private readonly servicioImgService = inject(ServicioImgService);
  @ViewChild('sf', { static: false }) private sf!: SFComponent;
  @Input() formData?: IServicio;
  @Input() coverFileList: Array<NzUploadFile<IBaseServicioImg>> = [];
  @Input() imgFileList: Array<NzUploadFile<IBaseServicioImg>> = [];
  @Output() private readonly submit = new EventEmitter<ServicioFormSubmitEvent>();

  formatedFormData?: Record<string, any>;
  itemsloading = 0;
  layout: SFLayout = 'horizontal';
  previewImage: string = '';
  previewVisible = false;

  schema: SFSchema = {};

  get data() {
    if (!this.formData) return;

    if (!this.formatedFormData) {
      this.formatedFormData = this.formData;
      const time = this.formData.tiempo_est?.split(' ') ?? ['0', '00:00'];

      if (time.length == 2) {
        this.formatedFormData['dias'] = Number(time[0]);
        this.formatedFormData['time'] = time[1];
      } else if (time.length == 1) {
        this.formatedFormData['time'] = time[0];
      }
    }

    return this.formatedFormData;
  }

  ngOnInit(): void {
    if (this.formData) {
      this.layout = 'vertical';
    }

    this.schema = {
      properties: {
        nombre: {
          type: 'string',
          title: this.i18n.getI18Value('form.servicio.nombre.label'),
          maxLength: 100
        },
        descripcion: {
          type: 'string',
          title: this.i18n.getI18Value('form.servicio.descripcion.label'),
          ui: {
            widget: 'textarea',
            maxCharacterCount: 225,
            autosize: { minRows: 2, maxRows: 6 }
          } as SFTextareaWidgetSchema
        },
        estado: {
          type: 'string',
          title: this.i18n.getI18Value('form.servicio.state.label'),
          ui: {
            widget: 'select',
            asyncData: () => this.servicioService.getStates().pipe(map(data => data.map(pt => ({ label: pt.nombre, value: pt.id }))))
          } as SFSelectWidgetSchema
        },
        precio: {
          type: 'number',
          title: this.i18n.getI18Value('form.servicio.precio.label'),
          minimum: 0,
          ui: {
            prefix: '$',
            precision: 2,
            optional: `(${this.i18n.getI18Value('form.optional.unit.label')})`,
            optionalHelp: this.i18n.getI18Value('form.optionalHelp.unit.text')
          } as SFNumberWidgetSchema
        },
        dias: {
          type: 'number',
          title: this.i18n.getI18Value('form.servicio.days.label'),
          minimum: 0,
          default: 0,
          ui: {
            optionalHelp: this.i18n.getI18Value('form.servicio.days.optionalHelp.label'),
            precision: 0
          } as SFNumberWidgetSchema
        },
        time: {
          type: 'string',
          title: this.i18n.getI18Value('form.servicio.time.label'),
          ui: {
            widget: 'time',
            format: `HH:mm:ss`,
            displayFormat: `HH:mm`,
            optional: `(${this.i18n.getI18Value('form.servicio.time.optional.label')})`,
            optionalHelp: this.i18n.getI18Value('form.servicio.time.optionalHelp.label')
          } as SFTimeWidgetSchema
        },
        encargado: {
          type: 'string',
          title: this.i18n.getI18Value('form.servicio.encargado.label'),
          ui: {
            widget: 'select',
            serverSearch: true,
            searchDebounceTime: 300,
            searchLoadingText: this.i18n.getI18Value('form.search.loading'),
            onSearch: q => {
              if (typeof q === 'number') {
                this.itemsloading++;
              }
              return lastValueFrom(
                (typeof q === 'number'
                  ? this.PersonalService.get(q).pipe(
                      toArray(),
                      tap(() => {
                        this.itemsloading--;
                      })
                    )
                  : this.PersonalService.search(q)
                ).pipe(map(res => res.map(i => ({ label: `${i.nombre} ${i.apellido}`, value: i.id }) as SFSchemaEnum)))
              );
            }
          } as SFSelectWidgetSchema
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
            fileList: this.coverFileList,
            data: {
              is_cover: true
            },
            urlReName: 'imagen',
            // TODO: Ajustar este valor.
            fileSize: 0,
            beforeUpload: () => {
              if (this.coverFileList.length) {
                this.msg.warning(this.i18n.getI18Value('form.product.imgs.cover.upload.max'));
                return false;
              }
              return true;
            },
            customRequest: this.uploadImgRequest.bind(this),
            remove: this.removeImg.bind(this),
            preview: this.handlePreview.bind(this),
            change: params => {
              this.coverFileList = params.fileList;
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
            fileList: this.imgFileList,
            urlReName: 'imagen',
            customRequest: this.uploadImgRequest.bind(this),
            remove: this.removeImg.bind(this),
            preview: this.handlePreview.bind(this),
            change: params => {
              this.imgFileList = params.fileList;
              this.uploadImgChange(params);
            }
          } as SFUploadWidgetSchema
        },
        productos: {
          type: 'string',
          title: this.i18n.getI18Value('form.servicio.productos.label'),
          ui: {
            widget: 'select',
            mode: 'multiple',
            serverSearch: true,
            searchDebounceTime: 300,
            searchLoadingText: this.i18n.getI18Value('form.search.loading'),
            onSearch: q => {
              if (Array.isArray(q) && !q.length) return [];
              if (Array.isArray(q)) {
                this.itemsloading++;
              }
              return lastValueFrom(
                (Array.isArray(q)
                  ? this.productService.getProductsByIds(q).pipe(
                      tap(() => {
                        this.itemsloading--;
                      })
                    )
                  : this.productService.search(q)
                ).pipe(map(res => res.map(i => ({ label: `${i.nombre} (${i.sku})`, value: i.id }) as SFSchemaEnum)))
              );
            }
          } as SFSelectWidgetSchema
        }
      },
      ui: {
        spanLabel: 6,
        errors: {
          required: this.i18n.getI18Value('form.error.required')
        }
      },
      required: ['nombre']
    };
  }

  formSubmit(values: any) {
    const servicio: INoIdServicio = values;

    if (values.time) {
      servicio.tiempo_est = `${values.dias} ${values.time}`;
    } else if (values.dias) {
      servicio.tiempo_est = `${values.dias} 00:00:00`;
    }

    if (values.precio) {
      servicio.precio = String(values.precio);
    }

    this.submit.emit({
      servicio,
      cover: this.coverFileList,
      imgs: this.imgFileList
    });
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
    return this.servicioImgService
      .upload(args.postFile, {
        ...(args.data ?? {}),
        servicio: this.formData?.id,
        is_tmp: !this.formData
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

  removeImg(file: NzUploadFile<IBaseServicioImg>) {
    try {
      return this.servicioImgService.delete(file.response.id).pipe(
        map(() => true),
        catchError(() => of(false))
      );
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('form.product.img.remove.try'), err));
      return false;
    }
  }
}
