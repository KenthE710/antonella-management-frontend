import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, _HttpClient } from '@delon/theme';
import { IProductoTipo } from '@service/inventory/product/schemas';
import { ProductoTipoService } from '@service/inventory/producto-tipo/producto-tipo.service';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AddProductoTipoFormComponent } from './add/add.component';
import { EditProductoTipoFormComponent } from './edit/edit.component';

@Component({
  selector: 'app-catalog-producto-tipo',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './producto-tipo.component.html'
})
export class CatalogProductoTipoComponent {
  private readonly http = inject(_HttpClient);
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly productoTipoService = inject(ProductoTipoService);

  @ViewChild('st') private readonly st!: STComponent;

  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号'
      }
    }
  };
  columns: STColumn[] = [
    { title: 'No', type: 'number', index: 'row_number' },
    {
      title: this.i18n.getI18Value('table.product_type.name.label'),
      index: 'nombre',
      filter: {
        type: 'keyword'
      }
    },
    {
      title: this.i18n.getI18Value('table.product_type.description.label'),
      index: 'descripcion',
      filter: {
        type: 'keyword'
      }
    },
    {
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'edit',
          type: 'drawer',
          drawer: {
            component: EditProductoTipoFormComponent,
            drawerOptions: {
              nzTitle: this.i18n.getI18Value('drawer.product_type.title'),
              nzWidth: '35%',
              nzOnCancel: async () => {
                this.st.reload();
              }
            },
            params: rec => ({
              id: rec.id,
              onProductoTipoUpdated: () => {
                this.st.reload();
              }
            })
          }
        },
        {
          icon: 'delete',
          type: 'del',
          pop: {
            title: this.i18n.getI18Value('popup.msg.confirm-delete'),
            okType: 'danger',
            icon: 'warning'
          },
          click: (record: IProductoTipo, _modal, comp) => {
            this.st.loading = true;
            this.productoTipoService.deleteProductoTipo(record.id).subscribe({
              complete: () => {
                this.msg.success(this.i18n.getI18ValueTemplate('table.notification.row.deleted', record.nombre));
                this.st.loading = false;
                comp!.removeRow(record);
                comp!.reload();
              },
              error: err => {
                this.msg.error(formatErrorMsg(this.i18n.getI18ValueTemplate('table.notification.row.deleted.error', record.nombre), err));
                this.st.loading = false;
              }
            });
          }
        }
      ]
    }
  ];

  get url() {
    return BACKEND_API.inventory.producto_tipo.grid.url();
  }
  add(): void {
    this.modal
      .create(
        AddProductoTipoFormComponent,
        {
          onProductoTipoCreated: () => {
            this.st.reload();
          }
        },
        {
          modalOptions: {
            nzTitle: this.i18n.getI18Value('modal.product_type.title')
          }
        }
      )
      .subscribe();
  }

  export() {
    this.st.filteredData.subscribe(data => {
      this.st.export(data);
    });
  }
}
