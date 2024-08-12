import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, _HttpClient } from '@delon/theme';
import { IServicio } from '@service/services/schemas/servicio.schema';
import { ServicioService } from '@service/services/servicio.service';
import { convertirDuracionAFecha, formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ServicioRealizadoFormComponent } from 'src/app/forms/services/servicio_realizado.form';

import { AddServicioFormComponent } from './add.component';
import { EditServicioFormComponent } from './edit.component';
import { RealizarServicioFormComponent } from './realizar-servicio.component';

@Component({
  selector: 'servicio-table',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    <page-header [action]="phActionTpl">
      <ng-template #phActionTpl>
        <button (click)="add()" nz-button nzType="primary">{{ 'btn.add' | i18n }}</button>
      </ng-template>
    </page-header>
    <st #st [data]="url" [columns]="columns" />
  `
})
export class ServicioTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly servicioService = inject(ServicioService);

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
    { title: this.i18n.getI18Value('table.servicio.nombre.label'), index: 'nombre' },
    { title: this.i18n.getI18Value('table.servicio.descripcion.label'), index: 'descripcion', default: '-' },
    {
      title: this.i18n.getI18Value('table.servicio.badge.label'),
      index: 'status',
      type: 'badge',
      badge: {
        0: { color: 'success', text: this.i18n.getI18Value('table.servicio.badge.available.label') },
        1: {
          color: 'error',
          text: this.i18n.getI18Value('table.servicio.badge.unavailable.label'),
          tooltip: this.i18n.getI18Value('table.servicio.badge.unavailable.help.label')
        }
      },
      filter: {
        menus: [
          { text: this.i18n.getI18Value('table.servicio.badge.available.label'), value: 0 },
          { text: this.i18n.getI18Value('table.servicio.badge.unavailable.label'), value: 1 }
        ],
        fn: (filter, record) => record.status === filter
      }
    },
    {
      title: this.i18n.getI18Value('table.servicio.precio.label'),
      index: 'precio',
      type: 'currency',
      currency: { format: { ngCurrency: { display: 'symbol', currencyCode: 'USD' } } }
    },
    {
      title: this.i18n.getI18Value('table.servicio.tiempo_est.label'),
      index: 'tiempo_est'
    },
    {
      title: this.i18n.getI18Value('table.servicio.encargado.label'),
      index: 'encargado',
      format: (item, _col, _index) => {
        return item.encargado ? `${item.encargado.nombre} ${item.encargado.apellido}` : '-';
      }
    },
    {
      title: this.i18n.getI18Value('table.servicio.productos.label'),
      index: 'productos',
      format(item) {
        return item.productos.map((p: any) => `${p.nombre} (${p.sku})`).join('</br>');
      }
    },
    {
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'plus',
          type: 'modal',
          modal: {
            component: RealizarServicioFormComponent,
            modalOptions: {
              nzTitle: this.i18n.getI18Value('modal.servicio-realizado.title'),
              nzWidth: '35%',
              nzOnCancel: async () => {
                this.st.reload();
              }
            },
            paramsName: 'data'
          }
        },
        {
          icon: 'edit',
          type: 'drawer',
          drawer: {
            component: EditServicioFormComponent,
            drawerOptions: {
              nzTitle: this.i18n.getI18Value('drawer.servicio.title'),
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
          click: (record: IServicio, _modal, comp) => {
            this.st.loading = true;
            this.servicioService.delete(record.id).subscribe({
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
    return BACKEND_API.services.servicio.grid.url();
  }
  add(): void {
    this.modal
      .createStatic(
        AddServicioFormComponent,
        {
          onCreated: () => {
            this.st.reload();
          }
        },
        {
          modalOptions: {
            nzTitle: this.i18n.getI18Value('modal.servicio.title')
          }
        }
      )
      .subscribe();
  }
}
