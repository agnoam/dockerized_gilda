// import { Subject } from 'rxjs/Subject';
// import rp = require('request-promise');
import { GitLabAgent } from './gitlab-agent';
import { MatterMostAgent } from './mattermost-agent'
import {IProject} from './interfaces/IProject'
import {IGig} from './interfaces/IGig'
import {ILabel} from './interfaces/ILabel'
import { ILabelModel } from './models/label';
import { IGigModel } from './models/gig';
import * as moment from 'moment';


import model from './db';

// //import {BehaviouSubject} from 'rxjs/BehaviorSubject'
// import { Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/fromPromise';
// import * as fs from 'fs';
// import * as ip from 'ip';
// import { getLogger } from 'log4js';


// const logger = getLogger();
//import * as download from 'download';
import { getLogger } from 'log4js';
//import rp = require('request-promise');
import { GuildUsers } from './guild-users';
import { Subject } from 'rxjs/Subject';
import { IUserModel } from './models/user';
import { IUser } from './interfaces/IUser';
import { IProjectModel } from './models/project';



const logger = getLogger();
const PROG_LANG = "Programming Language"
const DOMAIN = "Knowledge Domain"

export class MarketPlace {
    // private apiUrl : string
    // private private_token :string
    gitlabAgent: GitLabAgent = GitLabAgent.getGitLabAgent()
    matterMostAgent: MatterMostAgent = MatterMostAgent.getMatterMostAgent()
    guildUsers: GuildUsers = GuildUsers.getGuildUsers()
    //private discoverability_project_id: number = 379
    private static instance: MarketPlace

      
    private gigs_data: Array<any> = []
   

    private constructor() {
        
        require('dotenv').config()
       
        // initalize gigs_data
        this.getAllProjects().then(projects=> 
        this.getLabels().then(labels =>
        this.refreshGigs(labels, projects)))
        
            // subscribe on projects update
        this.gitlabAgent.getProjectsUpdate$().subscribe(projs => {    
            this.handleProjectsRefresh(projs).then(() =>
            {
                
                    logger.info('marketplace')
               
            })
           
          
        })
    

       
        //setInterval(() => this.refreshData(), 600000);
    }

    private processProjects(projs : any[])
    {
        return new Promise<Array<IProject>>((resolve, reject) => 
        {
            let promises: Array<Promise<any>> = []                       
            let processed_projects : IProject[] = []                 
                                
            for (let proj of projs)
            {           
                promises.push(new Promise<void>((resolve, reject)=>{
                    this.findOrCreateProject(proj.id)
                    .then((project : IProjectModel) => {
                        
                        this.copyProjectData(project, proj)
                        let days_not_updated = (moment().diff(moment(project.last_activity_at), 'days'))
                        //days_not_updated = days_not_updated > 60? 60 : days_not_updated 
                        let heartbeat = ((
                            project.contributors.length + project.owners.length +
                            (project.statistics ? project.statistics.commit_count : 0)) - 
                        days_not_updated) 
                        project.heartbeat = heartbeat < 0? 0 : (heartbeat > 100? 100 : heartbeat)
    
                        project.save()
                        .then((saved_project :IProjectModel) =>
                        {
                            processed_projects.push(saved_project)
                            resolve()
                        })
                        .catch((err)=>{logger.error(err); resolve()})                    
                    })
                }))                            
            }

            Promise.all(promises).then(()=> resolve(processed_projects))
        })
    }


    private findOrCreateProject(id : number)
    {
        return new Promise((resolve, reject) =>
        {
            this.getProject(id)
            
            .then((project : IProjectModel) =>
            {
                // Exisisting project
                if (project)
                {
                    resolve (project)
                }
                // New project
                else
                {
                    resolve(new model.project())
                }
            })
            
            .catch((err) =>
            {
                logger.error(err)
                reject(err)
            })
        })
       
    }

    private getTagsFromProjectList(projects: IProject[], labels : ILabel[]) {
        let tags : string[] = [];
        let langs = this.getLangs(labels).map(label => label.name)
        for (let proj of projects) {
            let proj_tags: Array<string> = proj.tag_list.map((tag: string) => tag.toLowerCase());

            // Avoid adding languages as knowledge domains
            for (let tag of proj_tags.filter(tag => langs.indexOf(tag) == -1)) {
                if (tags.indexOf(tag) == -1)
                    tags.push(tag);
            }
        }
        return tags;
    }

