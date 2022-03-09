"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guild_users_1 = require("./../guild-users");
//import {AuthenticationAgent} from './../authentication'
//import {getLogger} from 'log4js';
require('dotenv').config();
//const logger = getLogger();
// function getBearerToken(authHeader : string)
// {
//     let token : string = undefined
//     if (authHeader.startsWith('Bearer'))
//     {
//         token = authHeader.split('Bearer ')[1]        
//     }
//     return token
// }
function setAuthDataInSession(req, res, next, clientNavigation) {
    //let authHeader = JSON.parse(JSON.stringify(req.headers.authorization))
    //const token = getBearerToken(authHeader)
    let token = req.session.auth.token;
    if (token) {
        return verifyTokenAndGetUID(token)
            .then((user) => {
            let user_id = user.id;
            let username = user.username;
            req.session.auth = {
                user_id, username
            };
            req.session.save((err) => {
                //res.cookie('baseUrl', req.session.baseUrl)
                next();
            });
        })
            .catch((err) => {
            if (clientNavigation) {
                //res.cookie('baseUrl', req.baseUrl )
                return res.redirect(`/`);
            }
            else {
                return res.status(401).json({
                    status: 401,
                    message: 'UNAUTHORIZED'
                });
            }
        });
    }
}
function verifyTokenAndGetUID(token) {
    return guild_users_1.GuildUsers.getGuildUsers().getSignedInUser(token);
}
exports.isUserAuthenticated = (clientNavigation = false) => {
    return function (req, res, next) {
        // user data saved in session
        if (req.session.auth && req.session.auth.user_id) {
            //res.locals.auth.user_id = req.session.user_id
            next();
        }
        // user authenticated, but data not saved to session
        else if (req.session.auth && req.session.auth.token) {
            setAuthDataInSession(req, res, next, clientNavigation);
        }
        // User not authenticated
        // Allow get requests only
        else if (req.method == 'GET') {
            next();
        }
        // unauthorized
        else {
            if (clientNavigation) {
                return res.redirect('/');
            }
            else {
                return res.status(401).json({
                    status: 401,
                    message: 'UNAUTHORIZED'
                });
            }
        }
    };
};
exports.isUserAdmin = (req, res, next) => {
    try {
        let admins = process.env.GUILD_ADMIN_USERS;
        if (admins.indexOf(req.session.auth.username) != -1) {
            next();
        }
        else {
            return res.status(403).json({
                status: 403,
                message: 'FORBIDDEN'
            });
        }
    }
    catch (_a) {
        return res.status(401).json({
            status: 401,
            message: 'UNAUTHORIZED'
        });
    }
};
//# sourceMappingURL=authentication.js.map