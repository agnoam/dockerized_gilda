"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guild_users_1 = require("./../guild-users");
const challenges_1 = require("./../challenges");
const express = require("express");
const mail_1 = require("./../mail");
const meetups_1 = require("../meetups");
const monsters_1 = require("../monsters");
const router = express.Router();
router.get("/getusers", (request, response, next) => {
    let gsm = guild_users_1.GuildUsers.getGuildUsers();
    let userList = `username,name,email,gitlab user id,is active,` +
        `rank,score,` +
        `projects shared,challenges solved,members recommended,` +
        `pull reqs,projects,projects contributed\n`;
    gsm.getAllUsers().then(users => {
        for (const user of users) {
            userList += `${user.username},${user.name},${user.email},${user.gitlab_user_id},${user.active},` +
                `${user.rank},${user.score},` +
                `${user.badges.projects_shared.length},${user.badges.challenges_solved.length},${user.badges.members_recommended.length},` +
                `${user.badges.pull_requests.length},${user.badges.projects.length},${user.contributed_projects.length}\n`;
        }
        response
            .type("text/plain")
            .send(userList);
    });
});
router.get("/getmeetupusers", (request, response, next) => {
    //let gla = new GitLabAgent();
    let gsm = guild_users_1.GuildUsers.getGuildUsers();
    let meetups = new meetups_1.Meetups();
    let userList = '';
    meetups.getNextMeetup()
        .then((meetup) => {
        gsm.getAllUsers().then(users => {
            for (const user of users) {
                if (meetup.attending_list_gitlab_ids.findIndex((x) => x == user.gitlab_user_id) > -1) {
                    userList += `${user.username},${user.name},${user.email},${user.gitlab_user_id},${user.active}\n`;
                }
            }
            response
                .type("text/plain")
                .send(userList);
        });
    });
});
router.get("/sendmeetupreminder", (request, response, next) => {
    //let gla = new GitLabAgent();
    let mailSender = new mail_1.MailSender();
    let gsm = guild_users_1.GuildUsers.getGuildUsers();
    let meetups = new meetups_1.Meetups();
    meetups.getNextMeetup()
        .then((meetup) => gsm.getAllUsers().then(users => {
        let i = 1;
        while (users.length > 0) {
            let slice = users.splice(0, 20);
            setTimeout(mailSender.sendMeetupReminder2Users.bind(mailSender, slice, meetup), 1000 * 60 * i++); // Send in 5 minute intervals (20 users every 5 minutes)
        }
    }, (err) => next(err)));
    response
        .type("text/plain")
        .send("Mail Sent");
});
router.get("/sendsolution", (request, response, next) => {
    //let gla = new GitLabAgent();
    let challenges = challenges_1.Challenges.getInstance();
    challenges.weeklySchedule();
    response
        .type("text/plain")
        .send("Mail Sent");
});
router.get("/getadoptionapplicants", (request, response, next) => {
    //let gla = new GitLabAgent();
    let gsm = guild_users_1.GuildUsers.getGuildUsers();
    let monsters = new monsters_1.Monsters();
    let userList = '';
    monsters.getMonster4Adoption().then((monsters) => {
        if (monsters.length > 0) {
            let monster = monsters[0];
            for (const applicant_user_id of monster.adoption_applicants) {
                gsm.getUserByGitlabId(applicant_user_id).then((user) => {
                    userList += `${user.username},${user.name},${user.email},${user.gitlab_user_id},${user.active}\n`;
                });
            }
            response
                .type("text/plain")
                .send(userList);
        }
    });
});
router.get("/createusers", (request, response, next) => {
    //let gla = new GitLabAgent();
    let gsm = guild_users_1.GuildUsers.getGuildUsers();
    gsm.createGuildUsers();
    response
        .type("text/plain")
        .send("Users cerated");
});
router.get("/restore_recommendations", (request, response, next) => {
    //let gla = new GitLabAgent();
    let gsm = guild_users_1.GuildUsers.getGuildUsers();
    gsm.restore_recommended();
    response
        .type("text/plain")
        .send("Users updated");
});
router.get("/setuseravatar", (request, response, next) => {
    //let gla = new GitLabAgent();
    let gsm = guild_users_1.GuildUsers.getGuildUsers();
    gsm.setUsersAvatars();
    response
        .type("text/plain")
        .send("Users avatar");
});
router.get("/addmeetup", (request, response, next) => {
    let meetups = new meetups_1.Meetups();
    meetups.addMeetups();
    response
        .type("text/plain")
        .send("meetup created");
});
router.get("/alive", (request, response, next) => {
    response
        .type("text/plain")
        .send("Alive");
});
exports.default = router;
//# sourceMappingURL=admin.js.map