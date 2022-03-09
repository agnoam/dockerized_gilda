import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService : AuthService, private cookieService : CookieService)
  {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.authService.isUserAuthenticated()
  }
}
