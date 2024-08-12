import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'header-clear-storage',
  template: `
    <i nz-icon nzType="tool"></i>
    {{ 'menu.clear.local.storage' | i18n }}
  `,
  host: {
    '[class.flex-1]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NzIconModule, I18nPipe]
})
export class HeaderClearStorageComponent {
  private readonly modalSrv = inject(NzModalService);
  private readonly messageSrv = inject(NzMessageService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @HostListener('click')
  _click(): void {
    this.modalSrv.confirm({
      nzTitle: this.i18n.getI18Value('modal.clear_local_storage.message'),
      nzOnOk: () => {
        localStorage.clear();
        this.messageSrv.success(this.i18n.getI18Value('modal.clear_local_storage.success.message'));
      }
    });
  }
}
