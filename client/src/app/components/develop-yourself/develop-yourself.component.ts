import { Component, OnInit } from '@angular/core';
import { RanksService } from '../../services/ranks.service';

@Component({
  selector: 'app-develop-yourself',
  templateUrl: './develop-yourself.component.html',
  styleUrls: ['./develop-yourself.component.css']
})
export class DevelopYourselfComponent implements OnInit {

  selectedTabIndex : number = 0
  constructor(private ranksService : RanksService) { }

  ngOnInit() {
  }

  setCurrRank(rank : string)
  {
      this.ranksService.setCurrRank(rank)
  }
}
