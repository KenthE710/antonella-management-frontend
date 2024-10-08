import { CommonModule, NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, I18nPipe } from '@delon/theme';

import { PageHeaderComponent } from './components';
import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';

export const SHARED_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterLink,
  NgTemplateOutlet,
  NgClass,
  NgStyle,
  I18nPipe,
  DatePipe,
  ...SHARED_DELON_MODULES,
  ...SHARED_ZORRO_MODULES,
  PageHeaderComponent
];
