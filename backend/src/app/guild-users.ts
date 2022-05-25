import { IChallengeModel } from './models/challenge';
import { IUser } from './interfaces/IUser';
import { GitLabAgent } from './gitlab-agent';
import { IUserModel } from './models/user';
import { model } from './db';
import { Subject} from 'rxjs/Subject';
import { getLogger } from 'log4js';
import { MailSender } from './mail';
import {MatterMostAgent} from './mattermost-agent';

const logger = getLogger();

export class GuildUsers {
    gitlabAgent : GitLabAgent = GitLabAgent.getGitLabAgent()
    mattermostAgent : MatterMostAgent = MatterMostAgent.getMatterMostAgent()
    private static instance : GuildUsers
    projects : Array<any> = [];
    //private projects : Array<any> = []  
    
    private constructor() {      
        
        // Subscriptions
        this.gitlabAgent.getNewUsers$()
        .subscribe((user_id : number) => this.createUserfromGitLabID(user_id))
        //.then((user : IUserModel) => this.ScoreUser(user)))  
        // this.gitlabAgent.getNewMergeRequests$()
        // .subscribe((mergeReqData : any) => this.addMergeRequestsToUser(mergeReqData.username, mergeReqData.req_id)
        //.then((user : IUserModel)=> this.ScoreUser(user)))
                         
        this.gitlabAgent.getProjectsUpdate$().subscribe((projs : Array<any>) =>  
        {
            this.projects = projs
            this.updateGuildUsers()
        })
        this.gitlabAgent.getNewProject$().subscribe((project_id) => this.handleNewProject(project_id))

        
        // Create initail data
        this.createGuildUsers()
        
        //this.setUsersAvatars()
    }

    static getGuildUsers()
    {
        if (!GuildUsers.instance) GuildUsers.instance = new GuildUsers()
        return GuildUsers.instance
    }
    scoreUserAvatar(user: any)
    {
        let score = (user.avatar_url != null && 
            !user.avatar_url.endsWith('head-from-gitlab-logo-small-min.png')? 50: 0)
        user.score_detail.push(score + ' Gitlab avatar')
        return score;
    }

    setUsersAvatars()
    {
        this.gitlabAgent.getUsers$().subscribe((res: any)=> this.setUsersAvatar(res));        
    }


    createGuildUsers()
    {
        this.gitlabAgent.getUsers$().subscribe((res: any)=> this.createUsersFromGitlabUsers(res));
    }

    updateGuildUsers()
    {
        this.mattermostAgent.getUsers()
        .then((users : Array<any>) => this.updateUsersFromMatterMostUsers(users)
        .then(() => this.updateUsersFromGitLab(), err=> this.updateUsersFromGitLab()))
        
    }

    private updateUsersFromGitLab()
    {
        this.gitlabAgent.getUsers$()
        .subscribe((res: any)=> this.updateUsersFromGitlabUsers(res))
    }
    // private scoreMostSartedProject()
    // {
    //     return new Promise<Array<any>> ((resolve, reject) =>
    //     {
    //         this.gitlabAgent.getProjectsWithExtraData().then((projects : Array<any>) =>
    //         { 
    //             let maxStars = Math.max.apply(Math, projects.map((o : any) => o.star_count))        
    //             let mostStaredProjects = projects.filter((o : any) => o.star_count === maxStars);
    //             if (mostStaredProjects.length > 0) this.gitlabAgent.getProjectContributors$(mostStaredProjects[0].id)
    //             .subscribe((res : Array<any>) => resolve(res));
    //         })
    //     })
    // }
    ScoreUsers(projects : Array<any> = [])
    {   
        
       
        // let mostStaredProjectContributors : Array<any> = []
        // this.scoreMostSartedProject()
        // .then((contributors) =>
        // {
            // TODO :Score for most stared?
            // mostStaredProjectContributors= contributors
            // console.log(mostStaredProjectContributors)

            // Score all users
            model.user.find((err: any, res: IUserModel[]) => 
            {
                let promises: Array<Promise<IUserModel>> = []
                res.forEach(user => promises.push(this.ScoreUser(user, projects)), this)
                Promise.all(promises).then(()=> logger.info('ScoreUsers done'))
            })
        // })
    }

