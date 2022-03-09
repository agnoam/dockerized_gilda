import { meetupSchema } from './schemas/meetup';
import { IMeetupModel } from './models/meetup';

import mongoose = require("mongoose"); //import mongoose

import { IModel } from "./models/model"; //import IModel
import { IUserModel } from "./models/user"; //import IUserModel
import { userSchema } from "./schemas/user"; //import userSchema

import { IChallengeModel } from "./models/challenge"; //import IChallengeModel
import { challengeSchema } from "./schemas/challenge"; //import challengeSchema
import {cacheSchema} from "./schemas/cache";

import { IMonsterModel } from './models/monster';
import { monsterSchema } from './schemas/monster'; 
import { ICacheModel } from './models/cache';
import {IProjectModel} from './models/project';
import {ILabelModel} from './models/label'
import { projectSchema } from './schemas/project';
import {labelSchema} from './schemas/label';
import {gigSchema} from './schemas/gig';
import { IGigModel } from './models/gig';

require('dotenv').config()
//import * as ip from 'ip';
let dbServer = process.env.DB_SERVER || 'localhost';
let dbPort = process.env.DB_PORT;
let dbUsername = process.env.DB_USERNAME;
let dbPassword = process.env.DB_PASSWORD; 
let authString = '';

if (dbUsername && dbPassword)
    authString = `${dbUsername}:${dbPassword}@`;

const MONGODB_CONNECTION: string = `mongodb://${authString}${dbServer}:${dbPort}/Gilda?authSource=admin`;

var model: IModel = { 
    user: null, 
    challenge: null, 
    meetup: null, 
    monster: null, 
    cache:null, 
    project :null, 
    label:null,
    gig : null ,
    connection_string : MONGODB_CONNECTION}; //an instance of IModel


let connection: mongoose.Connection = mongoose.createConnection(MONGODB_CONNECTION); //, {useMongoClient: true} , auth: {user: dbUsername, pass: dbPassword}}); // v4


  
model.user = connection.model<IUserModel>("User", userSchema);
model.challenge = connection.model<IChallengeModel>("Challenge", challengeSchema);
model.meetup = connection.model<IMeetupModel>("Meetup", meetupSchema);
model.monster = connection.model<IMonsterModel>("Monster", monsterSchema);
model.cache = connection.model<ICacheModel>("Cache", cacheSchema);  
model.project = connection.model<IProjectModel>("Project", projectSchema);
model.label = connection.model<ILabelModel>("Label", labelSchema);
model.gig = connection.model<IGigModel>("Gig", gigSchema);

mongoose.Promise = Promise;
//model.reservation = connection.model<IResrvation>("Reservations", reservationSchema);   

export default model;

