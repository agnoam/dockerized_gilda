interface ProdEnv {
  production: boolean;
  apiUrl: string;
  userServiceUrl?: string;
  oAuthProvider: string;
  clientID: string;
}

export const environment = {
  production: true,
  apiUrl: window['env']['API_URL'],
  oAuthProvider: '',
  clientID: ''
}
