import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18NService, StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, SocialOpenType, SocialService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, CUSTOM_ERROR, I18nPipe, SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { BACKEND_API } from '@shared/constant';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabChangeEvent, NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { finalize } from 'rxjs';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    I18nPipe,
    NzCheckboxModule,
    NzTabsModule,
    NzAlertModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzToolTipModule,
    NzIconModule
  ]
})
export class UserLoginComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly settingsService = inject(SettingsService);
  private readonly socialService = inject(SocialService);
  private readonly reuseTabService = inject(ReuseTabService, { optional: true });
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly startupSrv = inject(StartupService);
  private readonly http = inject(_HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  form = inject(FormBuilder).nonNullable.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required]],
    mobile: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
    captcha: ['', [Validators.required]],
    remember: [true]
  });
  error = '';
  loading = false;

  count = 0;
  interval$: any;

  getCaptcha(): void {
    const mobile = this.form.controls.mobile;
    if (mobile.invalid) {
      mobile.markAsDirty({ onlySelf: true });
      mobile.updateValueAndValidity({ onlySelf: true });
      return;
    }
    this.count = 59;
    this.interval$ = setInterval(() => {
      this.count -= 1;
      if (this.count <= 0) {
        clearInterval(this.interval$);
      }
    }, 1000);
  }

  submit(): void {
    this.error = '';
    const { userName, password } = this.form.controls;
    userName.markAsDirty();
    userName.updateValueAndValidity();
    password.markAsDirty();
    password.updateValueAndValidity();
    if (userName.invalid || password.invalid) {
      return;
    }

    // La configuración por defecto fuerza el Token de usuario [checksum](https://ng-alain.com/auth/getting-started) para todas las peticiones HTTP
    // En general, las solicitudes de inicio de sesión no requieren sumas de comprobación, por lo que añadir `ALLOW_ANONYMOUS` significa que no se activan las sumas de comprobación de los tokens de usuario.
    this.loading = true;
    this.cdr.detectChanges();
    this.http
      .post(
        BACKEND_API.users.login.url(),
        {
          username: this.form.value.userName,
          password: this.form.value.password
        },
        null,
        {
          context: new HttpContext().set(ALLOW_ANONYMOUS, true).set(CUSTOM_ERROR, true)
        }
      )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: res => {
          if (res.msg !== 'ok') {
            this.error = res.msg;
            this.cdr.detectChanges();
            return;
          }
          // Borrado de la información de multiplexación de rutas
          this.reuseTabService?.clear();
          // Configuración de la información del token de usuario
          // TODO: Mock expired value
          //res.user.expired = +new Date() + 1000 * 60 * 60;
          this.tokenService.set({
            ...res.user,
            token: res.user.access_token
          });
          // Recuperar el contenido de StartupService, siempre asumimos que la información de la aplicación está generalmente afectada por el ámbito de autorización del usuario actual
          this.startupSrv.load().subscribe(() => {
            this.settingsService.setUser({
              name: res.user.name,
              avatar: res.user.avatar || './assets/tmp/img/avatar.jpg',
              email: res.user.email,
              token: res.user.access_token
            });
            let url = this.tokenService.referrer!.url || '/';
            if (url.includes('/passport')) {
              url = '/';
            }
            this.router.navigateByUrl(url);
          });
        },
        error: (err: any) => {
          console.error(err);
          this.error = this.i18n.getI18Value('services.login.error');
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
