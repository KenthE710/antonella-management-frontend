import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { IMostPerformedServices } from '@service/stats/schemas/most_performed_services.schema';
import { IProductosMasUtilizados } from '@service/stats/schemas/productos_mas_utilizados.schema';
import { IPeriod, Periods } from '@service/stats/schemas/servicios_realizados.schema';
import { StatsService } from '@service/stats/stats.service';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'graph-productos-mas-utilizados',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: ` <nz-select [(ngModel)]="selectedValue" (ngModelChange)="genData($event)" style="width: 50%">
      @for (period of Periods; track period) {
        <nz-option [nzValue]="period" [nzLabel]="getPeriodLabel(period)" />
      }
    </nz-select>
    <nz-list [nzDataSource]="dataSource" [nzRenderItem]="item" nzItemLayout="horizontal">
      <ng-template #item let-data>
        <nz-list-item>
          <nz-list-item-meta nzTitle="{{ getItemTitle(data) }}" [nzDescription]="getItemDescription(data)" />
        </nz-list-item>
      </ng-template>
    </nz-list>`
})
export class graphProductosMasUtilizadosComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly statsService = inject(StatsService);
  private readonly settingService = inject(SettingsService);

  selectedValue: IPeriod = this.periodo_inicial;
  dataSource: IProductosMasUtilizados[] = [];

  ngOnInit(): void {
    this.genData(this.selectedValue);
  }

  genData(period: IPeriod = 'week'): void {
    this.statsService.getProductosMasUtilizados(period).subscribe(data => {
      this.dataSource = data;
    });
  }

  get Periods() {
    return Object.values(Periods.enum);
  }

  get periodo_inicial(): IPeriod {
    try {
      return this.settingService.app.dashboard.periodo_inicial;
    } catch (error) {
      return 'week';
    }
  }

  getPeriodLabel(period: IPeriod): string {
    return this.i18n.getI18Value(`charts.servicios_realizados.${period}.label`);
  }

  getItemTitle(data: IProductosMasUtilizados): string {
    return `${data.nombre} (${data.sku})`;
  }
  getItemDescription(data: IProductosMasUtilizados): string {
    return this.i18n.getI18ValueTemplate('charts.productos_mas_utilizados.item.description', data.usos.toString());
  }
}
