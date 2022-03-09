"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marketplace_1 = require("./../marketplace");
const express = require("express");
const router = express.Router();
const marketplace = marketplace_1.MarketPlace.getMarketPlaceService();
router.get("/projects/:id/mattermost", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getProjectMatterostInviteLink(request.params.id)
        .then((res) => response.json(res), (err) => next(err));
});
router.get("/projects/:id/issues", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getProjectIssues(request.params.id)
        .subscribe((res) => response.json(res), (err) => next(err));
});
router.get("/projects/:id/", function (request, response, next) {
    marketplace.getProjectById(request.params.id, request.session.auth ? request.session.auth.user_id : undefined)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.put("/projects/star", function (request, response, next) {
    marketplace.starProject(request.body.project_id, request.session.auth.user_id, true)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.put("/projects/unstar", function (request, response, next) {
    marketplace.starProject(request.body.project_id, request.session.auth.user_id, false)
        .then((res) => response.json(res), (err) => next(err));
});
router.get("/projects", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getProjects(request.query)
        .then((res) => response.json(res), (err) => next(err));
});
router.get("/users/:id", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getUser(request.params.id)
        .then((res) => response.json(res), (err) => next(err));
});
router.get("/users", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getUsers(request.query)
        .then((res) => response.json(res), (err) => next(err));
});
router.get("/labels", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getLabels()
        .then((res) => response.json(res), (err) => next(err));
});
router.get("/languages", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getLanguages()
        .then((res) => response.json(res), (err) => next(err));
});
router.get("/tags", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getKnowledgeDomains()
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.put("/gigs/", 
// TODO: verify that the action is done by project owner
function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.updateGig(request.body.project_id, request.body.issue_iid, request.body.level, request.body.hours)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.post("/gigs", function (request, response, next) {
    //let gla = new GitLabAgent();
    // TODO: verify that the action is done by project owner
    marketplace.addGig(request.body.project_id, request.body.issue_iid, request.session.auth.user_id, request.body.hours, request.body.level)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.put("/gigs/userAssignment", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.updateUserAssignment(request.body.project_id, request.body.issue_iid, request.session.auth.user_id, request.body.assign_to_gig)
        .then((res) => response.json(res), (err) => next(err));
});
router.get("/gigs", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.getGigs(request.query)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.put("/user/skills", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.updateUserSkills(request.session.auth.user_id, request.body.labels)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.put("/user/fields", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.updateUserFieldsOfInterest(request.session.auth.user_id, request.body.labels)
        .then((res) => response.json(res), (err) => next(err));
});
// TODO - verify signedinuser
router.put("/user/autoupdate", function (request, response, next) {
    //let gla = new GitLabAgent();
    marketplace.updateUserAutoUpdate(request.session.auth.user_id, request.body.auto)
        .then((res) => response.json(res), (err) => next(err));
});
// router.get(
//     "/deletelabels",
//     function (request: Request, response: Response, next: NextFunction): void {
//         //let gla = new GitLabAgent();
//         marketplace.deleteAllLabels()
//         .then((res : Array<any>) => response.json(res), (err:any)=> next(err))               
//     })
//     router.get(
//         "/deleteissues",
//         function (request: Request, response: Response, next: NextFunction): void {
//             //let gla = new GitLabAgent();
//             marketplace.deleteAllIssues()
//             .then((res : Array<any>) => response.json(res), (err:any)=> next(err))               
//         })
exports.default = router;
//# sourceMappingURL=marketplace.js.map