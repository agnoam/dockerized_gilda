import { UsersService } from './../../services/users-service';
import { MeetupService } from './../../services/meetup.service';
import { RanksService } from '../../services/ranks.service';
import { Component, OnInit } from '@angular/core';
import { RoutingService } from './../../services/routing.service';
import { RoutingExtService } from './../../services/routing.ext.service';
import * as moment from 'moment';
import { MonstersService } from '../../services/monsters.service';
import {MatDialog} from '@angular/material';
import { MonsterCardComponent } from './../island/components/monster-card/monster-card.component'



@Component({
  selector: 'app-meetups-card',
  templateUrl: './meetups-card.component.html',
  styleUrls: ['./meetups-card.component.scss']
})
export class MeetupsCardComponent implements OnInit {

  loggedUser: any = undefined
  nextMeetup: any = undefined
  users: Array<any> = []
  meetups: Array<any> = []
  waitingList: Array<any> = []
  attendingList: Array<any> = []
  potential_parents: Array<any> = []
  meetupDate: string = ''
  canRegister = false;
  selectedTab = undefined;
  monster : any = undefined
  credits: any[];
  fit4Adoption = false

  constructor(private router: RoutingService,
    private routingServiceExt: RoutingExtService,
    private ranksService: RanksService,
    private meetupService: MeetupService,
    private usersService: UsersService,
    private monstersServices : MonstersService,
    public dialog: MatDialog,) { }

  private setSelectedTab(path: string) {
    if (path == '/monster') this.selectedTab = 5;
    else if (path == '/meetup') this.selectedTab = 2;
    this.router.setSelectedTab(this.selectedTab);

  }

  private calcCanAdopt()
  {

    let canAdopt = true

    if (!this.loggedUser) canAdopt = false

    let potential_parents : Array<any> = this.monster.adoption_applicants
    if ( potential_parents.findIndex(x=> x== this.loggedUser.gitlab_user_id) != -1) canAdopt = false
    this.monster.monster_adoption_criteria.forEach(criterion => {
      //console.log(criterion.completion +'<'+ criterion.count)
      if (criterion.completion < criterion.count) canAdopt = false
    }, this);

    return canAdopt

  }

  updateMonster(monster : any)
  {
    this.monster = monster
    console.log(" PARENTS: "+ this.monster.adoption_applicants.length)
    this.potential_parents = this.users.filter(user => (this.monster.adoption_applicants.findIndex(x => x === user.gitlab_user_id) != -1))
    this.fit4Adoption = this.calcCanAdopt()
    console.log("UPDATED MONSTER, PARENTS: "+ this.potential_parents.length )
  }
  ngOnChanges()
  {
    this.updateMonster(this.monster)
  }
  ngOnInit() {

    this.router.getSelectedTab$().subscribe(tab => this.selectedTab = tab)

    this.credits =
      [
        {
          name: 'Graphic Design', image: 'monsters_credit_006',
          peopleList: ['Gali Avni']
        },
        { name: 'Developers', image: 'monsters_credit_005', peopleList: ['Shelly Goldblit']},
        { name: 'System', image: 'monsters_credit_004', peopleList: ['Dmitry Kreisserman'] },

        {
          name: 'Co-Founders', image: 'monsters_credit_001',
          peopleList: ['Shelly Goldblit','Gilad Bornstein']
        },
        { name: 'Facilitation', image: 'monsters_credit_003', peopleList: ['Maya Pincas'] },
        { name: 'Special Thanks', image: 'monsters_credit_002', peopleList: ['Carmel Oron'] }];

    this.router.getRoutingEvents$().subscribe((path) => this.setSelectedTab(path))
    //this.monstersServices.getMonster4Adoption$()
      //.subscribe(monster => this.updateMonster(monster), err=> {})
    this.usersService.getLoggedInUser$().subscribe((user) =>
    {
      if (user)
      {
        this.loggedUser = user
        //console.log('GIT LAB USER ID: ' + user.gitlab_user_id)
        this.monstersServices.getMonster4Adoption$()
        .subscribe(monster => this.updateMonster(monster))
        }
    })
    this.usersService.getUsers$().subscribe((users) => {
      this.users = users
      this.getNextMeetup()
      this.updateMonster(this.monster)

    })

    this.meetupService.getAllMeetups$().subscribe((meetups) => {
      this.meetups = meetups.filter(meetup => (this.isPastMeetup(meetup)));

    })
  }

  getNextMeetup() {
    //console.log('get next meetup')
    this.meetupService.getNextMeetup$().subscribe((meetup) => {
      this.nextMeetup = meetup
      this.meetupDate = moment(this.nextMeetup.date).utc().format('MMMM Do [at] H:mm');

      //console.log(this.nextMeetup.attending_list_gitlab_ids.length)
      this.attendingList = this.users.filter(user => (this.nextMeetup.attending_list_gitlab_ids.findIndex(x => x === user.gitlab_user_id) != -1))
      this.waitingList = this.users.filter(user => (this.nextMeetup.waiting_list_gitlab_ids.findIndex(x => x === user.gitlab_user_id) != -1))
      this.calcCanRegister()
    })
  }

  htmlToPlaintext(text) {
    return text ? String(text).replace(/<[^>]+>/gm, '') : '';
  }

  apply4Adoption()
  {
      this.monstersServices.apply4Adoption$(this.loggedUser.gitlab_user_id)
      .subscribe(monster => this.updateMonster(monster), err=> {})
  }

  register() {
    this.canRegister = false;
    if (this.loggedUser) this.meetupService.register()
      .subscribe((res) => {
        this.getNextMeetup()
      })
  }

  unregister() {
    this.canRegister = true;
    if (this.loggedUser) this.meetupService.unregister()
      .subscribe((res) => {
        this.getNextMeetup()
      })
  }

  calcCanRegister() {
    if (this.loggedUser &&
      this.nextMeetup.attending_list_gitlab_ids.findIndex((x) => x == this.loggedUser.gitlab_user_id) == -1 &&
      this.nextMeetup.waiting_list_gitlab_ids.findIndex((x) => x == this.loggedUser.gitlab_user_id) == -1) {
      this.canRegister = true;
    }
  }

  isPastMeetup(meetup): boolean {
    if (!meetup.date)
      return false;

    let now = new Date();
    let meetupDate = new Date(meetup.date);
    return (meetupDate && meetupDate < now);
  }

  displayMonsterCard(monster: any) {

    let dialogRef = this.dialog.open(MonsterCardComponent, {
      data: monster,
      panelClass: 'monster-card'
    });
  }

  private navigate(userRank: string, userName: string) {
    //Sets filtered used to be displayed in the island's scoreboard
    //when clicking on a user in the attending users list
    this.usersService.setFilteredUser(userName);
    this.ranksService.setCurrRank(userRank);
    //Sets selected tab to be "SCORE BOARD"
    this.router.setSelectedTab(1);
    //Navigates to corresponding island, depending on selected user's rank
    this.router.navigate('scoreboard');
  }
}