    private getLangsfromProjectsList(projects: IProject[]) {
        let langs: Array<string> = [];
        for (let proj of projects) {
            for (let lang in proj.languages) {
                if (langs.indexOf(lang) == -1) langs.push(lang);
            }
        }
        return langs;
    }

    
    starProject(project_id : number, gitlab_user_id : number, star : boolean)
    {        
        return new Promise<any>((resolve, reject) =>
        {
            this.gitlabAgent.starProject(project_id, gitlab_user_id, star)
            .then(proj=> {               
            this.getProjectById(project_id, gitlab_user_id)
            .then(detailed_proj => resolve(detailed_proj))
            .catch(err=> reject(err))
            }).catch(err=> reject(err))           
        })
    }
    private deleteOldLabels(new_langs : string[], new_tags : string[], labels : Array<ILabel>)
    {
        let promises: Array<Promise<void>> = []
        //let langs = this.getLangs(labels).map(label => label.name) 
        let tags = this.getTags(labels).map(label => label.name) 
                
        //let deleted_langs = langs.filter(old_lang => new_langs.indexOf(old_lang) == -1)
        let deleted_tags = tags.filter(old_tag => new_tags.indexOf(old_tag) == -1)

        let labels_to_delete = labels
        .filter(label => 
            //(deleted_langs.indexOf(label.name) != -1 && label.description == 'Programming Language') ||
            (deleted_tags.indexOf(label.name) != -1 && label.description == DOMAIN)) 

        //let deleted_labels = old_labels.filter(old_label => this.labels.findIndex(label=> label.id == old_label.id ) == -1)
        // this.labels = this.labels
        //     .filter(label => labels_to_delete
        //     .findIndex(label_to_delete =>label_to_delete.id == label.id) == -1)
        // this.langs = new_langs
        // this.tags = new_tags
        for (let label of labels_to_delete)
        { 
           
            promises.push(model.label.remove({ name : label.name})
            .then(()=>{})
            .catch(err=>logger.error(err)))
            //this.gitlabAgent.deleteLabel(this.discoverability_project_id, label)
        }
        return Promise.all(promises)
    }

    getLabels() {        
        let query = model.label.find({},).sort({count: -1})
        return query.exec();    
    }
    private getLangs(labels : Array<ILabel>) {
        return labels.filter((label : ILabel) => label.description == PROG_LANG)
    }

    private getTags(labels : Array<ILabel>) {
        return labels.filter((label : ILabel) => label.description == DOMAIN)
    }

    // private refreshLabels(labels: Array<ILabel>) {        
    //     this.labels = labels
        
    //     this.langs = this.getLangs().map(lang => lang.name)
    //     this.tags = this.getTags().map(tag => tag.name)
    //     // labels.forEach((label => 
    //     //     {
    //     //         // if (label.description == "Programming Language")
    //     //         // {
    //     //         //     if (this.languages.indexOf(label.name) == -1)
    //     //         //     this.languages.push(label.name)
    //     //         // }
    //     //         // else
    //     //         {
    //     //             if (this.labels.findIndex(e=> label.name == e.name) == -1)
    //     //             this.labels.push(label)
    //     //         }
    //     //     }),this)

    // }
    private addLanguage(lang: string) {

        return this.createLabel(lang, PROG_LANG)
    }
    private addKnowledgeDomain(tag: string) {

        return this.createLabel(tag, DOMAIN)
    }

