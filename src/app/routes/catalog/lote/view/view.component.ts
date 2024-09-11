import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18NService } from '@core';
import { SVModule } from '@delon/abc/sv';
import { ALAIN_I18N_TOKEN, I18nPipe } from '@delon/theme';
import { LoteService } from '@service/inventory/lote/lote.service';
import { ILoteView } from '@service/inventory/lote/schemas/lote.schema';
import { formatDateFromString, formatErrorMsg, relativeDateToNowFromString } from '@shared';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'lote-view',
  standalone: true,
  imports: [
    SVModule,
    NzButtonModule,
    NzRadioModule,
    NzToolTipModule,
    FormsModule,
    NzSpinModule,
    NzDividerModule,
    NzImageModule,
    NzGridModule,
    NzTypographyModule,
    I18nPipe
  ],
  templateUrl: './view.component.html',
  styles: `
    .img-round {
      border-radius: 5%;
    }
  `
})
export class ViewLoteComponent implements OnInit {
  private readonly msg = inject(NzMessageService);
  private readonly loteService = inject(LoteService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @Input({ required: true }) private readonly id!: number;

  lote?: ILoteView;

  ngOnInit(): void {
    if (!this.id) {
      const idRequiredMsg = this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del lote');
      this.msg.error(idRequiredMsg);
      throw new Error(idRequiredMsg);
    }

    this.loteService.view(this.id).subscribe({
      next: lote => {
        this.lote = lote;
      },
      error: err => {
        this.msg.error(formatErrorMsg(this.i18n.getI18Value('services.lote.individual.get.error'), err));
      }
    });
  }

  formatDate(date?: string | null): string {
    try {
      if (!date) return '';
      const formatDate = formatDateFromString(date);
      const relativeFormatDate = relativeDateToNowFromString(date, this.i18n.getDateLocale());

      return `${formatDate} (${relativeFormatDate})`;
    } catch (error) {
      return '';
    }
  }
}
