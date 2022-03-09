import express = require( "express" );
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";
import {GitLabAgent} from './../gitlab-agent'


const router = express.Router()
const gitlabAgent : GitLabAgent = GitLabAgent.getGitLabAgent()        

router.post(
    "/",
    function (request: Request, response: Response, next: NextFunction): void {

        // email?: string;
        // name?: string;
        // user_id: string;
        // username: string;
        //console.log(request.body);
        if (request.body.event_name == 'user_create')
        { 
            
            gitlabAgent.handleNewUser(request.body.user_id)
            //gitlabAgent.getUser$(request.body.user_id).subscribe((res) => guildUsers.createUserFromGitlabUser(res))                                   
        }
        if (request.body.event_name == 'merge_request')
        {
            //gitlabAgent.handleNewMergeRequest(request.body)
            
        }

        if (request.body.event_name == 'project_create')
        {
            gitlabAgent.handleNewProject(request.body.project_id)
           
        }
        // if (request.body.event_name == 'push')
        // {
        //     gitlabAgent.handleProjectUpdate(request.body.project_id)
                        
        // }

        response
            .type("text/plain")
            .send("Handeled GITLAB event");

    }
);

export default router;