import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from './../../environments/environment';


@Injectable()
export class MeetupService {

  url = environment.apiUrl + '/meetups'

  constructor(private http: HttpClient) { }

  register()
  {
        
    return this.http.post(this.url,{})
  }
  unregister()
  {
        
    return this.http.delete(this.url, {});
  }
  getNextMeetup$()
  {
    return this.http.get(this.url+'/next')
  }

  getWaitingList$()
  {
    return this.http.get(this.url + '/waiting')
  }

  getAttendingList$()
  {
    return this.http.get(this.url + '/attending')
  }

  getAllMeetups$()
  {
    return this.http.get<any[]>(this.url);
  }
}
