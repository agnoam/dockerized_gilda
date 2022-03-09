import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-virtual-keyboard',
  templateUrl: './virtual-keyboard.component.html',
  styleUrls: ['./virtual-keyboard.component.css']
})
export class VirtualKeyboardComponent implements OnInit {
  @Input() layout : Array<Array<string>> = []
  @Input() inputFieldLayout : Array<number> = []
  @Output() submit: EventEmitter<string[]> = new EventEmitter();

  inputFieldValues: Array<string> = []
  inputText : string = ''
  maxLength : number = 0


  delete()
  {
    if (this.inputText.length > 0)
    {
      this.inputText = this.inputText.slice(0, -1)
      this.setInputValuesInFields()
    }
  }
  onClick(key : string)
  {

    if (this.inputText.length < this.maxLength)
    {

      this.inputText = this.inputText+key
      this.setInputValuesInFields()
    }
  }

  private setInputValuesInFields()
  {
       
    for (let i = 0, o = 0;
      i < this.inputFieldLayout.length;
      i++)
      {
        this.inputFieldValues[i] = this.inputText.substr(o, this.inputFieldLayout[i])
        o += this.inputFieldLayout[i]
      }
  }

  submitResult()
  {
    this.submit.emit(this.inputFieldValues)
  }

  constructor() { 
   }

   ngOnChanges(changes: any) {   
    //this.maxLength = this.inputFieldLayout.reduce((a, x) => a + x)    
    for (let i = 0; i < this.inputFieldLayout.length; i++) 
    {
      this.inputFieldValues[i] = ''
      this.maxLength += this.inputFieldLayout[i]
    }
    console.log('max length: ' + this.maxLength)
   
}


  ngOnInit() 
  {
   
  }

}
