import { SkillPoolService } from '../../../services/skill-pool.service';
import { Component, OnInit, Input } from '@angular/core';
import { SelectItem } from 'primeng/components/common/api';

@Component({
  selector: 'app-people-tab',
  templateUrl: './people-tab.component.html',
  styleUrls: ['./people-tab.component.scss']
})
export class PeopleTabComponent implements OnInit {
  people: any;
  sortableOption: SelectItem[];
  selectedSortableOption: number;
  constructor(private skillPoolService: SkillPoolService) {
    this.skillPoolService.peopleSubject$.subscribe(data => {
      this.people = data;
    })
    this.sortableOption =
     [{ label: 'Repositories', value: 1 },
      { label: 'Rank', value: 2},
  ];
  }

  ngOnInit() {
  }
  sortList() {
    switch (this.selectedSortableOption) {
      case 1: this.sortByProjectsNum()
        break;
      case 2: this.sortByScore()
        break;
    }
  }
  sortByProjectsNum() {
     this.people.sort((people1, people2) => {
      return (people2.badges.projects.length+ people2.contributed_projects.length) - 
      (people1.badges.projects.length + people1.contributed_projects.length)
    });
  }

  sortByScore() {
    this.people.sort((people1, people2) => {
     return (people2.score) - (people1.score)
   });
 }
}
