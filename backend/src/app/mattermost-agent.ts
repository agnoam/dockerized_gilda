// import { Subject } from 'rxjs/Subject';
 import rp = require('request-promise');

// //import {BehaviouSubject} from 'rxjs/BehaviorSubject'
// import { Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/fromPromise';
// import * as fs from 'fs';
// import * as ip from 'ip';
import { getLogger } from 'log4js';

 const logger = getLogger();
//import * as download from 'download';



export class MatterMostAgent {
    private apiUrl : string
    private private_token :string

    
    private static instance : MatterMostAgent
        
    private constructor() 
    {
        // require('dotenv').config()        
        this.apiUrl  = process.env.MATTERMOST_API_URL;
        this.private_token = process.env.MATTERMOST_PRIVATE_TOKEN  
            
        
    }

    
    static getMatterMostAgent()
    {
        if (!MatterMostAgent.instance) MatterMostAgent.instance = new MatterMostAgent()
        return MatterMostAgent.instance
    }

    private getDataFromMatterMostServer$(url : string, params : string = '')
    {
        let options = 
        {
            uri:  url + params,
            headers: {"authorization": "Bearer " + this.private_token},
            json : true              
        }
        logger.log("kuku")
        return rp.get(options)   
        
    }

    getUsers()
    {
        return new Promise<Array<any>> ((resolve, reject) =>
        {
            this.getDataFromMatterMostServer$(this.apiUrl+'/users')
            .then((res : Array<any>) => resolve(res), err=> resolve([]))
        })
    }


    getWebHook(id : string)
    {
        return new Promise<any> ((resolve, reject) =>
        {
            this.getDataFromMatterMostServer$(this.apiUrl+'/hooks/incoming/' + id)
            .then((res : any) => resolve(res), err=> reject())
        })

    }

    getTeam(id : string)
    {
        return new Promise<any> ((resolve, reject) =>
        {
            this.getDataFromMatterMostServer$(this.apiUrl+'/teams/' + id)
            .then((res : any) => resolve(res), err=> reject())
        })
    }

    getTeamInviteLink(id: string)
    {
        return new Promise<string> ((resolve, reject) =>
        {
            this.getTeam(id)
            .then((res : any) => 
            {
                resolve('http://mattermost/signup_user_complete/?id=' + res.invite_id)
            }, err=> resolve(''))
        })
    }

    getInviteLinkByWebHook(id : string)
    {
        return new Promise<string> ((resolve, reject) =>
        {
            this.getWebHook(id)
            .then(res => this.getTeamInviteLink(res.team_id)
            .then(res => resolve( res) , err=> resolve(''))
            , err=> resolve(''))
        })
        
    }
    getUser(username : string)
    {
        return new Promise<string> ((resolve, reject) =>
        {
            this.getDataFromMatterMostServer$(this.apiUrl+'/users/username/', username)
            .then((res : any) => resolve(res.id), err=> reject())
        })
  
    }
}
