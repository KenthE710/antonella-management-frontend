import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, SettingsService, _HttpClient } from '@delon/theme';
import { IProductoMarca } from '@service/inventory/product/schemas';
import { ProductoMarcaService } from '@service/inventory/producto-marca/producto-marca.service';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AddProductoMarcaFormComponent } from './add/add.component';
import { EditProductoMarcaFormComponent } from './edit/edit.component';

@Component({
  selector: 'producto-marca-table',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    <page-header [action]="phActionTpl">
      <ng-template #phActionTpl>
        <button (click)="add()" nz-button nzType="primary">{{ 'btn.add' | i18n }}</button>
      </ng-template>
    </page-header>

    <nz-card [nzBordered]="false">
      <div class="an-btn-filter-container">
        <button nz-button (click)="export()">{{ 'btn.Export' | i18n }}</button>
        <button nz-button nzType="dashed" (click)="st.reset()">{{ 'btn.filter.reset' | i18n }}</button>
      </div>

      <st #st [data]="url" [columns]="columns" responsiveHideHeaderFooter />
    </nz-card>
  `
})
export class ProductoMarcaTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly settingsService = inject(SettingsService);
  private readonly productoMarcaService = inject(ProductoMarcaService);

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
    { title: this.i18n.getI18Value('table.product_brand.name.label'), index: 'nombre', filter: { type: 'keyword' } },
    {
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'edit',
          type: 'drawer',
          iif: () => {
            return this.isAdmin;
          },
          drawer: {
            component: EditProductoMarcaFormComponent,
            drawerOptions: {
              nzTitle: this.i18n.getI18Value('drawer.product_brand.title'),
              nzWidth: '35%',
              nzOnCancel: async () => {
                this.st.reload();
              }
            },
            params: rec => ({
              id: rec.id,
              onUpdated: () => {
                this.st.reload();
              }
            })
          }
        },
        {
          icon: 'delete',
          type: 'del',
          iif: () => {
            return this.isAdmin;
          },
          pop: {
            title: this.i18n.getI18Value('popup.msg.confirm-delete'),
            okType: 'danger',
            icon: 'warning'
          },
          click: (record: IProductoMarca, _modal, comp) => {
            this.st.loading = true;
            this.productoMarcaService.deleteProductoMarca(record.id).subscribe({
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
    return BACKEND_API.inventory.producto_marca.grid.url();
  }

  get isAdmin() {
    return this.settingsService.user?.admin ?? false;
  }

  add(): void {
    this.modal
      .create(
        AddProductoMarcaFormComponent,
        {
          onCreated: () => {
            this.st.reload();
          }
        },
        {
          modalOptions: {
            nzTitle: this.i18n.getI18Value('modal.product_brand.title')
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
