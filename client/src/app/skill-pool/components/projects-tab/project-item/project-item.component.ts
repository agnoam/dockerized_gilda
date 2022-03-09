import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ExpandedProjectDetailsComponent } from '../../popupWindows/components/expanded-project-details/expanded-project-details.component';
import { SkillPoolService } from '../../../../services/skill-pool.service'


@Component({
  selector: 'app-project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.scss']
})
export class ProjectItemComponent implements OnInit {

  @Input() projectData: any;
  objectKeys = Object.keys;

  constructor(public dialog: MatDialog, private skillPoolService: SkillPoolService) { }

  ngOnInit() {
  }

  calcClones()
  {
    return this.skillPoolService.calcProjectClones(this.projectData)
  }

  openDialog(event): void {
    const dialogRef = this.dialog.open(ExpandedProjectDetailsComponent, {
      data: this.projectData.project_id
    });
  }

}
