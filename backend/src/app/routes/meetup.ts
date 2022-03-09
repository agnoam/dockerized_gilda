import { Meetups } from './../meetups';
import { IMeetup } from './../interfaces/IMeetup';


//import { GitLabAgent } from './../gitlabagent';

import express = require( "express" );
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";

const router = express.Router()

const meetups= new Meetups()


    // TODO - verify signedinuser
router.post(
    "/",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        meetups.registerUser((request.session as any).auth.user_id)
        .then((user) => response.json(user), (err:any)=> next(err))      
    }
)
    // TODO - verify signedinuser
router.delete(
    "/",
    function (request: Request, response: Response, next: NextFunction): void {
        meetups.unregisterUser((request.session as any).auth.user_id)
        .then((user) => response.json(user), (err:any)=> next(err))      
    }
)

router.get(
    "/",
    function (request: Request, response: Response, next: NextFunction): void {      
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        meetups.getAllMeetups()
        .then((meetups:Array<any>) => response.json(meetups), (err : any)=> next(err))      
    }
)


router.get(
    "/attending",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();        
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        meetups.getAttendingList()
        .then((users:Array<any>) => response.json(users), (err : any)=> next(err))      
    }
)

router.get(
    "/waiting",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        meetups.getWaitingList()
        .then((users:Array<any>) => response.json(users), (err : any)=> next(err))      
    }
)

router.get(
    "/next",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        meetups.getNextMeetup()
        .then((res : IMeetup) => response.json(res), (err:any)=> next(err))               
    }
)

export default router;