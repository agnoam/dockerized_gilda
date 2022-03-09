"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const challenges_1 = require("./../challenges");
const express = require("express");
const router = express.Router();
const challenges = challenges_1.Challenges.getInstance();
router.get("/", function (request, response, next) {
    challenges.getPastChallenges()
        .then((res) => response.json(res), (err) => next(err));
});
router.post("/current", function (request, response, next) {
    // POST arguments:
    // username
    // year
    // week
    challenges.getCurrentChallenge(request.body.year, request.body.week, request.session.auth.user_id)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.post("/test", function (request, response, next) {
    // POST arguments:
    // username
    // id
    // solution
    challenges.testChallenge(request.session.auth.user_id, request.body.id, request.body.solution)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.post("/hint", function (request, response, next) {
    // POST arguments:
    // username
    // id
    challenges.getChallengeHint(request.session.auth.user_id, request.body.id)
        .then((res) => response.json(res), (err) => next(err));
});
router.post("/add", function (request, response, next) {
    // POST arguments:
    // title
    // challenge
    // info
    // image
    // score
    // hint
    // hintprice
    // keyboard 
    // solution
    // year
    // week
    // author
    let c = {
        title: request.body.title,
        challenge: request.body.challenge,
        info: request.body.info,
        image: request.body.image,
        score: request.body.score,
        hint: { text: request.body.hint, price: request.body.hintprice },
        keyboard: challenges.string2keyboard(request.body.keyboard),
        solution: challenges.string2solution(request.body.solution),
        year: request.body.year,
        week: request.body.week,
        author: request.body.author
    };
    challenges.addChallenge(c)
        .then((res) => response.json(res), (err) => next(err));
});
exports.default = router;
//# sourceMappingURL=challenges.js.map