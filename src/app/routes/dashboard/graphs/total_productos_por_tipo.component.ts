import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { G2PieComponent, G2PieData, G2PieModule } from '@delon/chart/pie';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { StatsService } from '@service/stats/stats.service';

@Component({
  selector: 'graph-total-productos-por-tipo',
  standalone: true,
  imports: [G2PieModule, I18nPipe],
  template: ` @if (data.length > 0) {
    <g2-pie
      #pie
      [hasLegend]="showLegend"
      [title]="'charts.products_by_type.title' | i18n"
      [subTitle]="'charts.products_by_type.title' | i18n"
      [total]="total"
      [data]="data"
      [valueFormat]="format"
      height="294"
      repaint="false"
    />
  }`
})
export class graphTotalProductosPorTipoComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly statsService = inject(StatsService);
  @ViewChild('pie', { static: false }) readonly pie!: G2PieComponent;
  @Input() showLegend = false;
  data: G2PieData[] = [];
  total = '';

  ngOnInit(): void {
    this.statsService.getTotalProductosPorTipo().subscribe({
      next: res => {
        this.data = res.map(item => ({
          x: item.tipo,
          y: item.total
        }));
        this.total = this.i18n.getI18ValueTemplate(
          'charts.products_by_type.item.label',
          this.data.reduce((prev, curr) => prev + curr.y, 0).toString()
        );
      },
      error: err => console.error(err)
    });
  }

  format = (val: number): string => {
    return this.i18n.getI18ValueTemplate('charts.products_by_type.item.label', val.toString());
  };
}
