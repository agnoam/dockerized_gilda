import { RoutingService } from './../../../../services/routing.service';
import { Component, OnInit } from '@angular/core';
import {UsersService} from '../../../../services/users-service';
import { RanksService } from '../../../../services/ranks.service';



@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrls: ['./user-profil.component.css']
})
export class UserProfilComponent implements OnInit {

  currUserDetails: any;
  scoreInfo  = [

    {price: '30', action: 'Gitlab user', tooltip: 'First login to gitlab creates your user'},
    {price: '50', action: 'Gitlab avatar', tooltip: 'Set a personalized avatar rather then the default one'},
    {price: '75', action: 'First project', tooltip: 'The first gitlab project owned by you, or a group you belong to'},
    {price: '20', action: 'Next 10 projects', tooltip: 'Next 10 gitlab projects owned by you, or a group you belong to'},
    {price: '50', action: 'Shared project', tooltip: 'Gitlab projects owned by you, or a group you belong to, which recieved contributions (pull requests) from developers which are not owners of this project.'},
    {price: '10', action: 'README.md', tooltip: 'README.md file in gitlab projects owned by you, or a group you belong to (up to 11 projects)'},
    {price: '5', action: '.gitignore', tooltip: '.gitignore file in gitlab projects owned by you, or a group you belong to (up to 11 projects)'},
    {price: '1', action: 'Pull request', tooltip: 'Every pull request done by you in gitlab projects owned by you, or a group you belong to'},
    {price: '100', action: 'Contribution' , tooltip: 'Pull request done by you in gitlab projects not owned by you, or a group you belong to. First contribution to project is worth 100 points, next contributions are 30 points each'}
  ];


  constructor(private usersService: UsersService, private ranksService : RanksService, private router : RoutingService) { }

  ngOnInit() {
    this.usersService.getLoggedInUser$()
    .subscribe((res)=> {this.currUserDetails = res},
    (err)=> {console.log('rejected');})

  }

  openApplicantsScorBoard()
  {
    this.ranksService.setCurrRank('APPLICANT')
    this.router.navigate('scoreboard')
  }

}
