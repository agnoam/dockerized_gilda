import { IChallengeModel } from './models/challenge';
import { model } from './db';
import {GuildUsers} from './guild-users';
import * as moment from 'moment';
import { getLogger } from 'log4js';
import {MailSender} from './mail';
import {scheduleJob, Job} from 'node-schedule';
import { IUser } from './interfaces/IUser';

const logger = getLogger();

export class Challenges {

    weeklyJob : Job = null;
    
    private constructor() {       
        this.weeklyJob = scheduleJob('30 8 * * 0', this.weeklySchedule.bind(this)) // Set weekly schedule for Sunday @ 8:30
//        scheduleJob('29 * * * *', this.weeklySchedule.bind(this)) // FOR DEBUG ONLY
    }

    private static instance: Challenges;
    
    static getInstance() {
        logger.info('*** Getting Challenges instance ***');
        if (!Challenges.instance) {
            logger.info('*** Instantiating Challenges service ***');
            Challenges.instance = new Challenges();
            
        }
        return Challenges.instance;
    }
    
    

    weeklySchedule() {   
        logger.info('*** Sending weekly challenge email ***');
        
        let gsm = GuildUsers.getGuildUsers()      

        this.getChallengeByWeek().then(
            (currentChallenge: IChallengeModel) =>
            {
                this.getPrevChallenge(-1).then( // Get last week's challenge            
                (prevChallenge : IChallengeModel) =>  
                {
                    if (prevChallenge) {
                        gsm.getAllUsers().then(users => 
                        { 
                            
                                    let i = 1;
                                    while (users.length > 0) {
                                        let slice = users.splice(0, 20);                                                                
                                        setTimeout(this.sendSolution2Users.bind(this, slice, prevChallenge, currentChallenge), 1000*60*5*i++); // Send in 5 minute intervals (20 users every 5 minutes)
                                    }
                            
                        })
                    }
                }, 
                (err:any) => logger.error(`Error getting last week's challenge`));
            }
        )

    }

    sendSolution2Users(users : IUser[], prevChallenge : IChallengeModel, currentChallenge: IChallengeModel) {   

        logger.info(`sending solution mail to ${users.length} users`);
        let mailSender = new MailSender()

        users.forEach(user=> { 
            
            if (user.active) {
            //if (user.gitlab_user_id == 7)            
                mailSender.sendPrevChallengeSolution(user, prevChallenge, currentChallenge) 
            } 
        })
    }

    isPastChallenge(challenge: IChallengeModel) {

        let currDate = moment();                 
        let currYear: number = currDate.year();
        let currWeek: number = currDate.week();

        return ((challenge.year < currYear) || 
                (challenge.year == currYear && challenge.week < currWeek));
    }

    isCurrentChallenge(challenge: IChallengeModel) {

        let currDate = moment();                 
        let currYear: number = currDate.year();
        let currWeek: number = currDate.week();

        return (challenge.year == currYear && challenge.week == currWeek);
    }

    getAllChallenges()
    {
        let query =  model.challenge.find({})
        return query.exec()
    }

    getPastChallenges() {
        let _this = this;
        return new Promise<any>((resolve, reject) => {

            model.challenge.find().   
                sort({year: -1, week: -1}).                          
                exec(function (err, results) {                    
                    if (results != null) {                        
                        let res = [];
                        for (const challenge of results) {
                            if (_this.isCurrentChallenge(challenge) || 
                                _this.isPastChallenge(challenge)) {
                                res.push({ year: challenge.year, week: challenge.week });
                            }
                        }
                        resolve({challenges: res});
                    }
                    else                       
                        resolve(null);
                });                   
        });
    }

    getPrevChallenge(weekOffset: number) {

        let currDate = moment().add(weekOffset, 'weeks');;                 
        return this.getChallengeByWeek(currDate.year(),currDate.week());
    }

    getChallengeByWeek(year?: number, week?: number) {
        
        return new Promise<IChallengeModel>((resolve, reject) => {
             
            let currDate = moment();                 
            let currYear: number = currDate.year();
            let currWeek: number = currDate.week();
                    
            if (year && week) {
                if ((year < currYear)  || 
                    (year == currYear && week < currWeek)) {
                    currYear = year;
                    currWeek = week;
                }
            }            

            logger.info("Get Current Challenge for week " + year + ":" + week);

            model.challenge.findOne().                
                where('year').equals(currYear).
                where('week').equals(currWeek).
                exec(function (err, doc) {                    
                    if (doc != null)
                        resolve(doc);
                    else                       
                        resolve(null);
                });       
            });
    }

    findChallengeById(the_id: string): Promise<IChallengeModel> {
        return new Promise<IChallengeModel>((resolve, reject) => {
            model.challenge.findOne({ _id: the_id }).
                exec(function(err, doc) {
                    if (doc)
                        resolve(doc);           
                    else
                        reject(<IChallengeModel>{});
                });                
            });
    }

    areEqual(solution1: string[], solution2: string[]) : boolean {

        if (solution1.length != solution2.length) {            
            return false;
        }
            
        for (var i = 0; i < solution1.length; i++) {
            let str1 = solution1[i].toUpperCase();
            let str2 = solution2[i].toUpperCase(); 

            if (str1 != str2) {
                return false;
            }
        }
        return true;
    }