    // TODO : Make sure languages are not added as programming languages
    private createLabel(name : string, description : string)
    {
        return new Promise<ILabelModel>((resolve, reject) =>
        {
            let query = { name : name };                         

            model.label.findOne(query, (error:any, result :ILabelModel) =>
            { 
                if (!result) 
                {  
                    let new_label: ILabel = 
                    {
                        name : name,
                        description : description,
                        count : 0
                    }                         
                    result = new model.label(new_label);                         
                    result.save().then((label : ILabelModel) => resolve(label))
                }
                else
                {
                    resolve(result)
                }
                                    
            })
        })
    }

   
    // TODO : Find abetter name
    private recalcLabelsDueToProjectsRefresh(projects: Array<IProject>, labels : Array<ILabel>, new_langs : string[], new_tags : string[]) {

        let promises: Array<PromiseLike<void>> = []
      
        for (let label of labels)
        {
            label.count = 0
        }
        projects.forEach((project : IProject) => {
            for (let lang in project.languages) {                
                if (new_langs.indexOf(lang) == -1)
                 {
                    new_langs.push(lang)                    
                    if (labels.findIndex(label => label.name ==lang && label.description == PROG_LANG) == -1) {
                        promises.push(this.addLanguage(lang)
                            .then((label : ILabelModel) => {labels.push(label) })
                            .catch((err : any) => {logger.error(err) }))
                    }
                }
                else
                {
                    let lang_label = labels.find(label => label.name == lang)
                    if (lang_label) lang_label.count++                
                }
            }

            for (let tag of project.tag_list) 
            {
                tag = tag.toLowerCase()
                if (labels.filter(label => label.description == PROG_LANG)
                .map((lang) => lang.name.toLocaleLowerCase())
                .indexOf(tag) == -1 &&
                new_langs.map((lang : string) => lang.toLocaleLowerCase()).indexOf(tag) == -1)                
                {                   
                    if (new_tags.indexOf(tag) == -1) 
                    {
                        new_tags.push(tag)
                        if (labels.findIndex(label => label.name ==tag && label.description == DOMAIN) == -1)
                        {
                        
                            promises.push(this.addKnowledgeDomain(tag)
                                .then((label : ILabelModel) => {labels.push(label) })
                                .catch(err => { }))
                        }
                    }
                    else
                    {
                        let tag_label = labels.find(label => label.name == tag)
                        if (tag_label) tag_label.count++
                    }
                    
                }            

        }})
        return Promise.all(promises)
    }

    //  : do it sequentially to avoid Gitlab Server 502
    private refreshGigs(labels : ILabel[], projects : IProject[]) {

        return new Promise<void>((resolve, reject) => 
        {
            let promises: Array<Promise<any>> = []                                                       
            this.getAllGigs().then((gigs : Array<IGig>) =>
            {
                this.gigs_data=[]
                for (let gig of gigs) {
                    promises.push(this.pushGigData(gig, projects))
                } 
            })
            Promise.all(promises).then(()=>resolve())
        })     
    }
   
    private pushGigData(gig: IGig, projects : IProject[]) {
        return new Promise<void>((resolve, reject) => {                            
        this.gitlabAgent.getProjectIssue$(gig.project_id, gig.issue_id)
            .then(issue => {
                let proj = projects.find(project => project.project_id == gig.project_id) 
                
                issue.tags = proj.tag_list.map((x:string)=> x.toLowerCase())
                issue.langs =this.getLangsfromProjectsList([proj])    
                //  : set gig fields                                         
                issue.level = gig.level
                issue.publisher = gig.publisher
                issue.time_estimate = gig.time_estimate                   
                                    
                this.gigs_data.push(issue)
                resolve(issue)
                // let gig_index = this.gigs.findIndex(anygig => 
                //     anygig.project_id == gig.project_id && anygig.iid == gig.issue_id)
                // // push gig only if doesn't exist, otherwise, update gig
                // if (gig_index == -1) this.gigs.push(issue)
                // else this.gigs[gig_index] = issue                                        
            }).catch(err=> {logger.error(err);  reject()})
        })
           
    }


    private autoUpdateUserLabels(user: IUser, projects: IProject[], contributed_projects: IProject[], labels : ILabel[]) {
        let skills_langs = this.getLangsfromProjectsList(projects);
        let skills_tags = this.getTagsFromProjectList(projects, labels);
        let wants_to_learn_langs = this.getLangsfromProjectsList(contributed_projects);
        let wants_to_learn_tags = this.getTagsFromProjectList(contributed_projects, labels);
        return this.guildUsers.updateUserLabels(user.gitlab_user_id, skills_langs, skills_tags, wants_to_learn_langs, wants_to_learn_tags)
    }

    private updateContributedProjects(contributed_projects: any[], user: any) {
        for (let project of contributed_projects) {
            if (project.contributors.indexOf(user.gitlab_user_id) == -1)
                project.contributors.push(user.gitlab_user_id);
        }        
    }

