import express = require("express");
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";
import { AuthenticationAgent } from "../authentication";
//import {GuildUsers} from './../guild-users';
//import App from '.././app'
//import {  getLogger } from 'log4js';
//import rp = require('request-promise');

//import rp = require('request-promise');

const router = express.Router()



    // router.get(
    //     '/login',
    //     function (req: Request, res: Response, next: NextFunction): void { 
    //         rp.get(
    //             process.env.OAUTH_SERVER +
    //             '/login/oauth/authorize?'  +  
    //             'client_id='+
    //             process.env.CLIENT_ID+    
    //             '&redirect_uri=' +
    //             process.env.SERVER +
    //             '/oauth/redirect' +
    //             '&response_type=code' +
    //             '&state='+ req.sessionID 
    //         )
    //         .then(response=>
    //         {               
    //             res.send(response)
    //             //console.log(res)
    //         })
    //     })
    
    
    router.get(
        '/redirect', 
        // The req.query object has the query params that
        // were sent to this route. We want the `code` param
        function (req: Request, res: Response, next: NextFunction): void { 
            console.log("redierct");
            
            //return res.redirect(`/oauth/token?code=${req.query.code}`)           
            //return res.redirect('/code?'+req.query.code)  
             new AuthenticationAgent().getUserToken(req.query.code as string)                    
            .then((response) => {
                // Once we get the response, extract the access token from
                // the response body
                const accessToken = JSON.parse(response).access_token
                //res.json(accessToken)                                                                                          
                    return res.redirect(`/oauth/session?access_token=${accessToken}&base_url=${req.query.state}`)//?access_token=${accessToken.split('&')[0].split('=')[1]}`)
            })               
                
                     
        })

        router.get('/session', function(req, res) {
            (req.session as any).auth = { token : req.query.access_token }
            res.cookie('authenticated', 'true')
            res.redirect(req.query.base_url as string)
        });
export default router;