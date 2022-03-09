import { Component, OnInit } from '@angular/core';
import { ChallengesService } from '../../services/challenges-service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-add-challenge',
  templateUrl: './add-challenge.component.html',
  styleUrls: [ './add-challenge.component.css']
})
export class AddChallengeComponent implements OnInit {

  //addChallengeForm: FormGroup;
  addForm: FormGroup;

  newChallenge = {
    title: '',
    challenge: '',
    info: '',
    image: '',
    score: 50,
    hint: {text:'',price:10},
    solution: '',
    keyboard: '',
    author: '',
    year: 0,
    week: ''
  }

  constructor(private challengesService: ChallengesService) { }

  ngOnInit() {
    //this.addChallengeForm.valid = false;

    let now : Date = new Date();
    this.newChallenge.year = now.getFullYear();
  }

  isValid(): boolean {
    return false;
  }

  preview(displaySolution) {
    this.challengesService.previewEvent({ preview: this.newChallenge, displaySolution: displaySolution });
  }

  addChallenge() {

    console.log("title: " + this.newChallenge.title);
    console.log("challenge: " + this.newChallenge.challenge);
    console.log("info: " + this.newChallenge.info);
    console.log("image: " + this.newChallenge.image);
    console.log("score: " + this.newChallenge.score);
    console.log("hint: " + this.newChallenge.hint.text);
    console.log("hint price: " + this.newChallenge.hint.price);
    console.log("solution: " + this.newChallenge.solution);
    console.log("keyboard: " + this.newChallenge.keyboard);
    console.log("author: " + this.newChallenge.author);
    console.log("year: " + this.newChallenge.year);
    console.log("week: " + this.newChallenge.week);

    this.challengesService.addChallenge(this.newChallenge).subscribe(
      (response: boolean) => {
        console.log("addChallenge: " + response);
        if (response === true) {
          alert ("New Challenge Added!");
        }
        else {
          alert ("An error occured while adding challenge.");
        }

      },
      err =>  {
                console.log("error: " + err);
                alert ("An error occured while adding challenge: " + err);
      }
      );
  }

}
