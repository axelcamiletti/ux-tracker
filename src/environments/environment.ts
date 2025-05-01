import { firebaseConfig } from './firebase.config';

export const environment = {
  production: false,
  firebase: firebaseConfig,
  baseUrl: 'http://localhost:4200',
  figma: {
    accessToken: 'figd_2TOANzgLNQWD_4iuBAtWxg0Q2zgG-QcSmppRv-YY', // Token will be set at runtime
    apiUrl: 'https://api.figma.com/v1'
  }
};
