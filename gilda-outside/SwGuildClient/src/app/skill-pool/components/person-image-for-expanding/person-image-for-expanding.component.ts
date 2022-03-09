import { Component, OnInit, Input } from '@angular/core';
import { ExpandedPersonDetailsComponent } from '../popupWindows/components/expanded-person-details/expanded-person-details.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-person-image-for-expanding',
  templateUrl: './person-image-for-expanding.component.html',
  styleUrls: ['./person-image-for-expanding.component.scss']
})
export class PersonImageForExpandingComponent implements OnInit {

  @Input() personName: string;
  @Input() personId: number;
  @Input() personAvatarUrl: string;

  @Input() imgWidth: number = 54;
  @Input() imgHeight: number = 54;
  @Input() imgBorderRadius: number = 50;
  styleObj: object;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.styleObj = {
      'width': `${this.imgWidth}px`,
      'height': `${this.imgHeight}px`,
      'border-radius': `${this.imgBorderRadius}%`
    }
  }

  openExpandedPersonDetails(): void {
    const dialogRef = this.dialog.open(ExpandedPersonDetailsComponent, {
      data: this.personId
    });
  }
}
