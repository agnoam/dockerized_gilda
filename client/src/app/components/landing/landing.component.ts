import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users-service';
import { AuthService } from '../../services/auth.service';
import { RoutingService } from '../../services/routing.service';
import { CookieService } from 'ngx-cookie-service';




@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(private authService : AuthService, private usersService: UsersService, private router : RoutingService, private cookieService : CookieService) {    
  }

  ngOnInit() {
    if (this.authService.isUserAuthenticated())
    {

      //let cookie = decodeURIComponent(document.cookie)
      //let baseurl = 'homepage'

      let baseurl = this.cookieService.get('baseUrl') || 'homepage'
      this.usersService.getLoggedInUser$().subscribe(res=>{})
      this.router.navigate(baseurl)
    }
    else{
      this.usersService.signIn()
    }
  }

}
