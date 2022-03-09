import { SkillPoolService } from '../../../../../services/skill-pool.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GigLevelEnum } from '../../../../enums';

@Component({
  selector: 'app-expanded-gig-details',
  templateUrl: './expanded-gig-details.component.html',
  styleUrls: ['./expanded-gig-details.component.scss']
})
export class ExpandedGigDetailsComponent implements OnInit {
  gigLevel;
  isCurrentUserAssignee: boolean = false;
  gitlabUserId: boolean = false;

  constructor(private skillPoolService: SkillPoolService, public dialogRef: MatDialogRef<ExpandedGigDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public gigData: any, public dialog: MatDialog) {
    this.gigLevel = GigLevelEnum;
  }

  ngOnInit() {
    if (this.gigData) {
      this.gigData.projectName = this.skillPoolService.getProjectName(this.gigData.project_id);
      this.checkIfCurrentUserAssignee();
    }
  }
  getProjectName(projectId) {
    this.skillPoolService.getProjectName(projectId);
  }
  checkIfCurrentUserAssignee() {
    this.gitlabUserId = this.skillPoolService.getCurrentGitlabUserId();
    if (this.gigData.assignees.find(user => user.id == this.gitlabUserId)) {
      this.isCurrentUserAssignee = true;
    }
    else {
      this.isCurrentUserAssignee = false;
    }
  }
  assignYourself() {
    this.skillPoolService.assignToGig$(
      this.gigData.project_id,
      this.gigData.id).
      subscribe(gig => {
        this.gigData = gig;
        this.isCurrentUserAssignee = true;
        this.skillPoolService.updateGigData(this.gigData);
      })
  }
  leaveGig() {
    this.skillPoolService.leaveGig$(
      this.gigData.project_id,
      this.gigData.id).
      subscribe(gig => {
        this.gigData = gig;
        this.isCurrentUserAssignee = false;
        this.skillPoolService.updateGigData(this.gigData);
      })
  }

  openConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        header: 'Assign gig',
        message: `Do you take this gig for better or for worse?
       
       The time estimate is  ${this.gigData.time_estimate} hours

       You'll have to clone the repository and work on the related issue branch 

       Start a new merge request once you are done

       Happy Gigging!`

      }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      console.log('The dialog was closed');
      if (result) {
        this.assignYourself();
      }
    });
  }
closeWindow(): void {
    this.dialogRef.close();
  }
}
