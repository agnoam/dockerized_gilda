import { GigLevelEnum } from '../../../../enums';
import { SkillPoolService } from '../../../../../services/skill-pool.service';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { EnumType } from 'typescript';

@Component({
  selector: 'app-new-gig',
  templateUrl: './new-gig.component.html',
  styleUrls: ['./new-gig.component.scss']
})
export class NewGigComponent implements OnInit {
  projectList: any[] = [];
  selectedProject: any = {};
  selectedIssue: any = {};
  selectedGig: any = {};
  tagLabelsList: string[] = [];
  langLabelsList: string[] = [];

  levelOption
  // default values
  defaultLevel: number = 1;
  defaultDurationTime: number = 5;
  selectedLevel: number;
  durationTime: number;

  disableSetting: boolean = true;//save changes button
  disableAdding: boolean = true; //set as gig button

  constructor(public dialogRef: MatDialogRef<NewGigComponent>, private skillPoolService: SkillPoolService) {
    dialogRef.disableClose = true;    
    this.levelOption = this.enumToArray(GigLevelEnum);
  }

  ngOnInit() {
    this.projectList = this.skillPoolService.getProjectsToCurrentUser();
  }

  enumToArray(enumme): Array<any> {
    let array = Object.keys(enumme).map(key => ({ label: key, value: enumme[key] }));
    const length = array.length;
    array = array.slice(length / 2, length);
    return array;
  }

  chooseProject(projectId: number, index: number) {
    this.skillPoolService.getExpandedProjectById$(projectId)
      .subscribe((project) => {
        this.selectedProject = project;
        this.tagLabelsList = this.selectedProject.tag_list.slice(0);
        this.langLabelsList = Object.keys(this.selectedProject.languages);
        this.cancelIssueSelection();
        this.cancelGigSelection();
      });
  }
  cancelIssueSelection() {
    if (!this.disableAdding) {
      this.selectedIssue = {};
      this.disableAdding = true;
    }
  }
  selectIssue(issue) {
    this.cancelGigSelection();
    this.selectedIssue = issue;
    // enable to set gig
    this.disableAdding = false;
    this.selectedLevel = this.defaultLevel;
    this.durationTime = this.defaultDurationTime;

  }
  cancelGigSelection() {
    if (!this.disableSetting) {
      this.disableSetting = true;
      this.selectedLevel = this.defaultLevel;
      this.durationTime = this.defaultDurationTime;
    }
  }
  selectGig(gig) {
    this.cancelIssueSelection();
    //enable to update gig
    this.disableSetting =  gig.closed_at? true: false;
    this.selectedGig = gig;
    this.selectedLevel = this.selectedGig.level;
   
    this.durationTime=this.selectedGig.time_estimate
  }
  closeWindow(): void {
    this.dialogRef.close();
  }
  addGig() {
    this.skillPoolService.addGig$(
      this.selectedProject.project_id,
      this.selectedIssue.iid,
      this.selectedLevel,
      this.durationTime)
      .subscribe((new_gig) => {
        this.skillPoolService.updateGigData(new_gig)
        console.log("gig saved")
      })
    this.closeWindow();
  }
  updateGig() {
    this.skillPoolService.updateGig$(
      this.selectedProject.project_id,
      this.selectedGig.iid,
      this.selectedLevel,
      this.durationTime)
      .subscribe((updatedGig) => {
        console.log("gig updated")
        this.skillPoolService.updateGigData(updatedGig);
      })
    this.closeWindow();
  }
}
