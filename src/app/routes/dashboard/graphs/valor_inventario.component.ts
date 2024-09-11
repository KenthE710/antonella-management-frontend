import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { G2CardModule } from '@delon/chart/card';
import { TrendModule } from '@delon/chart/trend';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { StatsService } from '@service/stats/stats.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'graph-valor-inventario',
  standalone: true,
  imports: [G2CardModule, NzIconModule, NzToolTipModule, TrendModule, I18nPipe],
  template: ` <g2-card [title]="'charts.inventory_value.title' | i18n" [bordered]="true" [total]="total" [action]="action">
    <ng-template #action>
      <i nz-tooltip [nzTooltipTitle]="'charts.inventory_value.tooltip' | i18n" nz-icon nzType="info-circle"></i>
    </ng-template>
    @if (semanal) {
      {{ 'charts.inventory_value.week.label' | i18n }}
      <trend [flag]="semanal.includes('-') ? 'down' : 'up'" [reverseColor]="true">{{ semanal }}</trend>
    }
    @if (mensual) {
      {{ 'charts.inventory_value.month.label' | i18n }}
      <trend [flag]="mensual.includes('-') ? 'down' : 'up'" [reverseColor]="true">{{ mensual }}</trend>
    }
  </g2-card>`,
  styles: [
    `
      trend {
        margin: 0 16px 0 8px;
        color: rgba(0, 0, 0, 0.85);
      }
    `
  ]
})
export class graphValorInventarioComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly statsService = inject(StatsService);

  total = '';
  semanal = '';
  mensual = '';
  anual = '';

  ngOnInit(): void {
    this.statsService.getValorInventario().subscribe({
      next: res => {
        this.total = `$${res.total}`;
        this.semanal = this.getTasaCrecimiento(res.semanal.actual, res.semanal.anterior);
        this.mensual = this.getTasaCrecimiento(res.mensual.actual, res.mensual.anterior);
        this.anual = this.getTasaCrecimiento(res.anual.actual, res.anual.anterior);
      },
      error: console.error
    });
  }

  getTasaCrecimiento(actual: number, anterior: number): string {
    if (anterior === 0) {
      return '100%';
    }
    const diff = actual - anterior;
    const percent = (diff / anterior) * 100;
    return `${percent.toFixed(2)}%`;
  }
}
