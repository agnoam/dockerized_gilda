import {Component, OnInit} from '@angular/core';
import {RanksService} from '../../services/ranks.service';
import {UsersService} from '../../services/users-service';
import {MeetupService} from '../../services/meetup.service'
import {RoutingService} from '../../services/routing.service'
import * as moment from 'moment';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  ranks: Array<any>
  tiles: Array<any>
  islands:Array<any>
  nextMeetup : any
  currUserRank = -1


  constructor(private routingService : RoutingService, private ranksService: RanksService, public usersService: UsersService, private meetupsService: MeetupService) {

    this.islands =
    [
      {habitants: 'Grandmasters',
      rank:5,
      route: '/scoreboard',
      left:'65rem',
      top :'0',
      width: '40rem',
      cardRight:'10rem',
      cardTop:'-4rem',
      arraowImage: 'ARROW_text_left.png',
      arrowTop: '-10rem',
      arrowRight: '-5rem'
    },
      {habitants: 'Masters',
      rank:4,
      route: '/scoreboard',
      left:'150rem',
      top:'14rem',
      width:'40rem',
      cardRight:'9rem',
      cardTop:'-2rem',
      arraowImage: 'ARROW_text_down.png',
      arrowTop: '0rem',
      arrowRight: '10rem'
    },
    {
      habitants: 'Applicants',
      rank:0,
      route: '/scoreboard',
      left:'10rem',
      top :'19rem',
      width: '40rem',
      cardRight:'9rem',
      cardTop:'-5rem',
      arraowImage: 'ARROW_text_left.png',
      arrowTop: '-20rem',
      arrowRight: '0rem'
    },
    {
      habitants: 'Apprentices',
      rank:1,
      route: '/scoreboard',
      left:'17rem',
      top :'54rem',
      width: '40rem',
      cardRight:'0rem',
      cardTop:'-10rem',
      arraowImage: 'ARROW_text_left.png',
      arrowTop: '-12rem',
      arrowRight: '-7rem'
    },
    {
      habitants: 'Craftsmen',
      rank:2,
      route: '/scoreboard',
      left:'70rem',
      top :'69rem',
      width: '40rem',
      cardRight:'8rem',
      cardTop:'-7rem',
      arraowImage: 'ARROW_text_left.png',
      arrowTop: '-25rem',
      arrowRight: '-7rem'
    },
    {
      habitants: 'Journeymen',
      rank:3,
      route: '/scoreboard',
      left:'130rem',
      top :'49rem',
      width: '40rem',
      cardRight:'6rem',
      cardTop:'-12rem',
      arraowImage: 'ARROW_text_left.png',
      arrowTop: '0rem',
      arrowRight: '-7rem'
    },
    {
      habitants: 'Members',
      rank:6,
      route: '/meetup',
      left:'59.4rem',
      top :'23rem',
      width: '65rem',
      cardRight:'10rem',
      cardTop:'4rem',
      arraowImage: 'meetup_sign_blue.png',
      arrowTop: '0rem',
      arrowRight: '-5rem'
    },]

      this.ranks = this.ranksService.getRanks()
  }

  ngOnInit() {

    this.usersService.getLoggedInUser$().subscribe((user : any) =>
    {
      if (user !== undefined)
         this.currUserRank = this.ranksService.getRankIndex(user.rank)
    })

    this.usersService.getUsers$().subscribe((res) =>
    {
      this.ranks.forEach((rank) => rank.habitants = res.filter(x => x.rank === rank.name).length)
      this.ranks[this.ranks.length-1].habitants = res.length// - res.filter(x => x.rank === 'APPLICANT').length
    })

    this.meetupsService.getNextMeetup$()
    .subscribe((meetup) =>
      {

        this.nextMeetup = meetup
        let nextMeetupDate : Date = new Date(this.nextMeetup.date)
        this.ranks[this.ranks.length-1].score = moment(nextMeetupDate).utc().format('D/M/YYYY');


      })
  }

  private navigate(path:string, rankIndex: number)
  {
    this.ranksService.setCurrRankIndex(rankIndex)
    //sets default tab selection
    this.routingService.setSelectedTab(2);
    //clears users filter in the scoreboard tab
    this.usersService.setFilteredUser('');
    this.routingService.navigate(path);
  }

}