    isUserChallenged (gitlab_user_id: number, challenge:IChallengeModel) {
        let gsm = GuildUsers.getGuildUsers();        
        return gsm.isUserChallenged(gitlab_user_id, challenge._id);
    }
    
    isUserHinted(gitlab_user_id: number, challenge:IChallengeModel): boolean {
        
        if (!challenge || !challenge.users_hinted) {
            return false;
        }

        return (challenge.users_hinted_ids.indexOf(gitlab_user_id) != -1)
    }

    getMangledSolution(solution:string[]){
        return solution.map(function(word:string) {
            return 'X'.repeat(word.length);
        });
        
    }
    getCurrentChallenge(year : number, week : number, gitlab_user_id : number )
    {
        return new Promise((resolve, reject) =>
        {            
        
            this.getChallengeByWeek(year, week)
                .then(privateChallenge => {
                    
                    if (privateChallenge == null) {
                        resolve(null);
                    }
                    else
                    {       
                        //let publicChallenge = privateChallenge
                        //publicChallenge.solution = this.getMangledSolution(privateChallenge.solution)             
                        let publicChallenge = <IChallengeModel>{
                            _id: privateChallenge._id,
                            title: privateChallenge.title,
                            challenge: privateChallenge.challenge,
                            keyboard: privateChallenge.keyboard,
                            image: privateChallenge.image,
                            year: privateChallenge.year,
                            week: privateChallenge.week,
                            author: privateChallenge.author,
                            hint: privateChallenge.hint,
                            score: privateChallenge.score,
                            solution: this.getMangledSolution(privateChallenge.solution),
                            //users_solved: privateChallenge.users_solved,
                            users_solved_ids : privateChallenge.users_solved_ids
                        }; 

                        if (publicChallenge.hint != null && 
                            this.isCurrentChallenge(publicChallenge) &&
                            !this.isUserHinted(gitlab_user_id, privateChallenge)) {                    
                            publicChallenge.hint.text = null;
                        }
                        resolve(publicChallenge)
                    }
                })
            })

    }
    

    testChallenge(gitlab_user_id: number, _id: string, solution: string[]): Promise<boolean> {        
        logger.info(`testChallenge username:${gitlab_user_id} solution:${solution}`);
        return new Promise<any>((resolve, reject) => {
            this.findChallengeById(_id).then(challenge => {
                
                // If client sent a solution - test it
                if (solution) {
                    let correct: boolean = (this.areEqual(challenge.solution, solution));                                
                
                    if (correct) {
                        if (!challenge.users_solved_ids) {
                            challenge.users_solved_ids = [];
                        }
                        if (challenge.users_solved_ids.indexOf(gitlab_user_id) == -1)
                        {
                            challenge.users_solved_ids.push(gitlab_user_id); //add the current user to the challenge solvers.
                            challenge.save().then(
                                val => { 
                                    this.creditChallenge2User(_id, gitlab_user_id).then(val => 
                                        {
                                                                
                                            resolve({correct: true, solution: challenge.solution, info: challenge.info, hint: challenge.hint});
                                        });
                                },
                                err => { 
                                    logger.error(`Challenge save returned error: ${err}`);
                                    resolve({correct: false}); 
                                }
                            );
                        }                       
                        
                    }
                    else {
                        resolve({correct: false});                    
                    }
                }

                // Solution not sent - check if this is a past challenge or if user was correct in the past
                else {
                    if (this.isPastChallenge(challenge)) {
                        resolve({correct: true, solution: challenge.solution, info: challenge.info, hint: challenge.hint});
                    }
                    else {
                        this.isUserChallenged (gitlab_user_id, challenge).then ((userChallenged: boolean) => {
                            if (userChallenged) {
                                resolve({correct: true, solution: challenge.solution, info: challenge.info, hint: challenge.hint});
                            }
                            else {
                                resolve({correct: false});
                            }
                        });
                    }
                }
                
            });
        });
    }

    addChallenge(challenge: IChallengeModel): Promise<boolean> {


        return new Promise<boolean>((resolve, reject) => {
            model.challenge.create(challenge).then(() =>
                        {
                            logger.info("New challenge added");
                            resolve(true);
                        })
                        
        })        
    }

    getChallengeHint(gitlab_user_id: number, _id: string): Promise<string> {        
        logger.info(`getChallengeHint username:${gitlab_user_id}`);
        return new Promise<string>((resolve, reject) => {
            this.findChallengeById(_id).then(challenge => {
                
                this.makeUserPayForHint(challenge, gitlab_user_id)
                .then(updated_challenge => resolve(updated_challenge.hint.text))
                
            });
        });
    }

    creditChallenge2User(challenge_id: string, gitlab_user_id: number) {
        
        let gsm = GuildUsers.getGuildUsers();        
        return gsm.creditChallange2User(gitlab_user_id, challenge_id);
    }

    makeUserPayForHint(challenge: IChallengeModel, gitlab_user_id: number) {
        return new Promise<IChallengeModel>((resolve, reject) =>
        {
            if (challenge.users_hinted_ids.indexOf(gitlab_user_id) == -1)
            {
                 // Not found - add user and save
                challenge.users_hinted_ids.push(gitlab_user_id);
                challenge.save().then(res=> resolve(res))
            }
            else
            {
                resolve(challenge)
            }
        })
        

       
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
}