    getChallenge(the_id : string)
    {
        let query = model.challenge.findOne( {_id : the_id}) 
        return query.exec();                       
    }


    private scoreGitLabMembership(user : IUser)
    {
        let score = user.badges.gitlab_user? 30 : 0
        user.score_detail.push(score + ' Gitlab user ')
        return (score)         
    }
    private scorePullRequests(user : IUser)
    {
        let score =  user.badges.pull_requests.length
        user.score_detail.push(score + ' Pull requests')
        return score
    }
    private scoreRepositoryFiles (project : any)
    {
        let score = 0
        if (project.readme_url != null) score += 15                   

        return score  
    }


    private getProjectData(project_id : number, projects : Array<any>)
    {
        return new Promise<any>((resolve, reject)=>
        {
            let project_index = projects.findIndex((x) => x.id == project_id)
            if (project_index != -1)
            {
                resolve (projects[project_index])
            }
            else
            {
                this.gitlabAgent.getProject(project_id).then((project :any) =>
                {
                    projects.push(project)
                    resolve(project)
                }).catch((err)=> {logger.error(err + 'project id:' + project_id); reject()})
            }
        })        
    }

    private removeDeletedProjectsFromUser(user : IUserModel, deletedProjects: Array<number>)
    {
        deletedProjects.forEach(project_id=>  
            {
                user.badges.projects.splice(user.badges.projects.indexOf(project_id), 1)
                user.badges.projects_shared.splice(user.badges.projects_shared.indexOf(project_id), 1)
                user.contributed_projects.splice(user.contributed_projects.indexOf(project_id), 1)
            }
            ,this )
    }
    private scoreGitLabProjects(user : IUserModel, projects : Array<any>)
    {                
        return new Promise<number>((resolve, reject)=>
        {            
            let projects_score = 0
            let promises : Array<Promise<void>> = []    
            let deletedProjects : Array<number> =[]       
            let score_detail : Array<string> = []
            let score = 0          

            if (user.badges.projects.length > 0) 
            {
                score_detail.push('    Projects (up to a maximum of 445 points):')  
                score_detail.push('    55 1st project bonus')
                projects_score += 55           
            }
            user.badges.projects.forEach((project_id, index) => 
            {               
                promises.push(this.getProjectData(project_id, projects).then((project :any) =>                     
                {
                    if (project)
                    {
                        // Remove project if user is no longer the owner
                        if (project.owners.indexOf(user.gitlab_user_id) == -1)
                        {
                            user.badges.projects.splice(user.badges.projects.indexOf(project_id), 1)
                        }
                        projects_score += 20 
                        let filesScore = this.scoreRepositoryFiles(project)                             
                        score_detail.push('    ' + (20+ filesScore) + ' ' +project.name )                        
                        projects_score +=  filesScore                     
                    }        
                           
                }).catch(()=> 
                {                    
                    deletedProjects.push(project_id)
                }))
                                                 
            }, this)           
            
            Promise.all(promises).then(() => 
            {
                // Remove deleted projects
                this.removeDeletedProjectsFromUser(user,deletedProjects)
                projects_score = projects_score < 445? projects_score : 445                
                        
                user.score_detail = user.score_detail.concat(score_detail)
                user.score_detail.push (projects_score + ' Projects TOTAL')       
                score += projects_score
                score += this.scoreSahredProjects(user, projects)  
                score += this.scoreContributedProjects(user, projects)                                 
                resolve (score)
            })
        })                
    }
    private scoreContributedProjects(user : IUserModel, projects : Array<any>)
    {
        let contributed_porjects_score = 0
        if (user.contributed_projects.length > 0)
        {
            user.score_detail.push('    Contributed projects:')            
        }

        user.contributed_projects.forEach( project_id=>
        {
            let contributions = user.badges.contributed_pull_requests.filter(x=> x.project_id == project_id).length                            
            // first contribution is 100, the rest are 30 each
            if (contributions > 0) 
            {
                let project_contribution_score = (contributions*30) + 70
                contributed_porjects_score += project_contribution_score
                let project_index = projects.findIndex((x:any)=> x.id == project_id)
                let project_name = ''                 
                if (project_index != -1) 
                    project_name = projects[project_index].name
                else 
                    project_name= 'Project '+ project_id
                user.score_detail.push('    ' + project_contribution_score + ' '+project_name + ' contributions ')         
            }               
        }, this)

        user.score_detail.push(contributed_porjects_score + ' Contributed projects TOTAL')        
        return contributed_porjects_score
    }
    private scoreSahredProjects(user : IUserModel, projects : Array<any>)
    {                
        
        let shared_projects_scroe = user.badges.projects_shared.length*50
        if (user.badges.projects_shared.length > 0)
            user.score_detail.push('    Shared projects:')        
        user.badges.projects_shared.forEach(project_id=> 
        {
            let project_index = projects.findIndex((x:any)=> x.id == project_id)
            let project_name = ''                 
            if (project_index != -1) 
                project_name = projects[project_index].name
            else 
                project_name= 'Project '+ project_id
            user.score_detail.push('    50 ' + project_name)         
        })
        user.score_detail.push(shared_projects_scroe + ' Shared projects TOTAL')               
        return shared_projects_scroe
    }

