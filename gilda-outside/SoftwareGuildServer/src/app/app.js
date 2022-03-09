"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db_1 = require("./db");
const bodyParser = require("body-parser");
const path = require("path");
const admin_1 = require("./routes/admin");
const users_1 = require("./routes/users");
const challenges_1 = require("./routes/challenges");
const meetup_1 = require("./routes/meetup");
const gitlab_listener_1 = require("./routes/gitlab-listener");
const monsters_1 = require("./routes/monsters");
const marketplace_1 = require("./routes/marketplace");
const authentication_1 = require("./routes/authentication");
const client_navigation_1 = require("./routes/client-navigation");
const gitlab_agent_1 = require("./gitlab-agent");
const log4js_1 = require("log4js");
const authentication_2 = require("./middleware/authentication");
//import * as uuid from 'uuid/v4';
const session = require("express-session");
let MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();
log4js_1.configure({
    appenders: {
        serverlog: {
            type: 'file',
            filename: 'logs/server.log',
            maxLogSize: 10 * 1024 * 1024,
            numBackups: 10,
            compress: true
        },
        console: { type: "console" }
    },
    categories: {
        default: { appenders: ["console", "serverlog"], level: "error" }
    }
});
const logger = log4js_1.getLogger();
logger.level = "debug";
class App {
    constructor() {
        gitlab_agent_1.GitLabAgent.getGitLabAgent().init();
        this.express = express();
        let store = new MongoDBStore({
            uri: db_1.default.connection_string,
            collection: 'sessions'
        });
        // Catch errors
        store.on('error', function (error) {
            logger.error(error);
        });
        this.express.use(bodyParser.urlencoded({
            extended: false
        }));
        let corsOptions = {
            origin: (requestOrigin, callback) => {
                let whiteList = ['http://gilda', 'http://gitlab', 'http://localhost'];
                for (let origin of whiteList) {
                    if (!requestOrigin || requestOrigin.startsWith(origin)) {
                        callback(null, true);
                        return;
                    }
                }
                callback(new Error('Origin not allowed'));
            }
        };
        //let isOriginOK = 
        //TODO : use path
        //this.express.use(express.static(path.join(__dirname, 'public')));
        this.express.use(helmet());
        this.express.use(bodyParser.json());
        this.express.use(cors(corsOptions));
        this.express.use(session({
            secret: process.env.APPLICATION_SECRET,
            store: store,
            resave: true,
            saveUninitialized: true,
        }));
        this.express.set('sessions-store', store);
        // this.express.use(session({
        //     genid: (req) => {
        //       console.log('Inside the session middleware')
        //       console.log(req.sessionID)
        //       return uuid() // use UUIDs for session IDs
        //     },
        //     store: new FileStore(),
        //     secret: process.env.APPLICATION_SECRET,
        //     resave: false,
        //     saveUninitialized: true
        //   }))
        //this.express.use(isUserAuthenticated)
        this.express.use(express.static(path.join(__dirname, 'dist')));
        this.express.use(express.static(path.join(__dirname, 'assets')));
        this.express.use(express.static(path.join(__dirname, 'images')));
        //this.express.use(cors({origin:'*',}))
        this.express.use(function (error, request, response, next) {
            response
                .status(500)
                .type("text/plain")
                .send("Something went wrong: " + error);
        });
        // IMPL
        this.express.use('/oauth', authentication_1.default);
        this.express.use('/systemeventslistener', gitlab_listener_1.default);
        this.express.use('/admin', [authentication_2.isUserAuthenticated(false), authentication_2.isUserAdmin], admin_1.default);
        this.express.use('/challenges', [authentication_2.isUserAuthenticated(false)], challenges_1.default);
        this.express.use('/users', [authentication_2.isUserAuthenticated(false)], users_1.default);
        this.express.use('/meetups', [authentication_2.isUserAuthenticated(false)], meetup_1.default);
        this.express.use('/monsters', [authentication_2.isUserAuthenticated(false)], monsters_1.default);
        this.express.use('/marketplace', [authentication_2.isUserAuthenticated(false)], marketplace_1.default);
        this.express.use('/*', client_navigation_1.default);
    }
}
exports.default = new App().express;
//# sourceMappingURL=app.js.map