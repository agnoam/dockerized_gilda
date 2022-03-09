import { IUser } from './../interfaces/IUser';
import {GuildUsers} from './../guild-users';

//import { GitLabAgent } from './../gitlabagent';

import express = require( "express" );
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";

const router = express.Router()

const users : GuildUsers = GuildUsers.getGuildUsers()


    // TODO - verify signedinuser
router.post(
    "/",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        users.recommendUser(request.session.auth.user_id, request.body.applicant)
        .then(() => response.json(request.body),
         (err:any)=> next(err))
        .catch(err=> response.status(400).json(err) )      
    }
)
    // TODO - verify signedinuser
router.post(
    "/poke",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        users.pokeMember(request.session.auth.username, request.body.guildMember)
        .then(() => response.json(request.body), (err:any)=> next(err))      
    }
)

router.post(
    "/ishurAvtam",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        console.log("ishurAvtam", request.body);
        
        users.approveAvtamUser(request.session.auth.user_id, request.body.applicant)
        .then(() => response.json(request.body),
         (err:any)=> next(err))
        .catch(err=> response.status(400).json(err) )      
    }
)

router.get(
    "/signedin",
    function (request: Request, response: Response, next: NextFunction): void {
        console.log("signedin");
        
        //let gla = new GitLabAgent();
        if (request.session.auth && request.session.auth.user_id)
        {
            console.log("request.session.auth", request.session.auth);
            
            users.getUserByGitlabId(request.session.auth.user_id)
            //users.getSignedInUser(request.headers.authorization as string)
            .then((res : any) => 
            {
                
                response.json(res.username), (err:any)=> next(err)
            })      
            .catch(err=> 
                {
                    response.status(403);
                })   
        }
        else
        {
            response.status(401)
        }
              
    }
)
router.get(
    "/:id",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        users.getUserByGitlabId(request.params.id)
        .then((user:any) => response.json(user), (err : any)=> next(err))      
    }
)

router.get(
    "/corp/:id",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        users.getUserbyID(request.params.id)
        .then((user:any) => response.json(user), (err : any)=> next(err))      
    }
)

router.get(
    "/",
    function (request: Request, response: Response, next: NextFunction): void {
        //let gla = new GitLabAgent();
        users.getAllUsers()
        .then((res : Array<IUser>) => response.json(res), (err:any)=> next(err))               
    }
)

export default router;