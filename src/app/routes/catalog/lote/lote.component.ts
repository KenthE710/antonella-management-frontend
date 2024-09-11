import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, _HttpClient } from '@delon/theme';
import { LoteService } from '@service/inventory/lote/lote.service';
import { ILote, ILoteAll } from '@service/inventory/lote/schemas/lote.schema';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AddLoteFormComponent } from './add/add.component';
import { EditLoteFormComponent } from './edit/edit.component';
import { ViewLoteComponent } from './view/view.component';

@Component({
  selector: 'lote-table',
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

      <ng-template #numberRange let-f let-col="col" let-handle="handle">
        <nz-space nzDirection="vertical" style="width: 100%">
          <nz-input-number-group *nzSpaceItem style="width: 100%" [nzPrefix]="f.customData!.prefix!">
            <nz-input-number placeholder="Min" (ngModelChange)="handle.manual()" [nzPrecision]="f.customData!.precision" />
          </nz-input-number-group>
        </nz-space>
      </ng-template>
    </nz-card>
  `
})
export class LoteTableComponent implements OnInit {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly loteService = inject(LoteService);

  @ViewChild('numberRange', { static: true }) readonly numberRange!: TemplateRef<any>;
  @ViewChild('st') readonly st!: STComponent;

  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号'
      }
    }
  };
  columns: STColumn[] = [];

  ngOnInit(): void {
    this.columns = [
      { title: 'No', type: 'number', index: 'row_number' },
      {
        title: {
          i18n: 'table.lote.product.label'
        },
        index: 'producto',
        format: (item, col, index) => {
          return `${item.producto.nombre} (${item.producto.sku})`;
        },
        filter: {
          type: 'keyword'
        }
      },
      {
        title: {
          i18n: 'table.lote.badge.label'
        },
        index: 'state',
        type: 'badge',
        width: '100px',
        badge: {
          0: { text: this.i18n.getI18Value('table.lote.badge.disponible.label'), color: 'success' },
          1: { text: this.i18n.getI18Value('table.lote.badge.consumed.label'), color: 'error' },
          2: { text: this.i18n.getI18Value('table.lote.badge.retired.label'), color: 'warning' },
          3: { text: this.i18n.getI18Value('table.lote.badge.expired.label'), color: 'warning' }
        },
        filter: {
          multiple: true,
          menus: [
            { text: this.i18n.getI18Value('table.lote.badge.disponible.label'), value: 0 },
            { text: this.i18n.getI18Value('table.lote.badge.consumed.label'), value: 1 },
            { text: this.i18n.getI18Value('table.lote.badge.retired.label'), value: 2 },
            { text: this.i18n.getI18Value('table.lote.badge.expired.label'), value: 3 }
          ]
        }
      },
      {
        title: { i18n: 'table.lote.purchase_date.label' },
        index: 'fe_compra',
        type: 'date',
        filter: {
          type: 'date',
          date: {
            range: true
          },
          reName(list, col) {
            if (list.length === 0 || !Array.isArray(list[0].value) || list[0].value.length < 2) return {};
            const value: Date[] = list[0].value;

            return { fe_compra_inicio: value[0].toISOString(), fe_compra_fin: value[1].toISOString() };
          }
        }
      },
      {
        title: { i18n: 'table.lote.exp_date.label' },
        index: 'fe_exp',
        type: 'date',
        filter: {
          type: 'date',
          date: {
            range: true
          },
          reName(list, col) {
            if (list.length === 0 || !Array.isArray(list[0].value) || list[0].value.length < 2) return {};
            const value: Date[] = list[0].value;

            return { fe_exp_inicio: value[0].toISOString(), fe_exp_fin: value[1].toISOString() };
          }
        }
      },
      {
        title: { i18n: 'table.lote.qty.label' },
        index: 'cant',
        filter: {
          type: 'number',
          placeholder: this.i18n.getI18Value('form.lote.qty.label'),
          number: {
            min: 1,
            precision: 0
          }
        }
      },
      {
        title: {
          i18n: 'table.lote.cost.label'
        },
        index: 'costo',
        type: 'currency',
        currency: { format: { ngCurrency: { display: 'symbol', currencyCode: 'USD' } } },
        filter: {
          type: 'number',
          placeholder: this.i18n.getI18Value('form.lote.cost.label'),
          number: {
            min: 0,
            precision: 2
          }
        }
      },
      {
        title: {
          i18n: 'table.column.accion'
        },
        buttons: [
          {
            icon: 'eye',
            type: 'modal',
            modal: {
              component: ViewLoteComponent,
              modalOptions: {
                nzTitle: this.i18n.getI18Value('view.lote.title')
              },
              params: rec => ({
                id: rec.id
              })
            }
          },
          {
            icon: 'edit',
            type: 'drawer',
            drawer: {
              component: EditLoteFormComponent,
              drawerOptions: {
                nzTitle: this.i18n.getI18Value('drawer.lote.title'),
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
            pop: {
              title: this.i18n.getI18Value('popup.msg.confirm-delete'),
              okType: 'danger',
              icon: 'warning'
            },
            click: (record: ILoteAll, _modal, comp) => {
              this.st.loading = true;
              this.loteService.delete(record.id).subscribe({
                complete: () => {
                  //TODO: Implementar mensaje al eliminar el registro
                  this.msg.success(
                    this.i18n.getI18ValueTemplate(
                      'table.notification.row.deleted',
                      `Lote de ${record.producto.nombre} (${record.producto.sku})`
                    )
                  );
                  this.st.loading = false;
                  comp!.removeRow(record);
                  comp!.reload();
                },
                error: err => {
                  this.msg.error(
                    formatErrorMsg(
                      this.i18n.getI18ValueTemplate(
                        'table.notification.row.deleted.error',
                        `Lote de ${record.producto.nombre} (${record.producto.sku})`
                      ),
                      err
                    )
                  );
                  this.st.loading = false;
                }
              });
            }
          }
        ]
      }
    ];
  }

  get url() {
    return BACKEND_API.inventory.lote.grid.url();
  }
  add(): void {
    this.modal
      .create(
        AddLoteFormComponent,
        {
          onCreated: () => {
            this.st.reload();
          }
        },
        {
          modalOptions: {
            nzTitle: this.i18n.getI18Value('modal.lote.title')
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
