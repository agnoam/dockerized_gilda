import { RoutingService } from './../../services/routing.service';
import { RoutingExtService } from './../../services/routing.ext.service';
import { UsersService } from '../../services/users-service';
import { RanksService } from '../../services/ranks.service';
import { MonstersService } from '../../services/monsters.service'
import { MonsterCardComponent } from './components/monster-card/monster-card.component'

import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-island',
  templateUrl: './island.component.html',
  styleUrls: ['./island.component.scss'],
  animations: [
    // trigger('scaleRank', [
    //   state('small', style({
    //     transform: 'scale(0.5)',
    //   })),
    //   state('large', style({
    //     transform: 'scale(1)',
    //   })),
    //   transition('* => *', animate('500ms ease')),
    // ]),
  ]
})
export class IslandComponent implements OnInit {  
  ranks = this.ranksService.getRanks()
  currRankIndex = -1;
  rankName = ''
  currUserDetails: any
  startTab = 2;
  filter = ''

  rankMonsters: any[] = [];
  monsterUser: any;
  constructor(private routingService: RoutingService,
              private routingServiceExt: RoutingExtService,
              private ranksService: RanksService,
              private usersService: UsersService,
              private monstersService: MonstersService,
              public dialog: MatDialog,) {

  }

  //Uses for filtering user, selected in meetup attending list
  setFilter()
  {
    this.usersService.getFilteredUser$()
    .subscribe((userName: string) => {
      this.filter = userName;
      })
  }
  setSelectedTab()
  {
    if (this.currUserDetails && 
        this.currUserDetails.rank == this.rankName &&
        this.routingServiceExt.getPreviousUrl() != '/meetup')
    {
            this.startTab = 3
    }
    else
    {
      this.routingService.getSelectedTab$()
      .subscribe((tab: number) => {
        this.startTab = tab;
        })
    }
  }

  //sets users filter
  ngAfterViewInit() 
  {
    this.setFilter();
  }
  ngOnInit() {

    this.ranksService.getCurrRank$()
      .subscribe((rankIndex: number) => {
        this.currRankIndex = rankIndex
        this.rankName = this.ranks[this.currRankIndex].name
        if (!this.currUserDetails)
        {
          this.usersService.getLoggedInUser$().subscribe((res) => {
            if (res && !this.currUserDetails)
            {
              this.currUserDetails = res
              this.setSelectedTab()
            }
          }, (err) => { })
        }

        this.monstersService.getMonstersbyRank$(this.currRankIndex)
        .subscribe((res: Array<any>) => {
          this.rankMonsters= res;
          this.rankMonsters.forEach((monster) => {
            if (monster.parent !=0)
            this.usersService.getUserbyGitLabId$(monster.parent)
            .subscribe((user : any)=> monster.parentName = user.name)} , this)
          })

        })
       this.routingService.getRoutingEvents$().subscribe((path)=> this.setSelectedTab())
  }

  displayMonsterCard(monster: any) {

    console.log(`displayMonsterCard ${monster.name}`);

    let dialogRef = this.dialog.open(MonsterCardComponent, {
      data: monster,
      panelClass: 'monster-card'
    });
  }

}
