import { Environment } from '../typings';

export const environment = {
  production: true,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: false,
    refreshTokenType: 'auth-refresh'
  },
  backend: {
    host: 'http://127.0.0.1:8000',
    api_ver: 'v1'
  },
  errors: {
    http: {
      401: false
    }
  }
} as Environment;
