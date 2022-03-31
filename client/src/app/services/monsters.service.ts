import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// import { environment } from './../../environments/environment';
import { EnvService, IEnv } from './env.service';

@Injectable()
export class MonstersService {
  environment: IEnv;
  url: string;

  constructor(private http: HttpClient, private envService: EnvService) {
    this.environment = envService.getEnvironment();
    this.url = this.environment.apiUrl + '/monsters';
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
