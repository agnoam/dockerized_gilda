import { NewGigComponent } from '../popupWindows/components/new-gig/new-gig.component';
import { SkillPoolService } from '../../../services/skill-pool.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SelectItem } from 'primeng/components/common/api';

@Component({
  selector: 'app-gigs-tab',
  templateUrl: './gigs-tab.component.html',
  styleUrls: ['./gigs-tab.component.scss']
})
export class GigsTabComponent implements OnInit {
  gigs: any[];
  sortableOption: SelectItem[];
  selectedSortableOption: number;
  constructor(private skillPoolService: SkillPoolService, public dialog: MatDialog) {
    skillPoolService.gigsSubject$.subscribe((data: Array<any>) => {
      this.gigs = data;
      this.sortList()
    })
    this.sortableOption = [{ label: 'Duration', value: 1 },
    { label: 'Expertise Level', value: 2 },
    ];
    
  }

  
  ngOnInit() {
    
  }

  openNewGigDialog(event): void {
    const dialogRef = this.dialog.open(NewGigComponent);
  }

  sortList() {
    switch (this.selectedSortableOption) {
      case 1: this.sortByDuration()
        break;
      case 2: this.sortByLevel()
        break;
      default:
        this.gigSort((a,b)=>{return 0;})
      // case 3: this.sortByAvailability()
      //   break;
    }
  }
  
  sortByLevel() {
    this.gigSort((gig1, gig2) => {
      return gig1.level - gig2.level;
    })
  }
  sortByDuration() {
    this.gigSort((gig1, gig2) => {
      return gig1.time_estimate - gig2.time_estimate;
    })
  }

    gigSort(compareFn : (a: any, b: any) => number)
    {
      let available = this.gigs.filter(gig=> gig.assignees.length==0 && !gig.closed_at).sort(compareFn)
      let open_not_available = this.gigs.filter(gig=> gig.assignees.length !=0 && !gig.closed_at).sort(compareFn)
      let closed = this.gigs.filter(gig=> gig.closed_at).sort(compareFn)
      this.gigs = available.concat(open_not_available.concat(closed))
    }
  }
  
  

