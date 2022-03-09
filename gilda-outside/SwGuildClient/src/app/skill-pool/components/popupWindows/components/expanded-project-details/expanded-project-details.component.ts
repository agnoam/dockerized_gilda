import { SkillPoolService } from '../../../../../services/skill-pool.service';

import { Component, OnInit, Input, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { PeoplePopupComponent } from '../people-popup/people-popup.component';
// import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { LanguagePopupComponent } from '../language-popup/language-popup.component';
import { ExpandedGigDetailsComponent } from '../expanded-gig-details/expanded-gig-details.component';

@Component({
  selector: 'app-expanded-project-details',
  templateUrl: './expanded-project-details.component.html',
  styleUrls: ['./expanded-project-details.component.scss']
})
export class ExpandedProjectDetailsComponent implements OnInit {
  ownersList: any[] = [];
  contributorsList: any[] = [];
  communityList: any[] = [];
  potentialDevelopersList: any[] = [];
  objectKeys = Object.keys;
  projectData: any;

  constructor(private skillPoolService: SkillPoolService, public dialogRef: MatDialogRef<ExpandedProjectDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public projectId: number, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.skillPoolService.getExpandedProjectById$(this.projectId).subscribe((data) => {
      this.projectData = data;
    
      this.projectData.owners.forEach((personId: number) => {
        const person = this.skillPoolService.getPersonById(personId);
        if (person) {
          this.ownersList.push(person)
        }
      });
      this.projectData.contributors.forEach((personId: number) => {
        const person = this.skillPoolService.getPersonById(personId);
        if (person) {
          this.contributorsList.push(person)
        }
      });
      this.projectData.community.forEach((personId: number) => {
        const person = this.skillPoolService.getPersonById(personId);
        if (person) {
          this.communityList.push(person)
        }
      });
      
      this.projectData.potential_developers.forEach((personId: number) => {
        const person = this.skillPoolService.getPersonById(personId);
        if (person) {
          this.potentialDevelopersList.push(person)
        }
      });
    })
  }
  // getRandomColor() {
  //   var letters = '0123456789ABCDEF';
  //   var color = '#';
  //   for (var i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  // }
  closeWindow(): void {
    this.dialogRef.close();
  }

  openPeoplePopupDialog1(event): void {
    const dialogRef = this.dialog.open(PeoplePopupComponent, {
      data: [{ title: 'Owners', peopleGroup: this.ownersList },
      { title: 'Contributors', peopleGroup: this.contributorsList }]
    });
  }
  openPeoplePopupDialog2(event): void {
    const dialogRef = this.dialog.open(PeoplePopupComponent, {
      data: [{ title: 'Community members', peopleGroup: this.communityList },
      { title: 'Potential developers', peopleGroup: this.potentialDevelopersList }]
    });
  }
  openLanguageDialog(): void {
    const dialogRef = this.dialog.open(LanguagePopupComponent, {
      data: this.projectData.languages
    });
  }
  openExpandedGigDetails(gig): void {
    const dialogRef = this.dialog.open(ExpandedGigDetailsComponent, {
      data: gig
    });
  }
  
  addStar() {
    this.skillPoolService.addStarToProject$(
      this.projectData.project_id).
      subscribe(project => {
        this.projectData = project;
        this.skillPoolService.updateProjectData(project)
      })
  }
  unStar() {
    this.skillPoolService.unStarToProject$(
      this.projectData.project_id).
      subscribe(project => {
        this.projectData = project;
        this.skillPoolService.updateProjectData(project)
      })
  }

  
  calcClones()
  {
    return this.skillPoolService.calcProjectClones(this.projectData)
  }

  copyUrl() {
    const el = document.createElement('textarea');
    el.value = this.projectData.http_url_to_repo;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

  }
  // joinMattermost() {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     data: { header: 'mattermost', message: 'do you want joing to mattermost' }
  //   });
  //   dialogRef.afterClosed().subscribe((result: boolean) => {
  //     console.log('The dialog was closed');
  //     if (result) {
  //       this.skillPoolService.joinToProjectMattermost$(this.projectData.id).subscribe((url: string) => {
  //         // doent work
  //         window.open(url, "_blank");
  //       })
  //     }
  //   });
  // }
}
