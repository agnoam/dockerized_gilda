import { Component, OnInit } from '@angular/core';
import { RoutingService } from './../../services/routing.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { state, trigger,style,transition,animate,keyframes,stagger } from '@angular/animations';


@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss'],

})
export class PopUpComponent implements OnInit {
  isPopup: boolean = true;
  currPop: number = 1;
  state='active'
  xpos=1
  constructor(private router: RoutingService) { }

  ngOnInit() {
    setInterval(() => this.changeMonster(), 5000);
  }

  changeMonster() {
    this.state = this.state === 'active' ? 'inactive' : 'active';
    if (this.state=='active') this.currPop = ((this.currPop)%4)+1
    //this.xpos = (this.xpos+3)%5
  }



  adoptMonster()
  {
    console.log('take me there')
    this.router.navigate('/monster')
  }
}
