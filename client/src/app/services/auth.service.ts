// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthService {

  constructor(private cookieService : CookieService)
  {
    
  }
  //token = undefined;

  public isUserAuthenticated() : boolean{
    //if (this.getToken())
    if (this.cookieService.get('authenticated') == 'true' )
    {
      return true;
    }
    else{
      return false
    }
  }
  // public getToken(): string {
    
  //   //return localStorage.getItem('token');
  //   let token = localStorage.getItem('token')
  //   if (!token)
  //   {
  //     let cookie_token = this.cookieService.get('access_token')      
  //     //const query = document.location.search.substring(1)
  //     //let cookie = decodeURIComponent(document.cookie)
  //     if (cookie_token)
  //     {
  //       cookie_token.split('access_token=').forEach(str =>
  //         {
  //           if (str)
  //           {
              
  //             token = str.split('&')[0]
  //             localStorage.setItem('token', token )
  //           }
  //         })

  //       }
                 
        
  //   }
  //   return token
  // }

  
}