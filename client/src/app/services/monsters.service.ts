import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MonstersService {

  http: HttpClient = null;
  url = environment.apiUrl + '/monsters'

  constructor(private httpClient: HttpClient) {
    this.http = httpClient;
  }

  getMonstersbyRank$(rank: number) {
    return this.http.get(this.url + '/0' + (rank+1))
  }

  apply4Adoption$(gitlab_user_id : number)
  {    
    return this.http.post(this.url + "/apply", {})
  }
  getMonster4Adoption$()
  {
      return this.http.get(this.url +'/adopt')
  }
}
