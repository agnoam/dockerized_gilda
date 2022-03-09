"use strict";
//import { getLogger } from 'log4js';
Object.defineProperty(exports, "__esModule", { value: true });
//const logger = getLogger();
const rp = require("request-promise");
class AuthenticationAgent {
    // getCode()
    // {
    //     let redirect_url = process.env.OAUTH_SERVER+
    //     "/login/oauth/authorize?response_type=code&client_id="+
    //     process.env.APPLICATION_ID +
    //     "&state=shelly"+
    //     "&redirect_uri=" + 
    //     'http://loacalhost' +// process.env.SERVER + 
    //     "/oauth/redirect"
    //     rp.get(redirect_url)
    //     return redirect_url
    // }
    getUserToken(requestToken) {
        let clientID = process.env.APPLICATION_ID;
        let clientSecret = process.env.APPLICATION_SECRET;
        return rp.post({
            // make a POST request
            method: 'post',
            // to the Github authentication API, with the client ID, client secret
            // and request token
            url: process.env.OAUTH_SERVER +
                `/oauth/token?` +
                `client_id=${clientID}&` +
                `client_secret=${clientSecret}&` +
                `code=${requestToken}&` +
                `grant_type=authorization_code&` +
                `redirect_uri=${process.env.SERVER}:${process.env.PORT}/oauth/redirect`,
            // Set the content type header, so that we get the response in JSOn
            headers: {
                accept: 'application/json',
                json: true
            }
        }).catch(err => {
            console.log(err);
        });
    }
}
exports.AuthenticationAgent = AuthenticationAgent;
//# sourceMappingURL=authentication.js.map