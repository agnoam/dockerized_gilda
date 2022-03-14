import express = require( "express" );
// import cors = require('cors')
// import helmet = require('helmet')
import { DbConfig } from './db';

import { Application } from "express";
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";

import bodyParser = require( "body-parser" );
// import path = require('path');
import admin_router from './routes/admin'
import users_router from './routes/users'
import challenges_router from './routes/challenges'
import meetups_router from './routes/meetup'
import listener_router from './routes/gitlab-listener'
import monsters_router from './routes/monsters'
import { initializeRoute } from './routes/marketplace'
import authentication_router from './routes/authentication'
// import client_navigation_router from './routes/client-navigation'
import get_env_router from './routes/get-env'
import { GitLabAgent } from "./gitlab-agent";

import { configure, getLogger } from 'log4js';
import { isUserAuthenticated, isUserAdmin } from './middleware/authentication'
//import * as uuid from 'uuid/v4';
import * as session from 'express-session'
let MongoDBStore = require('connect-mongodb-session')(session);

import { ETCDConfig } from './configs/etcd.config';

configure({
    appenders: { 
        serverlog: {
            type: 'file',
            filename: 'logs/server.log',
            maxLogSize: 10 * 1024 * 1024, // 10Mb
            numBackups: 10,
            compress: true
        },   
        console: { type: "console" }
    },
    categories: {
        default: { appenders: ["console", "serverlog"], level: "error" } 
    }
});

const logger = getLogger();
logger.level = "debug";

export class ServerBoot {
    public express: Application;
    private store: any;
    // private readonly corsOptions = {
    //     origin : (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) => {
    //         logger.info('CORS received request from:', requestOrigin);
    //         let whiteList=['http://gilda', 'http://gitlab', 'http://localhost']
    //         for (let origin of whiteList) {
    //             if (!requestOrigin || requestOrigin.startsWith(origin)) {
    //                 callback(null, true)
    //                 return
    //             }
    //         }               

    //         callback(new Error('Origin not allowed'));
    //     }
    // }

    constructor () {
        GitLabAgent.getGitLabAgent().init();
        this.express = express();
        this.initialize();
    }

    public async initialize(): Promise<void> {
        await this.loadConfigs();
        this.loadMiddlewares();
        this.loadRoutes();
    }

    async loadConfigs(): Promise<void> {
        logger.info('Loading configurations');
        await ETCDConfig.initialize({ hosts: process.env.ETCD_HOST }, {
            configs: {
                genKeys: true,
                overrideSysObj: true,
                watchKeys: true
            },
            envParams: {
                GITLAB_API_URL: '<api-url>',
                GITLAB_PRIVATE_TOKEN: '<private-token>',
                GUILD_ADMIN_USERS: '[admin1, admin2]',
                PORT: '3000',
                MAIL_SERVER: '',
                SEND_EMAIL: '',
                EMAIL_BCC: '',
                DEBUG_MAIL_TO: '',
                DB_SERVER: '',
                DB_USERNAME: '',
                DB_PASSWORD: '',
                MATTERMOST_API_URL: '',
                MATTERMOST_PRIVATE_TOKEN: '',
                APPLICATION_ID: '',
                APPLICATION_SECRET: '',
                SERVER: '',
                OAUTH_SERVER: ''
            }
        });
        
        DbConfig.initilize();
        this.store = new MongoDBStore({
            uri: DbConfig.MONGODB_CONNECTION,
            collection: 'sessions'
        });
    }

    loadMiddlewares(): void {
        logger.info('Loading middlewares handlers');

        this.store.on('error', function(error: any) {
            logger.error(error);
        });
            
        this.express.use(bodyParser.urlencoded({
            extended: false
        }));
        this.express.use(bodyParser.json());

        // this.express.use(helmet());
        // this.express.use(cors(this.corsOptions));
        // this.express.use(session({              
        //     secret: process.env.APPLICATION_SECRET,
        //     store: this.store,       
        //     resave: true,
        //     saveUninitialized: true
        // }))
        // this.express.set('sessions-store', this.store);

        // TODO: Remove this middleware
        this.express.use((req: Request, res: Response, next: NextFunction) => {
            logger.info(`middleware accepted new request to: ${req.path}`);
            next();
        });
    }
  
    loadRoutes(): void {
        logger.info('Loading routes handlers');

        this.express.use('/oauth', authentication_router)
        this.express.use('/systemeventslistener', listener_router)
        this.express.use('/admin', [isUserAuthenticated(false), isUserAdmin], admin_router)
        this.express.use('/challenges', [isUserAuthenticated(false)], challenges_router)
        this.express.use('/users', [isUserAuthenticated(false)], users_router)
        this.express.use('/meetups', [isUserAuthenticated(false)], meetups_router)
        this.express.use('/monsters', [isUserAuthenticated(false)], monsters_router);
        this.express.use('/marketplace', [isUserAuthenticated(false)], initializeRoute());
        this.express.use('/env', get_env_router)
        this.express.use('/', (req, res) => res.json({ test: 1234 }));
        // this.express.use('/*', client_navigation_router);
    }
}