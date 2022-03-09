import { SkillPoolService } from '../../../services/skill-pool.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-labels-cloud',
  templateUrl: './labels-cloud.component.html',
  styleUrls: ['./labels-cloud.component.scss']
})
export class LabelsCloudComponent implements OnInit {

  labelsLang: any[];
  labelsTag: any[];
  constructor(private skillPoolService: SkillPoolService) {
    skillPoolService.getLabels$().subscribe((data: any[]) => 
    {       
      this.labelsLang = data.filter(label=> label.description == 'Programming Language')
      this.labelsTag = data.filter(label=> label.description == 'Knowledge Domain')
    })
    
  }

  ngOnInit() {   
  }

}