    private copyProjectData(project : IProjectModel, proj : any)
    {        
        project.project_id =  proj.id
        project.description = proj.description
        project.name = proj.name
        project.name_with_namespace = proj.name_with_namespace
        project.path = proj.path
        project.path_with_namespace =proj.path_with_namespace
        project.created_at = proj.created_at
        project.default_branch = proj.default_branch
        project.tag_list = proj.tag_list.slice() 
        project.ssh_url_to_repo = proj.ssh_url_to_repo
        project.http_url_to_repo = proj.http_url_to_repo
        project.web_url = proj.web_url
        project.readme_url = proj.readme_url
        project.avatar_url = proj.avatar_url
        project.star_count = proj.star_count
        project.forks_count = proj.forks_count
        project.last_activity_at = proj.last_activity_at

        project._links= {
            self : proj.self,
            issues : proj.isues,
            merge_requests: proj.merge_requests,
            repo_branches : proj.repo_branches,
            labels : proj.labels,
            events : proj.events,
            members : proj.members
        }
        project.archived = proj.archived
        project.visibility = proj.visibility  
        project.creator_id = proj.creator_id

        project.statistics = {
            commit_count : proj.statistics.commit_count
        
        }

        project.files = proj.files.slice()
        project.contributors =proj.contributors.slice()
        project.owners = proj.owners.slice(),       
        project.languages = JSON.parse(JSON.stringify(proj.languages))
     
        project.community = proj.community.slice(),
        
        project.potential_developers = proj.potential_developers.slice()
        project.heartbeat = 0

        for (let clone of proj.clones)
        {
            let day =  project.clones.find(fetch => fetch.date == clone.date)
            if (day)
            {
                day.count = clone.count
            }
            else
            {
                project.clones.push(clone)
            }
        }
        
    }

    private saveLabels(labels : ILabelModel[])
    {

        let promises: Array<PromiseLike<ILabelModel>> = []

        for (let label of labels)
        {
            promises.push(label.save())
        }
        return Promise.all(promises)
    }

    private handleProjectsRefresh(projects : any[]) {
        return new Promise<void>((resolve, reject) =>
        {
            this.getLabels()
                .then(labels => {
                    //this.refreshLabels(labels)
                    let new_langs : string[] = []
                    let new_tags : string[] = []
                    this.recalcLabelsDueToProjectsRefresh(projects, labels, new_langs, new_tags)
                    .then(() => {
                        this.saveLabels(labels).then(()=>{
                            this.deleteOldLabels(new_langs, new_tags, labels)
                            .then(()=>{
                            this.guildUsers.getAllUsers()
                            .then((users : IUser[]) => {
                                //let updated_users = this.copyUsers(users)

                                    this.refreshDataDueToUsersUpdate(labels, projects, users)
                                    .subscribe(() => this.processProjects(projects)
                                    .then((processed_projects) =>
                                    {
                                        this.refreshGigs(labels, processed_projects)
                                        .then(() => resolve())
                                    }))
                                    
                                
                                //.then(() => this.recalcLabelsDueToProjectsRefresh(users.slice())
                                //     .subscribe((processed_users : Array<IUser>) => 
                                //     {
                                //         this.users = processed_users
                                //         //this.saveCache().then(res=> console.log('ready'))
                                //     }))
                                })
                            })                       
                            
                        })
                        
                    })
                })
            })
    }

   
    private getAllGigs() {
        let query = model.gig.find({})
        return query.exec();  
    }
    static getMarketPlaceService() {
        if (!MarketPlace.instance) MarketPlace.instance = new MarketPlace()
        return MarketPlace.instance
    }

   

    //private copyUsers(users: Array<any>) {
        //create our own copy 
      //  return JSON.parse(JSON.stringify(users));

    //}
    private isUserProj(project: any, my_project_ids: Array<number>) {
        return my_project_ids.indexOf(project.id) != -1
    }

    private labelArray2String(str: Array<string>) {
        return str.reduce((labels: string, label: string) => (labels += ',' + label), '')
    }

