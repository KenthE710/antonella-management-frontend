import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFooterModule } from '@delon/abc/global-footer';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { SettingsService } from '@delon/theme';
import { ThemeBtnComponent } from '@delon/theme/theme-btn';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { HeaderI18nComponent } from '../basic/widgets/i18n.component';

@Component({
  selector: 'layout-passport',
  template: `
    <div class="container">
      <header-i18n showLangText="false" class="langs" />
      <div class="wrap">
        <div class="top">
          <div class="head">
            <img class="logo" src="./assets/logo.png" />
            <span class="title">{{ getAppName() }}</span>
          </div>
          <div class="desc">{{ getAppDescription() }}</div>
        </div>
        <router-outlet />
        <global-footer>
          Copyright
          <span nz-icon nzType="copyright" nzTheme="outline"></span> {{ currentYear }} {{ getAppName() }}
        </global-footer>
      </div>
    </div>
  `,
  styleUrls: ['./passport.component.less'],
  standalone: true,
  imports: [RouterOutlet, HeaderI18nComponent, GlobalFooterModule, NzIconModule, ThemeBtnComponent]
})
export class LayoutPassportComponent implements OnInit {
  private tokenService = inject(DA_SERVICE_TOKEN);
  private readonly settingsService = inject(SettingsService);

  links = [
    {
      title: '帮助',
      href: ''
    },
    {
      title: '隐私',
      href: ''
    },
    {
      title: '条款',
      href: ''
    }
  ];

  getAppName() {
    return this.settingsService.app.name;
  }

  getAppDescription() {
    return this.settingsService.app.description;
  }

  get currentYear() {
    return new Date().getFullYear();
  }

  ngOnInit(): void {
    this.tokenService.clear();
  }
}