    updateUserLabels(
        gitlab_user_id: number, 
        skills_langs : string[],
        skills_tags : string[],         
        wants_to_learn_langs : string[],
        wants_to_learn_tags : string[],
        description : string = 'all')
        {
            return new Promise<IUser>((resolve, reject) =>
            {
                this.getUserByGitlabId(gitlab_user_id).then((user : IUserModel) => 
                {
                   if (description == 'all' || description == 'Expertise')  
                   {    
                    user.skills_langs = skills_langs
                    user.skills_tags = skills_tags
                   }
                   if (description == 'all' || description == 'FieldsOfInterest')  
                   {  
                    user.wants_to_learn_langs = wants_to_learn_langs
                    user.wants_to_learn_tags = wants_to_learn_tags
                   }
                    user.save().then(usr=> resolve(usr)).catch(err=> {logger.error(err); reject()})              
                   
                })
                .catch(err=> {logger.error(err); reject()})
            })
        }


    updateUserAutoUpdate(
        gitlab_user_id: number, 
        auto_update : boolean)
        {
            return new Promise((resolve, reject) =>
            {
                this.getUserByGitlabId(gitlab_user_id).then((user : IUserModel) => 
                {
                            
                    user.auto_update = auto_update                       
                    user.save().then(usr=> resolve(usr)).catch(err=> logger.error(err))              
                    
                })
            })
        }
    creditChallange2User(gitlab_user_id : number, challeneg_id : string)
    {
        return new Promise((resolve, reject) =>
        {
            this.getUserByGitlabId(gitlab_user_id).then((user : IUserModel) => 
            {
                if (user.badges.challenges_solved.indexOf(challeneg_id) == -1)
                {
                    user.badges.challenges_solved.push(challeneg_id);             
                    user.save().then(usr=> resolve(usr))              
                }
                else
                {
                    reject()
                }
            })
        })
    }

    isUserChallenged(gitlab_user_id : number, challeneg_id : string)
    {
        return new Promise<boolean>((resolve, reject) =>
        {  
            this.getUserByGitlabId(gitlab_user_id).then((user : IUserModel) => 
            {
                resolve(user.badges.challenges_solved.indexOf(challeneg_id) != -1);
            })
        })
    }


