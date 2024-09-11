import { Component, inject, Input, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, ModalHelper } from '@delon/theme';
import { ClienteService } from '@service/customers/cliente/cliente.service';
import { ICliente } from '@service/customers/cliente/schemas/cliente.schema';
import { formatJustDateFromString, SHARED_IMPORTS } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'cliente-view',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    @if (cliente) {
      <div sv-container col="2">
        <sv [label]="'form.id.label' | i18n">{{ cliente.id }}</sv>
        <sv [label]="'view.cliente.nombre.label' | i18n" *ngIf="cliente.nombre">{{ cliente.nombre }}</sv>
        <sv [label]="'view.cliente.apellido.label' | i18n" *ngIf="cliente.apellido">{{ cliente.apellido }}</sv>
        <sv [label]="'view.cliente.cedula.label' | i18n" *ngIf="cliente.cedula">{{ cliente.cedula }}</sv>
        <sv [label]="'view.cliente.email.label' | i18n" *ngIf="cliente.email">{{ cliente.email }}</sv>
        <sv [label]="'view.cliente.telefono.label' | i18n" *ngIf="cliente.telefono">{{ cliente.telefono }}</sv>
        <sv [label]="'view.cliente.direccion.label' | i18n" *ngIf="cliente.direccion">{{ cliente.direccion }}</sv>
        <sv [label]="'view.cliente.fecha_nacimiento.label' | i18n" *ngIf="cliente.fecha_nacimiento">{{
          formatDate(cliente.fecha_nacimiento)
        }}</sv>
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
export class ViewClienteComponent implements OnInit {
  private readonly modal = inject(ModalHelper);
  private readonly msg = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly clienteService = inject(ClienteService);

  @Input({ required: true }) private readonly id!: number;
  cliente: ICliente | null = null;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del cliente');
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    this.clienteService.complete(this.id).subscribe(_ => {
      this.cliente = _;
    });
  }

  formatDate(date: string): string {
    return formatJustDateFromString(date);
  }
}
