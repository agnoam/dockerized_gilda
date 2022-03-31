import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { EMPTY } from 'rxjs';

import { AuthService } from './auth.service';
// import { EnvService, IEnv } from './env.service';
// import {environment} from './../../environments/environment';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // environment: IEnv;

  constructor(public auth: AuthService/*, private envService: EnvService*/) {
    // this.environment = envService.getEnvironment();
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    //let token = this.auth.getToken()    
   // if (token)
    //{
      //request.headers.append('Authorization', 'Bearer ' + `${this.auth.getToken()}`
      //)
      //request = request.clone({
       // setHeaders: {
         // Authorization: 'Bearer ' + `${this.auth.getToken()}`
       // }
      //});
      //request.headers.append('Access-Control-Allow-Origin', 'XXXXXXXX');      
      //request.headers.append('Access-Control-Allow-Credentials', 'true');;
      if (request.method == 'GET' ||  this.auth.isUserAuthenticated())
      {
        return next.handle(request);
      }
     
    
    else {
       // block unothenticated requests to server (we will only get 403)
      return EMPTY
    }
    //request.headers.append('Access-Control-Allow-Origin', '*');
    // request.headers.append('Access-Control-Allow-Origin', environment.apiUrl);
    // request.headers.append('Access-Control-Allow-Origin', environment.apiUrl+'/oauth/login');
    // request.headers.append('Access-Control-Allow-Origin', environment.apiUrl+'/oauth/redirect');


    
  }
}