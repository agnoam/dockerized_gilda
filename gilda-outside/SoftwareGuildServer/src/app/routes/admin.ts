
import {GuildUsers} from './../guild-users';
import {Challenges} from './../challenges';
import { IMonsterModel } from './../models/monster';

import express = require( "express" );
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";
import {MailSender} from './../mail';
import { IMeetup } from './../interfaces/IMeetup';
import { Meetups } from '../meetups';
import { Monsters } from '../monsters';



const router = express.Router()


router.get(
    "/getusers", (request: Request, response: Response, next: NextFunction) => {

        let gsm = GuildUsers.getGuildUsers()            
        let userList = `username,name,email,gitlab user id,is active,`+ 
                        `rank,score,` +
                        `projects shared,challenges solved,members recommended,` + 
                        `pull reqs,projects,projects contributed\n` 
        gsm.getAllUsers().then(users => 
            { 
                for (const user of users) {                
                    userList += `${user.username},${user.name},${user.email},${user.gitlab_user_id},${user.active},` +
                                `${user.rank},${user.score},` +
                                `${user.badges.projects_shared.length},${user.badges.challenges_solved.length},${user.badges.members_recommended.length},`+
                                `${user.badges.pull_requests.length},${user.badges.projects.length},${user.contributed_projects.length}\n`; 
                }

                response
                .type("text/plain")
                .send(userList);    
            }
        ) 
        

    }
);

router.get(
    "/getmeetupusers", (request: Request, response: Response, next: NextFunction) => {
        //let gla = new GitLabAgent();
        let gsm = GuildUsers.getGuildUsers()   
        let meetups= new Meetups()
        let userList = ''
        
        meetups.getNextMeetup()
        .then((meetup : IMeetup) => {
            gsm.getAllUsers().then(users => {
                for (const user of users) {
                    if (meetup.attending_list_gitlab_ids.findIndex((x)=> x == user.gitlab_user_id) > -1) {
                        userList += `${user.username},${user.name},${user.email},${user.gitlab_user_id},${user.active}\n`
                    }
                }

                response
                .type("text/plain")
                .send(userList);    
            })
            
        })
    }
);

router.get(
    "/sendmeetupreminder", (request: Request, response: Response, next: NextFunction) => {
        //let gla = new GitLabAgent();
        let mailSender = new MailSender()
        let gsm = GuildUsers.getGuildUsers()   
        let meetups= new Meetups()
        
        meetups.getNextMeetup()
        .then((meetup : IMeetup) =>  



            gsm.getAllUsers().then(users => {
           
                let i = 1;
                while (users.length > 0) {
                    let slice = users.splice(0, 20);                                                                
                    setTimeout(mailSender.sendMeetupReminder2Users.bind(mailSender, slice, meetup), 1000*60*i++); // Send in 5 minute intervals (20 users every 5 minutes)
                }                
        }
        , (err:any)=> next(err)));
        
        response
            .type("text/plain")
            .send("Mail Sent");

    }
);

router.get(
    "/sendsolution", (request: Request, response: Response, next: NextFunction) => {
        //let gla = new GitLabAgent();
        let challenges = Challenges.getInstance();
        
       
        
           challenges.weeklySchedule();
           
        
        
        
        
        response
            .type("text/plain")
            .send("Mail Sent");

    }
);

router.get(
    "/getadoptionapplicants", (request: Request, response: Response, next: NextFunction) => {
        //let gla = new GitLabAgent();
        let gsm = GuildUsers.getGuildUsers()   
        let monsters= new Monsters()
        let userList = ''
        
        monsters.getMonster4Adoption().then((monsters: Array<IMonsterModel>) => 
        {
            if (monsters.length > 0)
            {
                let monster = monsters[0];
                for (const applicant_user_id of monster.adoption_applicants) {
                    gsm.getUserByGitlabId(applicant_user_id).then((user) =>
                    { 
                        userList += `${user.username},${user.name},${user.email},${user.gitlab_user_id},${user.active}\n`                    
                    });
                }

                response
                .type("text/plain")
                .send(userList);    
            }
        })
    }
);
router.get(
    "/createusers", (request: Request, response: Response, next: NextFunction) => {
        //let gla = new GitLabAgent();
        
        let gsm = GuildUsers.getGuildUsers()    
        gsm.createGuildUsers();
       

        response
            .type("text/plain")
            .send("Users cerated");

    }
);

router.get(
    "/restore_recommendations", (request: Request, response: Response, next: NextFunction) => {
        //let gla = new GitLabAgent();
        
        let gsm = GuildUsers.getGuildUsers()    
        gsm.restore_recommended();
       

        response
            .type("text/plain")
            .send("Users updated");

    }
);

router.get(
    "/setuseravatar", (request: Request, response: Response, next: NextFunction) => {
        //let gla = new GitLabAgent();
        
        let gsm = GuildUsers.getGuildUsers()    
        gsm.setUsersAvatars();
       

        response
            .type("text/plain")
            .send("Users avatar");

    }
);

router.get(
    "/addmeetup", (request: Request, response: Response, next: NextFunction) => {
        let meetups = new Meetups();
        meetups.addMeetups();               

        response
            .type("text/plain")
            .send("meetup created");

    }    
);

router.get(
    "/alive", (request: Request, response: Response, next: NextFunction) => {
          
        response
            .type("text/plain")
            .send("Alive");

    }
);

export default router;