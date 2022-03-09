"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import { GitLabAgent } from './gitlab-agent';
//import chalk = require( "chalk" );
const app_1 = require("./app");
const log4js_1 = require("log4js");
const logger = log4js_1.getLogger();
require('dotenv').config();
// Start listening on the public port.
app_1.default.listen(process.env.PORT, function () {
    logger.debug("Server started. Listening on port :" + process.env.PORT);
});
// Listen for uncaught exceptions - these are errors that are thrown outside the
// context of the Express.js route handlers and other proper async request handling.
process.on("uncaughtException", function handleError(error) {
    logger.fatal("Catastrophic error: " + error);
});
//# sourceMappingURL=server.js.map