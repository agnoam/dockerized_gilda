import { SkillPoolService } from '../../../../../services/skill-pool.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import {RanksService} from '../../../../../services/ranks.service';

@Component({
  selector: 'app-expanded-person-details',
  templateUrl: './expanded-person-details.component.html',
  styleUrls: ['./expanded-person-details.component.scss']
})
export class ExpandedPersonDetailsComponent implements OnInit {
  personData: any;
  projectList: any[] = [];
  contributedProjectsList: any[] = [];
  pets = [];

  constructor(private skillPoolService: SkillPoolService, public dialogRef: MatDialogRef<ExpandedPersonDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public personId: number = -1, public dialog: MatDialog,  private ranksService: RanksService) {
  }

  ngOnInit() {
    this.personData = this.skillPoolService.getPersonById(this.personId);

    if (this.personData) {
      // debugger;
      this.personData.badges.projects.forEach((projectId: number) => {
        const project = this.skillPoolService.getProjectById(projectId);
    
        if (project) {
          this.projectList.push(project)
        }
      });
      this.personData.contributed_projects.forEach((projectId: number) => {
        const project = this.skillPoolService.getProjectById(projectId);
        if (project) {
          this.contributedProjectsList.push(project)
        }
      });


      let ranks = this.ranksService.getRanks()         
        
        const rankIndex = this.ranksService.getRankIndex(this.personData.rank)
        // const monsterGroup = rankIndex * 5;
        //this.currUserDetails.avatar_url = '../../assets/images/pets/no_monster.png'
        for (let i=0; i<rankIndex;i++)
        {
          for (let j=1; j<6; j++)
          {
            const monster = '../../assets/images/pets/0' + (i+1) + '_0' + j + '.svg'
            this.pets.push(monster)
          }
          
        }
        for (let i = ranks[rankIndex].step, j = 1; j <= 5; i += ranks[rankIndex].step, j++) {

          if (i <= this.personData.score - ranks[rankIndex].base) {
            const monster = '../../assets/images/pets/0' + (rankIndex+1) + '_0' + j + '.svg'
            this.pets.push(monster)
            //this.currUserDetails.avatar_url = monster
          } 
        }
    
    }
  }
  closeWindow(): void {
    this.dialogRef.close();
  }


}
