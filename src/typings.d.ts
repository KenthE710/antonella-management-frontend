// # 3rd Party Library
// If the library doesn't have typings available at `@types/`,
// you can still use it by manually adding typings for it
import { Environment as EnvironmentDelon } from '@delon/theme';
import { NzUploadFile as _NzUploadFile } from 'ng-zorro-antd/upload';

export type JustIdRequired<T extends Object> = Partial<Omit<T, 'id'>> & Required<Pick<T, 'id'>>;

export interface Environment extends EnvironmentDelon {
  backend: {
    host: string;
    api_ver: string;
  };
  errors?: {
    http?: Record<number, boolean>;
  };
}

declare module 'ng-zorro-antd/upload' {
  interface NzUploadFile<T = any> extends _NzUploadFile {
    response?: T;
  }
}
