import express = require( "express" );
import cors = require('cors')
import helmet = require('helmet')
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
const MongoDBStore = require('connect-mongodb-session')(session);

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

    constructor () {
        this.express = express();
        this.initialize();
    }

    public async initialize(): Promise<void> {
        try {
            await this.loadConfigs();
            this.loadMiddlewares();
            this.loadRoutes();
        } catch (ex) {
            logger.error(`Initialization failed with ex: ${ex}`);
        }
    }

    async loadConfigs(): Promise<void> {
        try {
            logger.info('Loading configurations');
            await ETCDConfig.initialize({ hosts: process.env.ETCD_HOST }, {
                configs: {
                    genKeys: true,
                    overrideSysObj: true,
                    watchKeys: true
                },
                envParams: {
                    ETCD_PUBLIC_DIR_PREFIX: 'gilda-client',
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
                    MONGODB_CONNECTION: '',
                    ENABLE_CORS: 'false',
                    MATTERMOST_API_URL: '',
                    MATTERMOST_PRIVATE_TOKEN: '',
                    APPLICATION_ID: '',
                    APPLICATION_SECRET: '',
                    SERVER: '',
                    OAUTH_SERVER: '',
                    AUTH_REDIRECTION_URI: ''
                }
            });
            
            DbConfig.initilize();
            GitLabAgent.getGitLabAgent().init();
            this.store = new MongoDBStore({
                uri: DbConfig.MONGODB_CONNECTION,
                collection: 'sessions'
            },
            (err: any) => {
                logger.error('MongoDB session store error:', err);
                this.store = new session.MemoryStore();
                logger.info('Session store has been changed to MemoryStore due to MongoDB session store error');
            });
        } catch (ex) {
            logger.error(`Exception occured at loadConfigs(): ${ex}`);
        }
    }

    loadMiddlewares(): void {
        logger.info('Loading middlewares handlers');

        this.store?.on('error', (error: any) => {
            logger.error(error);
        });
            
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(bodyParser.json());

        logger.info('Length of APPLICATION_SECRET:', `${process.env.APPLICATION_SECRET}`.length);
        this.express.use(helmet());
        
        if (process.env.ENABLE_CORS) {
            this.express.use(cors({}));
        }

        // this.express.use(cors({
            // origin : (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) => {
            //     let whiteList=['http://gilda', 'http://gitlab', 'http://localhost']
            //     for (let origin of whiteList) {
            //         if (!requestOrigin || requestOrigin.startsWith(origin)) {
            //             logger.error('CORS continues');
            //             callback(null, true)
            //             return
            //         }
            //     }               
    
            //     logger.error('CORS caught request from not allowed origin');
            //     callback(new Error('Origin not allowed'));
            // }
        // }));

        this.express.set('sessions-store', this.store);
        this.express.use(session({
            secret: process.env.APPLICATION_SECRET,
            store: this.store, // new session.MemoryStore(),
            resave: true,
            saveUninitialized: true
        }))

        // TODO: Remove this middleware
        this.express.use((req: Request, res: Response, next: NextFunction) => {
            logger.info(`Middleware accepted new request to: ${req.path}`);
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
        this.express.get('/', (req, res) => res.status(200).send('Server alive'));
        // this.express.use('/*', client_navigation_router);
    }
}