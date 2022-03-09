import {
  ExpandedPersonDetailsComponent
} from '../../popupWindows/components/expanded-person-details/expanded-person-details.component';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-person-item',
  templateUrl: './person-item.component.html',
  styleUrls: ['./person-item.component.scss']
})
export class PersonItemComponent implements OnInit {
  @Input() personData: any;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  openDialog(event): void {
    const dialogRef = this.dialog.open(ExpandedPersonDetailsComponent, {
      data: this.personData.gitlab_user_id
    });
  }
}
