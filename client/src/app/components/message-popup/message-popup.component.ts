import {Component, OnInit, Input, Inject, ViewChild, ElementRef} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';//import { inherits } from 'util';
import {NguCarousel} from '@ngu/carousel';

@Component({
  selector: 'message-popup',
  templateUrl: './message-popup.component.html',
  styleUrls: ['./message-popup.component.scss']
})

export class MessagePopupComponent implements OnInit {

  lines = []
  

  constructor(@Inject(MAT_DIALOG_DATA) public data: Array<string>, public dialogRef: MatDialogRef<MessagePopupComponent>) {
    this.lines.push("Here are your score's details")
    let subLines = []
    data.forEach(element => {
      if (element.startsWith(' '))
      {
          subLines.push(element) 
      }
      else
      {
          if (subLines.length > 0) 
          {
            this.lines.push(subLines)
            subLines = []
          }
          this.lines.push(element)          
      }
    });    

  }
  ngOnInit() {

  }

  private isLine(data : any)
  {
    return (typeof(data) == 'string')
  }
  onClose(): void {
    this.dialogRef.close();
  }
}
