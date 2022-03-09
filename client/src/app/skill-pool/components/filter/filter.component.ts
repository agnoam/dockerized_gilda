import { SkillPoolService } from '../../../services/skill-pool.service';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { forkJoin } from "rxjs/observable/forkJoin";



@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  langLabels: string[];
  tagLabels: string[];
  labels: any[];
  labels_max_count = 100

  optionsList: any;
  selectedItems: any[] = [];

  // icons
  languageIcon: string = 'code';
  tagIcon: string = 'tag';
  userIcon: string = 'circle';
  freeTextIcon: string = 'keyboard-o'

  //filter url
  langFilterQuery: string = 'lang_name[]';
  tagFilterQuery: string = 'tag_name[]';
  userFilterQuery: string = 'user_name[]';
  freeTextFilterQuery: string = 'search';
  currentTab: string = 'projects'
  loadingFinished : boolean = false
  items$ : Subject<Array<any>> = new Subject<Array<any>>()

  constructor(private skillPoolService: SkillPoolService) {    
      
    this.loadingFinished = false
    this.selectedItems = []    
    this.search()
    let langs = this.skillPoolService.getLanguageLabels$();
    let tags = this.skillPoolService.getTagsLabels$();
    let users = this.skillPoolService.getAllPeople$();



    this.skillPoolService.projectsSubject$.subscribe(res=> {if (res) this.loadingFinished = true})
    this.skillPoolService.gigsSubject$.subscribe(res=> {if (res) this.loadingFinished = true})
    this.skillPoolService.peopleSubject$.subscribe(res=> {if (res) this.loadingFinished = true})
    this.skillPoolService.tabChange$.subscribe(()=> this.loadingFinished=false)
   
    skillPoolService.getLabels$().subscribe((data: any[]) => 
    { 
      
      this.labels = data.slice(0, 50).sort((label1, label2) => 
      (label1.name.toLowerCase() > label2.name.toLowerCase()?
       1: (label1.name.toLowerCase() < label2.name.toLowerCase()? -1 :0)))      
      this.labels_max_count = data[0].count
      //.filter(label=> label.description == 'Programming Language')
      //this.labelsTag = data.filter(label=> label.description == 'Knowledge Domain')
    })
    
    //  this.skillPoolService.getLanguageLabels().subscribe((data: Array<any>) => {
    //   let languages = data.map((item: string) => { return { name: item, icon: this.languageIcon } });
    //   this.categories.push({ id: 1, name: 'language', options: languages });
    //   console.log("languages");
    // })

    // this.skillPoolService.getTagsLabels().subscribe((data: Array<any>) => {
    //   let tags = data.map((item: string) => { return { name: item, icon: this.tagIcon } });
    //   this.categories.push({ id: 2, name: 'tags', options: tags });
    //   console.log("tags");
    // })

    forkJoin([langs, tags, users]).subscribe((results: Array<any>) => {

      this.langLabels = results[0].slice();
      let languages = results[0].sort().map((item: string) => {
        return {
          filterLabel: '%' + item,
          label: item,
          field: this.langFilterQuery,
          icon: this.languageIcon,
          category: 'language:%language'
        }
      })
      
  
      this.tagLabels = results[1].slice();
      let tags = results[1].sort().map((item: string) => {
        return {
          filterLabel: '~' + item,
          label: item,
          field: this.tagFilterQuery,
          icon: this.tagIcon,
          category: 'tag:~tag'
        }
      });
     
      let users = results[2].map((item: any) => {
        return {
          label: item.name + ' (' + item.username + ')',
          filterLabel: '@' + item.username + ' ' + item.name.split(' ').reduce((filter: string, name: string) => (filter += ' @' + name), ''),
          img: item.avatar_url,
          field: this.userFilterQuery,
          //icon: this.userIcon,
          category: 'user:@user'
        }
      });
      this.optionsList = languages.concat(tags).concat(users)
      this.items$.next(this.optionsList)
      this.loadingFinished = true
      //this.categories.push({ id: 3, label: 'user:@user', icon: this.userIcon, options: users });
      //this.categories.push({ id: 4, label: 'text:text' , icon : this.freeTextIcon, options: [' ']})
      //this.optionsList = this.categories.slice(0);
    })
  }
  onSearchChange(searchValue: string) {
    // Handle free text      
    
  }

  ngOnInit() {
     
  }

  private getSearchParam(value: string) {
    return value.toLocaleLowerCase().split(/@|%|~/).filter(x => x)[0].trim()
  }
  
  private encodeStr (str: string) {
    return encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
  }
  
  search() {

    let filter = '';
    let search_string = ''
    for (let item of this.selectedItems) {

      if (item.field && item.filterLabel) {
        filter += `${item.field}=${this.encodeStr(this.getSearchParam(item.filterLabel))}&`;
      }
      else {
        search_string += `${this.encodeStr(item.label)}+`
      }
    }
    if (search_string.length > 0) filter += '&search=' + search_string
    this.loadingFinished = false
    this.skillPoolService.filter(filter)
  }

  onAdd(value) {
    
  }

  onChange(value) {
    this.search()

  }

  customSearchFn(term: string, item: any) {

    let terms: string[] = term.toLowerCase().split(' ')
    let search_in: string =
      (item.label ? item.label.toLowerCase() : '') +
      ' ' +
      (item.filterLabel ? item.filterLabel.toLowerCase() : '')
    return terms.every(term => search_in.includes(term))
    //return item.name.toLocaleLowerCase().indexOf(term) > -1 || item.gender.toLocaleLowerCase() === term;
  }


  onClose() {
  }
  
  addFilterLabel(selectedLabel: string) {
    const filterItem = this.optionsList.find(item => item.label == selectedLabel);
    this.selectedItems = [...this.selectedItems, filterItem];
    this.search()
  }
}
