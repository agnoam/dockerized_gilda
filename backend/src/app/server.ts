//import { GitLabAgent } from './gitlab-agent';
//import chalk = require( "chalk" );
import * as dotenv from 'dotenv';
dotenv.config();

// import { ETCDConfig } from './configs/etcd.config';
// import { DbConfig } from './db';
import { getLogger } from 'log4js';

import { ServerBoot } from './app';

(async () => {
    const logger = getLogger();

    // Start listening on the public port.
    const PORT: number = +process.env.PORT || 3000;
    new ServerBoot().express.listen(PORT, (): void => {
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
})();