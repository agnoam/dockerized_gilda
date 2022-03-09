"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { Subject } from 'rxjs/Subject';
const rp = require("request-promise");
// //import {BehaviouSubject} from 'rxjs/BehaviorSubject'
// import { Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/fromPromise';
// import * as fs from 'fs';
// import * as ip from 'ip';
const log4js_1 = require("log4js");
const logger = log4js_1.getLogger();
//import * as download from 'download';
class MatterMostAgent {
    constructor() {
        require('dotenv').config();
        this.apiUrl = process.env.MATTERMOST_API_URL;
        this.private_token = process.env.MATTERMOST_PRIVATE_TOKEN;
    }
    static getMatterMostAgent() {
        if (!MatterMostAgent.instance)
            MatterMostAgent.instance = new MatterMostAgent();
        return MatterMostAgent.instance;
    }
    getDataFromMatterMostServer$(url, params = '') {
        let options = {
            uri: url + params,
            headers: { "authorization": "Bearer " + this.private_token },
            json: true
        };
        logger.log("kuku");
        return rp.get(options);
    }
    getUsers() {
        return new Promise((resolve, reject) => {
            this.getDataFromMatterMostServer$(this.apiUrl + '/users')
                .then((res) => resolve(res), err => resolve([]));
        });
    }
    getWebHook(id) {
        return new Promise((resolve, reject) => {
            this.getDataFromMatterMostServer$(this.apiUrl + '/hooks/incoming/' + id)
                .then((res) => resolve(res), err => reject());
        });
    }
    getTeam(id) {
        return new Promise((resolve, reject) => {
            this.getDataFromMatterMostServer$(this.apiUrl + '/teams/' + id)
                .then((res) => resolve(res), err => reject());
        });
    }
    getTeamInviteLink(id) {
        return new Promise((resolve, reject) => {
            this.getTeam(id)
                .then((res) => {
                resolve('http://mattermost/signup_user_complete/?id=' + res.invite_id);
            }, err => resolve(''));
        });
    }
    getInviteLinkByWebHook(id) {
        return new Promise((resolve, reject) => {
            this.getWebHook(id)
                .then(res => this.getTeamInviteLink(res.team_id)
                .then(res => resolve(res), err => resolve('')), err => resolve(''));
        });
    }
    getUser(username) {
        return new Promise((resolve, reject) => {
            this.getDataFromMatterMostServer$(this.apiUrl + '/users/username/', username)
                .then((res) => resolve(res.id), err => reject());
        });
    }
}
exports.MatterMostAgent = MatterMostAgent;
//# sourceMappingURL=mattermost-agent.js.map