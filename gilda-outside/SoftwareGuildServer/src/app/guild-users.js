"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gitlab_agent_1 = require("./gitlab-agent");
const db_1 = require("./db");
const Subject_1 = require("rxjs/Subject");
const log4js_1 = require("log4js");
const mail_1 = require("./mail");
const mattermost_agent_1 = require("./mattermost-agent");
const logger = log4js_1.getLogger();
class GuildUsers {
    //private projects : Array<any> = []  
    constructor() {
        this.gitlabAgent = gitlab_agent_1.GitLabAgent.getGitLabAgent();
        this.mattermostAgent = mattermost_agent_1.MatterMostAgent.getMatterMostAgent();
        this.projects = [];
        // Subscriptions
        this.gitlabAgent.getNewUsers$()
            .subscribe((user_id) => this.createUserfromGitLabID(user_id));
        //.then((user : IUserModel) => this.ScoreUser(user)))  
        // this.gitlabAgent.getNewMergeRequests$()
        // .subscribe((mergeReqData : any) => this.addMergeRequestsToUser(mergeReqData.username, mergeReqData.req_id)
        //.then((user : IUserModel)=> this.ScoreUser(user)))
        this.gitlabAgent.getProjectsUpdate$().subscribe((projs) => {
            this.projects = projs;
            this.updateGuildUsers();
        });
        this.gitlabAgent.getNewProject$().subscribe((project_id) => this.handleNewProject(project_id));
        // Create initail data
        this.createGuildUsers();
        //this.setUsersAvatars()
    }
    static getGuildUsers() {
        if (!GuildUsers.instance)
            GuildUsers.instance = new GuildUsers();
        return GuildUsers.instance;
    }
    scoreUserAvatar(user) {
        let score = (user.avatar_url != null &&
            !user.avatar_url.endsWith('head-from-gitlab-logo-small-min.png') ? 50 : 0);
        user.score_detail.push(score + ' Gitlab avatar');
        return score;
    }
    setUsersAvatars() {
        this.gitlabAgent.getUsers$().subscribe((res) => this.setUsersAvatar(res));
    }
    createGuildUsers() {
        this.gitlabAgent.getUsers$().subscribe((res) => this.createUsersFromGitlabUsers(res));
    }
    updateGuildUsers() {
        this.mattermostAgent.getUsers()
            .then((users) => this.updateUsersFromMatterMostUsers(users)
            .then(() => this.updateUsersFromGitLab(), err => this.updateUsersFromGitLab()));
    }
    updateUsersFromGitLab() {
        this.gitlabAgent.getUsers$()
            .subscribe((res) => this.updateUsersFromGitlabUsers(res));
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
    ScoreUsers(projects = []) {
        // let mostStaredProjectContributors : Array<any> = []
        // this.scoreMostSartedProject()
        // .then((contributors) =>
        // {
        // TODO :Score for most stared?
        // mostStaredProjectContributors= contributors
        // console.log(mostStaredProjectContributors)
        // Score all users
        db_1.default.user.find((err, res) => {
            let promises = [];
            res.forEach(user => promises.push(this.ScoreUser(user, projects)), this);
            Promise.all(promises).then(() => logger.info('ScoreUsers done'));
        });
        // })
    }
    getChallenge(the_id) {
        let query = db_1.default.challenge.findOne({ _id: the_id });
        return query.exec();
    }
    scoreGitLabMembership(user) {
        let score = user.badges.gitlab_user ? 30 : 0;
        user.score_detail.push(score + ' Gitlab user ');
        return (score);
    }
    scorePullRequests(user) {
        let score = user.badges.pull_requests.length;
        user.score_detail.push(score + ' Pull requests');
        return score;
    }
    scoreRepositoryFiles(project) {
        let score = 0;
        if (project.readme_url != null)
            score += 15;
        return score;
    }
    getProjectData(project_id, projects) {
        return new Promise((resolve, reject) => {
            let project_index = projects.findIndex((x) => x.id == project_id);
            if (project_index != -1) {
                resolve(projects[project_index]);
            }
            else {
                this.gitlabAgent.getProject(project_id).then((project) => {
                    projects.push(project);
                    resolve(project);
                }).catch((err) => { logger.error(err + 'project id:' + project_id); reject(); });
            }
        });
    }
    removeDeletedProjectsFromUser(user, deletedProjects) {
        deletedProjects.forEach(project_id => {
            user.badges.projects.splice(user.badges.projects.indexOf(project_id), 1);
            user.badges.projects_shared.splice(user.badges.projects_shared.indexOf(project_id), 1);
            user.contributed_projects.splice(user.contributed_projects.indexOf(project_id), 1);
        }, this);
    }
    scoreGitLabProjects(user, projects) {
        return new Promise((resolve, reject) => {
            let projects_score = 0;
            let promises = [];
            let deletedProjects = [];
            let score_detail = [];
            let score = 0;
            if (user.badges.projects.length > 0) {
                score_detail.push('    Projects (up to a maximum of 445 points):');
                score_detail.push('    55 1st project bonus');
                projects_score += 55;
            }
            user.badges.projects.forEach((project_id, index) => {
                promises.push(this.getProjectData(project_id, projects).then((project) => {
                    if (project) {
                        // Remove project if user is no longer the owner
                        if (project.owners.indexOf(user.gitlab_user_id) == -1) {
                            user.badges.projects.splice(user.badges.projects.indexOf(project_id), 1);
                        }
                        projects_score += 20;
                        let filesScore = this.scoreRepositoryFiles(project);
                        score_detail.push('    ' + (20 + filesScore) + ' ' + project.name);
                        projects_score += filesScore;
                    }
                }).catch(() => {
                    deletedProjects.push(project_id);
                }));
            }, this);
            Promise.all(promises).then(() => {
                // Remove deleted projects
                this.removeDeletedProjectsFromUser(user, deletedProjects);
                projects_score = projects_score < 445 ? projects_score : 445;
                user.score_detail = user.score_detail.concat(score_detail);
                user.score_detail.push(projects_score + ' Projects TOTAL');
                score += projects_score;
                score += this.scoreSahredProjects(user, projects);
                score += this.scoreContributedProjects(user, projects);
                resolve(score);
            });
        });
    }
    scoreContributedProjects(user, projects) {
        let contributed_porjects_score = 0;
        if (user.contributed_projects.length > 0) {
            user.score_detail.push('    Contributed projects:');
        }
        user.contributed_projects.forEach(project_id => {
            let contributions = user.badges.contributed_pull_requests.filter(x => x.project_id == project_id).length;
            // first contribution is 100, the rest are 30 each
            if (contributions > 0) {
                let project_contribution_score = (contributions * 30) + 70;
                contributed_porjects_score += project_contribution_score;
                let project_index = projects.findIndex((x) => x.id == project_id);
                let project_name = '';
                if (project_index != -1)
                    project_name = projects[project_index].name;
                else
                    project_name = 'Project ' + project_id;
                user.score_detail.push('    ' + project_contribution_score + ' ' + project_name + ' contributions ');
            }
        }, this);
        user.score_detail.push(contributed_porjects_score + ' Contributed projects TOTAL');
        return contributed_porjects_score;
    }
    scoreSahredProjects(user, projects) {
        let shared_projects_scroe = user.badges.projects_shared.length * 50;
        if (user.badges.projects_shared.length > 0)
            user.score_detail.push('    Shared projects:');
        user.badges.projects_shared.forEach(project_id => {
            let project_index = projects.findIndex((x) => x.id == project_id);
            let project_name = '';
            if (project_index != -1)
                project_name = projects[project_index].name;
            else
                project_name = 'Project ' + project_id;
            user.score_detail.push('    50 ' + project_name);
        });
        user.score_detail.push(shared_projects_scroe + ' Shared projects TOTAL');
        return shared_projects_scroe;
    }
    updateUserLabels(gitlab_user_id, skills_langs, skills_tags, wants_to_learn_langs, wants_to_learn_tags, description = 'all') {
        return new Promise((resolve, reject) => {
            this.getUserByGitlabId(gitlab_user_id).then((user) => {
                if (description == 'all' || description == 'Expertise') {
                    user.skills_langs = skills_langs;
                    user.skills_tags = skills_tags;
                }
                if (description == 'all' || description == 'FieldsOfInterest') {
                    user.wants_to_learn_langs = wants_to_learn_langs;
                    user.wants_to_learn_tags = wants_to_learn_tags;
                }
                user.save().then(usr => resolve(usr)).catch(err => { logger.error(err); reject(); });
            })
                .catch(err => { logger.error(err); reject(); });
        });
    }
    updateUserAutoUpdate(gitlab_user_id, auto_update) {
        return new Promise((resolve, reject) => {
            this.getUserByGitlabId(gitlab_user_id).then((user) => {
                user.auto_update = auto_update;
                user.save().then(usr => resolve(usr)).catch(err => logger.error(err));
            });
        });
    }
    creditChallange2User(gitlab_user_id, challeneg_id) {
        return new Promise((resolve, reject) => {
            this.getUserByGitlabId(gitlab_user_id).then((user) => {
                if (user.badges.challenges_solved.indexOf(challeneg_id) == -1) {
                    user.badges.challenges_solved.push(challeneg_id);
                    user.save().then(usr => resolve(usr));
                }
                else {
                    reject();
                }
            });
        });
    }
    isUserChallenged(gitlab_user_id, challeneg_id) {
        return new Promise((resolve, reject) => {
            this.getUserByGitlabId(gitlab_user_id).then((user) => {
                resolve(user.badges.challenges_solved.indexOf(challeneg_id) != -1);
            });
        });
    }
    getSignedInUser(token) {
        return this.gitlabAgent.getSignedInUser(token);
    }
    scoreSolvedChallenges(user) {
        return new Promise((resolve, reject) => {
            let score = 0;
            let promises = [];
            user.badges.challenges_solved.forEach(_id => promises.push(this.getChallenge(_id)
                .then((challenge) => {
                if (challenge) {
                    score += challenge.score;
                    if (challenge.users_hinted_ids.indexOf(user.gitlab_user_id) != -1)
                        score -= challenge.hint.price;
                }
            })), this);
            Promise.all(promises).then(() => {
                user.score_detail.push(score + ' Challenges solved (' + user.badges.challenges_solved.length + ')');
                resolve(score);
            });
        });
    }
    scoreRecommendedMembers(user) {
        return new Promise((resolve, reject) => {
            let promises = [];
            let score = 0;
            let members = [];
            let deleted_members = [];
            if (user.badges.members_recommended.length > 0)
                members.push('    Members recommended:');
            user.badges.members_recommended.forEach(member => promises.push(this.getUserByGitlabId(member)
                .then((user) => {
                if (user.rank.toUpperCase() != 'APPLICANT') {
                    members.push('    50 ' + user.name);
                    score += 50;
                }
                else {
                    members.push('    0 ' + user.name);
                }
            }).catch(() => {
                deleted_members.push(member);
            })), this);
            Promise.all(promises).then(() => {
                // Delete recommended user if doesnt exist
                deleted_members.forEach((deleted_member) => {
                    user.badges.members_recommended.splice(user.badges.members_recommended.indexOf(deleted_member), 1);
                }, this);
                members.push(score + ' Member recommendations TOTAL');
                user.score_detail = user.score_detail.concat(members);
                resolve(score);
            });
        });
    }
    calcUserRank(user) {
        if (user.recommended_by == 0)
            return 'APPLICANT';
        else if (user.score > 5000)
            return 'GRANDMASTER';
        else if (user.score > 3000)
            return 'MASTER';
        else if (user.score > 1500)
            return 'JOURNEYMAN';
        else if (user.score > 750)
            return 'CRAFTSMAN';
        else if (user.score > 250)
            return 'APPRENTICE';
        else
            return 'APPLICANT';
    }
    ScoreUser(user, projects = []) {
        return new Promise((resolve, reject) => {
            let totalScore = 0;
            let promises = [];
            user.score_detail = [];
            totalScore += this.scoreGitLabMembership(user);
            totalScore += this.scoreUserAvatar(user);
            totalScore += this.scorePullRequests(user);
            promises.push(this.scoreGitLabProjects(user, projects).then((val) => totalScore += val));
            promises.push(this.scoreSolvedChallenges(user).then((val) => totalScore += val));
            promises.push(this.scoreRecommendedMembers(user).then((val) => totalScore += val));
            Promise.all(promises).then(() => {
                user.score = totalScore;
                // if (user.score > totalScore) logger.info(user.username + " : " + user.score + '>' + totalScore)
                // else user.score = totalScore
                let prevRank = user.rank;
                user.rank = this.calcUserRank(user);
                if (user.rank != 'APPLICANT' && prevRank == 'APPLICANT') {
                    // new MailSender().sendMailToNewMember(user);
                }
                user.score_detail.push(totalScore + ' TOTAL SCORE');
                user.save().then(user => resolve(user)).catch(err => logger.error(err));
            });
        });
    }
    setUsersAvatar(users) {
        if (users.length > 0) {
            //this.gitlabAgent.setUserAvater(users[3]);
            users.forEach(user => { this.gitlabAgent.setUserAvater(user.id); }, this);
        }
    }
    updateProjectsContributors$(projects, complete = new Subject_1.Subject(), projectsList = projects.slice()) {
        if (projectsList.length > 0) {
            let project = projectsList.pop();
            this.addProject2Owner(project.creator_id, project.id).then(() => {
                this.updateProjectContributors(project)
                    .then(() => this.updateProjectsContributors$(projects, complete, projectsList));
            });
        }
        else {
            complete.next(projects);
        }
        return complete;
    }
    updateProjectContributors(project) {
        let promises = [];
        project.owners.forEach((owner_user_id) => promises.push(this.addProject2Owner(owner_user_id, project.id)), this);
        return Promise.all(promises);
    }
    createUsersSequentially(users, completed = new Subject_1.Subject()) {
        if (users.length > 0) {
            this.createUserFromGitlabUser(users.pop()).then(() => this.createUsersSequentially(users, completed));
        }
        else {
            completed.next();
            completed.complete();
        }
        return completed;
    }
    createUsersFromGitlabUsers(users) {
        logger.info("createUsersFromGitlabUsers");
        this.createUsersSequentially(users).subscribe(() => this.updateGuildUsers());
    }
    updateUsersFromMatterMostUsers(users) {
        return new Promise((resolve, reject) => {
            let promises = [];
            users.forEach((user) => {
                promises.push(this.updateUserFromMatterMostUser(user));
            }, this);
            Promise.all(promises).then(() => {
                resolve();
            }, err => resolve());
        });
    }
    updateUsersFromGitlabUsers(users) {
        let promises = [];
        logger.info("updateUsersFromGitlabUser");
        if (this.projects.length > 0) {
            this.updateProjectsContributors$(this.projects)
                .subscribe((projects) => {
                let guildUsers = [];
                users.forEach((user) => {
                    promises.push(this.updateUserFromGitlabUser(user, projects)
                        .then((usr) => this.updateSharedProjects(usr)
                        .then((updatedUsr) => guildUsers.push(updatedUsr))));
                }, this);
                Promise.all(promises).then(() => {
                    promises = [];
                    guildUsers.forEach((guildUser) => {
                        promises.push(this.updateUserMergeRequests(guildUser));
                    }, this);
                    Promise.all(promises).then(() => this.ScoreUsers(projects));
                });
            });
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
    handleNewProject(project_id) {
        logger.info(`handleNewProject ${project_id}`);
        this.gitlabAgent.getProject(project_id)
            .then((project) => this.updateProjectsContributors$([project]));
    }
    canRecommend(user) {
        let now = new Date();
        // Can recommend only once a day
        return (user.rank != 'APPLICANT' &&
            now.getDate() != user.last_recommendation.getDate());
    }
    pokeMember(username, memberGitlabuserId) {
        logger.info(`pokeMember username:${username} memberGitlabuserId:${memberGitlabuserId}`);
        let guildMember = null;
        let applicant = null;
        let promises = [];
        promises.push(db_1.default.user.findOne({ gitlab_user_id: memberGitlabuserId })
            .then((user) => guildMember = user));
        promises.push(db_1.default.user.findOne({ username: username.toLowerCase() })
            .then((user) => applicant = user));
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(() => {
                if (guildMember && applicant) {
                    if ((applicant.rank == 'APPLICANT' || applicant.username == process.env.GUILD_ADMIN_USER) &&
                        applicant.recommended_by == 0 && guildMember.rank != 'APPLICANT') {
                        new mail_1.MailSender().sendMailToPokeMemmber(applicant, guildMember);
                        resolve(0);
                    }
                }
                reject();
            });
        });
    }
    recommendUser(gitlab_user_id, applicantGitlabuserId) {
        logger.info(`recommendUser username:${gitlab_user_id} applicantGitlabuserId:${applicantGitlabuserId}`);
        return new Promise((resolve, reject) => {
            this.getUserByGitlabId(gitlab_user_id)
                .then((guildMember) => {
                this.getUserByGitlabId(applicantGitlabuserId)
                    .then((applicant) => {
                    if ((guildMember.can_recommend || guildMember.username == process.env.GUILD_ADMIN_USER) &&
                        // Can recommend only if not already recommended
                        applicant.recommended_by == 0) {
                        guildMember.badges.members_recommended.push(applicantGitlabuserId);
                        guildMember.last_recommendation = new Date();
                        guildMember.can_recommend = false;
                        applicant.recommended_by = guildMember.gitlab_user_id;
                        new mail_1.MailSender().sendMailToRecommendedApplicant(applicant, guildMember);
                        guildMember.save().then(() => applicant.save().then(() => resolve()));
                        //this.ScoreUser(applicant)                                            
                    }
                    else {
                        reject('Can not recommend');
                    }
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }
    approveAvtamUser(gitlab_user_id, applicantGitlabuserId) {
        logger.info(`approveAvtamUser username:${gitlab_user_id} applicantGitlabuserId:${applicantGitlabuserId}`);
        return new Promise((resolve, reject) => {
            this.getUserByGitlabId(gitlab_user_id)
                .then((guildMember) => {
                logger.info(`guildMember :${guildMember.name}`);
                guildMember.approved_data_security_statement = true;
                guildMember.approved_data_security_statement_date = new Date;
                guildMember.save().then((res) => {
                    //logger.info(`approveAvtamUser then :${JSON.stringify(res)}`);
                    resolve();
                });
            }).catch(err => {
                logger.info(`approveAvtamUser error :${err}`);
                reject(err);
            });
        });
    }
    addMergeRequestsToUser(user, pull_requests) {
        pull_requests.forEach(pullrequest => {
            if (user.badges.projects.indexOf(pullrequest.project_id) == -1) {
                if (user.contributed_projects.indexOf(pullrequest.project_id) == -1) {
                    user.contributed_projects.push(pullrequest.project_id);
                }
                if (user.badges.contributed_pull_requests.findIndex((x) => (x.pull_req_id == pullrequest.id && x.project_id == pullrequest.project_id)) == -1) {
                    user.badges.contributed_pull_requests.push({ pull_req_id: pullrequest.id, project_id: pullrequest.project_id });
                }
            }
            else {
                if (user.badges.pull_requests.findIndex((x) => (x.pull_req_id == pullrequest.id && x.project_id == pullrequest.project_id)) == -1) {
                    user.badges.pull_requests.push({ pull_req_id: pullrequest.id, project_id: pullrequest.project_id });
                }
            }
        }, this);
        return user.save();
    }
    updateSharedProjects(user) {
        user.badges.projects.forEach((project_id) => {
            db_1.default.user.count({ 'contributed_projects': project_id })
                .then((share_count) => {
                if (share_count > 0) {
                    if (user.badges.projects_shared.indexOf(project_id) == -1)
                        user.badges.projects_shared.push(project_id);
                }
            });
        }, this);
        return user.save();
    }
    addProject2Owner(gitlab_user_id, project_id) {
        return new Promise((resolve, reject) => {
            this.getUserByGitlabId(gitlab_user_id)
                .then((user) => {
                if (user.badges.projects.findIndex((x) => x == project_id) == -1) {
                    user.badges.projects.push(project_id);
                    user.save().then(usr => resolve(usr));
                }
                else {
                    resolve(user);
                }
            });
        });
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
    getAllUsers() {
        let query = db_1.default.user.find({}).sort({ score: -1 });
        return query.exec();
    }
    getUserbyID(id) {
        let query = db_1.default.user.findOne({ username: id.toLowerCase() });
        return query.exec();
    }
    getUserByGitlabId(id) {
        let query = db_1.default.user.findOne({ gitlab_user_id: id });
        return query.exec();
    }
    createUserinDB(user) {
        return new Promise((resolve, reject) => {
            let query = { gitlab_user_id: user.gitlab_user_id };
            let newUser = new db_1.default.user(user);
            db_1.default.user.findOne(query, (error, result) => {
                if (!result) {
                    result = newUser;
                    result.save().then((user) => resolve(user));
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    createUserfromGitLabID(gitlab_user_id) {
        return new Promise((resolve, reject) => this.gitlabAgent.getUser$(gitlab_user_id)
            .subscribe((res) => this.createUserFromGitlabUser(JSON.parse(res)).
            then((newUser) => resolve(newUser))));
    }
    initUserFromGitlabUser(user) {
        // let userUrl : string = user.web_url.toLowerCase()
        // userUrl = userUrl.replace(username, 'users/'+username+'/contributed')        
        let newUser = {
            email: (user.email != undefined) ? user.email.toLowerCase() : undefined,
            name: user.name.toUpperCase(),
            gitlab_user_id: user.id,
            gitlab_url: user.web_url,
            username: user.username.toLowerCase(),
            score: 0,
            score_detail: [],
            avatar_url: user.avatar_url,
            rank: 'APPLICANT',
            recommended_by: 0,
            last_recommendation: new Date(0),
            can_recommend: false,
            contributed_projects: [],
            active: true,
            mettermost_user: "",
            bio: '',
            auto_update: true,
            skills_langs: [],
            skills_tags: [],
            wants_to_learn_tags: [],
            wants_to_learn_langs: [],
            badges: {
                gitlab_user: true,
                projects: [],
                snippets: [],
                pull_requests: [],
                contributed_pull_requests: [],
                members_recommended: [],
                challenges_solved: [],
                challenges_published: [],
                projects_shared: []
            }
        };
        return newUser;
    }
    updateUserFromMatterMostUser(user) {
        return new Promise((resolve, reject) => {
            this.getUserbyID(user.username)
                .then((guildUser) => {
                if (guildUser && guildUser.mettermost_user == "") {
                    guildUser.mettermost_user = user.id;
                    guildUser.save().then(savedUser => resolve());
                }
                resolve();
            }, err => resolve());
        });
    }
    updateUserFromGitlabUser(user, projects) {
        return new Promise((resolve, reject) => {
            this.getUserByGitlabId(user.id)
                .then((guild_user) => {
                if (guild_user) {
                    if (user.avatar_url != guild_user.avatar_url) {
                        guild_user.avatar_url = user.avatar_url;
                    }
                    if (user.bio != guild_user.bio) {
                        guild_user.bio = user.bio;
                    }
                    if (user.name != guild_user.name) {
                        guild_user.name = user.name;
                    }
                    if (user.state != "active") {
                        guild_user.active = false;
                    }
                    else {
                        guild_user.active = true;
                    }
                    guild_user.can_recommend = this.canRecommend(guild_user);
                    // if (!guild_user.approved_data_security_statement) {
                    //     guild_user.approved_data_security_statement = false;              
                    // }
                    // if (!guild_user.approved_data_security_statement) {
                    //     guild_user.approved_data_security_statement_date = null;
                    // }
                    guild_user.save().then(savedUser => resolve(savedUser));
                }
                else {
                    this.createUserfromGitLabID(user.id).then(newUser => resolve(newUser));
                }
            });
        });
    }
    updateUserMergeRequests(user) {
        return new Promise((resolve, reject) => this.gitlabAgent.getUserMergeRequests$(user.gitlab_user_id)
            .subscribe((requests) => {
            //let requests : Array<any> = JSON.parse(res)
            this.addMergeRequestsToUser(user, requests).then((usr) => resolve(usr));
        }, (error) => {
            user.active = false;
            user.save().then((usr) => resolve(usr));
        }));
    }
    createUserFromGitlabUser(user) {
        return new Promise((resolve, reject) => {
            this.createUserinDB(this.initUserFromGitlabUser(user))
                .then((newUser) => {
                if (newUser.avatar_url == null) {
                    this.gitlabAgent.setUserAvater(newUser.gitlab_user_id);
                }
                resolve(newUser);
            });
        });
    }
    restore_recommended() {
        return new Promise((resolve, reject) => {
            let promises = [];
            let users2Save = [];
            db_1.default.user.find((err, users) => {
                users.forEach(user => {
                    if (user.recommended_by != 0) {
                        let sponser = users.findIndex((usr) => usr.gitlab_user_id == user.recommended_by);
                        if (sponser != -1) {
                            if (users[sponser].badges.members_recommended.indexOf(user.gitlab_user_id) == -1) {
                                users[sponser].badges.members_recommended.push(user.gitlab_user_id);
                                if (users2Save.indexOf(sponser) == -1)
                                    users2Save.push(sponser);
                            }
                        }
                    }
                }, this);
                users2Save.forEach((sponser) => promises.push(users[sponser].save()), this);
                Promise.all(promises).then(() => resolve()).catch(() => reject());
            });
        });
    }
}
exports.GuildUsers = GuildUsers;
//# sourceMappingURL=guild-users.js.map