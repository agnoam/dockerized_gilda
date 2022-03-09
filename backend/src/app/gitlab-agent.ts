import { Subject } from 'rxjs/Subject';
import rp = require('request-promise');
//import {Cache} from './cache';
//import {BehaviouSubject} from 'rxjs/BehaviorSubject'
import { Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import * as fs from 'fs';
import * as ip from 'ip';
import { getLogger } from 'log4js';
import { String } from 'aws-sdk/clients/rds';
//import { projectSchema } from './schemas/project';


 const logger = getLogger();
//import * as download from 'download';



export class GitLabAgent {


    private apiUrl : string
    private private_token :string

    private allUsersGroupId : number
    private newUser$ : Subject<number>
    private projectsUpdate$ : Subject<Array<any>>
    //private newMergeRequest$ : Subject<any>

    
    private newProject$ : Subject<number>
    private static instance : GitLabAgent
        
    private constructor() 
    {
        require('dotenv').config()        
        this.apiUrl  = process.env.GITLAB_API_URL;
        this.private_token = 'private_token=' + process.env.GITLAB_PRIVATE_TOKEN  
            
        this.newUser$ = new Subject<number>()
        this.projectsUpdate$ = new Subject<Array<any>>()
        //this.newMergeRequest$ = new Subject<any>()

        // let cache = new Cache()
        // cache.getCache('projects').
        // then((projects: Array<any>) =>
        // {
        //     if (projects && projects.length >0)
        //         this.projectsUpdate$.next(projects)
        // }).catch(err=> {console.log(err)})

        this.newProject$ = new Subject<number>()      
        
                
        this.getProjectsWithExtraData()
        setInterval(() => this.getProjectsWithExtraData(), 3600000);
        
    }

    init()
    {
        this.addSystemHooks()
        this.allowInnerSourceing()
    }

    
    getSignedInUser(access_token : string)
    {
       
        let options = { method: 'GET',
        url: this.apiUrl+'/user',
        headers: 
        { 
        'cache-control': 'no-cache',
        authorization: 'Bearer ' + access_token,
        'content-type': 'application/json' },

        json: true };


        //let token = access_token.split('&')[0]
        return rp.get(options)//+'&'+this.private_token,
    }
    getNewProject$()
    {
        return this.newProject$
    }
    getNewUsers$()
    {
        return this.newUser$
    }

    getProjectIssues$(project_id : number, state : string =undefined)
    {
        return this.getListFromGitLabServer$(this.apiUrl+'/projects/'+project_id+'/issues',  (state? 'state='+state : '') )
    }

    getIssueNotes$(project_id : number, issue_iid : number)
    {
        return this.getListFromGitLabServer$(this.apiUrl+'/projects/'+project_id+'/issues/'+issue_iid + '/notes', '')
    }
    getProjectCommunityFromIssues$(project_id : number, issues : any[], completed : Subject<Array <any>> = new Subject<Array<any>>(), community : Array<number> =[] )
    {
       if (issues.length >0)
       {
            let issue = issues.pop()
            if (community.indexOf(issue.author.id) == -1)
            {
                community.push(issue.author.id)
            }
            this.getIssueNotes$(project_id, issue.iid)
            .subscribe(notes=>
            {
                for (let note of notes)
                {
                    if (community.indexOf(note.author.id) == -1)
                    {
                        community.push(note.author.id)
                    }
                }
                this.getProjectCommunityFromIssues$(project_id, issues, completed, community)
            })
            
        }
        else
        {
            completed.next(community)
            completed.complete()
        }
        return completed
    }

    getProjectIssue$(project_id : number, issue_iid: number)
    {
        return rp.get(
            this.apiUrl+'/projects/'+project_id+'/issues/'+ issue_iid,
            { json : true    })
    }

    setIssueDuration(project_id : number, issue_id : number, hours : number)
    {
        return rp.post(
            this.apiUrl+
            '/projects/'+
            project_id +
            '/issues/' +
            issue_id +
            '/time_estimate?duration=' +
            hours +
            'h&' +
            this.private_token,
            { json : true    })
    }

    updateIssue(project_id: number, issue_id: number, assignee_id : number | number[], weight : number= 0, labels : string ='', )
    {
        let options = { method: 'PUT',
            url:  this.apiUrl + '/projects/'+project_id+'/issues/' + issue_id +'?'+this.private_token,       
            headers: 
            { 
              'cache-control': 'no-cache',
              'content-type': 'multipart/form-data' },
            json : true,                     
            formData: 
            {                 
                weight : weight,
                'assignee_ids[]': assignee_id,
                labels: labels,                
            }
        }
        return rp.put(options)               
        
    }
    addIssue(project_id: number, title : string,  confidential: boolean = false, description : string ='', weight : number= 0, labels : string ='')
    {  
        // let request = require("request");

        // let options = { method: 'POST',
        //  url: this.apiUrl + '/projects/'+project_id+'/issues/',
        // qs: { private_token: process.env.GITLAB_PRIVATE_TOKEN },
        // headers: 
        // {
        //     'cache-control': 'no-cache',
        //     'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
        // formData: 
        // { title: title,
        //     description: '',
        //     'assignee_ids[]':asignee,
        //     labels: labels,
        //     confidential: confidential.toString() } };

        // request(options, function (error : any, response :any, body:any) {
        // if (error) throw new Error(error);
        // console.log(response)
        // console.log(body);
        // });
        let options = { method: 'POST',
            url:  this.apiUrl + '/projects/'+project_id+'/issues/',       
            headers: 
            { 
              'cache-control': 'no-cache',
              'content-type': 'multipart/form-data;' },
            json : true,          
            qs: 
            { 
                private_token: process.env.GITLAB_PRIVATE_TOKEN,
            },
            formData: 
            { 
                title: title,
                description: description,
                weight : weight,
                //'assignee_ids[]': '8',
                labels: labels,
                confidential: confidential.toString()
            }
        }
        return rp(options)               
        
    }

    getAllIssues$()
    {
        return this.getListFromGitLabServer$(this.apiUrl+'/issues/', 'scope=all')
    }
    getProjectsUpdate$()
    {
        return this.projectsUpdate$
    }

    // getNewMergeRequests$()
    // {
    //     return this.newMergeRequest$
    // }

    handleNewProject(project_id : number)
    {
        this.getProject(project_id).then((project: any)=> this.addGroup2ProjectDevelopers(project, this.allUsersGroupId))        
        this.newProject$.next(project_id)
    }

   
    // handleNewMergeRequest(mergeReq : any)
    // {
    //     logger.info(mergeReq)
    //     let mergeReqData = {username : mergeReq.user.username, req_id: mergeReq.object_attributes.id}
    //     this.newMergeRequest$.next(mergeReqData)
    // }

    handleNewUser(user_id : number)
    {    
        this.setUserAvater(user_id)
        this.verifyAllUsersGroupExist()
        .then((group_id : number) => this.addUser2Group(user_id, group_id))              
        this.newUser$.next(user_id)
    }
    private addUser2Group(user_id : number, group_id : number)
    {
        rp.post(this.apiUrl+'/groups/'+group_id+'/members?user_id='+user_id+'&access_level=30&'+this.private_token)
        .then(()=>{}, err=>{})
    }

    private verifyAllUsersinAllUsersGroup(group_id :number)
    {
        this.getUsers$()
        .subscribe((users : Array<any>) => 
        {
        this.getListFromGitLabServer$(this.apiUrl+'/groups/'+ group_id+'/members', '')
        .subscribe((gorupUsers : Array<any>) => 
        {
            //let gorupUsers : Array<any> = JSON.parse(res)
            users.forEach((user : any)=> 
            {
                if (gorupUsers.findIndex((x : any) => x.id == user.id) == -1)
                 this.addUser2Group(user.id, group_id)
            }, this) 
        })})               
    }

    private verifyAllUsersGroupExist()
    {
        return new Promise((resolve, reject) =>
        {
            rp.get(this.apiUrl+'/groups?search=AllUsers&'+ this.private_token)
            .then((res : string) => 
            {
                let groups : Array<any> = JSON.parse(res) 
                if (groups.length == 0) this.createAllUsersGroup()
                .then((res : string) => 
                {
                    let group = JSON.parse(res)
                    resolve(group.id)
                })
                else resolve(groups[0].id)
            }, err=>{}).catch(() =>{})
        })
    }
    private allowInnerSourceing()
    {
        this.verifyAllUsersGroupExist()
        .then((group_id : number) => 
        {             
            this.allUsersGroupId = group_id      
            this.verifyAllUsersinAllUsersGroup(group_id)
            this.addAllUsersAsDevelopersofAllProjects(group_id)           
        })                        
    }

    private  getRandomColor() 
    {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    public createLabel(label :string, description: string, project_id: number, color : string = this.getRandomColor())
    {
      
        let options = { method: 'POST',
        url:  this.apiUrl + '/projects/'+project_id+'/labels/',             
        qs: 
        { 
            private_token: process.env.GITLAB_PRIVATE_TOKEN,
        },
        formData: 
        { 
            name: label,
            description: description,
            priority: '0',
            color: color } 
        }
        return rp(options)
    }

    deleteLabel(project_id : number, label : any)
    {
        
        let options = { method: 'DELETE',
        url:  this.apiUrl + '/projects/'+project_id+'/labels/',             
        qs: 
        { 
            private_token: process.env.GITLAB_PRIVATE_TOKEN,
        },
        formData: 
        { 
            name: label.name,
            id: label.id}           
        }
        return rp(options)
    }

    deleteIssue(project_id : number, issue : any)
    {
        
        let options = {
             method: 'DELETE',
            url:  this.apiUrl + '/projects/'+project_id+'/issues/'+issue.iid,             
            qs: 
            { 
                private_token: process.env.GITLAB_PRIVATE_TOKEN,
            }
        }
     
        return rp(options)
    }
    private addAllUsersAsDevelopersofAllProjects(group_id : number)
    {
        this.getProjects$()
       .subscribe((projects : Array<any>) => projects.forEach((project) => this.addGroup2ProjectDevelopers(project, group_id) , this))
    }
    private addGroup2ProjectDevelopers(project : any, group_id : number)
    {
        let shared_groups : Array<any> = project.shared_with_groups
        if (shared_groups.findIndex(x=> x.group_id == group_id) == -1)
        {
            if (project.visibility == 'public')
            {
                rp.post(this.apiUrl+'/projects/'+ project.id +  '/share/?group_id='+ group_id +'&group_access=30&'+ this.private_token)
                .then(() => {}, (err) => 
                logger.error(err.message + ' ' + project.id + ' ' + project.name) )
            }
        }
        else
        {
            // Remove All Users from private projects
            if (project.visibility != 'public')
            {
                rp.delete(this.apiUrl+'/projects/'+ project.id +  '/share/'+ group_id +'?'+ this.private_token)
                .then(() => {}, (err) => 
                logger.error(err.message + ' ' + project.id + ' ' + project.name) )
            }
        }
    }
    private createAllUsersGroup()
    {
        return rp.post(this.apiUrl+'/groups/'+'?name=AllUsers&path=AllUsers&'+ this.private_token)        
    }
    private addSystemHooks()
    {
        let hookUrl : String = 'http://' + ip.address()+ ':' + process.env.PORT + '/systemeventslistener'       

        rp.get(this.apiUrl+'/hooks?'+ this.private_token)
        .then((hooks: string) => 
        {            
            let myHooks = JSON.parse(hooks).filter((hook : any) => hook.url == hookUrl );
            if (myHooks.length == 0)
            {
                let options = { method: 'POST',
                url:  this.apiUrl + '/hooks',             
                qs: 
                { 
                    private_token: process.env.GITLAB_PRIVATE_TOKEN,
                    url : hookUrl
                },
                }
                //if (process.env.PORT && process.env.IP)
                rp(options)
                .then((res :any) => logger.info(res), err=>{ logger.error(err) });
            }
        }).catch(() =>{})
    }    
    
    setUserAvater(user_id : number)
    {

        let filename = 'head-from-gitlab-logo-small-min.png'
        
        
       //download('http://babylonsrv/pictures/10024961.jpg', '.').then(() => {
         
       
        let options = { method: 'PUT',
        url: this.apiUrl + '/users/' + user_id,
        qs: { private_token: process.env.GITLAB_PRIVATE_TOKEN },
        formData: 
            { avatar: 
            { value: fs.createReadStream(filename),
                options: 
                { filename: filename} 
                } } };
        
        return rp(options)
        //});
    }                    
         
    getProjectMattermostService(project_id : number)
    {         
        return rp.get(
            {
                uri:  this.apiUrl +'/projects/' + project_id + '/services/mattermost' + '?'+this.private_token,
                headers: {'User-Agent' : 'Request-Promise'},
                json : true              
            }
        )
    }
    
    getUsers$()
    {
        return this.getListFromGitLabServer$(this.apiUrl + '/users/', '')            
    }
    
    getProjects$()
    {
        return this.getListFromGitLabServer$(this.apiUrl +'/projects','statistics=true')
    }

    private getGroupMembers(group : any)
    {
        return new Promise((resolve, reject) =>
        {
            this.getListFromGitLabServer$(this.apiUrl+'/groups/' +group.id +'/members', '')                
            .subscribe((users:any[])=> {
                users.forEach((user: any)=> group.users.push(user.id), this) 
                resolve(group)
            }, err=>{logger.error(err + group.name)})
        })
    }

    private getGroupProjects(group : any)
    {
        return new Promise((resolve, reject) =>
        {
            rp.get({
                uri:  this.apiUrl+'/groups/'+ group.id +'?'+this.private_token,
                headers: {'User-Agent' : 'Request-Promise'},
                json : true              
            })
            .then((groupData:any)=> {
                groupData.projects.forEach((project:any) => group.projects.push(project.id), this)
                resolve(group)
            }, err=>{logger.error(err + group.name)})
        })
    }
    private getGroupData(group : any)
    {        
        group.users = []
        group.projects = []        
        return new Promise((resolve, reject) => 
        {
            this.getGroupMembers(group)
            .then((groupWithMembers)=> this.getGroupProjects(groupWithMembers)
            .then(groupWithProjects=> resolve(groupWithProjects)))
        })                                        
    
    }
    private getGroupsData(groups : Array<any>, completed : Subject<Array <any>>, groupsData : Array<any> =[])
    {        
        if (groups.length > 0)
        {
            this.getGroupData(groups.pop()).then(groupData => 
            {
                groupsData.push(groupData)
                this.getGroupsData(groups, completed, groupsData)
            })
        }
        else
        {
            completed.next(groupsData)
        }   
    }

    private getGroupsMembersAndProjects$()
    {
 
        let groups$ : Subject<any[]> = new Subject()
        
        this.getListFromGitLabServer$(this.apiUrl+'/groups', '')
        .subscribe((groups:any[])=>
        {
            this.getGroupsData(groups, groups$)                                  
        })          
        return groups$
    }

   
    private getProjectsWithExtraData()
    {
                 
            this.getGroupsMembersAndProjects$()
            .subscribe((groups:any[])=>
            this.getListFromGitLabServer$(this.apiUrl +'/projects', 'statistics=true')
            .subscribe((projects : Array<any>) => this.setProjectsDataSync$(projects, groups)
            .subscribe((projects) => { 
                // let cache= new Cache()
                // cache.saveCache('projects', projects)
                // .then((data : Array<any>) =>
                // {
                //     console.log(data.length)
             
                    this.projectsUpdate$.next(projects)                     
                // })         
            })
                     
                
            ))
               
    }

    // getProjectContributors$getProjectContributors$(project_id : number)
    // {        
    //     return this.getListFromGitLabServer$(this.apiUrl+'/projects/'+project_id+'/repository/contributors')               
    // }

    getUser$(user_id : number)
    {
        return Observable.fromPromise
        (rp.get( this.apiUrl+'/users/'+user_id+'/?'+this.private_token))
    }

    getUserMergeRequests$(user_id : number)
    {
        return this.getListFromGitLabServer$(this.apiUrl+'/merge_requests/' , 'scope=all&author_id='+user_id )
        // return Observable.fromPromise
        // (rp.get( this.apiUrl+'/merge_requests/?author_id='+user_id+'&'+this.private_token ));
    }

    getProjectFromGitLabServer(project_id : number, token : string = this.private_token)
    {     
        let options = 
        {
            uri:  this.apiUrl +'/projects/' + project_id + '?'+ token,
            headers: {'User-Agent' : 'Request-Promise'},
            json : true              
        };
        
        return new Promise((resolve, reject) =>
        {
            rp.get(options).then(res=> 
            {            
                this.getGroupsMembersAndProjects$().subscribe((groups:any[])=>
                this.setProjectExtraData(res, groups).then((res)=> resolve(res)))           
            } , err=>{logger.error('GET PROJECT ERROR ' + err); reject()})
        })
                          
    }    

    getProject(project_id : number)
    {        
        return (this.getProjectFromGitLabServer(project_id))
    }
        

    private getListFromGitLabServer$(url :string, params : string, token:string = process.env.GITLAB_PRIVATE_TOKEN ,page_number = 1, result: Array<any> = [], listReady = new Subject<Array<any>>())
    {
        let num_in_page = 100;                
        let options = 
        {
            uri:  url + '?'+ 'private_token='+token +'&page='+page_number+'&per_page='+num_in_page + '&' + (params? params : ''),
            headers: {'User-Agent' : 'Request-Promise'},
            json : true              
        }
        rp.get(options).then((res : Array<any>)=> 
        {
            result = result.concat(res)                    
            if (res.length == num_in_page) 
            {                       
                this.getListFromGitLabServer$(url, params, token, page_number+1, result, listReady) 
            }
            else
            {
                listReady.next(result)
                listReady.complete()                    
            }                                     
        }).catch((err) => 
            {
                listReady.next(result)
                listReady.complete()
            })
        return listReady
                
    }
   
    private setProjectExtraData(project: any, groups : Array<any>)
    {                
        project.files=new Array<string>();
        project.contributors = new Array<any>();
        //project.merge_requests= new Array<any>();
        project.owners = new Array<string>()
        project.languages = {};
        project.community = new Array<number>()
        project.clones = new Array<any>()
        project.potential_developers = new Array<number>()

        let projectGroup = groups.filter((group:any)=> group.projects.findIndex((x:number)=> x== project.id) != -1)
       
        projectGroup.forEach((group:any)=> project.owners= group.users.slice(), this)
        
        return this.getProjectExtraData(project)        
    }

    private setProjectsDataSync$(projects : Array<any>, groups : Array<any>, result : Array<any>=[], complete : Subject<Array<any>> = new Subject<Array<any>>())
    {        
        if (projects.length > 0)        
        {
           
            let project = projects.pop()
            console.log(projects.length+' ' + project.name)
            this.setProjectExtraData(project, groups)
            .then((res)=> 
            {
                this.setProjectsDataSync$(projects, groups, result, complete)
                result.push(res)
            })
        }
        else
        {
            complete.next(result)
        }
        return complete        
    }
    // private setProjectsExtraData$(projects : Array<any>)
    // {    
        // return new Promise((resolve, reject) => 
        // {    
            //let projectsIdList : Array<string> = Array.from(this.projects, x => x.id)   
            //let promises : Array<PromiseLike<void>> = []                                    
        //return this.setProjectsDataSync$(projects)
           
            //projects.forEach((project) => promises = promises.concat(this.setProjectExtraData(project)))                           
            // Promise.all(promises)
            // .then(()=>
            // {
            //     resolve(projects)
            // })
            // .catch(() => 
            // {
            //     resolve(projects)
            // })
        //})
        
   // }

    private getProjectMembers(project :any)
    {
        return new Promise ((resolve, reject) =>
        {            

            if (project.creator_id && project.owners.indexOf(project.creator_id) == -1) project.owners.push(project.creator_id)           
            if (project.owner && project.owners.indexOf(project.owner.id) == -1) project.owners.push(project.owner.id)
            
            this.getListFromGitLabServer$(this.apiUrl+'/projects/'+project.id+'/members','')            
            .subscribe((members) => 
            {
                members.forEach((member : any) => 
                {
                    if (project.owners.findIndex((x: number) => x == member.id) == -1) project.owners.push(member.id)
                }, this)
                // if (project.namespace.kind == "group")
                // {
                //     this.getListFromGitLabServer$(this.apiUrl+'/groups/'+project.namespace.id+'/members')
                //     .subscribe((members) => 
                //     {
                //         members.forEach((member : any) => 
                //         {
                //             if (project.owners.findIndex((x: number) => x == member.id) == -1) project.owners.push(member.id)
                //         }, this)
                //         resolve(project)
                //     })
                // }
                // else
                // {
                    resolve(project)
                //}
            })
        })
    }

    // private addFile2ProjectFilesList(project : any, fileName: string)
    // {
    //     return new Promise((resolve, reject) =>
    //     {
    //         this.getRepositoryContainsFile(project.id,fileName)
    //         .then((fileData)=> 
    //         {
    //             //console.log('before '+ project.files.length)                    
    //             project.files.push(fileData)
    //             //console.log('after '+ project.files.length)         
    //         },
    //         err=>{
    //             if (!err.statusCode || (err.statusCode && err.statusCode != 404)) logger.error(err + ' ' + project + ' ' + fileName)
    //         })
    //         .catch(()=> {})
    //         .finally(() => resolve())     
    //     })          
    // }

    findProjectbyName(name : string)
    {
        return rp.get(this.apiUrl+ '/search?scope=projects&search='+name)   
    }

    getProjectLabels$(id : number)
    {
        return this.getListFromGitLabServer$(this.apiUrl +'/projects/' + id+'/labels','')        
    }
    public getProjectContributors(project: any)
    {
        return new Promise((resolve, reject) =>
        {
            this.getListFromGitLabServer$(this.apiUrl+'/projects/'+project.id+'/repository/contributors','')
            .subscribe((contributors : Array<any>)=> 
            {
                project.contributors = contributors.slice()
                 resolve(project)
            },
            err=>{
                reject()
            })
            
        })     
    }

    private getProjectLanguage(project : any)
    {
        return new Promise<any>((resolve, reject)=>
        {
            rp.get(this.apiUrl+'/projects/'+ project.id +'/languages' +'?'+this.private_token)
            .then(languages => 
            {
                project.languages = JSON.parse(languages)
                resolve(project)
            })
            .catch(err=> resolve (project))
        })
    }
    
    private getProjectDownloadStatistics(project : any)
    {
        let options = 
        {
            uri:  this.apiUrl+'/projects/'+ project.id +'/statistics' +'?'+this.private_token,
            headers: {'User-Agent' : 'Request-Promise'},
            json : true              
        } 
        return rp.get(options)
    }
    // TODO : change project_id to number?
    private getProjectExtraData(project : any)
    {                                                     
        return new Promise((resolve, reject) => 
        {     
            this.getProjectLanguage(project)
            .then(project=> this.getProjectDownloadStatistics(project)
            .then(clones=>
            {  
                project.clones = clones.fetches.days
                this.getProjectMembers(project).then((project : any) =>
                {                    
                    project.community = project.owners.concat(project.contributors)
                      this.getProjectIssues$(project.id)
                        .subscribe(issues => 
                        {
                            if (issues.length > 0)
                            this.getProjectCommunityFromIssues$(project.id, issues)
                            .subscribe(community => 
                            {
                                //project.community = [...new Set([...community,...project.community])]
                                resolve(project)    
                            })
                            else
                            {
                                resolve(project)
                            }
                        })                                                        
                    }, error =>{resolve(project)})              
                    
                //})) 
            }).catch(()=>{})
            )
        })
    }
        

    // private getProjectMergeRequests$(project_id : string)
    // {
    //     return this.getListFromGitLabServer$(this.apiUrl+'/projects/'+project_id+'/merge_requests')        
        
    // }
    public getRepositoryContainsFile(project_id: number, filename : string)
    {   
        let options = 
        {
            uri:  this.apiUrl+'/projects/'+project_id+'/repository/files/' + filename + '/raw?ref=master&'+this.private_token,
            headers: {'User-Agent' : 'Request-Promise'},
            json : true              
        }            
        return rp.get(options) 
            
    }
     
    starProject(project_id : number, gitlab_user_id : number, star: boolean)
    {        
        return new Promise<any>((resolve, reject) =>
        {
            this.getImpersonationToken(gitlab_user_id)
            .then(token => 
            {
                rp.post(
                {
                    uri: this.apiUrl+
                    '/projects/'+
                    project_id +                       
                    '/' + (star? 'star': 'unstar') +
                    '?private_token=' +
                    token.token,
                    headers: {'User-Agent' : 'Request-Promise'},
                    json : true   
                }).then (res=> resolve(res)).catch(err=> reject(err))
            }).catch (err=> reject(err))
        })
    }

   
    private getImpersonationToken(gitlab_user_id : number)
    {
        return new Promise<any> ((resolve, reject) => {

            
            this.getListFromGitLabServer$(this.apiUrl+ '/user/' + gitlab_user_id+'/impersonation_tokens','').
            subscribe(tokens => 
            {
                let gilda_token = tokens.find(token => token.name == 'gilda_token')
                if (gilda_token)
                {
                    resolve(gilda_token)
                }
                else
                {
                    rp.post(
                        {
                            uri:
                            this.apiUrl+
                            '/users/'+
                            gitlab_user_id +
                            '/impersonation_tokens?scopes[]=api&name=gilda_token' +           
                            '&' +
                            this.private_token,
                            headers: {'User-Agent' : 'Request-Promise'},
                            json : true   
                    }).then(new_token =>resolve(new_token)).catch(err=> reject())
                }
            })
            
        })
    }

    getStarredProjects(gitlab_user_id: number)
    {
        return new Promise<any[]>((resolve, reject)=>
        {
            this.getImpersonationToken(gitlab_user_id)
            .then(token => this.getListFromGitLabServer$(this.apiUrl+'/projects','starred=true', token.token )
            .subscribe(projects => resolve(projects))).catch(err => resolve([]))
        })
        

    }

    // private revokeImpersonationToken(gitlab_user_id : number, token_id : number)
    // {
    //     return rp.delete(
    //         this.apiUrl+
    //         '/users/'+
    //         gitlab_user_id +
    //         '/impersonation_tokens/' +
    //         token_id +           
    //         '?' +
    //         this.private_token)
    // }
    static getGitLabAgent()
    {
        if (!GitLabAgent.instance) GitLabAgent.instance = new GitLabAgent()
        return GitLabAgent.instance
    }
}
