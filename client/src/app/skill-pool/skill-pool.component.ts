import { SkillPoolService } from '../services/skill-pool.service';
import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-skill-pool',
  templateUrl: './skill-pool.component.html',
  styleUrls: ['./skill-pool.component.scss']
})
export class SkillPoolComponent implements OnInit {

  constructor(private skillPoolService:SkillPoolService) { }

  ngOnInit() {
  }
  tabChanged(tabChangeEvent: MatTabChangeEvent): void  {
    this.skillPoolService.updateSelectedTabIndex(tabChangeEvent.index);
  }
  
}
