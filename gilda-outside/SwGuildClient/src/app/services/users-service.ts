import { Subject } from 'rxjs/Subject';
import {environment} from './../../environments/environment';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class UsersService {



  url = environment.apiUrl + '/users'
  // DO NOT CHANGE THIS
  loggedUserName = undefined// for DEBUG in local host, use the code below
  loggedUserName$ = new BehaviorSubject<string>(this.loggedUserName)
  loggedUserData: any = undefined
  loggedUserData$ = new BehaviorSubject<any>(this.loggedUserData)
  filteredUser = '';
  filteredUser$ : BehaviorSubject<string> = new BehaviorSubject(this.filteredUser)
  baseUrl = '/homepage'

  constructor(private http: HttpClient) {

    // USE THIS FOR DEBUG IN LOCALHOST

    // setTimeout(() => {
    //  console.log('setting user')
    //  this.loggedUserName='xxxxx';
    //  this.loggedUserName$.next(this.loggedUserName)

    // }, 1000);
    //this.signIn() 
    this.getCurrentUser$().subscribe((username)=> {console.log('USERNAME '+username)}
                          //this.loggedUserName = username
                        );
    this.getLoggedInUser$(true).subscribe((user)=> { if (user) console.log('USERNAME '+user.name)})
  }
  signIn()
  {    
    this.baseUrl = window.location.pathname
    let signInUrl = environment.oAuthProvider+
    '/oauth/authorize?'  +  
    'client_id='+
    environment.clientID+    
    '&redirect_uri=' +
    environment.apiUrl +
    '/oauth/redirect' +
    '&response_type=code' +
    '&state='+ this.baseUrl  
    window.location.replace(signInUrl)
  }

  getBaseUrl()
  {
    return this.baseUrl
  }
  getCurrentUser$() {

    // if (!this.loggedUserName)
    // {
    //   this.signIn()      
    // }

    this.http.get(this.url+'/signedin')
    .subscribe((username : string)=> 
      {        
        this.loggedUserName = username        
        this.loggedUserName$.next(this.loggedUserName)
      })

      // this.http.get(environment.userServiceUrl, { withCredentials: true })
      // .subscribe((username:string)=>
      // {
      //   debugger
      //   this.loggedUserName=username
      //   this.loggedUserName$.next(this.loggedUserName)
      // })
    
    return this.loggedUserName$
  }

  getFilteredUser$()
  {
    return this.filteredUser$.asObservable();
  }

  setFilteredUser(selectedUser : string)
  {
    this.filteredUser = selectedUser
    this.filteredUser$.next(this.filteredUser)
  }


  refreshCurrentUser()
  {
    this.getLoggedInUser$(true)
  }

  getLoggedInUser$(getDataFromServer : boolean = false)
  {
    
      if (getDataFromServer || !this.loggedUserData)
      {
        this.getCurrentUser$()
        .subscribe((currUserName:string) =>
        {
          if (currUserName)
          {
            this.getUserbyUsername$(currUserName.toLowerCase())
            .subscribe((user=>
              {
                this.loggedUserData = user
                this.loggedUserData$.next(this.loggedUserData )
              }))
          }
        })
      }
      return this.loggedUserData$
  }

  getUsers$() {
    return this.usersFromServer()
  }

  private usersFromServer() {
    return this.http.get<any[]>(this.url);
  }

  recommendApplicant$(gitlab_user_id : number)
  {
    let body = { username: this.loggedUserName, applicant: gitlab_user_id }
    return this.http.post(this.url, body)
  }

  ishurAvtam()
  {
    let body = { username: this.loggedUserName, applicant: this.loggedUserData.gitlab_user_id }
    return this.http.post(this.url + "/ishurAvtam", body).toPromise()
  }

  getUserbyGitLabId$(gitlab_user_id : number)
  {
    return this.http.get(this.url+'/'+gitlab_user_id)
  }

  getUserbyUsername$(username : string)
  {
    return this.http.get(this.url+'/corp/'+username)
  }
}
