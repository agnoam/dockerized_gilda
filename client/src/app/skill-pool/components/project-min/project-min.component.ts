import { Component, OnInit, Input } from '@angular/core';
import { ExpandedProjectDetailsComponent } from '../popupWindows/components/expanded-project-details/expanded-project-details.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-project-min',
  templateUrl: './project-min.component.html',
  styleUrls: ['./project-min.component.scss']
})
export class ProjectMinComponent implements OnInit {
  @Input() projectData: any;
  @Input() isOpenExpandedWindow: boolean = true;
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  openExpandedProject(): void {
    const dialogRef = this.dialog.open(ExpandedProjectDetailsComponent, {
      data: this.projectData.project_id
    });
  }
}
