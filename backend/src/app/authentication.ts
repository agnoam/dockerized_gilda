//import { getLogger } from 'log4js';

//const logger = getLogger();
import rp = require('request-promise');


export class AuthenticationAgent {
 

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
    getUserToken(requestToken : string)
    {
        
        let clientID = process.env.APPLICATION_ID;
        let clientSecret = process.env.APPLICATION_SECRET;
    
        return rp.post({
        // make a POST request
        method: 'post',
        // to the Github authentication API, with the client ID, client secret
        // and request token
        url: process.env.OAUTH_SERVER +
        `/oauth/token?`+
        `client_id=${clientID}&`+
        `client_secret=${clientSecret}&`+
        `code=${requestToken}&`+
        `grant_type=authorization_code&` +
        `redirect_uri=${process.env.AUTH_REDIRECTION_URI}`,
        // Set the content type header, so that we get the response in JSOn
        headers: {
            accept: 'application/json',
            json : true
        }
        }).catch(err =>
        {
            console.log(err)
        })
    }
}