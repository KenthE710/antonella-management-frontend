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
    host: process.env['ANT_BACKEND_HOST'] || 'http://127.0.0.1:8000',
    api_ver: process.env['ANT_BACKEND_API_VER'] || 'v1'
  },
  errors: {
    http: {
      401: false
    }
  }
} as Environment;
