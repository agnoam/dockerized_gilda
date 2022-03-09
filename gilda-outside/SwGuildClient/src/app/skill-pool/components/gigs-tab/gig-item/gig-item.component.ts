import { GigLevelEnum } from '../../../enums';
import { SkillPoolService } from '../../../../services/skill-pool.service';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ExpandedGigDetailsComponent } from '../../popupWindows/components/expanded-gig-details/expanded-gig-details.component';

@Component({
  selector: 'app-gig-item',
  templateUrl: './gig-item.component.html',
  styleUrls: ['./gig-item.component.scss']
})
export class GigItemComponent implements OnInit {
  @Input() gigData: any;
  gigLevel;

  constructor(private skillPoolService: SkillPoolService, public dialog: MatDialog) {
    this.gigLevel = GigLevelEnum;
  }

  ngOnInit() {
    if (this.gigData) {
      this.gigData.projectName = this.skillPoolService.getProjectName(this.gigData.project_id);
    }
  }

  openDialog(event): void {
    const dialogRef = this.dialog.open(ExpandedGigDetailsComponent, {
      data: this.gigData
    });
  }
}
