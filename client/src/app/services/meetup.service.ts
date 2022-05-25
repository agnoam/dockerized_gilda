import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

// import {environment} from './../../environments/environment';
import { EnvService, IEnv } from './env.service';

@Injectable()
export class MeetupService {

  environment: IEnv;
  url: string;

  constructor(private http: HttpClient, private envService: EnvService) { 
    this.environment = envService.getEnvironment();    
    this.url = this.environment.apiUrl + '/meetups';
  }

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
