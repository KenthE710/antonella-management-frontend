import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, ModalHelper } from '@delon/theme';
import { PersonalService } from '@service/staff/personal.service';
import { IPersonalFull } from '@service/staff/schemas/personal.schema';
import { formatJustDateFromString, SHARED_IMPORTS } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'personal-view',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    @if (personal) {
      <div sv-container col="2">
        <sv [label]="'form.id.label' | i18n">{{ personal.id }}</sv>
        <sv [label]="'table.personal.nombre.label' | i18n" *ngIf="personal.nombre">{{ personal.nombre }}</sv>
        <sv [label]="'table.personal.apellido.label' | i18n" *ngIf="personal.apellido">{{ personal.apellido }}</sv>
        <sv [label]="'table.personal.cedula.label' | i18n" *ngIf="personal.cedula">{{ personal.cedula }}</sv>
        <sv [label]="'table.personal.email.label' | i18n" *ngIf="personal.email">{{ personal.email }}</sv>
        <sv [label]="'table.personal.telefono.label' | i18n" *ngIf="personal.telefono">{{ personal.telefono }}</sv>
        <sv [label]="'table.personal.direccion.label' | i18n" *ngIf="personal.direccion">{{ personal.direccion }}</sv>
        <sv [label]="'table.personal.fecha_nacimiento.label' | i18n" *ngIf="personal.fecha_nacimiento">{{
          formatDate(personal.fecha_nacimiento)
        }}</sv>
        <sv [label]="'table.personal.estado.label' | i18n" *ngIf="personal.estado">{{ personal.estado }}</sv>
      </div>
    } @else {
      <nz-spin />
    }
  `,
  styles: `
    .img-round {
      border-radius: 5%;
    }
    .sv-description {
      margin-top: 10px;
    }
  `
})
export class ViewPersonalComponent implements OnInit {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly personalService = inject(PersonalService);

  @Input({ required: true }) private readonly id!: number;
  personal: IPersonalFull | null = null;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del personal');
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    this.personalService.complete(this.id).subscribe(personal => {
      this.personal = personal;
    });
  }

  formatDate(date: string): string {
    return formatJustDateFromString(date);
  }
}
