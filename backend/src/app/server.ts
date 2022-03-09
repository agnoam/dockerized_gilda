//import { GitLabAgent } from './gitlab-agent';
//import chalk = require( "chalk" );
import App from './app'
import { getLogger } from 'log4js';
import { ETCDConfig } from './configs/etcd.config';

require('dotenv').config()
const logger = getLogger();

ETCDConfig.initialize({ hosts: process.env.ETCD_HOST }, {
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

// Start listening on the public port.
const PORT: number = +process.env.PORT || 3000;
App.listen(PORT, (): void => {
    logger.debug(`Server started. Listening on port : ${PORT}`);
});

// Listen for uncaught exceptions - these are errors that are thrown outside the
// context of the Express.js route handlers and other proper async request handling.
process.on(
    "uncaughtException",
    function handleError(error: any): void {
        logger.fatal("Catastrophic error: " + error);
    }
);

