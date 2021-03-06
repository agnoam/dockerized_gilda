// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

interface IEnv {
  production: boolean;
  apiUrl: string;
  oAuthProvider: string;
  clientID: string;
  userServiceUrl?: string;
}

export const environment: IEnv = {
  production: false,
  apiUrl: window['env']['API_URL'] || 'http://<some-domain>',
  oAuthProvider: '',
  clientID: ''
}