    // private getUserProjects(user :IUserModel)
    // {       
    //     return user.badges.projects.concat(user.contributed_projects)        
    // }
    private refreshDataDueToUsersUpdate(labels : ILabel[], projects: any[], users: Array<IUser>, completed: Subject<any[]> = new Subject<any[]>(), proccessed_users : IUser[] = []) 
    {
        if (users.length > 0) {
            
            let user = users.pop()            
            let user_projects = projects.filter(proj => this.isUserProj(proj, user.badges.projects))
            let contributed_projects = projects.filter(proj => this.isUserProj(proj, user.contributed_projects))

            this.updateContributedProjects(contributed_projects, user);    
            if (user.auto_update)
            {
                this.autoUpdateUserLabels(user, user_projects, contributed_projects, labels )
                .then((processed_user : IUser) =>                
                {
                    proccessed_users.push(processed_user)  
                    this.refreshDataDueToUsersUpdate(labels, projects, users, completed, proccessed_users)                   
                })
            }
            else
            {
                this.refreshDataDueToUsersUpdate(labels, projects, users, completed, proccessed_users)                   
            }
            
                       
                           
        }
        else 
        {                      
            completed.next(proccessed_users)
            completed.complete()
        }
        return completed
    }
         

    
    getLanguages() {
        return new Promise((resolve, reject) => {
            this.getLabels().then((labels : ILabel[]) => 
                {
                    resolve (this.getLangs(labels)
                    .map(label => label.name)
                    .sort())                   
                })
        })         
    }


    getKnowledgeDomains() {
        return new Promise((resolve, reject) => {
            this.getLabels().then((labels : ILabel[]) => 
                {
                     resolve(this.getTags(labels)                    
                    .map((label : ILabel) => label.name)
                    .sort())
                })
            })
    }

   

    updateUserFieldsOfInterest(gitlab_user_id: number, wants_to_learn: string[]) {
        //let issue = this.issues.filter(issue => issue.title == gitlab_user_id && issue.description == 'FieldsOfInterest')
        return this.updateUser(gitlab_user_id, wants_to_learn, 'FieldsOfInterest')
    }

    private updateUser(gitlab_user_id: number, labels: string[], description: string) {
        return new Promise<IUser>((resolve, reject)=>
        {
            this.getLabels().then(skill_poll_labels=>
                {
                    let langs = this.getLangs(skill_poll_labels).map((label : ILabel) => label.name)
                    let tags = this.getTags(skill_poll_labels).map((label : ILabel) => label.name)
        
                    let langs_list = labels.filter(label => langs.indexOf(label) != -1)
                    let tags_list = labels.filter(label => tags.indexOf(label) != -1)
                    this.guildUsers.updateUserLabels(
                        gitlab_user_id, 
                        langs_list, 
                        tags_list, 
                        langs_list, 
                        tags_list, 
                        description).then(user=> resolve(user))
                })
                
        })
        
    }

    updateUserSkills(gitlab_user_id: number, skills: string[]) {

        //let issue = this.issues.filter(issue => issue.title == gitlab_user_id && issue.description == 'FieldsOfInterest')
        return this.updateUser(gitlab_user_id, skills, 'Expertise')
    }

    updateUserAutoUpdate(gitlab_user_id: number, auto_update: boolean) {
        return this.guildUsers.updateUserAutoUpdate(gitlab_user_id, auto_update)
    }
    

    
    private doesUserIDMatch(user: any, gitlab_user_ids: Array<number>) {
        return gitlab_user_ids.every(id => id == user.gitlab_user_id)
    }

    private isUserLabeled(user_labels: string[], query_labels: Array<string>) {                            
        return query_labels.every((tag: string) => user_labels.indexOf(tag) != -1)
    }

    private isFreeTextInUser(user: any, free_text: Array<string>) {
        let search_str: string = user.name.toLowerCase() + user.username.toLowerCase()
        return free_text.every((text => search_str.indexOf(text) != -1))
    }


    private convert2GitlabUserIds(usernames: Array<string>, users : IUser[]) {
        return usernames.map((username: string) => {
            username = username.toLowerCase();
            let user = users.find(user => user.username == username);
            if (user)
                return user.gitlab_user_id;
            else
                return 0;
        });
    }
    private filterUsers(query: any, users : IUser[]) {
        let result = users;
        if (query.user_name) {
            let user_ids = this.convert2GitlabUserIds(query.user_name, users);
            result = result.filter((user: any) => this.doesUserIDMatch(user, user_ids));
        }

        if (query.tag_name)
            result = result.filter((user: any) =>
            this.isUserLabeled(
                user.wants_to_learn_tags.
                concat(user.skills_tags), 
                query.tag_name));
        if (query.lang_name)
            result = result.filter((user: any) => 
            this.isUserLabeled(
                user.wants_to_learn_langs.
                map((str: string) => str.toLowerCase()).
                concat(user.skills_langs.
                map((str: string) => str.toLowerCase()))
                , query.lang_name))        
          
        if (query.search)
            result = result.filter((user: any) => this.isFreeTextInUser(user, query.search.split(' ')));
        return result;
    }

