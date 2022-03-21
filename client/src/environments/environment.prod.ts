interface ProdEnv {
  production: boolean;
  apiUrl: string;
  userServiceUrl?: string;
  oAuthProvider: string;
  clientID: string;
}

export const environment = {
  production: true,
  apiUrl: 'http://<some-domain>',
  oAuthProvider: '',
  clientID: ''
}
