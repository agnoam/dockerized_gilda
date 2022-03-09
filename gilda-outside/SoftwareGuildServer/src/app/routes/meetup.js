"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meetups_1 = require("./../meetups");
//import { GitLabAgent } from './../gitlabagent';
const express = require("express");
const router = express.Router();
const meetups = new meetups_1.Meetups();
// TODO - verify signedinuser
router.post("/", function (request, response, next) {
    //let gla = new GitLabAgent();
    meetups.registerUser(request.session.auth.user_id)
        .then((user) => response.json(user), (err) => next(err));
});
// TODO - verify signedinuser
router.delete("/", function (request, response, next) {
    meetups.unregisterUser(request.session.auth.user_id)
        .then((user) => response.json(user), (err) => next(err));
});
router.get("/", function (request, response, next) {
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    meetups.getAllMeetups()
        .then((meetups) => response.json(meetups), (err) => next(err));
});
router.get("/attending", function (request, response, next) {
    //let gla = new GitLabAgent();        
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    meetups.getAttendingList()
        .then((users) => response.json(users), (err) => next(err));
});
router.get("/waiting", function (request, response, next) {
    //let gla = new GitLabAgent();
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    meetups.getWaitingList()
        .then((users) => response.json(users), (err) => next(err));
});
router.get("/next", function (request, response, next) {
    //let gla = new GitLabAgent();
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    meetups.getNextMeetup()
        .then((res) => response.json(res), (err) => next(err));
});
exports.default = router;
//# sourceMappingURL=meetup.js.map