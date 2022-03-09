
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";
import {GuildUsers} from './../guild-users';
//import {AuthenticationAgent} from './../authentication'

//import {getLogger} from 'log4js';
require('dotenv').config()


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

function setAuthDataInSession(req : Request, res : Response,  next : NextFunction, clientNavigation : boolean)
{
    //let authHeader = JSON.parse(JSON.stringify(req.headers.authorization))
    //const token = getBearerToken(authHeader)
    let token = (req.session as any).auth.token
    if (token) {
      return verifyTokenAndGetUID(token)
        .then((user : any) => {
          // let user_id = user.id
          // const username = user.username

          (req.session as any).auth = {
            user_id: user.id, 
            username: user.username
          }     
          
          req.session.save((err: any) => 
          {
            //res.cookie('baseUrl', req.session.baseUrl)
            next()
          })       
          
        })
        .catch((err) => {              
          if (clientNavigation)
          {
            //res.cookie('baseUrl', req.baseUrl )
             return res.redirect(`/`)
          }
          else
          {
           return res.status(401).json({
             status: 401,
             message: 'UNAUTHORIZED'
           })
          }
        })
  }
}

function verifyTokenAndGetUID(token :string)
{
    return GuildUsers.getGuildUsers().getSignedInUser(token)
}

export const isUserAuthenticated = (clientNavigation : boolean = false) =>
{
   return function (req : Request, res : Response, next : NextFunction) {
    
       // user data saved in session
      if ((req.session as any).auth && (req.session as any).auth.user_id)
      {
        //res.locals.auth.user_id = req.session.user_id
        next()
      }
      // user authenticated, but data not saved to session
      else if ((req.session as any).auth && (req.session as any).auth.token)
      {
        setAuthDataInSession(req, res, next, clientNavigation)
      }          
      // User not authenticated
      // Allow get requests only
      else if ( req.method == 'GET')
      {
        next()
      }
      // unauthorized
      else
       {

          
            if (clientNavigation)
            {          
                
                return res.redirect('/')
            }
            else
            {
                return res.status(401).json({
                status: 401,
                message: 'UNAUTHORIZED'
                })
            }
       }
        
      }

}

  export const isUserAdmin = (req : Request, res : Response, next : NextFunction) => 
  {
    try
    {
        let admins = process.env.GUILD_ADMIN_USERS
        if (admins.indexOf((req.session as any).auth.username) != -1)
        {              
            next()
        }
        else {
            return res.status(403).json({
              status: 403,
              message: 'FORBIDDEN'
            })
        }
    }
    catch
    {
        return res.status(401).json({
            status: 401,
            message: 'UNAUTHORIZED'
          })
    }
    
  }
  