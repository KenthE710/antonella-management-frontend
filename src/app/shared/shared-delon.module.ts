import { PageHeaderModule } from '@delon/abc/page-header';
import { ResultModule } from '@delon/abc/result';
import { SEModule } from '@delon/abc/se';
import { STModule } from '@delon/abc/st';
import { SVModule } from '@delon/abc/sv';
import { G2PieModule } from '@delon/chart/pie';
import { DelonFormModule } from '@delon/form';
import { TimeWidgetModule } from '@delon/form/widgets/time';
import { UploadWidgetModule } from '@delon/form/widgets/upload';

export const SHARED_DELON_MODULES = [
  PageHeaderModule,
  STModule,
  SEModule,
  SVModule,
  ResultModule,
  DelonFormModule,
  UploadWidgetModule,
  G2PieModule,
  TimeWidgetModule
];
