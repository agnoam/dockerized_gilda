import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-people-popup',
  templateUrl: './people-popup.component.html',
  styleUrls: ['./people-popup.component.scss']
})
export class PeoplePopupComponent implements OnInit {

  //i want to get array[{title:'',peopleGroup:[persons]}]

  constructor(public dialogRef: MatDialogRef<PeoplePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }
  closeWindow(): void {
    this.dialogRef.close();
  }
}
