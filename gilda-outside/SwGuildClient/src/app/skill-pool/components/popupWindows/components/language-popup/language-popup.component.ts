import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-language-popup',
  templateUrl: './language-popup.component.html',
  styleUrls: ['./language-popup.component.scss']
})
export class LanguagePopupComponent implements OnInit {
  objectKeys = Object.keys;
  constructor(public dialogRef: MatDialogRef<LanguagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public languages: any) {
  }

  ngOnInit() {
  }
  closeWindow(): void {
    this.dialogRef.close();
  }

}
