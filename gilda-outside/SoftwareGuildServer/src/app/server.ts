//import { GitLabAgent } from './gitlab-agent';
//import chalk = require( "chalk" );
import App from './app'
import { getLogger } from 'log4js';

 const logger = getLogger();


require('dotenv').config()


// Start listening on the public port.
App.listen(
    process.env.PORT,
    function (): void {
        logger.debug("Server started. Listening on port :" + process.env.PORT);
    }
);



// Listen for uncaught exceptions - these are errors that are thrown outside the
// context of the Express.js route handlers and other proper async request handling.
process.on(
    "uncaughtException",
    function handleError(error: any): void {
        logger.fatal("Catastrophic error: " + error);
    }
);

