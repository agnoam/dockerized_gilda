import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'avtam-pop-up',
  templateUrl: './avtam.component.html',
  styleUrls: ['./avtam.component.scss'],

})
export class AvtamComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<AvtamComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  ishur() {
    //TODO: Save in DB

    this.dialogRef.close(true);
  }

}
