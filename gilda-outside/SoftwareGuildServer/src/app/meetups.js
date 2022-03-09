"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const mail_1 = require("./mail");
const guild_users_1 = require("./guild-users");
//import * as moment from 'moment';
const log4js_1 = require("log4js");
const logger = log4js_1.getLogger();
const MAX_MEETUP_ATTENDEES = 150;
//const MEETUP_FULL_THRESHOLD = 100;
class Meetups {
    constructor() {
        setInterval(this.handleWaitingList.bind(this), 1000 * 60 * 60 * 8); // Every 8 hours           
    }
    getAllMeetups() {
        let query = db_1.default.meetup.find({}).sort({ date: -1 });
        return query.exec();
    }
    addMeetups() {
        let meetup = {
            email: 'After almost 15 years of standing still, ECMAScript (A.K.A JavaScript) is going through major changes. ' +
                'Using latest standards you can now define classes, lambda expressions, properties, import/export, decorator, reflection and other goodies. ' +
                'The new language specification makes JavaScript a programming language that is suited not just for Web development but also for enterprise scale. ' +
                'During this session we will cover all major features/topics of the new ECMAScript standard.',
            waiting_list_gitlab_ids: [],
            attending_list_gitlab_ids: [],
            subject: 'ECMAScript 6 and The Future of JavaScript',
            description: 'ECMAScript (A.K.A JavaScript) is going through major changes. We will cover all major features/topics of the new ECMAScript standard.',
            location: 'MATAM Auditorium, Haifa',
            date: new Date("2018-06-04 09:00:00.000Z"),
            calendar_ics: 'meetup-monday-ECMAScript6.ics',
            resources_url: ''
        };
        let newMeetup = new db_1.default.meetup(meetup);
        newMeetup.save();
    }
    getAttendingList() {
        return new Promise((resolve, reject) => {
            this.getNextMeetup().then((nextMeetup) => {
                resolve(nextMeetup.attending_list_gitlab_ids);
            }, (err) => { reject(); });
        });
    }
    getWaitingList() {
        return new Promise((resolve, reject) => {
            this.getNextMeetup().then((nextMeetup) => {
                resolve(nextMeetup.waiting_list_gitlab_ids);
            }, (err) => { reject(); });
        });
    }
    registerUser(gitlab_user_id) {
        return new Promise((resolve, reject) => {
            this.getNextMeetup().then((nextMeetup) => {
                if (nextMeetup.attending_list_gitlab_ids.findIndex((x) => x == gitlab_user_id) == -1 &&
                    nextMeetup.waiting_list_gitlab_ids.findIndex((x) => x == gitlab_user_id) == -1) {
                    nextMeetup.waiting_list_gitlab_ids.push(gitlab_user_id);
                    logger.info(`Register User ${gitlab_user_id} for meetup ${nextMeetup.subject}`);
                    nextMeetup.save();
                    new mail_1.MailSender().sendMeetupRegistrationAck(gitlab_user_id, nextMeetup);
                    resolve(gitlab_user_id);
                }
                else {
                    reject();
                }
            });
        });
    }
    unregisterUser(gitlab_user_id) {
        return new Promise((resolve, reject) => {
            this.getNextMeetup().then((nextMeetup) => {
                const i = nextMeetup.attending_list_gitlab_ids.findIndex((x) => x == gitlab_user_id);
                //the user is already registered
                if (i != -1) {
                    nextMeetup.attending_list_gitlab_ids.splice(i, 1);
                }
                else {
                    const j = nextMeetup.waiting_list_gitlab_ids.findIndex((x) => x == gitlab_user_id);
                    if (j != -1) {
                        nextMeetup.waiting_list_gitlab_ids.splice(j, 1);
                    }
                    else {
                        reject();
                    }
                }
                logger.info(`Unregister User ${gitlab_user_id} from meetup ${nextMeetup.subject}`);
                nextMeetup.save();
                new mail_1.MailSender().sendMeetupUnregistrationAck(gitlab_user_id, nextMeetup);
                resolve(gitlab_user_id);
            });
        });
    }
    getNextMeetup() {
        return new Promise((resolve, reject) => {
            db_1.default.meetup.findOne().
                where('date').gt(Date.now()).
                sort('date').
                exec(function (err, doc) {
                if (doc != null)
                    resolve(doc);
                else
                    resolve(null);
            });
        });
    }
    handleWaitingList() {
        this.getNextMeetup().then((meetup) => {
            if (meetup === null)
                return;
            let attending = meetup.attending_list_gitlab_ids.length;
            if (attending < MAX_MEETUP_ATTENDEES) {
                this.approveAttendees(meetup, MAX_MEETUP_ATTENDEES - attending);
            }
        }, (err) => { logger.error(`Error getting next meetup: ${err}`); });
    }
    approveAttendees(meetup, howMany) {
        let gsm = guild_users_1.GuildUsers.getGuildUsers();
        let promises = [];
        let users = [];
        meetup.waiting_list_gitlab_ids.forEach(id => {
            promises.push(gsm.getUserByGitlabId(id).then((user) => {
                users.push(user);
            }));
        });
        Promise.all(promises).then(() => {
            users.sort((a, b) => (b.score - a.score));
            users = users.slice(0, howMany);
            users.forEach(user => {
                logger.info(`Approving user ${user.name} for next meetup`);
                let index = meetup.waiting_list_gitlab_ids.findIndex((x) => x == user.gitlab_user_id);
                if (index >= 0) {
                    meetup.waiting_list_gitlab_ids.splice(index, 1);
                }
                meetup.attending_list_gitlab_ids.push(user.gitlab_user_id);
                meetup.save();
                new mail_1.MailSender().sendMeetupApproval(user, meetup);
            });
        });
        //         var points = [40, 100, 1, 5, 25, 10];
        //  points.sort(function(a, b){return a-b});
    }
}
exports.Meetups = Meetups;
//# sourceMappingURL=meetups.js.map