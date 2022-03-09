import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';//import { inherits } from 'util';
import {NguCarousel} from '@ngu/carousel';

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.scss']
})

export class HelpPageComponent implements OnInit {

  items = [ "../../../assets/images/help/Help0.png",
            "../../../assets/images/help/Help1.png",
            "../../../assets/images/help/Help2.png",
            "../../../assets/images/help/Help3.png",
            "../../../assets/images/help/Help4.png",
            "../../../assets/images/help/Help5.png",
            "../../../assets/images/help/Help6.png",
            "../../../assets/images/help/Help7.png"
  ];
  public carouselConfig: NguCarousel = {
          grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
          slide: 4,
          speed: 500,
          loop: true,
          // interval: 4000,
          point: {
            visible: true,
            pointStyles: `
              .ngucarouselPoint {
                list-style-type: none;
                text-align: center;
                padding: 12px;
                margin: 0;
                white-space: nowrap;
                overflow: auto;
                position: absolute;
                width: 100%;
                bottom: 20px;
                left: 0;
                box-sizing: border-box;
              }
              .ngucarouselPoint li {
                display: inline-block;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.55);
                padding: 5px;
                margin: 0 3px;
                transition: .4s ease all;
              }
              .ngucarouselPoint li.active {
                  background: white;
                  width: 10px;
              }
            `
          },
          load: 2,
          custom: 'banner',
          touch: true,
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          //RTL: true,
          //vertical: { enabled: true, height: 400 }
        };


  constructor(public dialogRef: MatDialogRef<HelpPageComponent>) {
  }

  ngOnInit() {

  }

  onClose(): void {
    this.dialogRef.close();
  }
}
