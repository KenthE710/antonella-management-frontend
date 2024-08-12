import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { G2CardModule } from '@delon/chart/card';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { StatsService } from '@service/stats/stats.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'graph-valor-inventario',
  standalone: true,
  imports: [G2CardModule, NzIconModule, NzToolTipModule, I18nPipe],
  template: ` <g2-card [title]="'charts.inventory_value.title' | i18n" [bordered]="true" [total]="total" [action]="action">
    <ng-template #action>
      <i nz-tooltip [nzTooltipTitle]="'charts.inventory_value.tooltip' | i18n" nz-icon nzType="info-circle"></i>
    </ng-template>
  </g2-card>`
})
export class graphValorInventarioComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly statsService = inject(StatsService);

  total = '';

  ngOnInit(): void {
    this.statsService.getValorInventario().subscribe({
      next: res => {
        this.total = `$${res.valor_total}`;
      },
      error: err => console.error(err)
    });
  }
}
