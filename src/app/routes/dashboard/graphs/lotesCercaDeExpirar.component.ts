import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { ILoteAll } from '@service/inventory/lote/schemas/lote.schema';
import { IUmbralPeriod, UmbralPeriods } from '@service/stats/schemas/lotes_cerca_de_expirar.schema';
import { Periods } from '@service/stats/schemas/servicios_realizados.schema';
import { StatsService } from '@service/stats/stats.service';
import { formatDateFromString, relativeDateToNowFromString, SHARED_IMPORTS } from '@shared';
import { debounceTime, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'graph-lotes-cerca-de-expirar',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `
    <nz-select [(ngModel)]="selectedValue" (ngModelChange)="genDataByPeriod($event)" style="width: 50%">
      @for (period of PeriodsWithoutDays; track period) {
        <nz-option [nzValue]="period" [nzLabel]="getPeriodLabel(period)" />
      }
      <nz-option nzValue="custom" [nzLabel]="'custom' | i18n" />
    </nz-select>
    @if (selectedValue === 'custom') {
      <nz-space nzDirection="vertical" style="width: 100%">
        <nz-input-number-group *nzSpaceItem nzCompact>
          <nz-select [(ngModel)]="customPeriod" (ngModelChange)="genData()" style="width: 40%">
            @for (period of Periods; track period) {
              <nz-option [nzValue]="period" [nzLabel]="getCustomPeriodLabel(period)" />
            }
          </nz-select>
          <nz-input-number [(ngModel)]="umbral" style="width: 25%" [nzMin]="0" (ngModelChange)="genData($event)" />
        </nz-input-number-group>
      </nz-space>
    }
    <nz-spin [nzSpinning]="loading">
      <nz-list [nzDataSource]="dataSource" [nzRenderItem]="item" nzItemLayout="horizontal">
        <ng-template #item let-lote>
          <nz-list-item>
            <nz-list-item-meta nzTitle="{{ getLoteTitle(lote) }}" [nzDescription]="getLoteDescription(lote)" />
          </nz-list-item>
        </ng-template>
      </nz-list>
    </nz-spin>
  `
})
export class graphLotesCercaDeExpirarComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly statsService = inject(StatsService);
  private readonly settingService = inject(SettingsService);

  private $umbralSubject = new Subject<number>();

  selectedValue: IUmbralPeriod | 'custom' = this.periodo_inicial;
  customPeriod: IUmbralPeriod = 'day';
  umbral = 10;
  loading: boolean | null = null;
  dataSource: ILoteAll[] = [];

  ngOnInit(): void {
    this.$umbralSubject
      .pipe(
        debounceTime(800),
        switchMap(umbral => {
          this.loading = true;
          return this.statsService.lotesCercaDeExpirar(umbral);
        })
      )
      .subscribe(data => {
        this.loading = false;
        this.dataSource = data;
      });

    this.genDataByPeriod(this.selectedValue);
  }

  genDataByPeriod(period: IUmbralPeriod | 'custom'): void {
    const umbral = period == 'week' ? 7 : period == 'month' ? 30 : period == 'year' ? 365 : this.umbral;
    this.genData(umbral);
  }

  genData(umbral?: number): void {
    let _umbral = umbral || this.umbral;

    if (!_umbral || _umbral < 0) return;

    if (this.selectedValue == 'custom') {
      switch (this.customPeriod) {
        case 'week':
          _umbral *= 7;
          break;
        case 'month':
          _umbral *= 30;
          break;
        case 'year':
          _umbral *= 365;
          break;
      }
    }

    this.$umbralSubject.next(_umbral);
  }

  get Periods() {
    return Object.values(UmbralPeriods.enum);
  }
  get PeriodsWithoutDays() {
    return Object.values(UmbralPeriods.enum).filter(period => period != 'day');
  }

  get periodo_inicial(): IUmbralPeriod {
    try {
      return this.settingService.app.dashboard.periodo_inicial;
    } catch (error) {
      return 'week';
    }
  }

  getPeriodLabel(period: IUmbralPeriod): string {
    return this.i18n.getI18Value(`charts.lotes_cerca_de_expirar.umbral.${period}.label`);
  }
  getCustomPeriodLabel(period: IUmbralPeriod): string {
    return this.i18n.getI18Value(`charts.lotes_cerca_de_expirar.umbral.custom_period.${period}.label`);
  }

  getLoteTitle(lote: ILoteAll): string {
    return this.i18n.getI18ValueTemplate('charts.lotes_cerca_de_expirar.item.title', `${lote.producto.nombre} (${lote.producto.sku})`);
  }
  getLoteDescription(lote: ILoteAll): string {
    return this.i18n
      .getI18Value('charts.lotes_cerca_de_expirar.item.description')
      .replace(
        '{{purchase_date}}',
        `${formatDateFromString(lote.fe_compra)} (${relativeDateToNowFromString(lote.fe_compra, this.i18n.getDateLocale())})`
      )
      .replace(
        '{{exp_date}}',
        `${formatDateFromString(lote.fe_exp)} (${relativeDateToNowFromString(lote.fe_exp, this.i18n.getDateLocale())})`
      );
  }
}
