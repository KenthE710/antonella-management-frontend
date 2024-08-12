import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, Injectable, Provider, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { ALAIN_I18N_TOKEN, MenuService, SettingsService, TitleService } from '@delon/theme';
import { environment } from '@env/environment';
import { ParametroService } from '@service/parameters/parametro.service';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable, zip, of, catchError, map } from 'rxjs';

import { I18NService } from '../i18n/i18n.service';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
export function provideStartup(): Provider[] {
  return [
    StartupService,
    {
      provide: APP_INITIALIZER,
      useFactory: (startupService: StartupService) => () => startupService.load(),
      deps: [StartupService],
      multi: true
    }
  ];
}

@Injectable()
export class StartupService {
  private menuService = inject(MenuService);
  private settingService = inject(SettingsService);
  private tokenService = inject(DA_SERVICE_TOKEN);
  private aclService = inject(ACLService);
  private titleService = inject(TitleService);
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  private parametroService = inject(ParametroService);

  // If http request allows anonymous access, you need to add `ALLOW_ANONYMOUS`:
  // this.httpClient.get('/app', { context: new HttpContext().set(ALLOW_ANONYMOUS, true) })
  private appData$ = this.httpClient.get('./assets/tmp/app-data.json').pipe(
    catchError((res: NzSafeAny) => {
      console.warn(`StartupService.load: Network request failed`, res);
      setTimeout(() => this.router.navigateByUrl(`/exception/500`));
      return of({});
    })
  );

  private handleAppData(res: NzSafeAny): void {
    // Application information: including site name, description, year
    this.settingService.setApp(res.app);
    // User information: including name, avatar, email address
    //this.settingService.setUser(res.user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add(res.menu ?? []);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = res.app?.name;
  }

  private viaHttp(): Observable<void> {
    const defaultLang = this.i18n.defaultLang;
    return zip(this.i18n.loadLangData(defaultLang), this.appData$).pipe(
      map(([langData, appData]: [Record<string, string>, NzSafeAny]) => {
        // setting language data
        this.i18n.use(defaultLang, langData);

        this.handleAppData(appData);
      })
    );
  }

  private viaMockI18n(): Observable<void> {
    const defaultLang = this.i18n.defaultLang;
    return this.i18n.loadLangData(defaultLang).pipe(
      map((langData: NzSafeAny) => {
        this.i18n.use(defaultLang, langData);

        this.viaMock();
      })
    );
  }

  private viaMock(): Observable<void> {
    // const tokenData = this.tokenService.get();
    // if (!tokenData.token) {
    //   this.router.navigateByUrl(this.tokenService.login_url!);
    //   return;
    // }
    // mock
    const app: any = {
      name: `Antonella Management`,
      description: `Sistema de gestión para la empresa Antonella`
    };
    const user: any = {
      name: 'Admin',
      avatar: './assets/tmp/img/avatar.jpg',
      email: 'admin@antonella.com',
      token: '123456789'
    };
    // Application information: including site name, description, year
    this.settingService.setApp(app);
    // User information: including name, avatar, email address
    // this.settingService.setUser(user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add([
      {
        i18n: 'menu.main',
        group: true,
        hideInBreadcrumb: true,
        children: [
          {
            i18n: 'menu.dashboard',
            link: '/dashboard',
            icon: { type: 'icon', value: 'pie-chart' }
          },
          {
            i18n: 'menu.catalog',
            group: true,
            icon: { type: 'icon', value: 'shop' },
            children: [
              {
                i18n: 'menu.catalog.product',
                link: '/catalog/product',
                icon: { type: 'icon', value: 'shopping-cart' }
              },
              {
                i18n: 'menu.catalog.lote',
                link: '/catalog/lote',
                icon: { type: 'icon', value: 'inbox' }
              },
              {
                i18n: 'menu.catalog.product_type',
                link: '/catalog/producto-tipo',
                icon: { type: 'icon', value: 'bars' }
              },
              {
                i18n: 'menu.catalog.product_brand',
                link: '/catalog/producto-marca',
                icon: { type: 'icon', value: 'skin' }
              }
            ]
          },
          {
            i18n: 'menu.staff',
            link: '/staff/personal',
            icon: { type: 'icon', value: 'gf-groups' }
          },
          {
            i18n: 'menu.customers',
            link: '/customers',
            icon: { type: 'icon', value: 'gf-face' }
          },
          {
            i18n: 'menu.service',
            group: true,
            icon: { type: 'icon', value: 'gf-health-and-beauty' },
            children: [
              {
                i18n: 'menu.service',
                link: '/service/servicio',
                icon: { type: 'icon', value: 'gf-service-toolbox' }
              },
              {
                i18n: 'menu.servicios_realizados',
                link: '/service/servicio-realizado',
                icon: { type: 'icon', value: 'gf-task-alt' }
              }
            ]
          }
        ]
      }
    ]);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = app.name;

    return of(void 0);
  }

  load(): Observable<void> {
    // http
    // return this.viaHttp();
    // mock: Don’t use it in a production environment. ViaMock is just to simulate some data to make the scaffolding work normally
    return environment.production ? this.viaHttp() : this.viaMockI18n();
  }
}
