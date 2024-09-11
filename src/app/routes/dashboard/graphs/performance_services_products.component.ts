import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { I18NService } from '@core';
import { G2SingleBarModule } from '@delon/chart/single-bar';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { IPerformanceServicesProducts } from '@service/stats/schemas/performance_services_products.schema';
import { StatsService } from '@service/stats/stats.service';
import { SHARED_IMPORTS } from '@shared';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'graph-performance-services-products',
  encapsulation: ViewEncapsulation.Emulated,
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    <!-- <button nz-button (click)="refresh()" nzType="primary">Refresh</button> -->
    <div nz-flex [nzJustify]="'flex-end'">
      <span>
        <i nz-tooltip [nzTooltipTitle]="'charts.performance_services_products.helper_text' | i18n" nz-icon nzType="info-circle"></i>
      </span>
    </div>
    <nz-table [nzData]="dataSource" [nzShowPagination]="false">
      <thead>
        <tr>
          <th>{{ 'charts.performance_services_products.column.servicios.label' | i18n }}</th>
          <th>{{ 'charts.performance_services_products.column.servicios_realizados.label' | i18n }}</th>
          <th>{{ 'charts.performance_services_products.column.use_variation.label' | i18n }}</th>
        </tr>
      </thead>
      <tbody>
        @for (data of dataSource; track data.servicio) {
          <tr>
            <td>{{ data.servicio }}</td>
            <td>
              <g2-single-bar height="24" [value]="data.num_realizados" />
            </td>
            <td>
              <g2-single-bar height="60" [value]="data.variacion_uso" min="-100" line />
            </td>
          </tr>
        }
      </tbody>
    </nz-table>
  `,
  styles: [
    `
      :host ::ng-deep .ant-table tbody > tr > td {
        padding: 0;
      }
    `
  ]
})
export class graphPerformanceServicesProductsComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly statsService = inject(StatsService);

  dataSource: IPerformanceServicesProducts[] = [];

  ngOnInit(): void {
    this.genData();

    // TEST
    /* this.dataSource = new Array(5).fill({}).map((_data, i) => ({
      servicio: `Servicio ${i}`,
      num_realizados: Math.floor(Math.random() * 100),
      variacion_uso: Math.floor(Math.random() * 100) > 50 ? Math.floor(Math.random() * 100) : -Math.floor(Math.random() * 100)
    })); */
  }

  genData() {
    this.statsService.performanceServicesProducts().subscribe(res => {
      this.dataSource = res;
    });
  }
}