    getSignedInUser(token : string)
    {
        return this.gitlabAgent.getSignedInUser(token)
    }
    private scoreSolvedChallenges(user : IUser)
    {
        
        return new Promise<number>((resolve, reject) =>
        {    
            let score = 0
            let promises : Array<Promise<void>> = []
            user.badges.challenges_solved.forEach
            (_id => 
                promises.push( this.getChallenge(_id)
                .then((challenge :IChallengeModel) =>
                { 
                    if (challenge) {
                        score +=  challenge.score
                        if (challenge.users_hinted_ids.indexOf(user.gitlab_user_id) != -1) score -= challenge.hint.price                
                    }
                })), this)
            
            Promise.all(promises).then(() => 
            {
                user.score_detail.push(score + ' Challenges solved ('+ user.badges.challenges_solved.length + ')')
                resolve(score)
            })
        })
    }

    private scoreRecommendedMembers(user : IUser)
    {
        

        return new Promise<number>((resolve, reject) =>
        {    
            let promises : Array<Promise<void>> = []
            let score = 0
            let members : Array<string> = []
            let deleted_members : Array<Number> = []

            if (user.badges.members_recommended.length > 0)
                members.push('    Members recommended:')
            user.badges.members_recommended.forEach
            (member => 
                promises.push(this.getUserByGitlabId(member)
                .then((user : IUser) => {
                    if (user.rank.toUpperCase() != 'APPLICANT') 
                    {
                        members.push('    50 '+user.name)
                        score+= 50                        
                    }
                    else
                    {
                        members.push('    0 '+user.name)
                    }
                }).catch(() =>
                {                    
                    deleted_members.push(member)
                })), this)
                    
            Promise.all(promises).then(()=> 
            {
                // Delete recommended user if doesnt exist
                
                deleted_members.forEach((deleted_member :number)=>
                {
                    user.badges.members_recommended.splice(
                    user.badges.members_recommended.indexOf(deleted_member) , 1)
                }, this)                
                
                members.push(score+ ' Member recommendations TOTAL')
                user.score_detail= user.score_detail.concat(members)
                resolve (score)
            }) 
        })
    }

    private calcUserRank(user:IUser)
    {
        if (user.recommended_by == 0) return 'APPLICANT'
        else if(user.score > 5000) return 'GRANDMASTER'
        else if (user.score > 3000) return 'MASTER'
        else if (user.score > 1500) return 'JOURNEYMAN'
        else if (user.score > 750) return 'CRAFTSMAN'
        else if (user.score > 250) return 'APPRENTICE' 
        else return 'APPLICANT'
    }
    
    private ScoreUser(user : IUserModel, projects: Array<any> = [])
    {
        return new Promise<IUserModel>((resolve, reject)=>
        {
            let totalScore = 0
            let promises: Array<any> = []
            
            user.score_detail = []
            totalScore += this.scoreGitLabMembership(user)            
            totalScore += this.scoreUserAvatar(user)
            totalScore += this.scorePullRequests(user)            
            promises.push(this.scoreGitLabProjects(user, projects).then((val : number) => totalScore+=val))
            promises.push(this.scoreSolvedChallenges(user).then((val : number) => totalScore+=val))
            promises.push(this.scoreRecommendedMembers(user).then((val : number) => totalScore+=val))        
            Promise.all(promises).then(()=> 
            {
                user.score = totalScore
                // if (user.score > totalScore) logger.info(user.username + " : " + user.score + '>' + totalScore)
                // else user.score = totalScore
                let prevRank = user.rank
                user.rank = this.calcUserRank(user)                
                if (user.rank != 'APPLICANT' && prevRank == 'APPLICANT') {
                    // new MailSender().sendMailToNewMember(user);
                }
                user.score_detail.push(totalScore + ' TOTAL SCORE')
                user.save().then(user=> resolve(user)).catch(err=> logger.error(err))
            })
        })
    }
           
    
    private setUsersAvatar(users : Array<any>)
    {
        if (users.length >0)
        {
            //this.gitlabAgent.setUserAvater(users[3]);
            users.forEach(user => { this.gitlabAgent.setUserAvater(user.id)}, this);                           
        }

    }
    
