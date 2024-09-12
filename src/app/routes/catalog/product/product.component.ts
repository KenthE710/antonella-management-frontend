import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STChange, STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, SettingsService, _HttpClient } from '@delon/theme';
import { ProductService } from '@service/inventory/product/producto.service';
import { SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CreateProductFormComponent } from './add/add.component';
import { EditProductFormComponent } from './edit/edit.component';
import { ViewProductComponent } from './view/view.component';

@Component({
  selector: 'app-catalog-product',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './product.component.html'
})
export class CatalogProductComponent implements OnInit {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly settingsService = inject(SettingsService);
  private readonly productService = inject(ProductService);

  @ViewChild('st') private readonly st!: STComponent;

  table_loading: boolean | null = null;
  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: 'número de serie'
      }
    }
  };
  columns: STColumn[] = [
    { title: 'No', type: 'number', index: 'row_number' },
    {
      title: {
        i18n: 'table.product.cover.label'
      },
      type: 'img',
      width: 100,
      index: 'cover',
      exported: false
    },
    {
      title: {
        i18n: 'table.product.name.label'
      },
      index: 'nombre',
      filter: {
        type: 'keyword'
      }
    },
    {
      title: {
        i18n: 'table.product.sku.label'
      },
      index: 'sku',
      filter: {
        type: 'keyword'
      }
    },
    {
      title: {
        i18n: 'table.product.type.label'
      },
      index: 'tipo',
      filter: {
        type: 'keyword'
      }
    },
    {
      title: {
        i18n: 'table.product.has_stock.label'
      },
      index: 'status',
      type: 'badge',
      badge: {
        0: { text: this.i18n.getI18Value('table.product.has_stock.badge.dont_have_stock.label'), color: 'error' },
        1: { text: this.i18n.getI18Value('table.product.has_stock.badge.have_stock.label'), color: 'success' }
      },
      filter: {
        menus: [
          { text: this.i18n.getI18Value('table.product.has_stock.badge.dont_have_stock.label'), value: false },
          { text: this.i18n.getI18Value('table.product.has_stock.badge.have_stock.label'), value: true }
        ],
        multiple: false
      }
    }
    /* {
      title: {
        i18n: 'table.product.existencias.label',
        optionalHelp: this.i18n.getI18Value('table.product.existencias.optionalHelp.label')
      },
      index: 'existencias',
      type: 'number'
    },
    {
      title: {
        i18n: 'table.product.usos_restantes.label',
        optionalHelp: this.i18n.getI18Value('table.product.usos_restantes.optionalHelp.label')
      },
      index: 'usos_restantes',
      type: 'number'
    } */
  ];

  add(): void {
    this.modal
      .create(
        CreateProductFormComponent,
        {
          onClose: () => {
            this.st.reload();
          }
        },
        {
          modalOptions: {
            nzTitle: this.i18n.getI18Value('modal.product.title')
          }
        }
      )
      .subscribe();
  }

  get url() {
    return BACKEND_API.inventory.product.grid.url();
  }

  get isAdmin() {
    return this.settingsService.user?.admin ?? false;
  }

  export() {
    this.st.filteredData.subscribe(data => {
      this.st.export(data);
    });
  }

  ngOnInit(): void {
    this.columns.push({
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'eye',
          type: 'modal',
          modal: {
            component: ViewProductComponent,
            modalOptions: {
              nzTitle: this.i18n.getI18Value('view.product.title')
            },
            params: rec => ({
              id: rec.id
            })
          }
        },
        {
          icon: 'edit',
          type: 'drawer',
          iif: () => {
            return this.isAdmin;
          },
          drawer: {
            component: EditProductFormComponent,
            drawerOptions: {
              nzTitle: this.i18n.getI18Value('drawer.product.title'),
              nzWidth: '35%',
              nzOnCancel: async () => {
                this.st.reload();
              }
            },
            paramsName: 'productoData',
            params: rec => ({
              id: rec.id,
              onClose: () => {
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
          click: (record, _modal, comp) => {
            this.table_loading = true;
            this.productService.deleteProducto(record.id).subscribe({
              complete: () => {
                this.msg.success(this.i18n.getI18ValueTemplate('table.notification.row.deleted', record.nombre));
                comp!.removeRow(record);
                comp!.reload();
                this.table_loading = false;
              },
              error: err => {
                this.msg.error(this.i18n.getI18ValueTemplate('table.notification.row.deleted.error', record.nombre));
                this.table_loading = false;
              }
            });
          }
        }
      ]
    });
  }
}