    public getUsers(query: any) {
        return new Promise<IUser[]>((resolve, reject) =>
        {
            this.guildUsers.getAllUsers().then(users=>
            {
                let result = this.filterUsers(query, users)
                result = result.sort((user1, user2)=> {return (user1.name >= user2.name? 1: -1)})
                resolve(result)
            })
            
        
        })
            
    }


   
    private gigMatchUserLabels(gig : any, tags : string[], langs : string[])
    {
        return langs.some((lang: string) => gig.langs.indexOf(lang) != -1) &&
               tags.some((tag: string) => gig.tags.indexOf(tag) != -1)
    }
    private findGigsForUser(user : IUser) {        

        return this.gigs_data.filter(
            gig=> (gig.publisher != user.gitlab_user_id.toString()) &&

            ((gig.level == 1 || gig.level == 2) &&                  
            this.gigMatchUserLabels(gig, user.wants_to_learn_tags, user.wants_to_learn_langs)) ||
    
            (gig.level == 3 || gig.level == 2) &&  (gig.publisher != user.gitlab_user_id.toString()) &&
             this.gigMatchUserLabels(gig, user.skills_tags, user.skills_langs )
            )          
    }

    getUser(username: string) {
        return new Promise<any>((resolve, reject) => {
            username = username.toLowerCase()
            this.guildUsers.getAllUsers()
            .then((users :any[]) => {                
                let user :any  = users.find(user => user.username == username)
                if (user) {
                    let result = JSON.parse(JSON.stringify(user))
                    result.gigs = this.findGigsForUser(result)
                    resolve(result)
                }
                else reject()
            })
           
        })

    }
      


    private areUsersActiveInProject(proj: IProject, gitlab_user_ids: Array<number>) {
        let proj_users = proj.contributors.concat(proj.owners)
        return gitlab_user_ids.every((id: number) => proj_users.indexOf(id) != -1)

    }

    private isProjectTaged(proj: IProject, tag_list: Array<string>) {
        let proj_tags = proj.tag_list
            .map((tag: string) => tag.toLowerCase())
        return tag_list.every((tag: string) => proj_tags.indexOf(tag) != -1)
    }
    private isLangInProject(proj: IProject, langs: Array<string>) {
        let proj_langs = Object.keys(proj.languages).map((lang: string) => lang.toLowerCase())
        return langs.every((lang: string) => proj_langs.indexOf(lang) != -1)
    }

    private isFreeTextInProject(proj: IProject, free_text: Array<string>) {
        let search_in: string = proj.name.toLowerCase() + (proj.description? proj.description.toLowerCase() : '')
        return free_text.every(search_str => search_in.indexOf(search_str) != -1)
    }

    private filterProjects(query: any, projects : IProject[], users : IUser[]) {
        let result = projects.filter(project => project.visibility != "private")
        if (query.user_name) {
            let query_users = this.convert2GitlabUserIds(query.user_name, users);
            result = result.filter((proj: any) => this.areUsersActiveInProject(proj, query_users));
        }
        if (query.tag_name)
            result = result.filter((proj: any) => this.isProjectTaged(proj, query.tag_name));
        if (query.lang_name)
            result = result.filter((proj: any) => this.isLangInProject(proj, query.lang_name));
        if (query.search)
            result = result.filter((proj: any) => this.isFreeTextInProject(proj, query.search.split(' ')));
        return result;
    }

    private getAllProjects()
    {
        let query = model.project.find({},)
        return  query.exec()
    }
    public getProjects(query: any) {

        return new Promise((resolve, reject) => {
            this.getAllProjects().then(projects =>
            {
                this.guildUsers.getAllUsers()
                .then(users => {
                    let result = this.filterProjects(query, projects, users);
                    resolve(result)
                })
            })
            

        })

    }

    getProjectMatterostInviteLink(project_id: number) {
        return new Promise((resolve, reject) => {
            this.gitlabAgent.getProjectMattermostService(project_id)
                .then(res => {
                    if (res.properties.webhook != undefined) {
                        let webhook_id: string = res.properties.webhook.replace('http://mattermost/hooks/', '')
                        this.matterMostAgent.getInviteLinkByWebHook(webhook_id)
                            .then(link => resolve(link))
                    }
                    else {
                        resolve(undefined)
                    }
                }).catch(err=> resolve(undefined))
        })

    }

