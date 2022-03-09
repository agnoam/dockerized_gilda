"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meetup_1 = require("./schemas/meetup");
const mongoose = require("mongoose"); //import mongoose
const user_1 = require("./schemas/user"); //import userSchema
const challenge_1 = require("./schemas/challenge"); //import challengeSchema
const cache_1 = require("./schemas/cache");
const monster_1 = require("./schemas/monster");
const project_1 = require("./schemas/project");
const label_1 = require("./schemas/label");
const gig_1 = require("./schemas/gig");
require('dotenv').config();
//import * as ip from 'ip';
let dbServer = process.env.DB_SERVER || 'localhost';
let dbPort = process.env.DB_PORT;
let dbUsername = process.env.DB_USERNAME;
let dbPassword = process.env.DB_PASSWORD;
let authString = '';
if (dbUsername && dbPassword)
    authString = `${dbUsername}:${dbPassword}@`;
const MONGODB_CONNECTION = `mongodb://${authString}${dbServer}:${dbPort}/Gilda?authSource=admin`;
var model = {
    user: null,
    challenge: null,
    meetup: null,
    monster: null,
    cache: null,
    project: null,
    label: null,
    gig: null,
    connection_string: MONGODB_CONNECTION
}; //an instance of IModel
let connection = mongoose.createConnection(MONGODB_CONNECTION, { useMongoClient: true }); //, auth: {user: dbUsername, pass: dbPassword}});
model.user = connection.model("User", user_1.userSchema);
model.challenge = connection.model("Challenge", challenge_1.challengeSchema);
model.meetup = connection.model("Meetup", meetup_1.meetupSchema);
model.monster = connection.model("Monster", monster_1.monsterSchema);
model.cache = connection.model("Cache", cache_1.cacheSchema);
model.project = connection.model("Project", project_1.projectSchema);
model.label = connection.model("Label", label_1.labelSchema);
model.gig = connection.model("Gig", gig_1.gigSchema);
mongoose.Promise = Promise;
//model.reservation = connection.model<IResrvation>("Reservations", reservationSchema);   
exports.default = model;
//# sourceMappingURL=db.js.map