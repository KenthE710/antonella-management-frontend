import { inject, Injectable } from '@angular/core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { I18NService } from './i18n/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);
  private readonly notification = inject(NzNotificationService);

  error(msg: string) {
    this.msg.error(msg);
  }

  warn(msg: string, titulo?: string) {
    let _titulo = titulo;

    if (!_titulo) {
      _titulo = this.i18n.getI18Value('warning');
    }

    if (!environment.production) {
      _titulo = `${_titulo} (DEV)`;
    }

    this.notification.warning(_titulo, msg);
  }
}
