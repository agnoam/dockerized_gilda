import { IChallengeModel } from './../models/challenge';
import { Challenges } from './../challenges';

import express = require( "express" );
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";

const router = express.Router()

const challenges : Challenges = Challenges.getInstance();

router.get(
    "/",
    function (request: Request, response: Response, next: NextFunction): void {        
        challenges.getPastChallenges()
        .then((res : Array<any>) => response.json(res), (err:any)=> next(err))               
    }
)

router.post(
    "/current",
    function (request: Request, response: Response, next: NextFunction): void {

        // POST arguments:
        // username
        // year
        // week
    
        challenges.getCurrentChallenge(request.body.year, request.body.week, request.session.auth.user_id)
        .then((res) => response.json(res), (err:any)=> next(err))    
    }
);

    // TODO - verify signedinuser
router.post(
    "/test",
    function (request: Request, response: Response, next: NextFunction): void {
        
        // POST arguments:
        // username
        // id
        // solution

        challenges.testChallenge(request.session.auth.user_id, request.body.id, request.body.solution)
        .then((res) => response.json(res), (err:any)=> next(err))      
    }
)
    // TODO - verify signedinuser
router.post(
    "/hint",
    function (request: Request, response: Response, next: NextFunction): void {
        
        // POST arguments:
        // username
        // id

        challenges.getChallengeHint(request.session.auth.user_id, request.body.id)
        .then((res:string) => response.json(res), (err:any)=> next(err))      
    }
)

router.post(
    "/add",
    function (request: Request, response: Response, next: NextFunction): void {
        
        // POST arguments:
        // title
        // challenge
        // info
        // image
        // score
        // hint
        // hintprice
        // keyboard 
        // solution
        // year
        // week
        // author
        
        let c = <IChallengeModel>{
            title: request.body.title,
            challenge: request.body.challenge,
            info: request.body.info,
            image: request.body.image,
            score: request.body.score,
            hint: { text: request.body.hint, price: request.body.hintprice },
            keyboard: challenges.string2keyboard(request.body.keyboard), 
            solution: challenges.string2solution(request.body.solution),
            year: request.body.year,
            week: request.body.week,
            author: request.body.author
        }; 

        challenges.addChallenge(c)
        .then((res:boolean) => response.json(res), (err:any)=> next(err))      
    }
)
export default router;