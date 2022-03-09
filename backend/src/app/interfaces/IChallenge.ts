export interface IChallenge {
    challenge_id : number;
    challenge: string;
    title: string;
    solution: string[];
    info: string;
    score: number;
    hint: 
    {
      text: string, 
      price : number};
    users_challenged: string[];
    users_solved: string[];//list of all the users that solved this challenge.
    users_hinted: string[];
    users_solved_ids : number[];
    users_hinted_ids : number[];
    keyboard: string[][];
    image : string;
    author : string;
    year: number;
    week: number;
  }
  