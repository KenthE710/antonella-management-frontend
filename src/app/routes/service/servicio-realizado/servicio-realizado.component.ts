import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, _HttpClient } from '@delon/theme';
import { IServicio } from '@service/services/schemas/servicio.schema';
import { ServicioService } from '@service/services/servicio.service';
import { ServicioRealizadoService } from '@service/services/servicio_realizado.service';
import { convertirDuracionAFecha, formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ServicioRealizadoFormComponent } from 'src/app/forms/services/servicio_realizado.form';

import { ServicioRealizadoEditFormComponent } from './edit.component';
import { ServicioRealizadoViewComponent } from './view.component';

@Component({
  selector: 'servicio-realizado-table',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    <page-header />
    <st #st [data]="url" [columns]="columns" />
  `
})
export class ServicioRealizadoTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly ServicioRealizadoService = inject(ServicioRealizadoService);

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
      title: this.i18n.getI18Value('form.servicio_realizado.servicio.label'),
      index: 'servicio',
      format(item, col, index) {
        return item.servicio.nombre;
      }
    },
    {
      title: this.i18n.getI18Value('form.servicio_realizado.client.label'),
      index: 'cliente',
      format(item, col, index) {
        return `${item.cliente.nombre} - ${item.cliente.apellido}`;
      }
    },
    { title: this.i18n.getI18Value('form.servicio_realizado.date.label'), index: 'fecha', type: 'date' },
    {
      title: this.i18n.getI18Value('form.servicio_realizado.paid.label'),
      index: 'pagado',
      type: 'currency',
      currency: { format: { ngCurrency: { display: 'symbol', currencyCode: 'USD' } } }
    },
    {
      title: this.i18n.getI18Value('form.servicio_realizado.finish.label'),
      index: 'finalizado',
      type: 'badge',
      badge: {
        true: {
          text: this.i18n.getI18Value('form.servicio_realizado.finish.yes.label'),
          color: 'success'
        },
        false: {
          text: this.i18n.getI18Value('form.servicio_realizado.finish.no.label'),
          color: 'error'
        }
      }
    },
    {
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'eye',
          type: 'modal',
          modal: {
            component: ServicioRealizadoViewComponent,
            modalOptions: {
              nzTitle: this.i18n.getI18Value('view.servicio_realizado.title')
            },
            params: rec => ({
              id: rec.id
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
            this.ServicioRealizadoService.delete(record.id).subscribe({
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
        /* {
          icon: 'edit',
          type: 'drawer',
          drawer: {
            component: ServicioRealizadoEditFormComponent,
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
        } */
      ]
    }
  ];

  get url() {
    return BACKEND_API.services.servicio_realizado.grid.url();
  }
}
