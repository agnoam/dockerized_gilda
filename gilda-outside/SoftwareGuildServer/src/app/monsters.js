"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guild_users_1 = require("./guild-users");
const db_1 = require("./db");
const log4js_1 = require("log4js");
const IMonster_1 = require("./interfaces/IMonster");
const marketplace_1 = require("./marketplace");
const logger = log4js_1.getLogger();
class Monsters {
    constructor() {
    }
    createMonsters() {
        for (let i = 1; i < 7; i++) {
            for (let j = 1; j < 6; j++) {
                this.addMonster({
                    name: "AnonyMonster" + i + j,
                    parent: 0,
                    rank: `0${i}`,
                    monster_index: `0${j}`,
                });
            }
        }
    }
    getMonster4Adoption() {
        let query = db_1.default.monster.find()
            .and([
            { 'monster_adoption_criteria': { '$ne': [] } },
            { 'parent': 0 }
        ]);
        return query.exec();
    }
    addMonster(monster) {
        return new Promise((resolve, reject) => {
            db_1.default.monster.create(monster).then(() => {
                logger.info("New monster added " + monster.rank);
                resolve(true);
            });
        });
    }
    isFitParent(monster, user) {
        let fitParent = true;
        let gigs_publishers = marketplace_1.MarketPlace.getMarketPlaceService().getGigsPublishers();
        monster.monster_adoption_criteria.forEach((criterion, index) => {
            if (criterion.action == IMonster_1.Action.gitlab_user.toString()) {
                criterion.completion = user.badges.gitlab_user ? 1 : 0;
            }
            else if (criterion.action == IMonster_1.Action.add_project.toString()) {
                criterion.completion = user.badges.projects.length;
            }
            else if (criterion.action == IMonster_1.Action.contribute_code.toString()) {
                criterion.completion = user.contributed_projects.length;
            }
            else if (criterion.action == IMonster_1.Action.pull_request.toString()) {
                criterion.completion = user.badges.pull_requests.length + user.badges.contributed_pull_requests.length;
            }
            else if (criterion.action == IMonster_1.Action.recommend_applicant.toString()) {
                criterion.completion = user.badges.members_recommended.length;
            }
            else if (criterion.action == IMonster_1.Action.set_avatar.toString()) {
                criterion.completion = user.avatar_url.endsWith('head-from-gitlab-logo-small-min.png') ? 0 : 1;
            }
            else if (criterion.action == IMonster_1.Action.share_code.toString()) {
                criterion.completion = user.badges.projects_shared.length;
            }
            else if (criterion.action == IMonster_1.Action.solve_challange.toString()) {
                criterion.completion = user.badges.challenges_solved.length;
            }
            else if (criterion.action == IMonster_1.Action.mattermost_user.toString()) {
                criterion.completion = user.mettermost_user != "" ? 1 : 0;
            }
            else if (criterion.action == IMonster_1.Action.publish_gig.toString()) {
                criterion.completion = gigs_publishers.filter(x => x == user.gitlab_user_id).length;
            }
            else if (criterion.action == IMonster_1.Action.gitlab_bio.toString()) {
                criterion.completion = (user.bio && user.bio != null && user.bio != '') ? 1 : 0;
            }
            else if (criterion.action == IMonster_1.Action.user_skill_tags.toString()) {
                criterion.completion = user.skills_tags.length;
            }
            else if (criterion.action == IMonster_1.Action.user_fields_of_interest_tags.toString()) {
                criterion.completion = user.wants_to_learn_tags.length;
            }
            else if (criterion.action == IMonster_1.Action.user_skill_langs.toString()) {
                criterion.completion = user.skills_langs.length;
            }
            else if (criterion.action == IMonster_1.Action.user_fields_of_interest_langs.toString()) {
                criterion.completion = user.wants_to_learn_tags.length;
            }
            if (criterion.completion < criterion.count)
                fitParent = false;
            monster.monster_adoption_criteria[index].completion = criterion.completion;
        }, this);
        return fitParent;
    }
    applyForAdoption(user_gitlab_id, submitAdoptionRequest = false) {
        return new Promise((resolve, reject) => {
            let gsm = guild_users_1.GuildUsers.getGuildUsers();
            this.getMonster4Adoption().then((monsters) => {
                if (monsters.length > 0) {
                    let monster = monsters[0];
                    gsm.getUserByGitlabId(user_gitlab_id).then((user) => {
                        if (user) {
                            if (this.isFitParent(monster, user)) {
                                if (submitAdoptionRequest) {
                                    if (monster.adoption_applicants.indexOf(user_gitlab_id) == -1) {
                                        monster.adoption_applicants.push(user_gitlab_id);
                                        monster.save().then(() => resolve(monster));
                                    }
                                }
                            }
                            resolve(monster);
                        }
                        else {
                            resolve(monster);
                        }
                    }, err => { resolve(monster); });
                }
                else
                    reject();
            });
        });
    }
    getMonstersByRank(rankNumber) {
        return db_1.default.monster.find({ rank: rankNumber }).sort({ monster_index: 1 }).exec();
    }
}
exports.Monsters = Monsters;
//# sourceMappingURL=monsters.js.map