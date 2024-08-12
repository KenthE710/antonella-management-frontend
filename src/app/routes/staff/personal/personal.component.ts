import { Component, ViewChild, inject } from '@angular/core';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ALAIN_I18N_TOKEN, ModalHelper, _HttpClient } from '@delon/theme';
import { PersonalService } from '@service/staff/personal.service';
import { IPersonal } from '@service/staff/schemas/personal.schema';
import { formatErrorMsg, SHARED_IMPORTS } from '@shared';
import { BACKEND_API } from '@shared/constant';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AddPersonalFormComponent } from './add.component';
import { EditPersonalFormComponent } from './edit.component';

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
    <st #st [data]="url" [columns]="columns" />
  `
})
export class PersonalTableComponent {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
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
    { title: 'No', type: 'no' },
    { title: this.i18n.getI18Value('table.staff.nombre.label'), index: 'nombre' },
    { title: this.i18n.getI18Value('table.staff.apellido.label'), index: 'apellido' },
    { title: this.i18n.getI18Value('table.staff.cedula.label'), index: 'cedula' },
    {
      title: this.i18n.getI18Value('table.column.accion'),
      buttons: [
        {
          icon: 'edit',
          type: 'drawer',
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
          pop: {
            title: this.i18n.getI18Value('popup.msg.confirm-delete'),
            okType: 'danger',
            icon: 'warning'
          },
          click: (record: IPersonal, _modal, comp) => {
            this.st.loading = true;
            this.personalService.delete(record.id).subscribe({
              complete: () => {
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
    return BACKEND_API.staff.personal.grid.url();
  }
  add(): void {
    this.modal
      .createStatic(
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
}
