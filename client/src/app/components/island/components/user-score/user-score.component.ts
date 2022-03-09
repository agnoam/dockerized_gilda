import { ScoreBoardComponent } from './../score-board/score-board.component';
import { RoutingService } from '../../../../services/routing.service';
import {Component, OnInit, Input, SimpleChanges} from '@angular/core';
import {UsersService} from '../../../../services/users-service';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';
import {RanksService} from '../../../../services/ranks.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import {MessagePopupComponent} from '../../../../components/message-popup/message-popup.component'

@Component({
  selector: 'app-user-score',
  templateUrl: './user-score.component.html',
  styleUrls: ['./user-score.component.css']
})

export class UserScoreComponent implements OnInit {

  @Input() currUserDetails: any;
  @Input() isUserProfil: boolean;

  badges: Element[] = [];
  pets: string[] = [];
  ranks = this.ranksService.getRanks()
  isButtonDisabled: boolean = false;
  loggedInUser = undefined
  canBeRecommended : boolean = false
  recommendedBy : any

  constructor(private router: RoutingService, private ranksService: RanksService, private usersService: UsersService, private dialog: MatDialog) {


  }

  private getLoggedInUser()
  {
    this.usersService.getLoggedInUser$().subscribe((user)=>
    {
      if (user)
      {
        this.loggedInUser = user
        this.updateCanBeRecommended()
        //console.log(this.loggedInUser.name + this.loggedInUser.can_recommend);
      }
    })
  }

  displayScoreDetails(linesToDisplay: any)
  {
    let dialogRef = this.dialog.open( MessagePopupComponent, 
                                      { data: linesToDisplay,
                                        width: '80rem',
                                        height: '70rem',
                                        // minWidth: '147rem',
                                        // minHeight: '78rem',
                                        // maxWidth:'147rem',
                                        // maxHeight: '78rem'
                                      });
  }

  recommendApplicant(gitlab_user_id : number)
  {
    this.usersService.recommendApplicant$(gitlab_user_id)
    .subscribe(res => {
      this.canBeRecommended = false;
      this.loggedInUser.can_recommend = false;
      this.ranksService.setCurrRank(this.loggedInUser.rank)
      this.usersService.refreshCurrentUser()
      this.router.navigate('scoreboard')
    })


  }

  private updateCanBeRecommended()
  {
    this.canBeRecommended  = 
      this.loggedInUser &&
      this.loggedInUser.can_recommend &&
      this.currUserDetails &&
      this.currUserDetails.recommended_by == 0
  }

  private setCurrUserData() {
    const newLine = '<br/>'
    if (this.currUserDetails) {

      if (this.currUserDetails && this.currUserDetails.recommended_by != 0)
      {
        this.usersService.getUserbyGitLabId$(this.currUserDetails.recommended_by)
        .subscribe((user: any) => {this.recommendedBy= user})
      }
      this.updateCanBeRecommended()

      this.badges = []
      this.pets = []

      this.badges.push({
        val: this.currUserDetails.contributed_projects.length + this.currUserDetails.badges.projects_shared.length,
        badge: 'Code Shares',
        tooltip: this.currUserDetails.badges.projects_shared.length + ' shared projects + ' + this.currUserDetails.contributed_projects.length + ' projects contributed'
      })

      this.badges.push({
        val: this.currUserDetails.badges.projects.length,
        badge: 'Gitlab Projects',
        tooltip: this.currUserDetails.badges.projects.length + ' gitlab projects owned by you or a group you belong to'
      })
      // this.badges.push({val : this.currUserDetails.badges.snippets.length, badge : 'Snippets'})
	  let pull_req_num = this.currUserDetails.badges.pull_requests.length + this.currUserDetails.badges.contributed_pull_requests.length
      this.badges.push({
        val: pull_req_num,
        badge: 'Pull Requests',
        tooltip:  pull_req_num +' pull requests done by you in gitlab projects'
      })
      this.badges.push({
        val: this.currUserDetails.badges.challenges_solved.length,
        badge: 'Challenges Solved ',
        tooltip: this.currUserDetails.badges.challenges_solved.length + ' challenges cracked'
      })
      this.badges.push({
        val: this.currUserDetails.badges.members_recommended.length,
        badge: 'Members Recommended',
        tooltip: this.currUserDetails.badges.members_recommended.length + ' members recommended by you'})

      const rankIndex = this.ranksService.getRankIndex(this.currUserDetails.rank)
      // const monsterGroup = rankIndex * 5;
      //this.currUserDetails.avatar_url = '../../assets/images/pets/no_monster.png'
      for (let i = this.ranks[rankIndex].step, j = 1; j <= 5; i += this.ranks[rankIndex].step, j++) {

        if (i <= this.currUserDetails.score - this.ranks[rankIndex].base) {
          const monster = '../../assets/images/pets/0' + (rankIndex+1) + '_0' + j + '.svg'
          this.pets.push(monster)
          //this.currUserDetails.avatar_url = monster
        } else {
          this.pets.push('../../assets/images/pets/0' + (rankIndex+1) + '_0' + j + '_black.svg')
        }
      }

    }

  }

  ngOnInit() {
    //
    this.getLoggedInUser()
    this.setCurrUserData()
    //console.log('user-score init')
  }
  ngOnChanges(changes: SimpleChanges)
  {
    //this.setCurrUserData()
    //console.log('CAN BE RECOMENDED : '+ this.canBeRecommended + ' LOGGEDINUSER: ' + (this.loggedInUser) )
    //console.log('data change')
  }

}

export interface Element {
  badge: string;
  val: number;
  tooltip: string;
}
