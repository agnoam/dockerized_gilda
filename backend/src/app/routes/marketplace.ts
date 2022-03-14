

import { MarketPlace } from './../marketplace';
import express = require("express");
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";
import {IUser} from './../interfaces/IUser';

export const initializeRoute = () => {
    const router = express.Router()
    const marketplace = MarketPlace.getMarketPlaceService()
    
    
    router.get(
        "/projects/:id/mattermost",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getProjectMatterostInviteLink(+request.params.id)
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
    router.get(
        "/projects/:id/issues",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getProjectIssues(+request.params.id)
                .subscribe((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    router.get(
        "/projects/:id/",
        function (request: Request, response: Response, next: NextFunction): void {
            marketplace.getProjectById(
                +request.params.id, 
                (request.session as any).auth ? (request.session as any).auth.user_id : undefined
            ).then((res: any) => response.json(res), (err: any) => next(err))
        })
    
        // TODO - verify signedinuser
    router.put(
        "/projects/star",
        function (request: Request, response: Response, next: NextFunction): void {
            marketplace.starProject(request.body.project_id, (request.session as any).auth.user_id, true)
                .then((res: any) => response.json(res), (err: any) => next(err))
        })
        
    // TODO - verify signedinuser
    router.put(
        "/projects/unstar",
        function (request: Request, response: Response, next: NextFunction): void {
            marketplace.starProject(request.body.project_id,  (request.session as any).auth.user_id, false)
                .then((res: any) => response.json(res), (err: any) => next(err))
        })
    router.get(
        "/projects",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getProjects(request.query)
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
    
    router.get(
        "/users/:id",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getUser(request.params.id)
                .then((res: any) => response.json(res), (err: any) => next(err))
        })
    
    
    router.get(
        "/users",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getUsers(request.query)
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
    
    router.get(
        "/labels",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getLabels()
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
    router.get(
        "/languages",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getLanguages()
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
    router.get(
        "/tags",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getKnowledgeDomains()
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
            // TODO - verify signedinuser
        router.put(
            "/gigs/",
            // TODO: verify that the action is done by project owner
            function (request: Request, response: Response, next: NextFunction): void {
                //let gla = new GitLabAgent();
                marketplace.updateGig(request.body.project_id,
                    request.body.issue_iid,
                    request.body.level,
                    request.body.hours)
                    .then((res: Array<any>) => response.json(res), (err: any) => next(err))
            })
    
                // TODO - verify signedinuser
    
    router.post(
        "/gigs",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            // TODO: verify that the action is done by project owner
            marketplace.addGig(request.body.project_id,
                request.body.issue_iid,
                (request.session as any).auth.user_id,
                request.body.hours,
                request.body.level)
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
            // TODO - verify signedinuser
    router.put(
        "/gigs/userAssignment",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.updateUserAssignment(request.body.project_id,
                request.body.issue_iid,
                (request.session as any).auth.user_id,
                request.body.assign_to_gig)
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
       
    router.get(
        "/gigs",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.getGigs(request.query)
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
            // TODO - verify signedinuser
    router.put(
        "/user/skills",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.updateUserSkills((request.session as any).auth.user_id, request.body.labels)
                .then((res: IUser) => response.json(res), (err: any) => next(err))
        })
    
            // TODO - verify signedinuser
    router.put(
        "/user/fields",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.updateUserFieldsOfInterest((request.session as any).auth.user_id, request.body.labels)
                .then((res: IUser) => response.json(res), (err: any) => next(err))
        })
    
            // TODO - verify signedinuser
    router.put(
        "/user/autoupdate",
        function (request: Request, response: Response, next: NextFunction): void {
            //let gla = new GitLabAgent();
            marketplace.updateUserAutoUpdate((request.session as any).auth.user_id, request.body.auto)
                .then((res: Array<any>) => response.json(res), (err: any) => next(err))
        })
    
    
    // router.get(
    //     "/deletelabels",
    //     function (request: Request, response: Response, next: NextFunction): void {
    //         //let gla = new GitLabAgent();
    //         marketplace.deleteAllLabels()
    //         .then((res : Array<any>) => response.json(res), (err:any)=> next(err))               
    //     })
    
    //     router.get(
    //         "/deleteissues",
    //         function (request: Request, response: Response, next: NextFunction): void {
    //             //let gla = new GitLabAgent();
    //             marketplace.deleteAllIssues()
    //             .then((res : Array<any>) => response.json(res), (err:any)=> next(err))               
    //         })

    return router;
}