
import { Component, OnInit } from '@angular/core';
import { SkillPoolService } from '../../../services/skill-pool.service';
import { SelectItem } from 'primeng/components/common/api';

@Component({
  selector: 'app-projects-tab',
  templateUrl: './projects-tab.component.html',
  styleUrls: ['./projects-tab.component.scss']
})
export class ProjectsTabComponent implements OnInit {

  projects: any[];
  sortableOption: SelectItem[];
  selectedSortableOption: number;
  constructor(private skillPoolService: SkillPoolService) {
    this.skillPoolService.projectsSubject$.subscribe(data => {
      this.projects = data;
      this.sortList()
    })
    this.sortableOption = [{ label: 'Most popular', value: 1 },
    { label: 'Latest', value: 2 },
    { label: 'Heartbeat', value: 3 },
    // { label: 'Best Match', value: 4 }
    ];
  }

  ngOnInit() {
  }
  sortList() {
    switch (this.selectedSortableOption) {
      case 1: this.sortByPopular()
        break;
      case 2: this.sortByLatest()
        break;
      case 3: this.sortByHeartbeat()        
        break;
      // case 4: this.sortByBestMatch()
      // break;
    }
  }

  sortByHeartbeat()
  {
    const sortArray = this.projects.sort((project1, project2) => {
      return project2.heartbeat - project1.heartbeat;
    });
  }
  
  private calcProjectPopularity(project : any)
  {
    let star_count : number =  project.star_count
    return this.skillPoolService.calcProjectClones(project) + star_count
  }
  sortByPopular() {
    const sortArray = this.projects.sort((project1, project2) => {      
      return this.calcProjectPopularity(project2) - this.calcProjectPopularity(project1)    
    })
  }
  sortByLatest() {
    const sortArray = this.projects.sort((project1, project2) => {
      return new Date(project2.last_activity_at).getTime() - new Date(project1.last_activity_at).getTime();
    });
  }
  sortByBestMatch() {
    const sortArray = this.projects
  }
}
