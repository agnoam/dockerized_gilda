interface ProdEnv {
  production: boolean;
  apiUrl: string;
  userServiceUrl?: string;
  oAuthProvider: string;
  clientID: string;
}

export const environment = {};
