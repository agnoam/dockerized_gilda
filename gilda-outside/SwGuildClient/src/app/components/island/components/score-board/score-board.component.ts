import {RanksService} from '../../../../services/ranks.service';
import {UsersService} from '../../../../services/users-service';
import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.css']
})
export class ScoreBoardComponent implements OnInit {
  @Input() filter: string;
  ranks: Array<any> = this.ranksService.getRanks();
  users: Array<any> = [];
  rankUsers: Array<any> = [];
  value = '';


  constructor(private usersService: UsersService,
              private ranksService: RanksService) {

  }

  badges: Array<string> = [];
  // rankIndex = -1
  currRankIndex = 0;

  // private findRankIndex(rankname : string)
  // {
  //   console.log('arnk :' +rankname)
  //    return this.ranks.findIndex((x) => x.name === rankname)
  // }
  // changeRank()
  // {
  //   console.log(this.users[0])
  //   let currRank = this.rank.toUpperCase()
  //   this.rankusers = this.users.filter(x => x.rank === currRank)
  // }


  // ngDoCheck() {
  //   if (this.value = '') this.filterRankUsers()
  //   else
  //   {
  //     console.log('FILTER: ' + this.value)
  //     let words = this.value.split(" ")
  //     words.forEach ((word : string)=>
  //       {
  //         console.log(word)
  //         word = word.toUpperCase()
  //         this.filterRankUsers()
  //       },this)
  //     console.log(this.rankUsers.length)
  //   }
  // }

  ngOnInit() {
    this.usersService.getUsers$()
    .subscribe((res) =>
    {
        this.users=res
        this.filterRankUsers()
        //Explicitly calls filter processing logic
        //Used for displaying filtered user details
        //when navigating from meetups attending users list
        this.onFilterChange();

    })
    this.ranksService.getCurrRank$().subscribe((rankIndex : number) =>
    {
      this.currRankIndex = rankIndex
      this.filterRankUsers()
    })
  }

  private filterRankUsers()
  {
    this.rankUsers = this.users.filter(x => x.rank === this.ranks[this.currRankIndex].name)
  }

  onFilterChange()
  {
    console.log('ON CHANGE FILTER: ' + this.filter)
    this.filterRankUsers()

    if (this.filter == "$") {
      this.rankUsers = this.rankUsers.filter(x=>(x.active && x.recommended_by == 0))
    }
    else {
      console.log('FILTER: ' + this.filter)
      let words = this.filter.split(" ")
      console.log(words[0])
      words.forEach ((word : string)=>
        {
          console.log(word)
          let name = word.toUpperCase()
          let username = word.toLowerCase()
          this.rankUsers = this.rankUsers.filter(x=>((x.name != undefined && x.username != undefined) && (x.name.indexOf(name) > -1 || x.username.indexOf(username) > -1)))
        },this)
      console.log(this.rankUsers.length)
    }
  }

  ngOnChanges()
  {
      this.onFilterChange();
  }

}

