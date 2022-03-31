import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

// import {environment} from './../../environments/environment';
import { EnvService, IEnv } from './env.service';

@Injectable()
export class ChallengesService {

  environment: IEnv;
  url: string;
  private _subject = new Subject<any>();
  currUsername = ''

  constructor(private http: HttpClient, private envService: EnvService) {
    this.environment = envService.getEnvironment();
    this.environment.apiUrl + '/challenges';
  }

  previewEvent(event) {
    this._subject.next(event);
  }

  get events$ () {
    return this._subject.asObservable();
  }

  public getPastChallenges() {

    return this.http.get(this.url + '/');

  }

  public getCurrentChallenge(year?:number, week?:number) {

    let body = { year: year, week: week };

    return this.http.post(this.url + '/current', body);

  }

  public testChallenge(challenge_id: number, submit: string[], currUser: string) {

    let body = { id: challenge_id, solution: submit };
    return this.http.post(this.url + '/test', body);
  }

  getChallengeHint(_id: number) {



    let body = {  
                  id: _id};

    return this.http.post(this.url + '/hint', body);

  }

  addChallenge(challenge: any) {

    let body = {  title: challenge.title,
                  challenge: challenge.challenge,
                  info: challenge.info,
                  image: challenge.image,
                  score: challenge.score,
                  hint: challenge.hint.text,
                  hintprice: challenge.hint.price ,
                  solution: challenge.solution,
                  keyboard: challenge.keyboard,
                  author: challenge.author,
                  year: challenge.year,
                  week: challenge.week
                };

    console.log('addChallenge sending to ' + this.url + '/add');
    let x =  this.http.post(this.url + '/add', body);
    return x;
  }
}
