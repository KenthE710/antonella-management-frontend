import { PageHeaderModule } from '@delon/abc/page-header';
import { ResultModule } from '@delon/abc/result';
import { SEModule } from '@delon/abc/se';
import { SGModule } from '@delon/abc/sg';
import { STModule } from '@delon/abc/st';
import { SVModule } from '@delon/abc/sv';
import { G2BarModule } from '@delon/chart/bar';
import { G2MiniAreaModule } from '@delon/chart/mini-area';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { G2PieModule } from '@delon/chart/pie';
import { G2SingleBarModule } from '@delon/chart/single-bar';
import { G2TimelineModule } from '@delon/chart/timeline';
import { DelonFormModule } from '@delon/form';
import { TimeWidgetModule } from '@delon/form/widgets/time';
import { UploadWidgetModule } from '@delon/form/widgets/upload';

export const SHARED_DELON_MODULES = [
  PageHeaderModule,
  STModule,
  SEModule,
  SVModule,
  SGModule,
  ResultModule,
  DelonFormModule,
  UploadWidgetModule,
  G2PieModule,
  TimeWidgetModule,
  G2TimelineModule,
  G2BarModule,
  G2MiniAreaModule,
  G2MiniBarModule,
  G2SingleBarModule
];
