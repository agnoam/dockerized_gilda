import { SkillPoolService } from '../../../services/skill-pool.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { MatDialog } from '@angular/material';
import { ExpandedGigDetailsComponent } from '../popupWindows/components/expanded-gig-details/expanded-gig-details.component';
@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrls: ['./user-profil.component.scss']
})
export class UserProfilComponent implements OnInit {

  @ViewChild("opAddInterestLabels") opAddInterestLabels: OverlayPanel;
  @ViewChild("opAddSkillsLabels") opAddSkillsLabels: OverlayPanel;

  currentUser: any;
  userProjects: any[];

  skillsLabels: string[] = [];
  interestLabels: string[] = [];

  constructor(public dialog: MatDialog, private skillPoolService: SkillPoolService) {
    // this.userProjects = [{ name: 'title1' }, { name: 'title1' }, { name: 'title1' }, { name: 'title4' }, { name: 'title5' }];\
    this.skillPoolService.currentUserSubject$.subscribe(user => {
      console.log("user updated");
      this.currentUser = user;
      this.buildLablesList();
    })
  }

  ngOnInit() {
  }
  
  buildLablesList() {
    if (this.currentUser)
    {
      if (this.currentUser.skills_langs) {
        this.skillsLabels = this.currentUser.skills_langs;
        if (this.currentUser.skills_tags)
          this.skillsLabels = this.currentUser.skills_langs.concat(this.currentUser.skills_tags);
      }
      if (this.currentUser.wants_to_learn_langs) {
        this.interestLabels = this.currentUser.wants_to_learn_langs;
        if (this.currentUser.wants_to_learn_tags)
          this.interestLabels = this.currentUser.wants_to_learn_langs.concat(this.currentUser.wants_to_learn_tags);
      }
    }
  }

  autoUpdateChange(event) {
    this.skillPoolService.updateUserAutoupdate(this.currentUser.gitlab_user_id, event.checked)
  }
  closeSkillsSelection() {
    this.opAddSkillsLabels.hide();
  }
  cancelSkillsSelection() {
    this.closeSkillsSelection();
  }
  doneSkillsSelection(event) {
    this.skillPoolService.updateUserSkills(this.currentUser.gitlab_user_id, event.value);

    this.closeSkillsSelection();
  }

  closeInterestSelection() {
    this.opAddInterestLabels.hide();
  }
  cancelInterestSelection() {
    this.closeInterestSelection();
  }
  doneInterestSelection(event) {
    this.skillPoolService.updateUserFieldsOfInterest(this.currentUser.gitlab_user_id, event.value);
    this.closeInterestSelection();
  }
  
  openExpandedGigDetails(index): void {
    const dialogRef = this.dialog.open(ExpandedGigDetailsComponent, {     
      data: this. currentUser.gigs[index]
    });

  }

}
