import {Component, OnInit, Input, ChangeDetectorRef, ViewChild , ElementRef} from '@angular/core';
import {ChallengesService} from '../../../../services/challenges-service';
import {UsersService} from '../../../../services/users-service';
import * as moment from 'moment';

@Component({
  selector: 'app-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.css']
})

export class ChallengeCardComponent implements OnInit {

  @Input() isPreview: boolean;

  challengeExists: boolean;
  solutionCorrect: boolean;
  currentChallenge: any = {};
  hintExists: boolean = false;
  hintVisible: boolean = false;
  messageVisible: boolean = false;
  solutionLayout = []
  actualScore: number = 0;
  justSubmitted: boolean = false;
  pastChallenges = null;

  solvedCount = 0;
  weeklyOffset = 0;

  constructor(private challengesService: ChallengesService, private usersService: UsersService, private ref: ChangeDetectorRef) {

  }
  @ViewChild('challengeText') challengeTextElement: ElementRef;
  @ViewChild('infoText') infoTextElement: ElementRef;
  @ViewChild('footerText') footerTextElement: ElementRef;



  getLayout(solution: string[]) {
    return solution.map(function (word: string) {
      return word.length;
    });
  }

  ngOnInit() {

    this.challengesService.events$.forEach(event => this.displayPreviewData(event.preview, event.displaySolution));

    if (!this.isPreview) {
      this.getCurrentChallenge();
    }
  }

  displayPreviewData(preview, displaySolution) {
    if (preview) {
      console.log("title: " + preview.title);
      console.log("challenge: " + preview.challenge);
      console.log("info: " + preview.info);
      console.log("image: " + preview.image);
      console.log("score: " + preview.score);
      console.log("hint: " + preview.hint.text);
      console.log("hint price: " + preview.hint.price);
      console.log("solution: " + preview.solution);
      console.log("keyboard: " + preview.keyboard);
      console.log("author: " + preview.author);
      console.log("year: " + preview.year);
      console.log("week: " + preview.week);

      this.currentChallenge.title = preview.title;
      this.currentChallenge.challenge = preview.challenge;
      this.currentChallenge.info = preview.info;
      this.currentChallenge.image = preview.image;
      this.currentChallenge.score = preview.score;
      this.currentChallenge.hint =  { text: preview.hint.text, price: preview.hint.price };
      this.currentChallenge.author = preview.author;
      this.currentChallenge.year = preview.year;
      this.currentChallenge.week = preview.week;
      this.challengeTextElement.nativeElement.innerHTML = this.currentChallenge.challenge;

      if (preview.solution) {
        this.solutionLayout = this.getLayout(this.string2solution(preview.solution));
      }

      if (preview.keyboard) {
        this.currentChallenge.keyboard = this.string2keyboard(preview.keyboard);
      }

      this.hintExists = true;
      this.hintVisible = true;
      this.challengeExists = true;
      this.actualScore = this.currentChallenge.score;
      this.solvedCount = 0;

      this.solutionCorrect = null;
      this.justSubmitted = false;


      if (displaySolution) {
        this.solutionCorrect = true;
        this.justSubmitted = false;

        this.currentChallenge.solution = preview.solution;
        this.currentChallenge.displaySolution = preview.solution;

        this.currentChallenge.info = preview.info;
        this.infoTextElement.nativeElement.innerHTML = this.currentChallenge.info;
      }
    }
  }

  string2solution(s: string): string[] {

    return s.toUpperCase().split(' ');
  }

  string2keyboard(s: string): string[][] {

    let words = s.split(' ');

    return words.map(function(word:string) {
        return word.toUpperCase().split('');
    });
  }

  isThisWeek(challenge) {

    if (this.weeklyOffset > 0)
      return true;
    else
      return (challenge.year == moment().year() &&
              challenge.week == moment().week())
  }

