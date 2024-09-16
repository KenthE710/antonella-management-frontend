import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, SettingsService, _HttpClient } from '@delon/theme';
import { IServicioRealizadoAll } from '@service/services/schemas/servicio_realizado.schema';
import { ServicioRealizadoService } from '@service/services/servicio_realizado.service';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ServicioRealizadoViewComponent } from './view.component';

@Component({
  selector: 'servicio-realizado-table',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    <page-header />
    <nz-card [nzBordered]="false">
      <div class="an-btn-filter-container">
        <button nz-button nzType="primary" (click)="export()">{{ 'btn.Export' | i18n }}</button>
        <button nz-button nzType="default" (click)="st.reset()">{{ 'btn.filter.reset' | i18n }}</button>
      </div>

      <st #st [data]="url" [columns]="columns" responsiveHideHeaderFooter />
    </nz-card>
  `
})
export class ServicioRealizadoTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly settingsService = inject(SettingsService);
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
    //{ title: '', index: 'id.value', type: 'checkbox' },
    { title: 'No', type: 'number', index: 'row_number', className: 'text-center', width: 'fit-conent' },
    {
      title: this.i18n.getI18Value('form.servicio_realizado.servicio.label'),
      index: 'servicio',
      format(item, col, index) {
        return item.servicio.nombre;
      },
      filter: { type: 'keyword' }
    },
    {
      title: this.i18n.getI18Value('form.servicio_realizado.client.label'),
      index: 'cliente',
      format(item, col, index) {
        return `${item.cliente.nombre} ${item.cliente.apellido}`;
      },
      filter: { type: 'keyword' }
    },
    {
      title: {
        i18n: 'form.servicio_realizado.date.label'
      },
      index: 'fecha',
      type: 'date',
      filter: {
        type: 'date',
        date: {
          range: true
        },
        reName(list, col) {
          if (list.length === 0 || !Array.isArray(list[0].value) || list[0].value.length < 2) return {};
          const value: Date[] = list[0].value;

          return { fecha_inicio: value[0].toISOString(), fecha_fin: value[1].toISOString() };
        }
      }
    },
    {
      title: this.i18n.getI18Value('form.servicio_realizado.paid.label'),
      index: 'pagado',
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
      },
      filter: {
        multiple: false,
        menus: [
          { text: this.i18n.getI18Value('form.servicio_realizado.finish.yes.label'), value: true },
          { text: this.i18n.getI18Value('form.servicio_realizado.finish.no.label'), value: false }
        ]
      }
    },
    {
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'close-circle',
          type: 'del',
          iif: rec => rec.finalizado,
          pop: {
            title: this.i18n.getI18Value('popup.servicio_realizado.change_state.unfinish'),
            okType: 'primary',
            icon: 'warning'
          },
          click: (record: IServicioRealizadoAll, _modal, comp) => {
            this.st.loading = true;
            this.ServicioRealizadoService.update_finalizado_batch(false, [record.id]).subscribe({
              complete: () => {
                this.msg.success(this.i18n.getI18Value('table.notification.servicio_realizado.change_state.unfinish'));
                this.st.loading = false;
                comp!.reload();
              },
              error: err => {
                this.msg.warning(
                  formatErrorMsg(this.i18n.getI18Value('table.notification.servicio_realizado.change_state.unfinish.error'), err)
                );
                this.st.loading = false;
              }
            });
          }
        },
        {
          icon: 'check-circle',
          type: 'del',
          iif: rec => !rec.finalizado,
          pop: {
            title: this.i18n.getI18Value('popup.servicio_realizado.change_state.finish'),
            okType: 'primary',
            icon: 'warning'
          },
          click: (record: IServicioRealizadoAll, _modal, comp) => {
            this.st.loading = true;
            this.ServicioRealizadoService.update_finalizado_batch(true, [record.id]).subscribe({
              complete: () => {
                this.msg.success(this.i18n.getI18Value('table.notification.servicio_realizado.change_state.finish'));
                this.st.loading = false;
                comp!.reload();
              },
              error: err => {
                this.msg.warning(
                  formatErrorMsg(this.i18n.getI18Value('table.notification.servicio_realizado.change_state.finish.error'), err)
                );
                this.st.loading = false;
              }
            });
          }
        },
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
          iif: () => {
            return this.isAdmin;
          },
          pop: {
            title: this.i18n.getI18Value('popup.msg.confirm-delete'),
            okType: 'danger',
            icon: 'warning'
          },
          click: (record: IServicioRealizadoAll, _modal, comp) => {
            this.st.loading = true;
            this.ServicioRealizadoService.delete(record.id).subscribe({
              complete: () => {
                this.msg.success(this.i18n.getI18ValueTemplate('table.notification.row.deleted', record.servicio.nombre));
                this.st.loading = false;
                comp!.removeRow(record);
                comp!.reload();
              },
              error: err => {
                this.msg.warning(
                  formatErrorMsg(this.i18n.getI18ValueTemplate('table.notification.row.deleted.error', record.servicio.nombre), err)
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
    return BACKEND_API.services.servicio_realizado.grid.url();
  }

  get isAdmin() {
    return this.settingsService.user?.admin ?? false;
  }

  export() {
    this.st.filteredData.subscribe(data => {
      this.st.export(data);
    });
  }
}