    private getProject(id: number)
    {
        let query = model.project.findOne({project_id : id})
        return query.exec()
    }

    // private getGig(project_id: number, issue_id: number)
    // {
    //     let query = model.gig.findOne({project_id : project_id, issue_id : issue_id})
    //     return query.exec()
    // }

    getProjectById(id: number, gitlab_user_id : number) {
        return new Promise<any>((resolve, reject) => {
            
            this.getProject(id).then((project : IProjectModel) =>
            {                
                if (project) 
                {   
                    
                    this.gitlabAgent.getStarredProjects(gitlab_user_id)               
                    .then((projects: any[]) => 
                    {
                        this.guildUsers.getAllUsers()
                        .then ((users : IUserModel[])=>
                        {
                        // Copy project                    
                        let result_project : any = JSON.parse(JSON.stringify(project))
                        if (gitlab_user_id)
                        {
                            result_project.starred_by_user = (projects.findIndex(proj=> proj.id == project.project_id) != -1)
                        }
                        
                        result_project.gigs = this.gigs_data.filter(gig=> gig.project_id==project.project_id && !gig.closed_at)
                       
                        let langs =  Object.keys(project.languages)
                        result_project.potential_developers = 
                        users.filter(user => user.gitlab_user_id != gitlab_user_id && 
                            (langs.some(lang => user.skills_langs.indexOf(lang) != -1) || 
                            project.tag_list.some((tag : string)=> user.skills_tags.indexOf(tag) != -1)))
                            .map(user=> user.gitlab_user_id)
                        this.gitlabAgent.getProjectIssues$(project.project_id, 'opened')
                        .subscribe(issues=> {
                            // Add only non-gig issues
                            result_project.issues = issues.filter((issue :any) => result_project.gigs.findIndex((gig : any)=> gig.id == issue.id) == -1)
                            result_project.mattermost = this.getProjectMatterostInviteLink(project.project_id)
                            .then(channel => 
                                {                                
                                    result_project.mattermost = channel;
                                    this.gitlabAgent.getRepositoryContainsFile(project.project_id,'README.md')
                                    .then(data=>
                                    {
                                        result_project.readmeContent = data;
                                        
                                    })
                                    .catch(e=> {})
                                    .finally(() => resolve(result_project))
                                    
                                })  
                            
                        })
                    })
                    })        
                }
                else reject();
            }).catch(err=> reject())
            
        })
    }
    
    private areUsersActiveInGig(gig: any, users: Array<number>) {
        let users_in_gig: Array<number> = gig.assignees.map((assignee: any) => assignee.id)
        users_in_gig.push(+gig.publisher)
        users_in_gig.push(gig.author.id)

        return users.every(user => users_in_gig.indexOf(user) != -1)
    }

    private isGigLabeled(gig: any, labels: string[]) {
        let gig_labels =  gig.labels.concat(gig.tags).concat(gig.langs);
        gig_labels = gig_labels.map((label: string) => label.toLowerCase());
        return labels.every((label: string) => gig_labels.indexOf(label) != -1);
    }

    private isFreeTextInGig(gig: any, free_text: string[]) {
        let search_str: string = gig.description.toLowerCase() + gig.title.toLowerCase()
        return free_text.every((text => search_str.indexOf(text) != -1))
    }

    public getGigs(query: any) {
        return new Promise((resolve, reject) => { 
            this.guildUsers.getAllUsers()
            .then(users => {
                resolve(this.filterGigs(query, users))
            })           
            
        })

    }
    private filterGigs(query: any, users: IUser[]) {
        let result = this.gigs_data;
        let labels: Array<string> = []
        if (query.user_name) {
            let query_users = this.convert2GitlabUserIds(query.user_name, users);
            result = result.filter((gig: any) => this.areUsersActiveInGig(gig, query_users));
        }
        if (query.tag_name)
            labels = labels.concat(query.tag_name)

        if (query.lang_name)
            labels = labels.concat(query.lang_name)
        if (labels.length > 0)
            result = result.filter((gig: any) => this.isGigLabeled(gig, labels));
        if (query.search)
            result = result.filter((gig: any) => this.isFreeTextInGig(gig, query.search.split(' ')));
        return result;
    }

   

    public getProjectIssues(project_id: number) {
        return this.gitlabAgent.getProjectIssues$(project_id)
    }

