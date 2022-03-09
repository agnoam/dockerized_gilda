import express = require( "express" );
import cors = require('cors')
import helmet = require('helmet')
import model from './db';

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
import marketplace_router from './routes/marketplace'
import authentication_router from './routes/authentication'
// import client_navigation_router from './routes/client-navigation'
import get_env_router from './routes/get-env'
import { GitLabAgent } from "./gitlab-agent";

import { configure, getLogger } from 'log4js';
import { isUserAuthenticated, isUserAdmin } from './middleware/authentication'
//import * as uuid from 'uuid/v4';
import * as session from 'express-session'
let MongoDBStore = require('connect-mongodb-session')(session);





require('dotenv').config();


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

class App {

  public express: Application

  constructor () {
    
    GitLabAgent.getGitLabAgent().init()    
    
    this.express = express()
    let store = new MongoDBStore({
        uri: model.connection_string,
        collection: 'sessions'
      });
      
      // Catch errors
    store.on('error', function(error: any) {
        logger.error(error);
    });
   
  
      
    this.express.use(bodyParser.urlencoded({
        extended: false
    }));

    

    let corsOptions = 
    {
        origin : (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) =>
        {
            let whiteList=['http://gilda', 'http://gitlab', 'http://localhost']
            for (let origin of whiteList)
            {
                if (!requestOrigin || requestOrigin.startsWith(origin))
                {
                    callback(null, true)
                    return
                }
            }               
            callback(new Error('Origin not allowed'))
            
        }
    }
    //let isOriginOK = 
        
    //TODO : use path
    //this.express.use(express.static(path.join(__dirname, 'public')));
   
    this.express.use(helmet())
    this.express.use(bodyParser.json());
    this.express.use(cors(corsOptions))
    
    // TODO: Don't forget to uncoment the session middleware
    this.express.use(session(
    {              
        secret: process.env.APPLICATION_SECRET,
        store: store,
        
        resave: true,
        saveUninitialized: true,
        //cookie : {httpOnly: true}

        // store: new FileStore(),   
        //  resave: false,
        //  saveUninitialized: true
    }
    ))

    this.express.set('sessions-store', store)
   
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
      
      
      
    // TODO: Remove web server static serving
    //this.express.use(isUserAuthenticated)
    // this.express.use(express.static(path.join(__dirname,'dist')))
    // this.express.use(express.static(path.join(__dirname,'assets')))
    // this.express.use(express.static(path.join(__dirname,'images')))
    //this.express.use(cors({origin:'*',}))
    this.express.use(
        function (error: any, request: Request, response: Response, next: NextFunction): void {
    
            response
                .status(500)
                .type("text/plain")
                .send("Something went wrong: " + error);
    
        }
    )

    // IMPL
   
    this.express.use('/oauth', authentication_router)
    this.express.use('/systemeventslistener', listener_router)
    this.express.use('/admin', [isUserAuthenticated(false), isUserAdmin], admin_router)
    this.express.use('/challenges', [isUserAuthenticated(false)], challenges_router)
    this.express.use('/users', [isUserAuthenticated(false)], users_router)
    this.express.use('/meetups', [isUserAuthenticated(false)], meetups_router)
    this.express.use('/monsters', [isUserAuthenticated(false)], monsters_router);
    this.express.use('/marketplace', [isUserAuthenticated(false)], marketplace_router);
    this.express.use('/env', get_env_router)
    // this.express.use('/*', client_navigation_router);

  }
  
}

export default new App().express
