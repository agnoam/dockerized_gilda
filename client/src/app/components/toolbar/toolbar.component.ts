import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users-service';
import { RanksService } from '../../services/ranks.service';
import { RoutingService } from "../../services/routing.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { HelpPageComponent } from '../../components/help-page/help-page.component'
import { FormatWidth } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { EnvService, IEnv } from './../../services/env.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  currUserDetails: any
  isLogedIn: boolean = false
  showStartHereArrow: boolean = false;
  environment: IEnv;

  constructor(
    private authService : AuthService, private usersService: UsersService, private envService: EnvService,
    private ranksService: RanksService, private router: RoutingService, private dialog: MatDialog
  ) { 
    this.environment = envService.getEnvironment();
  }

  ngOnInit() {

    this.checkIfIWasHere();
    //this.saveBaseUrl()
    // if (!this.authService.isUserAuthenticated())
    // {      
    //   this.usersService.signIn()
    // }
    this.getLoggedUser()

  }
  // private saveBaseUrl() {
  //   let baseUrl: string = localStorage.getItem('baseUrl')
    
  //   console.log(`BaseUrl was ${baseUrl}`);
  //   localStorage.setItem('BaseUrl', window.location.pathname);
  //   console.log(`BaseUrl is ${baseUrl}`);
    
    
  // }

  signIn() {
    this.usersService.signIn()
  }
  
  private checkIfIWasHere() {
    let numOfVisits: number = Number(localStorage.getItem('GildaWasHere'));
    if (!numOfVisits)
      numOfVisits = 0;

    numOfVisits++;
    console.log(`Gilda Was Here ${numOfVisits} times`);
    localStorage.setItem('GildaWasHere', String(numOfVisits));
    this.showStartHereArrow = (numOfVisits <= 2);
  }

  private getLoggedUser() {
    this.usersService.getLoggedInUser$()
      .subscribe((res) => { if (res) { this.isLogedIn = true; this.currUserDetails = res } },
        (err) => { console.log('rejected'); })
  }
  goToProfile() {
    if (this.isLogedIn) {
      this.ranksService.setCurrRank(this.currUserDetails.rank)
      //console.log('kuku')
      this.router.navigate('scoreboard')

    }
  }

  displayHelp() {
    console.log(`displayHelp`);

    let dialogRef = this.dialog.open(HelpPageComponent);
  }

  
 }
