import { GuildUsers } from './guild-users';
import { IMonsterModel } from './models/monster';
import { IUserModel } from './models/user';
import { model } from './db';
import { getLogger } from 'log4js';
import {Action, IMonster} from './interfaces/IMonster';
import {MarketPlace} from './marketplace'


const logger = getLogger();

export class Monsters {
    
    constructor() {
        
    }

    createMonsters() {
        for (let i = 1; i < 7; i++) {
            for (let j = 1; j < 6; j++) {
                this.addMonster(<IMonsterModel>{
                    name: "AnonyMonster"+i+j,
                    parent: 0,
                    rank: `0${i}`,
                    monster_index: `0${j}`,
                });
            }
        }

    }

    getMonster4Adoption()
    {
        let query  = model.monster.find()
        .and([
            { 'monster_adoption_criteria' : { '$ne' : []}},
            { 'parent' : 0}
        ]);
        return query.exec()
    }


    addMonster(monster: IMonsterModel): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            model.monster.create(monster).then(() => {
                logger.info("New monster added " + monster.rank);
                resolve(true);
            })

        })
    }

    isFitParent(monster : IMonster, user: IUserModel)
    {
        let fitParent = true;
       
        let gigs_publishers = MarketPlace.getMarketPlaceService().getGigsPublishers()
        monster.monster_adoption_criteria.forEach((criterion, index) =>
        {
            if (criterion.action == Action.gitlab_user.toString())
            {
                criterion.completion = user.badges.gitlab_user? 1 :0              
            }
            else if (criterion.action == Action.add_project.toString())
            {
                criterion.completion = user.badges.projects.length
            }
            else if (criterion.action == Action.contribute_code.toString())
            {
                criterion.completion = user.contributed_projects.length
            }
            else if (criterion.action == Action.pull_request.toString())
            {
                criterion.completion = user.badges.pull_requests.length + user.badges.contributed_pull_requests.length
            }
            else if (criterion.action == Action.recommend_applicant.toString())
            {
                criterion.completion = user.badges.members_recommended.length 
            }
            else if (criterion.action == Action.set_avatar.toString())
            {
                criterion.completion = user.avatar_url.endsWith('head-from-gitlab-logo-small-min.png')? 0 : 1
            }
            else if (criterion.action == Action.share_code.toString())
            {
                criterion.completion = user.badges.projects_shared.length
            }
            else if (criterion.action == Action.solve_challange.toString())
            {
                criterion.completion = user.badges.challenges_solved.length 
            }
            else if (criterion.action == Action.mattermost_user.toString())
            {
                criterion.completion = user.mettermost_user != "" ? 1 :0   
            }
            else if (criterion.action == Action.publish_gig.toString())
            {
                criterion.completion = gigs_publishers.filter(x=> x== user.gitlab_user_id).length
            }
            else if (criterion.action == Action.gitlab_bio.toString())
            {
                criterion.completion = (user.bio && user.bio != null && user.bio != '')? 1 : 0
            }
            else if (criterion.action == Action.user_skill_tags.toString())
            {
                criterion.completion = user.skills_tags.length
            }
            else if (criterion.action == Action.user_fields_of_interest_tags.toString())
            {
                criterion.completion =  user.wants_to_learn_tags.length
            }
            else if (criterion.action == Action.user_skill_langs.toString())
            {
                criterion.completion = user.skills_langs.length
            }
            else if (criterion.action == Action.user_fields_of_interest_langs.toString())
            {
                criterion.completion =  user.wants_to_learn_tags.length
            }
           
            if (criterion.completion < criterion.count) fitParent = false
            monster.monster_adoption_criteria[index].completion = criterion.completion            
        }, this) 
       
        return fitParent;
    }

    applyForAdoption(user_gitlab_id: number, submitAdoptionRequest : boolean = false)
    {
        return new Promise<IMonster>((resolve, reject)=>
        {
            let gsm = GuildUsers.getGuildUsers();             
            this.getMonster4Adoption().then((monsters: Array<IMonsterModel>) => 
            {
                if (monsters.length > 0)
                {
                    let monster = monsters[0]
                    gsm.getUserByGitlabId(user_gitlab_id).then((user) =>
                    {               
                        if (user)
                        {
                            if (this.isFitParent(monster, user))
                            {                                
                                if (submitAdoptionRequest)
                                {
                                    if (monster.adoption_applicants.indexOf(user_gitlab_id) == -1)
                                    {
                                        monster.adoption_applicants.push(user_gitlab_id)
                                        monster.save().then(()=> resolve(monster))
                                    }
                                }
                            }
                            resolve(monster) 
                        }  
                        else
                        {
                            resolve(monster)
                        }                      
                                                    
                    }, err => {resolve(monster)})                                        
                }  
                else reject()                               
            })
        })
    }

    getMonstersByRank(rankNumber: string): Promise<IMonsterModel[]> {
        return model.monster.find({ rank: rankNumber }).sort({monster_index:1}).exec();
    }

}