  getCurrentChallenge() {

    console.log('getCurrentChallenge()');
    this.challengeExists = false;
    this.solutionCorrect = null;
    this.currentChallenge = {};
    this.hintExists = false;
    this.hintVisible = false;

    this.challengesService.getPastChallenges().subscribe((pastChallenges:any) => {
      if (pastChallenges && pastChallenges.challenges.length && pastChallenges.challenges.length > 0) {
        this.pastChallenges = pastChallenges.challenges;
        let theChallenge = this.pastChallenges[this.weeklyOffset];
        if (this.isThisWeek(theChallenge)) {

          this.challengesService.getCurrentChallenge(theChallenge.year, theChallenge.week).subscribe(

            data => {
              if (data != null) {

                this.currentChallenge = data;
                this.challengeTextElement.nativeElement.innerHTML = this.currentChallenge.challenge;

                this.solutionLayout = this.getLayout(this.currentChallenge.solution);
                this.challengeExists = true;
                this.actualScore = this.currentChallenge.score;
                if(this.currentChallenge.users_solved != null) {
                  this.solvedCount = this.currentChallenge.users_solved.length;
                }
                if(this.currentChallenge.users_solved_ids != null) {
                  this.solvedCount = this.currentChallenge.users_solved_ids.length;
                }
                if (this.currentChallenge.hint && this.currentChallenge.hint.price) {
                  this.hintExists = true;
                }
                if (this.currentChallenge.hint && this.currentChallenge.hint.text) {
                  this.hintVisible = true;
                  this.actualScore -= this.currentChallenge.hint.price;
                }
                if (this.isCurrentChallenge())
                  this.testSolution(this.currentChallenge._id, null);
              } else {
                this.challengeExists = false;
                this.solutionCorrect = null;
              }
            },
            err => {
              console.log('error: ' + err);
            }
          );
        }
        else {
          this.challengeExists = false;
        }
      }
    });
  }
  public revealHint() {

    this.challengesService.getChallengeHint(this.currentChallenge._id).subscribe(
      (response: string) => {
        console.log('getChallengeHint: ' + response);
        this.currentChallenge.hint.text = response;
        this.actualScore -= this.currentChallenge.hint.price;
        this.hintVisible = true;
      },
      err =>  {
        console.log('error: ' + err);
      }
      );

  }

  testSolution(_id: any, solution: string[]) {

    this.solutionCorrect = null;
    this.usersService.getCurrentUser$().subscribe((user:string)=>
    {
      this.challengesService.testChallenge(_id, solution, user).subscribe(
      (response: any) => {
        console.log("testSolution: response->" + response.correct);
        if (solution) {
          this.messageVisible = true;
        }

        this.solutionCorrect = response.correct;
        if (response.correct === true) {
          //setTimeout(()=> this.usersService.refreshCurrentUser(), 700)
          this.currentChallenge.hint =  response.hint;
          this.hintExists = true;
          this.hintVisible = true;

          this.currentChallenge.solution = response.solution;
          this.currentChallenge.displaySolution = response.solution.join(' ');

          this.currentChallenge.info = response.info;
          this.infoTextElement.nativeElement.innerHTML = this.currentChallenge.info;
          if (this.justSubmitted) {
            this.footerTextElement.nativeElement.innerHTML = 'Your score will be updated within 3 business days...';
          }
        }
      },
      err => {
        console.log("error: " + err);
      }
    )})

  }
  submitResult(solution) {

    if (!this.isPreview) {
      this.solutionCorrect = null;
      this.justSubmitted = true;
      this.testSolution(this.currentChallenge._id, solution);
    }
  }

  isCurrentChallenge() {
    return this.weeklyOffset == 0;
  }

  isLastChallenge() {
    if (this.pastChallenges && this.pastChallenges.length)
      return this.weeklyOffset == this.pastChallenges.length -1
    else
      return true;
  }

  prevChallenge() {
    if (this.weeklyOffset < this.pastChallenges.length) {
      this.weeklyOffset++;
    }

    this.getCurrentChallenge();
  }

  nextChallenge() {
    if (this.weeklyOffset > 0) {
      this.weeklyOffset--;
    }

    this.getCurrentChallenge();
  }

  revealSolution() {
    this.testSolution(this.currentChallenge._id, null);
  }

  backToChallenge() {
    this.solutionCorrect = null;
  }

  chooseChallenge(event) {
    this.weeklyOffset = (+event.value);
    this.getCurrentChallenge();
  }

}
