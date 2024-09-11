// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import * as MOCKDATA from '@_mock';
import { mockInterceptor, provideMockConfig } from '@delon/mock';

import { Environment } from '../typings';

export const environment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: false,
    refreshTokenType: 'auth-refresh' //'re-request'
  },
  backend: {
    host: process.env['ANT_BACKEND_HOST'] || 'http://127.0.0.1:8000',
    api_ver: process.env['ANT_BACKEND_API_VER'] || 'v1'
  },
  errors: {
    http: {
      401: false
    }
  },
  providers: [provideMockConfig({ data: MOCKDATA })],
  interceptorFns: [mockInterceptor]
} as Environment;
