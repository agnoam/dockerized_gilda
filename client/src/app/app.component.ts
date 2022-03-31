import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry, MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MatGridListModule } from '@angular/material/grid-list';
import 'rxjs/add/operator/filter';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AvtamComponent} from "./components/avtam/avtam.component";
import { UsersService } from './services/users-service';
import { EnvService, IEnv } from './services/env.service';

import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  selected: string = ''
  environment: IEnv = null;

  navItems = [
    { name: 'SCORE BOARD', route: '/scoreboard' },
    { name: 'DEVELOP YOURSELF', route: '/develop' },
    { name: 'ABOUT GILDA', route: '/about' }
  ]

  constructor(
    iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private dialog: MatDialog, 
    private usersService: UsersService, private envService: EnvService, private http: HttpClient
  ) {
    // To avoid XSS attacks, the URL needs to be trusted from inside of your application.
    const avatarsSafeUrl = sanitizer.bypassSecurityTrustResourceUrl('./assets/avatars.svg');

    iconRegistry.addSvgIconSetInNamespace('avatars', avatarsSafeUrl);
    this.select(this.navItems[0].name);
    //console.log(this.selected)
  }

  select(selected: string) {
    this.selected = selected;
  }

  isSelected(nav: string) {
    return nav == this.selected;
  }

  openAdminDialog() { }

  isModalOpened = false;
  ngOnInit() {
    this.envService.fetchVariables();
    this.environment = this.envService.getEnvironment();

    this.usersService.getLoggedInUser$().subscribe((user : any) => {
      if (user && !this.isModalOpened) {
        console.log("user logged in");
          if (!user.approved_data_security_statement) {
            this.isModalOpened = true;
            this.openModal();
          }
      }
    });
  }

  openModal() {
    //this.isModalAvtam = true;
    return this.dialog.open(AvtamComponent, {
      width: '500px',
      height: '350px',
      disableClose: true,
      data: {

      }
    }).afterClosed().toPromise().then(async (res) => {
      if (res) {
        this.usersService.ishurAvtam();
      }
    });
  }
}
