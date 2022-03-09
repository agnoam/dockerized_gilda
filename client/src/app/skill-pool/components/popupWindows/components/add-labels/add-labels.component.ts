import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SkillPoolService } from '../../../../../services/skill-pool.service';
import { SimpleChange } from '@angular/core';

@Component({
  selector: 'app-add-labels',
  templateUrl: './add-labels.component.html',
  styleUrls: ['./add-labels.component.scss']
})
export class AddLabelsComponent implements OnInit {

  @Output() cancel: EventEmitter<any> = new EventEmitter();
  @Output() done: EventEmitter<any> = new EventEmitter();
  @Input() userLabels: string[];
  // @Output() userLabelsChanged = new EventEmitter();
  userLabelsTemp: string[];

  labels: any[];
  filteredLables: any[];

  private _searchValue:string = '';
  get searchValue():string {
      return this._searchValue;
  }
  set searchValue(value:string) {
    this._searchValue = value;
    this.filterItem(value);
     console.log('set searchValue');
  }
 
  constructor(private skillPoolService: SkillPoolService) { }

  ngOnInit() {
    this.skillPoolService.labelsSubject$.subscribe(data => {
      this.labels = data
      .sort((label1, label2) => 
      (label1.name.toLowerCase() > label2.name.toLowerCase()?
       1: (label1.name.toLowerCase() < label2.name.toLowerCase()? -1 :0)))
    
      this.assignCopy();
    })
    if (this.userLabels) {
      this.userLabelsTemp = this.userLabels.slice(0);
    }
  }
  ngOnChanges(changes: SimpleChange) {
    for (let propName in changes) {
      if (propName == "userLabels" && !changes[propName].firstChange) {
        if (this.userLabels) {
          this.userLabelsTemp = this.userLabels.slice(0);
        }
      }
    }
  }
  assignCopy() {
    this.filteredLables = Object.assign([], this.labels);
  }
  filterItem(value) {
    if (value=='') this.assignCopy(); //when nothing has typed
    this.filteredLables = Object.assign([], this.labels).filter(
      item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    )
  }
  clearSearch() {
    this.searchValue = '';
  }

  checkIsAvailables(label): boolean {
    if (this.userLabelsTemp) {
      const result = this.userLabelsTemp.find(item => item === label.name);
      if (result)
        return false; //is not available
    }
    return true;

  }
  toggleLable(selectedLabel) {
    let findIndex = this.userLabelsTemp.findIndex(label => label == selectedLabel.name);
    //for toggle item
    if (findIndex > -1) {
      this.userLabelsTemp.splice(findIndex, 1);
    }
    //if choose new item
    else {
      this.userLabelsTemp.push(selectedLabel.name);
    }
  }
  cancelSelection() {
    this.userLabelsTemp = this.userLabels.slice(0);
    // this.userLabelsChanged.emit();
    this.cancel.emit();
    this.clearSearch();
  }
  doneSelection() {
    // this.userLabels = this.userLabelsTemp.slice(0);
    // this.userLabelsChanged.emit(this.userLabels);
    this.done.emit({ value: this.userLabelsTemp });
    this.clearSearch();
  }
}
