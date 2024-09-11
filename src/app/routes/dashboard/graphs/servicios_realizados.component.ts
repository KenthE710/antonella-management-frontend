import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { G2BarData } from '@delon/chart/bar';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { IPeriod, Periods } from '@service/stats/schemas/servicios_realizados.schema';
import { StatsService } from '@service/stats/stats.service';
import { SHARED_IMPORTS } from '@shared';
import { format, getYear, parseISO, getWeekOfMonth } from 'date-fns';
import { format as formatZoned, utcToZonedTime } from 'date-fns-tz';

@Component({
  selector: 'graph-servicios-realizados',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    <nz-select [(ngModel)]="selectedValue" (ngModelChange)="genData($event)">
      @for (period of Periods; track period) {
        <nz-option [nzValue]="period" [nzLabel]="getPeriodLabel(period)" />
      }
    </nz-select>

    <g2-bar height="200" [data]="data" />
  `,
  styles: [
    `
      nz-select {
        margin: 12px 0;
        width: 120px;
      }
    `
  ]
})
export class serviciosRealizadosStatsComponent implements OnInit {
  private readonly statsService = inject(StatsService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly settingService = inject(SettingsService);

  data: G2BarData[] = [];
  selectedValue: IPeriod = this.periodo_inicial;

  ngOnInit(): void {
    this.genData(this.selectedValue);
  }

  genData(period: IPeriod = 'week'): void {
    this.statsService.serviciosRealizados(period).subscribe(serviciosRealizados => {
      const timeZone = 'UTC';

      this.data = serviciosRealizados.map(item => {
        const date = parseISO(item.period);
        const zonedDate = utcToZonedTime(date, timeZone);

        return {
          x:
            period === 'week'
              ? this.i18n
                  .getI18Value('charts.servicios_realizados.by_week.x_label.template')
                  .replace('{{week}}', getWeekOfMonth(zonedDate).toString())
                  .replace('{{month}}', formatZoned(zonedDate, 'LLL', { timeZone, locale: this.i18n.getDateLocale() }))
              : period == 'month'
                ? formatZoned(zonedDate, 'MM/yyyy', { timeZone })
                : formatZoned(zonedDate, 'yyyy', { timeZone }),
          y: item.total_servicios
        };
      });
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
}
