import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, _HttpClient } from '@delon/theme';
import { ClienteService } from '@service/customers/cliente/cliente.service';
import { ICliente } from '@service/customers/cliente/schemas/cliente.schema';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AddClienteFormComponent } from './add/add.component';
import { EditClienteFormComponent } from './edit/edit.component';
import { ViewClienteComponent } from './view.component';

@Component({
  selector: 'cliente-table',
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
        <button nz-button nzType="primary" (click)="export()">{{ 'btn.Export' | i18n }}</button>
        <button nz-button nzType="default" (click)="st.reset()">{{ 'btn.filter.reset' | i18n }}</button>
      </div>

      <st #st [data]="url" [columns]="columns" responsiveHideHeaderFooter />
    </nz-card>
  `
})
export class ClienteTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly clienteService = inject(ClienteService);

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
    { title: this.i18n.getI18Value('table.client.id.label'), index: 'cedula', filter: { type: 'keyword' } },
    {
      title: this.i18n.getI18Value('table.client.name.label'),
      index: 'nombre',
      filter: { type: 'keyword' },
      format(item, col, index) {
        return `${item.nombre} ${item.apellido}`;
      }
    },
    { title: this.i18n.getI18Value('table.client.email.label'), index: 'email', filter: { type: 'keyword' } },
    { title: this.i18n.getI18Value('table.client.phone.label'), index: 'telefono', filter: { type: 'keyword' } },
    {
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'eye',
          type: 'modal',
          modal: {
            component: ViewClienteComponent,
            modalOptions: {
              nzTitle: this.i18n.getI18Value('modal.client.view.title')
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
            component: EditClienteFormComponent,
            drawerOptions: {
              nzTitle: this.i18n.getI18Value('drawer.client.title'),
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
          click: (record: ICliente, _modal, comp) => {
            this.st.loading = true;
            this.clienteService.deleteCliente(record.id).subscribe({
              complete: () => {
                this.msg.success(this.i18n.getI18ValueTemplate('table.notification.row.deleted', `${record.nombre} ${record.apellido}`));
                this.st.loading = false;
                comp!.removeRow(record);
                comp!.reload();
              },
              error: err => {
                this.msg.error(
                  formatErrorMsg(
                    this.i18n.getI18ValueTemplate('table.notification.row.deleted.error', `${record.nombre} ${record.apellido}`),
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

  get url() {
    return BACKEND_API.customers.cliente.grid.url();
  }
  add(): void {
    this.modal
      .create(
        AddClienteFormComponent,
        {
          onCreated: () => {
            this.st.reload();
          }
        },
        {
          modalOptions: {
            nzTitle: this.i18n.getI18Value('modal.client.title')
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
