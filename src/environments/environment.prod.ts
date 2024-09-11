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
    host: 'https://kencalada.pythonanywhere.com',
    api_ver: 'v1'
  },
  errors: {
    http: {
      401: false
    }
  }
} as Environment;
