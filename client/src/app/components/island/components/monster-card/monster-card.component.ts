import {Component, OnInit, Input, Inject, ViewChild, ElementRef} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';//import { inherits } from 'util';

@Component({ 
  selector: 'app-monster-card',
  templateUrl: './monster-card.component.html',
  styleUrls: ['./monster-card.component.scss']
})

export class MonsterCardComponent implements OnInit {
  
  monster = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.monster = data;
  }
  @ViewChild('descriptionText') descriptionTextElement: ElementRef;

  ngOnInit() {   
    if (this.monster.description) {
      this.descriptionTextElement.nativeElement.innerHTML = this.monster.description;        
    }

  }

}
