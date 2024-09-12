import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STChange, STColumn, STComponent, STWidthMode } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, SettingsService, _HttpClient } from '@delon/theme';
import { IServicio } from '@service/services/schemas/servicio.schema';
import { ServicioService } from '@service/services/servicio.service';
import { convertirDuracionAFecha, formatDuration, formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AddServicioFormComponent } from './add.component';
import { EditServicioFormComponent } from './edit.component';
import { RealizarServicioFormComponent } from './realizar-servicio.component';
import { ViewServicioComponent } from './view.component';

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

    <nz-card [nzBordered]="false">
      <div class="an-btn-filter-container">
        <button nz-button nzType="primary" (click)="export()">{{ 'btn.Export' | i18n }}</button>
        <button nz-button nzType="default" (click)="st.reset()">{{ 'btn.filter.reset' | i18n }}</button>

        <button nz-button nz-dropdown [nzDropdownMenu]="selectActionMenu" *ngIf="this.selected.length">
          Acciones
          <span nz-icon nzType="down"></span>
        </button>
        <nz-dropdown-menu #selectActionMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item (click)="delete_batch()">
              {{ 'btn.delete' | i18n }}
            </li>
          </ul>
        </nz-dropdown-menu>
      </div>

      <st #st [data]="url" [columns]="columns" (change)="change($event)" [loading]="loading" />
    </nz-card>
  `
})
export class ServicioTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly settingsService = inject(SettingsService);
  private readonly servicioService = inject(ServicioService);

  @ViewChild('st') private readonly st!: STComponent;

  loading: boolean | null = null;
  selected: IServicio[] = [];

  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号'
      }
    }
  };
  columns: STColumn[] = [
    { title: '', index: 'id.value', type: 'checkbox' },
    { title: 'No', type: 'number', index: 'row_number', className: 'text-center', width: 'fit-conent' },
    {
      title: {
        i18n: 'table.servicio.cover.label'
      },
      type: 'img',
      width: 'fit-conent',
      index: 'cover',
      exported: false
    },
    { title: this.i18n.getI18Value('table.servicio.nombre.label'), index: 'nombre', filter: { type: 'keyword' } },
    //{ title: this.i18n.getI18Value('table.servicio.descripcion.label'), index: 'descripcion', default: '-', filter: { type: 'keyword' } },
    {
      title: this.i18n.getI18Value('table.servicio.available.label'),
      index: 'disponibilidad',
      type: 'badge',
      width: 'fit-conent',
      badge: {
        true: { color: 'success', text: this.i18n.getI18Value('table.servicio.available.badge.available.label') },
        false: {
          color: 'error',
          text: this.i18n.getI18Value('table.servicio.available.badge.unavailable.label'),
          tooltip: this.i18n.getI18Value('table.servicio.available.badge.unavailable.help.label')
        }
      },
      filter: {
        multiple: false,
        menus: [
          { text: this.i18n.getI18Value('table.servicio.available.badge.available.label'), value: true },
          { text: this.i18n.getI18Value('table.servicio.available.badge.unavailable.label'), value: false }
        ]
      }
    },
    {
      title: {
        i18n: 'table.servicio.state.label'
      },
      index: 'estado.nombre',
      type: 'tag',
      tag: {
        ACTIVO: { text: this.i18n.getI18Value('form.servicio.state.badge.active.label'), color: 'green' },
        INACTIVO: { text: this.i18n.getI18Value('form.servicio.state.badge.inactive.label'), color: 'red' }
      },
      filter: {
        menus: [
          { text: this.i18n.getI18Value('form.servicio.state.badge.active.label'), value: 'ACTIVO' },
          { text: this.i18n.getI18Value('form.servicio.state.badge.inactive.label'), value: 'INACTIVO' }
        ],
        reName(list, col) {
          return {
            state: list
              .filter(w => w.checked)
              .map(item => item.value)
              .join(',')
          };
        }
      }
    },
    {
      title: this.i18n.getI18Value('table.servicio.precio.label'),
      index: 'precio',
      type: 'currency',
      className: 'text-center',
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
      title: this.i18n.getI18Value('table.servicio.tiempo_est.label'),
      index: 'tiempo_est',
      className: 'text-center',
      format: (item, col, index) => {
        return item.tiempo_est ? formatDuration(item.tiempo_est, this.i18n.getI18Value('table.servicio.tiempo_est.format')) : '-';
      }
    },
    {
      title: this.i18n.getI18Value('table.servicio.encargado.label'),
      index: 'encargado',
      className: 'text-center',
      format: (item, _col, _index) => {
        return item.encargado ? `${item.encargado.nombre} ${item.encargado.apellido}` : '-';
      },
      filter: { type: 'keyword' }
    },
    /* {
      title: this.i18n.getI18Value('table.servicio.productos.label'),
      index: 'productos',
      className: 'text-center',
      format(item) {
        if (!item.productos || !item.productos.length) return '-';
        return item.productos.map((p: any) => `${p.nombre} (${p.sku})`).join('</br>');
      },
      filter: { type: 'keyword' }
    }, */
    {
      title: this.i18n.getI18Value('table.column.accion'),
      width: 'fit-conent',
      buttons: [
        {
          icon: 'plus',
          type: 'modal',
          iif(item, btn, column) {
            return item.disponibilidad;
          },
          modal: {
            component: RealizarServicioFormComponent,
            modalOptions: {
              nzTitle: this.i18n.getI18Value('modal.servicio-realizado.title'),
              nzWidth: '35%',
              nzOnCancel: async () => {
                this.st.reload();
              }
            },
            paramsName: 'data',
            params: rec => {
              return {
                onCreated: () => {
                  this.st.reload();
                }
              };
            }
          }
        },
        {
          icon: 'eye',
          type: 'modal',
          modal: {
            component: ViewServicioComponent,
            modalOptions: {
              nzTitle: this.i18n.getI18Value('view.servicio.title')
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
          iif: () => {
            return this.isAdmin;
          },
          pop: {
            title: this.i18n.getI18Value('popup.msg.confirm-delete'),
            okType: 'danger',
            icon: 'warning'
          },
          click: (record: IServicio, _modal, comp) => {
            this.loading = true;
            this.servicioService.delete(record.id).subscribe({
              complete: () => {
                this.msg.success(this.i18n.getI18ValueTemplate('table.notification.row.deleted', record.nombre));
                this.loading = false;
                comp!.removeRow(record);
                comp!.reload();
              },
              error: err => {
                this.msg.error(formatErrorMsg(this.i18n.getI18ValueTemplate('table.notification.row.deleted.error', record.nombre), err));
                this.loading = false;
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

  get isAdmin() {
    return this.settingsService.user?.admin ?? false;
  }

  add(): void {
    this.modal
      .create(
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

  delete_batch() {
    if (this.selected.length === 0) return;

    try {
      this.loading = true;
      this.servicioService.delete_batch(this.selected.map(i => i.id)).subscribe({
        complete: () => {
          this.msg.success(this.i18n.getI18Value('table.notification.selection.deleted'));
          this.st.removeRow(this.selected);
          this.selected = [];
          this.loading = false;
        },
        error: err => {
          this.msg.error(formatErrorMsg(this.i18n.getI18Value('table.notification.selection.deleted.error'), err));
          this.loading = false;
        }
      });
    } catch (err: any) {
      this.msg.error(formatErrorMsg(this.i18n.getI18Value('table.notification.selection.deleted.error'), err));
      this.loading = false;
    }
  }

  export() {
    this.st.filteredData.subscribe(data => {
      this.st.export(data);
    });
  }

  change(e: STChange): void {
    if (e.type === 'checkbox' && e.checkbox) {
      this.selected = e.checkbox;
    }
  }
}
