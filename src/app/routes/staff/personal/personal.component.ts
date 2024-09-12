import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, SettingsService, _HttpClient } from '@delon/theme';
import { PersonalService } from '@service/staff/personal.service';
import { IPersonal } from '@service/staff/schemas/personal.schema';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AddPersonalFormComponent } from './add.component';
import { EditPersonalFormComponent } from './edit.component';
import { ViewPersonalComponent } from './view.component';

@Component({
  selector: 'personal-table',
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
export class PersonalTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly settingsService = inject(SettingsService);
  private readonly personalService = inject(PersonalService);

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
    { title: this.i18n.getI18Value('table.staff.cedula.label'), index: 'cedula', filter: { type: 'keyword' } },
    {
      title: this.i18n.getI18Value('table.staff.nombre.label'),
      format(item, col, index) {
        return `${item.nombre} ${item.apellido}`;
      },
      filter: { type: 'keyword' }
    },
    { title: this.i18n.getI18Value('table.staff.email.label'), index: 'email', filter: { type: 'keyword' } },
    {
      title: {
        i18n: 'table.staff.state.label'
      },
      index: 'estado.name',
      type: 'badge',
      badge: {
        ACTIVO: { text: this.i18n.getI18Value('form.staff.state.badge.active.label'), color: 'success' },
        INACTIVO: { text: this.i18n.getI18Value('form.staff.state.badge.inactive.label'), color: 'error' }
      },
      filter: {
        menus: [
          { text: this.i18n.getI18Value('form.staff.state.badge.active.label'), value: 'ACTIVO' },
          { text: this.i18n.getI18Value('form.staff.state.badge.inactive.label'), value: 'INACTIVO' }
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
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'eye',
          type: 'modal',
          modal: {
            component: ViewPersonalComponent,
            modalOptions: {
              nzTitle: this.i18n.getI18Value('modal.staff.view.title')
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
            component: EditPersonalFormComponent,
            drawerOptions: {
              nzTitle: this.i18n.getI18Value('drawer.staff.title'),
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
          click: (record: IPersonal, _modal, comp) => {
            this.st.loading = true;
            this.personalService.delete(record.id).subscribe({
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
    return BACKEND_API.staff.personal.grid.url();
  }

  get isAdmin() {
    return this.settingsService.user?.admin ?? false;
  }

  add(): void {
    this.modal
      .create(
        AddPersonalFormComponent,
        {
          onCreated: () => {
            this.st.reload();
          }
        },
        {
          modalOptions: {
            nzTitle: this.i18n.getI18Value('modal.staff.title')
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
