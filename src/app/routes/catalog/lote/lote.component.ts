import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, _HttpClient } from '@delon/theme';
import { LoteService } from '@service/inventory/lote/lote.service';
import { ILote } from '@service/inventory/lote/schemas/lote.schema';
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
    <st #st [data]="url" [columns]="columns" responsiveHideHeaderFooter />
  `
})
export class LoteTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly loteService = inject(LoteService);

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
    { title: 'No', type: 'no' },
    {
      title: {
        i18n: 'table.lote.product.label'
      },
      index: 'producto',
      format: (item, col, index) => {
        return `${item.producto.nombre} (${item.producto.sku})`;
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
      }
    },
    { title: { i18n: 'table.lote.purchase_date.label' }, index: 'fe_compra', type: 'date' },
    { title: { i18n: 'table.lote.exp_date.label' }, index: 'fe_exp', type: 'date' },
    { title: { i18n: 'table.lote.qty.label' }, index: 'cant' },
    /* {
      title: {
        i18n: 'table.lote.servicios_realizados.label',
        optionalHelp: this.i18n.getI18Value('table.lote.servicios_realizados.optionalHelp.label')
      },
      width: 'fit-content',
      index: 'servicios_Realizados',
      type: 'number'
    },
    {
      title: {
        i18n: 'table.lote.servicios_restantes.label',
        optionalHelp: this.i18n.getI18Value('table.lote.servicios_restantes.optionalHelp.label')
      },
      width: 'fit-content',
      index: 'servicios_restantes',
      type: 'number'
    }, */
    {
      title: {
        i18n: 'table.lote.cost.label'
      },
      index: 'costo',
      type: 'currency',
      currency: { format: { ngCurrency: { display: 'symbol', currencyCode: 'USD' } } }
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
          click: (record: ILote, _modal, comp) => {
            this.st.loading = true;
            this.loteService.delete(record.id).subscribe({
              complete: () => {
                //TODO: Implementar mensaje al eliminar el registro
                this.msg.success(this.i18n.getI18ValueTemplate('table.notification.row.deleted', ''));
                this.st.loading = false;
                comp!.removeRow(record);
                comp!.reload();
              },
              error: err => {
                this.msg.error(formatErrorMsg(this.i18n.getI18ValueTemplate('table.notification.row.deleted.error', ''), err));
                this.st.loading = false;
              }
            });
          }
        }
      ]
    }
  ];

  get url() {
    return BACKEND_API.inventory.lote.grid.url();
  }
  add(): void {
    this.modal
      .createStatic(
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
}