    private updateProjectsContributors$(projects : Array<any>, complete : Subject<Array<any>> = new Subject(), projectsList = projects.slice())
    {                              
        if (projectsList.length > 0)
        {            
            let project = projectsList.pop()
            this.addProject2Owner(project.creator_id, project.id).then(() =>
            {
                this.updateProjectContributors(project)
                .then(()=> this.updateProjectsContributors$(projects, complete, projectsList))       
                
            })                                                                        
        } 
        else
        {
            complete.next(projects)
        }   
        return complete
                          
    }
    
    
    private updateProjectContributors(project : any)
    {
        let promises : Array<Promise<IUserModel>> = []
        project.owners.forEach((owner_user_id : number) => 
        promises.push(this.addProject2Owner(owner_user_id, project.id)), this)
        return Promise.all(promises)
    }

    private createUsersSequentially(users : Array<any>, completed: Subject<void> = new Subject<void>())
    {
        if (users.length > 0)
        {
            this.createUserFromGitlabUser(users.pop()).then(() => this.createUsersSequentially(users, completed))
        }
        else
        {
            completed.next()
            completed.complete()
        }
        return completed
    }
    private createUsersFromGitlabUsers(users: Array<any>)
    {       
        logger.info("createUsersFromGitlabUsers")
        this.createUsersSequentially(users).subscribe(()=>      
        this.updateGuildUsers())                                     
    }    
    private updateUsersFromMatterMostUsers(users: Array<any>): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            let promises : Array<Promise<null>> = []
            users.forEach((user) => 
            {
                promises.push(this.updateUserFromMatterMostUser(user))                                   
            }, this) 
            Promise.all(promises).then(()=> 
            {
                resolve()
            }, err=> resolve())
        })
        
    }

    private updateUsersFromGitlabUsers(users: Array<any>)
    {       
        let promises : Array<Promise<any>> = []
        logger.info("updateUsersFromGitlabUser");
        if (this.projects.length >0)
        {
            this.updateProjectsContributors$(this.projects)
            .subscribe((projects) => 
            {
                let guildUsers : Array<IUserModel> = []
                users.forEach((user) => 
                {
                    promises.push(this.updateUserFromGitlabUser(user, projects)
                    .then((usr) => this.updateSharedProjects(usr)
                    .then((updatedUsr : IUserModel) =>  guildUsers.push(updatedUsr))))                
                }, this)    
                Promise.all(promises).then(()=> 
                {
                    promises = []
                    guildUsers.forEach((guildUser) => 
                    {
                        promises.push(this.updateUserMergeRequests(guildUser))                                
                    }, this) 
                    Promise.all(promises).then(()=> this.ScoreUsers(projects))
                })    
            })
        }
    }

    // handleProjectUpdate(project_id : number)
    // {
    //     logger.info(`handleProjectUpdate ${project_id}`);
    //     this.gitlabAgent.getProject(project_id).then((project)=>
    //     {
    //     this.updateProjectContributors(project)
    //     .then((users : Array<any>) => users
    //     .forEach(user => this.getUserbyID(user.username)
    //     .then((guilduser : IUserModel) => this.ScoreUser(guilduser)), this))
    //     })
    // }

    handleNewProject(project_id : number)
    {        
        logger.info(`handleNewProject ${project_id}`);
        this.gitlabAgent.getProject(project_id)
        .then((project) => this.updateProjectsContributors$([project]))
    }

    private canRecommend(user : any)
    { 
        let now  = new Date()
        // Can recommend only once a day
        return (user.rank != 'APPLICANT' &&
                now.getDate() != user.last_recommendation.getDate())
    }

    pokeMember(username : string, memberGitlabuserId :number)
    {
        logger.info(`pokeMember username:${username} memberGitlabuserId:${memberGitlabuserId}`);
        let guildMember : IUserModel = null;
        let applicant : IUserModel = null;

        let promises : Array<Promise<IUserModel>> =[]
        promises.push(model.user.findOne({gitlab_user_id : memberGitlabuserId})
        .then((user : IUserModel)=> guildMember = user))
        promises.push(model.user.findOne({username : username.toLowerCase()})
        .then((user : IUserModel)=> applicant = user))
        return new Promise((resolve, reject) =>
        {
            Promise.all(promises).then(()=>
            {
                if(guildMember && applicant)  
                { 
                    if ((applicant.rank == 'APPLICANT' || applicant.username == process.env.GUILD_ADMIN_USER) && 
                        applicant.recommended_by == 0 && guildMember.rank != 'APPLICANT') 
                        {
                            new MailSender().sendMailToPokeMemmber(applicant, guildMember);  
                            resolve(0); 
                        }                        
                }
                reject();
            })
        })
    }

    recommendUser(gitlab_user_id : number, applicantGitlabuserId :number)
    {        
        logger.info(`recommendUser username:${gitlab_user_id} applicantGitlabuserId:${applicantGitlabuserId}`);
       
        return new Promise<void>((resolve, reject) =>
        {
            this.getUserByGitlabId(gitlab_user_id)
            .then((guildMember : IUserModel)=>
            {
                this.getUserByGitlabId(applicantGitlabuserId)
                .then((applicant: IUserModel)=>
                {
                                            
                    if ((                       
                        guildMember.can_recommend || guildMember.username == process.env.GUILD_ADMIN_USER) &&
                        // Can recommend only if not already recommended
                        applicant.recommended_by == 0)                         
                    {
                        guildMember.badges.members_recommended.push(applicantGitlabuserId)
                        guildMember.last_recommendation = new Date()
                        guildMember.can_recommend = false;
                        applicant.recommended_by = guildMember.gitlab_user_id;
                        new MailSender().sendMailToRecommendedApplicant(applicant, guildMember);
                        guildMember.save().then(()=> applicant.save().then(()=> resolve()))                        
                        //this.ScoreUser(applicant)                                            
                    }        
                    else
                    {
                        reject('Can not recommend')
                    }    
                
                }).catch(err => reject(err))
            }).catch(err=> reject(err))        
            
        })
        
        
    }

    approveAvtamUser(gitlab_user_id: number, applicantGitlabuserId: number) {
        logger.info(`approveAvtamUser username:${gitlab_user_id} applicantGitlabuserId:${applicantGitlabuserId}`);

        return new Promise<void>((resolve, reject) => {
            this.getUserByGitlabId(gitlab_user_id)
                .then((guildMember: IUserModel) => {
                    logger.info(`guildMember :${guildMember.name}`);
                    guildMember.approved_data_security_statement = true;
                    guildMember.approved_data_security_statement_date = new Date;
                    guildMember.save().then((res) => {
                        //logger.info(`approveAvtamUser then :${JSON.stringify(res)}`);
                        resolve();
                    })
                }).catch(err => {
                    logger.info(`approveAvtamUser error :${err}`);
                    reject(err);
                })
        })
    }

    addMergeRequestsToUser(user: IUserModel, pull_requests : Array<any>)
    {                
        pull_requests.forEach(pullrequest =>
        {
            if (user.badges.projects.indexOf(pullrequest.project_id) == -1)
            {
                if (user.contributed_projects.indexOf(pullrequest.project_id) == -1)
                {                
                    user.contributed_projects.push(pullrequest.project_id)                                   
                }  
                if (user.badges.contributed_pull_requests.findIndex((x) => (x.pull_req_id == pullrequest.id && x.project_id == pullrequest.project_id)) == -1)
                {                
                    user.badges.contributed_pull_requests.push({pull_req_id: pullrequest.id, project_id: pullrequest.project_id})                                   
                }  
            }
            else 
            {                  
                if (user.badges.pull_requests.findIndex((x) => (x.pull_req_id == pullrequest.id && x.project_id == pullrequest.project_id)) == -1)
                {
                    user.badges.pull_requests.push({pull_req_id: pullrequest.id, project_id: pullrequest.project_id} );                        
                }
            }   
                            
        }, this)
        return user.save()
    }

    private updateSharedProjects(user : IUserModel)
    {        
        user.badges.projects.forEach((project_id)=> 
        {
            model.user.count({'contributed_projects': project_id})
            .then((share_count : number)=>
            {
                if (share_count > 0) 
                {
                    if (user.badges.projects_shared.indexOf(project_id) == -1)
                    user.badges.projects_shared.push(project_id)
                }
                
            })
        }, this)
        return user.save()       
    }

    private addProject2Owner(gitlab_user_id :number, project_id:number)
    {
        return new Promise<IUserModel>((resolve, reject)=> 
        {
            this.getUserByGitlabId(gitlab_user_id)
            .then((user : IUserModel) => 
            {
                if (user.badges.projects.findIndex((x)=> x== project_id) == -1)
                {
                    user.badges.projects.push(project_id)
                    user.save().then(usr=> resolve(usr))                                       
                }
                else
                {
                    resolve (user)
                }
            })
        })
    }
    // addProjectToUser(gitlab_id: number, project_id : number)
    // {                    
    //     return new Promise<void>((resolve, reject) =>
    //     {
    //         this.getUserByGitlabId(gitlab_id).then((user : IUserModel)=>
    //         {
    //             if (user == null) 
    //             {
    //                 logger.error('addProjectToUser user is null!')
    //                 reject()
    //             }
    //             if (user.contributed_projects.indexOf(project_id) == -1)
    //             {                    
    //                 user.contributed_projects.push(project_id)                                                                                  
    //                 user.save().then(usr=> resolve())                   
    //             }
    //             else
    //             {
    //                 resolve()
    //             }
    //         })            
    //     })                                                         
   
    // }

    getAllUsers()
    {
        let query = model.user.find({},).sort({score: -1})
        return query.exec();    
    }
        
    getUserbyID(id : string)
    {
        let query = model.user.findOne({ username : id.toLowerCase()}) 
        return query.exec();    
    }
    getUserByGitlabId(id : number)
    {
        let query = model.user.findOne({ gitlab_user_id : id}) 
        return query.exec();    
    }
    private createUserinDB(user: IUser)
    {
        return new Promise<IUserModel>((resolve, reject) =>
        {
            let query = { gitlab_user_id : user.gitlab_user_id }; 
            let newUser: IUserModel = new model.user(user);

            model.user.findOne(query, 
                (error:any, result :IUserModel) =>
                    { 
                        if (!result) 
                        {                            
                            result = newUser                        
                            result.save().then((user : IUserModel) => resolve(user))
                        }
                        else
                        {
                            resolve(result)
                        }
                                            
                    })
        })
    }

   
    createUserfromGitLabID(gitlab_user_id : number)
    {
        return new Promise<IUserModel>((resolve, reject) =>
        this.gitlabAgent.getUser$(gitlab_user_id)
        .subscribe((res : any) => this.createUserFromGitlabUser(JSON.parse(res)).
        then((newUser) => resolve(newUser))))       
        
    }
    private initUserFromGitlabUser(user : any)
    {        
        // let userUrl : string = user.web_url.toLowerCase()
        // userUrl = userUrl.replace(username, 'users/'+username+'/contributed')        

        let newUser : IUser = { 
            email: (user.email != undefined) ? user.email.toLowerCase() : undefined,
            name:  user.name.toUpperCase(),
            gitlab_user_id: user.id,
            gitlab_url: user.web_url,//userUrl,
            username: user.username.toLowerCase(),
            score: 0,
            score_detail: [],
            avatar_url : user.avatar_url,
            rank : 'APPLICANT',
            recommended_by : 0,
            last_recommendation : new Date(0), 
            can_recommend : false,
            contributed_projects:[],
            active: true,
            mettermost_user : "",
            bio : '',
            auto_update : true,
            skills_langs:[],
            skills_tags: [],
            wants_to_learn_tags :[],
            wants_to_learn_langs : [],
            badges : {
                gitlab_user: true,
                projects:[],
                snippets : [],
                pull_requests : [],
                contributed_pull_requests : [],
                members_recommended : [],
                challenges_solved : [],
                challenges_published :[],      
                projects_shared : []                     
            }
        }    
        return newUser
    }

    private updateUserFromMatterMostUser(user : any): Promise<null>
    {
        return new Promise<null> ((resolve, reject) =>
        {
            this.getUserbyID(user.username)
            .then((guildUser : IUserModel)=> 
            {
                if (guildUser  && guildUser.mettermost_user == "")
                {
                    guildUser.mettermost_user = user.id
                    guildUser.save().then(savedUser=> resolve(null))
                }
                resolve(null)
            }, err=> resolve(null))
        })
    }

    private updateUserFromGitlabUser(user : any, projects : Array<any>)
    {
        return new Promise<IUserModel>((resolve, reject)=>
        {
            this.getUserByGitlabId(user.id)
            .then((guild_user : IUserModel)=>
            {
                if (guild_user)
                {
                    if (user.avatar_url != guild_user.avatar_url)
                    {
                        guild_user.avatar_url = user.avatar_url                    
                    }
                    if (user.bio != guild_user.bio)
                    {
                        guild_user.bio = user.bio
                    }
                    if (user.name != guild_user.name)
                    {
                        guild_user.name = user.name
                    }
                    if (user.state != "active")
                    {
                        guild_user.active = false
                    }
                    else
                    {
                        guild_user.active = true
                    }
                    guild_user.can_recommend = this.canRecommend(guild_user)     
                    // if (!guild_user.approved_data_security_statement) {
                    //     guild_user.approved_data_security_statement = false;              
                    // }
                    // if (!guild_user.approved_data_security_statement) {
                    //     guild_user.approved_data_security_statement_date = null;
                    // }

                    guild_user.save().then(savedUser => resolve(savedUser))               
                    
                }
                else 
                {
                    this.createUserfromGitLabID(user.id).then(newUser => resolve(newUser))
                }
            })
        })
    }

    private updateUserMergeRequests(user : IUserModel)
    {
        return new Promise<IUserModel>((resolve, reject)=>
        this.gitlabAgent.getUserMergeRequests$(user.gitlab_user_id)
        .subscribe((requests : Array<any>) => 
        {
            //let requests : Array<any> = JSON.parse(res)
            this.addMergeRequestsToUser(user, requests).then((usr)=> resolve(usr))                            
        }, 
        (error)=>
        {
            user.active= false; 
            user.save().then((usr)=> resolve(usr))
        }))
    }
    private createUserFromGitlabUser(user :any)
    {        
        return new Promise<IUserModel>((resolve, reject) =>
        {                                  
            this.createUserinDB(this.initUserFromGitlabUser(user))
            .then((newUser)=>
            {
                if (newUser.avatar_url == null) 
                {
                    this.gitlabAgent.setUserAvater(newUser.gitlab_user_id)                    
                }
             resolve(newUser)
            })
        })
    }

    restore_recommended()
    {
        return new Promise<void>((resolve,reject) =>
        {
            let promises : Array<Promise<IUserModel>> = []
            let users2Save : Array <number> = []
            model.user.find((err: any, users: IUserModel[]) =>             
            {
                users.forEach(user => 
                {
                    if (user.recommended_by != 0)
                    {
                        let sponser = users.findIndex((usr)=> usr.gitlab_user_id == user.recommended_by)
                        if (sponser != -1)
                        {
                            if (users[sponser].badges.members_recommended.indexOf(user.gitlab_user_id) == -1)
                            {
                                users[sponser].badges.members_recommended.push(user.gitlab_user_id)
                                if (users2Save.indexOf(sponser) == -1 ) users2Save.push(sponser)
                            }
                            
                        }
                    }
                }, this)
                users2Save.forEach((sponser : number)=>promises.push(users[sponser].save()), this )
                Promise.all(promises).then(()=> resolve()).catch(()=>reject())
            })
        })
    }
    

}
