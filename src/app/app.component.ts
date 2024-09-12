import { Component, ElementRef, OnInit, Renderer2, inject } from '@angular/core';
import { NavigationEnd, NavigationError, RouteConfigLoadStart, Router, RouterOutlet } from '@angular/router';
import { TitleService, VERSION as VERSION_ALAIN, stepPreloader } from '@delon/theme';
import { environment } from '@env/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VERSION as VERSION_ZORRO } from 'ng-zorro-antd/version';

@Component({
  selector: 'app-root',
  template: ` <router-outlet />`,
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly titleSrv = inject(TitleService);
  private readonly modalSrv = inject(NzModalService);

  private donePreloader = stepPreloader();

  constructor(el: ElementRef, renderer: Renderer2) {
    renderer.setAttribute(el.nativeElement, 'ng-alain-version', VERSION_ALAIN.full);
    renderer.setAttribute(el.nativeElement, 'ng-zorro-version', VERSION_ZORRO.full);
  }

  ngOnInit(): void {
    let configLoad = false;
    this.router.events.subscribe(ev => {
      if (ev instanceof RouteConfigLoadStart) {
        configLoad = true;
      }
      if (configLoad && ev instanceof NavigationError) {
        this.modalSrv.confirm({
          nzTitle: `recordatorios`,
          nzContent: environment.production
            ? `Es posible que se haya publicado una nueva versión de la aplicación. Haga clic en Actualizar para que surta efecto.`
            : `No se ha podido cargar la ruta：${ev.url}`,
          nzCancelDisabled: false,
          nzOkText: 'refrescar (ventana del ordenador)',
          nzCancelText: 'Cancelar',
          nzOnOk: () => location.reload()
        });
      }
      if (ev instanceof NavigationEnd) {
        this.donePreloader();
        this.titleSrv.setTitle();
        this.modalSrv.closeAll();
      }
    });
  }
}
