import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { IProductoWithExistencias } from '@service/inventory/product/schemas';
import { StatsService } from '@service/stats/stats.service';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'graph-productos-cerca-de-agotar',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: ` <nz-list [nzDataSource]="dataSource" [nzRenderItem]="item" nzItemLayout="horizontal">
    <ng-template #item let-data>
      <nz-list-item>
        <nz-list-item-meta nzTitle="{{ getItemTitle(data) }}" [nzDescription]="getItemDescription(data)" />
      </nz-list-item>
    </ng-template>
  </nz-list>`
})
export class graphProductosCercaDeAgotarComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly statsService = inject(StatsService);
  private readonly settingService = inject(SettingsService);
  dataSource: IProductoWithExistencias[] = [];

  ngOnInit(): void {
    this.genData();
  }

  genData(): void {
    this.statsService.productosCercaDeAgotar().subscribe(data => {
      this.dataSource = data;
    });
  }

  getItemTitle(data: IProductoWithExistencias): string {
    return `${data.nombre} (${data.sku})`;
  }
  getItemDescription(data: IProductoWithExistencias): string {
    return this.i18n.getI18ValueTemplate('charts.productos_cerca_de_agotar.item.description', data.existencias.toString());
  }
}
