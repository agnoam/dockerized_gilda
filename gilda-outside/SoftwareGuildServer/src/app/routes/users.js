"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guild_users_1 = require("./../guild-users");
//import { GitLabAgent } from './../gitlabagent';
const express = require("express");
const router = express.Router();
const users = guild_users_1.GuildUsers.getGuildUsers();
// TODO - verify signedinuser
router.post("/", function (request, response, next) {
    //let gla = new GitLabAgent();
    users.recommendUser(request.session.auth.user_id, request.body.applicant)
        .then(() => response.json(request.body), (err) => next(err))
        .catch(err => response.status(400).json(err));
});
// TODO - verify signedinuser
router.post("/poke", function (request, response, next) {
    //let gla = new GitLabAgent();
    users.pokeMember(request.session.auth.username, request.body.guildMember)
        .then(() => response.json(request.body), (err) => next(err));
});
router.post("/ishurAvtam", function (request, response, next) {
    //let gla = new GitLabAgent();
    console.log("ishurAvtam", request.body);
    users.approveAvtamUser(request.session.auth.user_id, request.body.applicant)
        .then(() => response.json(request.body), (err) => next(err))
        .catch(err => response.status(400).json(err));
});
router.get("/signedin", function (request, response, next) {
    console.log("signedin");
    //let gla = new GitLabAgent();
    if (request.session.auth && request.session.auth.user_id) {
        console.log("request.session.auth", request.session.auth);
        users.getUserByGitlabId(request.session.auth.user_id)
            //users.getSignedInUser(request.headers.authorization as string)
            .then((res) => {
            response.json(res.username), (err) => next(err);
        })
            .catch(err => {
            response.status(403);
        });
    }
    else {
        response.status(401);
    }
});
router.get("/:id", function (request, response, next) {
    //let gla = new GitLabAgent();
    users.getUserByGitlabId(request.params.id)
        .then((user) => response.json(user), (err) => next(err));
});
router.get("/corp/:id", function (request, response, next) {
    //let gla = new GitLabAgent();
    users.getUserbyID(request.params.id)
        .then((user) => response.json(user), (err) => next(err));
});
router.get("/", function (request, response, next) {
    //let gla = new GitLabAgent();
    users.getAllUsers()
        .then((res) => response.json(res), (err) => next(err));
});
exports.default = router;
//# sourceMappingURL=users.js.map