    public updateUserAssignment(project_id: number, issue_id: number, gitlab_user_id: number, assign : boolean = true)
    {
        return new Promise<any>((resolve, reject) => {
            let gig = this.gigs_data.find(gig=> gig.project_id == project_id && gig.id == issue_id)

            if (gig)
            {                      
                let assignees : number[]= gig.assignees.map((assignee : any) => assignee.id)
                if (assign && assignees.indexOf(gitlab_user_id) == -1) {
                    assignees.push(gitlab_user_id)
                }
                if (!assign && assignees.indexOf(gitlab_user_id) != -1){
                    assignees = assignees.filter(assignee_id => assignee_id != gitlab_user_id)
                }

                if (assignees.length != gig.assignees.length)
                {
                    this.gitlabAgent.updateIssue
                    (project_id,
                    gig.iid,
                    (assignees.length > 0? assignees : 0),
                    gig.weight? gig.weight : 0,
                    this.labelArray2String(gig.labels)).                   
                    then(updated_issue => { 
                        if (updated_issue.assignees.length == assignees.length) {                                                
                            gig.assignees = updated_issue.assignees.slice()
                        }
                       resolve(gig)          
                    }).catch(err => reject(err))
                }
                else
                {
                    resolve(gig)
                }                                  
            }
            else
            {
                reject('No such gig')
            }
        })
    }

    public updateGig(project_id: number, issue_id: number, level: number, hours: number)
    {
        return new Promise((resolve, reject) => {
        
            this.findGig(project_id, issue_id)
            .then((gig : IGigModel) =>
            {
                let gig_index = this.findGigIndex(project_id, issue_id) 
            //let gig_issue = this.issues.find(issue=> issue.title == project_id+'+'+issue_id)
                if  (level != gig.level || hours != gig.time_estimate) {
                   
                                      
                    gig.level = level;
                    gig.time_estimate = hours;
                    gig.save()
                    .then((new_gig :IGigModel) => 
                    {
                        if (gig_index != -1)
                        {
                            this.gigs_data[gig_index].level = level
                            this.gigs_data[gig_index].time_estimate = hours
                        }
                        resolve(this.gigs_data[gig_index])
                    })
                    .catch(err=> {logger.error(err); reject(err)})
            
                }    
                else {
                    resolve(this.gigs_data[gig_index])
                }    
                                                                       
            })
            .catch(err=> {logger.error(err); reject(err)})
        })
       
    }
   

    private findGig(project_id: number, issue_id: number) {
        return model.gig.findOne({ project_id: project_id, issue_id: issue_id }).exec();
    }

    private findGigIndex(project_id: number, issue_id: number)
    {
        return this.gigs_data.findIndex((gig : any) => gig.project_id == project_id && gig.iid == issue_id)
    }
      public addGig(project_id: number, issue_id: number, publisher_gitlab_user_id: number, hours: number, level: number = 0) {
        return new Promise((resolve, reject) => {

            // get gig labels : languages and tags
            this.getProject(project_id).then(proj => {
                //let tags = proj.tag_list
                //let langs = this.getLangsfromProjectsList([proj])
                //let labels = langs.concat(tags)
                
                this.findGig(project_id, issue_id).then((gig) =>
                {
                    if (gig) {
                        reject('Gig already exists')
                    }
                    else {
                        let new_gig = new model.gig()
                        new_gig.project_id = project_id
                        new_gig.issue_id = issue_id
                        new_gig.publisher = publisher_gitlab_user_id
                        new_gig.level = level
                        new_gig.time_estimate = hours
                        new_gig.save().then(saved_gig =>
                         {                             
                             resolve(this.pushGigData(saved_gig, [proj]))
                         })     
                    }
                })
                .catch((err)=>
                {
                    logger.error(err)
                    reject(err)
                })               
               
            }).catch((err=> 
                {
                    logger.error(err)
                    reject("Project doesn't exist")
                }))
    
            })

           
    }

    // public removeGig(issue_id: number) {
    //     return this.gitlabAgent.deleteIssue(this.discoverability_project_id, issue_id)
    // }
    
    
    getGigsPublishers()
    {
        let publishers =[]
        for (let gig of this.gigs_data)
        {
            if (publishers.indexOf(gig.publisher) == -1)
                publishers.push(gig.publisher)
        }
        return publishers
    }

    
}
