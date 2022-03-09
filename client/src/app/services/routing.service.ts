import { RanksService } from './ranks.service';
import { UsersService } from './users-service';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class RoutingService {

  routingOccured$ = new Subject<string>()
  selectedTab = 2;
  selectedTab$: BehaviorSubject<number> = new BehaviorSubject(this.selectedTab)

  constructor(private router: Router, private usersService: UsersService, private ranksService: RanksService) {

  }

  getSelectedTab$() {
    return this.selectedTab$;
  }

  setSelectedTab(selectedTab: number) {
    this.selectedTab = selectedTab
    this.selectedTab$.next(this.selectedTab)
  }

  getRoutingEvents$() {
    return this.routingOccured$
  }
  navigate(to: string) {
    console.log('navigating to ' + to)
    this.router.navigate([to])
    this.routingOccured$.next(to);
  }

  navigateToUserScoreboard(userRank: string, userName: string) {
    //Sets filtered used to be displayed in the island's scoreboard
    //when clicking on a user in the attending users list
    this.usersService.setFilteredUser(userName);
    this.ranksService.setCurrRank(userRank);
    //Sets selected tab to be "SCORE BOARD"
    this.setSelectedTab(1);
    //Navigates to corresponding island, depending on selected user's rank
    this.navigate('scoreboard');
  }
}
