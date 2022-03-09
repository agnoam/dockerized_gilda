import { BehaviorSubject, Subject } from 'rxjs/internal/Rx';
import { Injectable } from '@angular/core';

import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UsersService } from './../services/users-service';
import { HttpHeaders } from '@angular/common/http';
import { forkJoin } from "rxjs/observable/forkJoin";
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class SkillPoolService {

  curr_user_name = ''
  url = environment.apiUrl + '/marketplace'
  http: HttpClient = null;

  selectedTab: number = 0;
  last_filter : string = ''

  currentUser: any;
  currentUserSubject$: BehaviorSubject<any> = new BehaviorSubject(undefined);
  peopleData: any[];
  peopleSubject$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  projectsData: any[] = [];
  projectsSubject$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  gigsData: any[] = [];
  gigsSubject$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  labelsList: any[];
  labelsSubject$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  tabChange$:BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private httpClient: HttpClient, private usersService: UsersService) {
    this.http = httpClient;
    this.usersService.getCurrentUser$().subscribe(
      (username: string) => {
        this.curr_user_name = username;
        this.getCurrentUser$().subscribe(user => {
          this.currentUser = user;
          this.currentUserSubject$.next(this.currentUser)
        })
      })
    let projects = this.getProjects$('');
    let gigs = this.getGigs$('');
    let users = this.getAllPeople$();
    // let lables
    forkJoin([projects, gigs, users]).subscribe((results: Array<any>) => {
      this.projectsData = results[0];
      this.projectsSubject$.next(this.projectsData);
      this.gigsData = results[1];
      this.gigsSubject$.next(this.gigsData);
      this.peopleData = results[2];
      this.peopleSubject$.next(this.peopleData);
    })
    this.getLabels$().subscribe((date: Array<any>) => {
      this.labelsList = date;
      this.labelsSubject$.next(this.labelsList);
    })
    // this.getProjects('').subscribe((data: Array<any>) => {
    //   this.projectsData = data;
    //   this.projectsSubject.next(this.projectsData);
    // });
    // this.getAllPeople().subscribe((data: Array<any>) => {
    //   this.peopleData = data;
    //   this.peopleSubject.next(this.peopleData);
    // });
    // this.getGigs('').subscribe((data: Array<any>) => {
    //   this.gigsData = data;
    //   this.gigsSubject.next(this.gigsData);
    // });
  }

  updateSelectedTabIndex(index: number) {
    this.selectedTab = index;
    this.tabChange$.next(undefined)
    this.filter()
  }
  // get peopleSubject()
  // {
  //   return this.peopleSubject;
  // }
  //user profil
  getCurrentUser$() {
    return this.http.get(this.url + '/users/' + this.curr_user_name);
  }
  getCurrentGitlabUserId() {
    return this.currentUser.gitlab_user_id;
  }

  updateUserSkills(userId, lablesList) {
    this.http.put(`${this.url}/user/skills`, { labels: lablesList }, httpOptions).subscribe(user => {
      this.currentUser = user;
      this.currentUserSubject$.next(this.currentUser)
    })
  }
  updateUserFieldsOfInterest(userId, lablesList) {
    this.http.put(`${this.url}/user/fields`, { labels: lablesList }, httpOptions).subscribe(user => {
      this.currentUser = user;
      this.currentUserSubject$.next(this.currentUser)
    })
  }
  updateUserAutoupdate(userId, checked: boolean) {
    this.http.put(`${this.url}/user/autoupdate`, { auto: checked }, httpOptions).subscribe(user => {
      this.currentUser = user;
      this.currentUserSubject$.next(this.currentUser)
    });
  }

  // lables
  getLabels$() {
    return this.http.get(this.url + '/labels');
  }
  getLanguageLabels$() {
    return this.http.get(this.url + '/languages/');
  }
  getTagsLabels$() {
    return this.http.get(this.url + '/tags/');
  }

  //people tab
  getAllPeople$() {
    return this.http.get(this.url + '/users');
  }
  getPeople$(filter: string) {
    return this.http.get(this.url + '/users' + '?' + filter);
  }
  getPersonById(id: number) {
    return this.peopleData.find(person => person.gitlab_user_id == id);
  }

  //project tab
  getProjects$(filter: string) {
    return this.http.get(this.url + '/projects' + '?' + filter);
  }
  getProjectById(id: number) {    
    return this.projectsData.find(project => project.project_id == id);
  }
  getExpandedProjectById$(id: number) {
    return this.http.get(this.url + '/projects/' + id);
  }
  getProjectName(id: number) {
    if (this.projectsData.length > 0) {
      const project = this.projectsData.find(project => project.project_id == id);
      if (project) {
        return project.name;
      }
    }
  }

  getProjectsToCurrentUser() {
    let projectList = [];
    this.currentUser.badges.projects.forEach((projectId: number) => {
      const project = this.getProjectById(projectId);
      if (project) {
        projectList.push(project)
      }
    });
    return projectList;
  }
  addStarToProject$(project_id: number) {
    return this.http.put(`${this.url}/projects/star`,
      {
        project_id: project_id      
      }, httpOptions)
  }
  unStarToProject$(project_id: number) {
    return this.http.put(`${this.url}/projects/unstar`,
      {
        project_id: project_id        
      }, httpOptions);
  }
  updateProjectData(updatedProject) {
    const index = this.projectsData.findIndex(project => project.project_id == updatedProject.project_id);
    this.projectsData[index] = updatedProject;
    this.projectsSubject$.next(this.projectsData);
  }
  joinToProjectMattermost$(projectId: number) {
    return this.http.get(`${this.url}/projects/${projectId}/mattermost`);
  }

  //gigs tab
  // TODO : Verify publisher is owner
  addGig$(project_id: number, issue_id: number, level: number, hours: number) {
    return this.http.post(`${this.url}/gigs/`,
      {
        project_id: project_id,
        issue_iid: issue_id,        
        hours: hours,
        level: level
      }, httpOptions)
  }
  updateGig$(project_id: number, issue_id: number, level: number, hours: number) {
    return this.http.put(`${this.url}/gigs/`,
      {
        project_id: project_id,
        issue_iid: issue_id,
        hours: hours,
        level: level
      }, httpOptions)
  }

  calcProjectClones(project : any)
  {
    let clones : number =  project.clones.map(clone=> clone.count).reduce((a ,b)=>a+b, 0)
    return clones
  }
  
  assignToGig$(project_id: number, issue_id: number) {
    return this.http.put(`${this.url}/gigs/userAssignment`,
      {
        project_id: project_id,
        issue_iid: issue_id,        
        assign_to_gig: true
      }, httpOptions)
  }

  leaveGig$(project_id: number, issue_id: number) {
    return this.http.put(`${this.url}/gigs/userAssignment`,
      {
        project_id: project_id,
        issue_iid: issue_id,        
        assign_to_gig: false
      }, httpOptions)
  }
  getGigs$(filter: string) {
    return this.http.get(this.url + '/gigs' + '?' + filter);
  }
  updateGigData(gigData) {
    
    const index = this.gigsData.findIndex(gig => gig.project_id == gigData.project_id && gig.iid == gigData.issue_id);
    this.gigsData[index] = gigData;
    this.gigsSubject$.next(this.gigsData);
  }

  filter(filter: string = this.last_filter) {
    // i have to know the current tab
    // for meantime
    this.last_filter = filter
    switch (this.selectedTab) {
      case 0: this.getProjects$(filter).subscribe((data: Array<any>) => {
        this.projectsSubject$.next(data);
      });
        break;
      case 1: this.getGigs$(filter).subscribe((data: Array<any>) => {
        this.gigsSubject$.next(data);
      });
        break;
      case 2: this.getPeople$(filter).subscribe((data: Array<any>) => {
        this.peopleSubject$.next(data);
      });
        break;
      default: this.getProjects$(filter).subscribe((data: Array<any>) => {
        this.projectsSubject$.next(data);
      });
    }

  }

}
