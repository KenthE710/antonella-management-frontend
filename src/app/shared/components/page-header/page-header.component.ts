import { Component, Input, TemplateRef } from '@angular/core';
import { PageHeaderModule } from '@delon/abc/page-header';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [PageHeaderModule],
  template: `
    <page-header [homeI18n]="homeI18n" [action]="action">
      <ng-content />
    </page-header>
  `
})
export class PageHeaderComponent {
  @Input() homeI18n?: string = 'app.home';
  @Input() action?: TemplateRef<void> | null = null;
}
