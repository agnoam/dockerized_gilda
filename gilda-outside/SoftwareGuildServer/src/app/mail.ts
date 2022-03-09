import * as Mail from 'nodemailer/lib/mailer'
import * as smtpTransport from 'nodemailer-smtp-transport'
import { GuildUsers } from './guild-users';
import { IUser } from './interfaces/IUser';
import { IMeetup } from './interfaces/IMeetup';
import { IMeetupModel } from './models/meetup';
import { IChallengeModel } from './models/challenge';
import * as moment from 'moment';

import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import { getLogger } from 'log4js';

 const logger = getLogger();

//import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
//import * as SMTPConnection from 'nodemailer/lib/smtp-connection';
//import {interface SMTPConnection.Options

//const nodemailer = require('nodemailer');



export class journey{
    constructor(s :string){}      
    };

export interface slogan
  {
    from: string,
    to: string
  }
let gilda : slogan = 
{
    from :'apprentice',
    to : 'master'
}
let the : journey = 'begin'


console.log(the);
console.log(gilda);


export class MailSender {
    options : smtpTransport.SmtpOptions; 
    transport : Mail; 
    users : GuildUsers
    constructor() {
       this.options  =      
        {
          host: process.env.MAIL_SERVER,
          port: 25,
          logger: false,
          //direct: true,
          //relay: false       
        }
        this.transport = nodemailer.createTransport(this.options);
        this.users = GuildUsers.getGuildUsers()
    }
          
    sendMeetupRegistrationAck(gitlab_user_id : number, nextMeetup : IMeetupModel)
    {        
        let dateStr: string = moment(nextMeetup.date).utc().format('dddd, MMMM Do YYYY [at] H:mm');

        this.getUser(gitlab_user_id).then((user : IUser) =>
        {
            logger.info(`Sending meetup registration mail to ${user.email} (${user.name})`);
            
            this.sendGildaMail( 'Thank you for your registration', 
                                user.email, 
                                `<table class="main-body">
                                <tr ><td class="banner">DEAR ${user.name}</td></tr>
                                <tr><td class="content">
                                <div>
                                <div>Thank you for submitting your registration request for the next meetup:</div><br>
                                <div class="subject">${nextMeetup.subject}</div>
                                <div><strong>on ${dateStr}, at ${nextMeetup.location}</strong></div><br>
                                <div>${nextMeetup.email}</div>
                                <div>We will review your request for registration ASAP.</div>
                                <div>This is a "by invitation only" event. We will contact you shortly with the status of your registration.</div><br>
                                <div>We appreciate your patience.</div>
                                <div>We are looking forward to seeing you there!</div>
                                </div>                    
                                </td></tr>
                                </table>`);
        }).catch(()=>{})
    }

    sendMeetupApproval(user : IUser, nextMeetup : IMeetupModel)
    {        
        logger.info(`Sending meetup approval mail to ${user.email} (${user.name})`);
        
        let dateStr: string = moment(nextMeetup.date).utc().format('dddd, MMMM Do YYYY [at] H:mm');       

        this.sendMeetupEventIcs(user.email, `.\\src\\assets\\${nextMeetup.calendar_ics}`, nextMeetup.subject)
        
        this.sendGildaMail( 'Your meetup registration is approved!', 
                            user.email, 
                            `<table class="main-body">
                            <tr ><td class="banner">DEAR ${user.name}</td></tr>
                            <tr><td class="content">
                            <div>
                            <div>Your meetup registration is approved!</div>
                            <div class="subject">${nextMeetup.subject}</div>
                            <div><strong>on ${dateStr}, at ${nextMeetup.location}</strong></div><br>
                            <br>
                            <br>
                            <div>See you there!</div>                                                        
                            </div>                            
                            </td></tr>
                            </table>`);
    }

    sendMeetupUnregistrationAck(gitlab_user_id : number, nextMeetup : IMeetupModel)
    {        
        let dateStr: string = moment(nextMeetup.date).utc().format('dddd, MMMM Do YYYY [at] H:mm');

        this.getUser(gitlab_user_id).then((user : IUser) =>
        {
            logger.info(`Sending meetup unregistration mail to ${user.email} (${user.name})`);
            
            this.sendGildaMail( 'You have been unregistered', 
                                user.email, 
                                `<table class="main-body">
                                <tr ><td class="banner">DEAR ${user.name}</td></tr>
                                <tr><td class="content">
                                <div>
                                <div>You have been unregistered from the next meetup:</div><br>
                                <div class="subject">${nextMeetup.subject}</div>
                                <div>on ${dateStr}.</div><br>
                                <div>${nextMeetup.email}</div>
                                <div>We hope to see you on the next meetups</div><br>
                                </div>                    
                                </td></tr>
                                </table>`);
        }).catch(()=>{})
    }

    sendChallengeReminder(user : IUser)
    {                 
        this.sendGildaMail( 'Have you cracked the weekly challenge yet?', 
                            user.email, 
                            `<table class="main-body">
                            <tr ><td class="banner">DEAR ${user.name}</td></tr>
                            <tr><td class="content">
                            <div>
                                <div>Only 3 days left to crack the weekly challenge.</div><br>                
                                <div>Hurry, gain points and win monster stickers for your laptop! </div>
                                <br>
                                <div>We are looking forward to seeing you. <a href="http://gilda">http://gilda</a></div>
                                <h4>Be sure to register to the next meetup at the <a href="http://gilda/meetup">GUILDHALL</a>.</h4>
                                <br>
                            </div>
                            
                            </td></tr>
                            </table>`);                        
    }

    sendPrevChallengeSolution(user : IUser, prevChallenge: IChallengeModel, currentChallenge: IChallengeModel)
    {          
        //rp.get(prevChallenge.image).pipe(fs.createWriteStream('challenge-image'))
        let imagePath = prevChallenge.image.replace('http://gilda/images/', 'c:\\inetpub\\wwwroot\\images\\');

        let image = {
            filename: 'challenge-image',                    
            content: fs.createReadStream(imagePath),
            cid: 'challenge-image' 
        }

        let currImagePath = currentChallenge.image.replace('http://gilda/images/', 'c:\\inetpub\\wwwroot\\images\\');

        let currImage = {
            filename: 'curr-challenge-image',                    
            content: fs.createReadStream(currImagePath),
            cid: 'curr-challenge-image' 
        }

        this.sendGildaMail( `Did you crack last week's challenge?`, 
                            user.email, 
                            `<table class="main-body">
                            <tr ><td class="banner">DEAR ${user.name}</td></tr>
                            <tr><td class="content">
                            <div>
                                <div>Last week's challenge was:</div>
                                <h4>${prevChallenge.challenge}</h4>    
                                <div>hint: ${prevChallenge.hint.text}</div>
                            </div>                            
                            </td></tr>
                            <tr><td class="challenge-image">
                                <img src="challenge-image" width="511"/>   
                            </td></tr>
                            <tr><td class="content">
                            <div>
                                <h4>Solution: ${prevChallenge.solution.join(' ')}</h4>                
                                <div>${prevChallenge.info}</div><br>                
                                <h4>Be sure to crack this week's challenge at <a href="http://gilda/scoreboard">http://gilda</a></h4>
                                <br>
                            </div>
                            <div>
                            <div></div>
                                <h4>${currentChallenge.challenge}</h4>    
                            </div>
                            <tr><td class="challenge-image">
                                <img src="curr-challenge-image" width="511"/>   
                            </td></tr>
                            </td></tr>
                            </table>`,
                            [image, currImage]);                        
    }

    sendMeetupReminder2Users(users : IUser[], meetup : IMeetup) {
        users.forEach(user => { 
            if (user.active) //(user.gitlab_user_id == 8) 
            { 
                this.sendMeetupReminder(user, meetup);
            } 
        })
    }
    
    sendMeetupReminder(user : IUser, meetup : IMeetup)
    {                 
        let meetupDate: string = moment(meetup.date).utc().format('dddd, MMMM Do YYYY [at] H:mm');

        this.sendGildaMail( 'Meetup, Snacks & Monsters', 
                            user.email, 
                            `<table class="main-body">
                            <tr ><td class="banner">DEAR ${user.name}</td></tr>
                            <tr><td class="content">
                            <div>
                                <div>The software development world moves faster than ever before, and new technologies are introduced every day.</div>
                                <br>
                                               
                                <div>Want to keep up with the latest trends in the software world?</div>
                                <br>
                                
                                <div>Join an internal meetup, hold your daily tasks for 3 hours and get to know the cutting edge technologies in the software world today.</div><br>
                                <div>Meet fellow developers and exchange thoughts and ideas.</div>
                                <br>
                                <strong>                            
                                <div>Next meetup: ${meetupDate}, ${meetup.location}</div>
                                <div class="subject2">${meetup.subject}</div>
                                </strong>
                                
                                <div><h4>Register now at the <a href="http://gilda/meetup">GUILDHALL</a></h4></div>                                                           
                                <div><h4>You will receive cool monster stickers for your laptop, so keep on gaining points and get more stickers!</h4></div>                                
                                <div><h4>Breakfast Buffet!</h4></div>                                                             
                                <div>Looking forward to seeing you. <a href="http://gilda">http://gilda</a></div>
                                <br>
                            </div>
                            
                            </td></tr>
                            </table>`);                        
    }

    sendMailToRecommendedApplicant(applicant : IUser, recommender : IUser)
    {   
        logger.info(`Sending mail to recommended applicant ${applicant.email} (${applicant.name}) by member ${recommender.email} (${recommender.name})`);

        this.sendGildaMail( 'Someone believes in you...', 
                            applicant.email, 
                            `<table class="main-body">
                            <tr ><td class="banner">DEAR ${applicant.name}</td></tr>
                            <tr><td class="content">
                            <div>
                                <div>${recommender.name} has recommended you as a GILDA member.</div><br>                
                                <div>The GILDA is a professional guild of software developers. In order to progress in their professional rank, guild members can earn professional points by cracking software related challenges, contributing code to the Inner Source repository and recommending applicants. </div>
                                <br>
                                <div>We are looking forward to seeing you. <a href="http://gilda">http://gilda</a></div>
                                <h4>Be sure to register to the next meetup at the <a href="http://gilda/meetup">GUILDHALL</a>.</h4>
                                <br>
                            </div>
                            
                            </td></tr>
                            </table>`);       
    }

    sendMailToPokeMemmber(applicant : IUser, potentialRecommender : IUser)
    {
        logger.info(`Poking member ${potentialRecommender.email} (${potentialRecommender.name}) to recommend applicant ${applicant.email} (${applicant.name})`);
        this.sendGildaMail( 'You have been poked!', 
                            potentialRecommender.email, 
                            `<table class="main-body">
                            <tr ><td class="banner">DEAR ${potentialRecommender.name}</td></tr>
                            <tr><td class="content">
                            <div>
                                <div>${applicant.name} wants you to recommend him as a GILDA member. what do you say?</div><br>                
                                <div>The GILDA is a professional guild of software developers. In order to progress in their professional rank, guild members can earn professional points by cracking software related challenges, contributing code to the Inner Source repository and recommending applicants. </div>
                                <br>
                                <div>We are looking forward to seeing you. <a href="http://gilda">http://gilda</a></div>
                                <h4>Be sure to register to the next meetup at the GUILDHALL.</h4>
                            </div>
                            
                            </td></tr>
                            </table>`);    
    }
    

    sendMeetupEventIcs(to : string, icsPath : string, subject : string)
    {
       
               
        let content :string  = fs.readFileSync(icsPath).toString();
        content = content.replace
        ('ATTENDEE;CN=shellyniz@gmail.com;RSVP=TRUE:mailto:shellyniz@gmail.com', 
        'ATTENDEE;CN='+to+';PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:'+to)
  
        let message = {
            from: 'Gilda <gilda@your-org.com>',
            to: to,
            subject: 'Monday Meetup '+ subject,            
            alternatives: [{
              contentType: "text/calendar",
              content: Buffer.from(content)
            }],
            //contentType: 'application/ms-tnef',
  
            // icalEvent: {
            //     filename: 'invitation.ics',
            //     method: 'request',
            //     content: content//cal.toString(),             
            // }
        };
  
  
        this.transport.sendMail(message, (error:any, info:any) => {
            if (error) {
                logger.error(`An Error occurred while sending mail: ${error.message}`);
                
            }
            this.transport.close();
        });
    }
    sendMailToNewMember(newMember : IUser)
    {   
        logger.info(`Sending mail to new member ${newMember.email} (${newMember.name})`);

        this.sendGildaMail( 'Congratulations!!! You are a GILDA member', 
                            newMember.email, 
                            `<table class="main-body">
                            <tr ><td class="banner">CONGRATULATIONS ${newMember.name}</td></tr>
                            <tr><td class="content">
                            <div>
                                <div>You are now an official member of the software GILDA.</div>
                                <div>You have reached the esteamed rank of ${newMember.rank}</div>
                                <br>
                                <div>You can now attend GILDA meetups and recommend other applicants.</div>
                                <div>We are looking forward to seeing you. <a href="http://gilda">http://gilda</a></div>
                                <h4>Be sure to register to the next meetup at the <a href="http://gilda/meetup">GUILDHALL</a>.</h4>
                                <br>
                            </div>
                            
                            </td></tr>
                            </table>`);     
    }
    
    private sendMail(message : any)
    {
        let sendMail = process.env.SEND_EMAIL; 
        if (sendMail && sendMail === "true")
        {
            this.transport.sendMail(message, (error:any, info:any) => {
                if (error) {
                    logger.error(`An Error occurred while sending mail: ${error.message}`);
                    
                }
                this.transport.close();
            });
        }
        else {
            logger.info('Non-production server. Mail not sent...');
        }
    }

    sendGildaMail(subject: string, to: string, body: string, addAttachments?: any)
    {   
        let debugMailTo = process.env.DEBUG_MAIL_TO; 
        if (debugMailTo) {
            to = debugMailTo;
        }
     
        let attachments = [ {
                                filename: 'banner.png',                    
                                content: fs.createReadStream('./src/assets/mail/mail_banner.png'),
                                cid: 'banner' 
                            },
                            {
                                filename: 'footer.png',                    
                                content: fs.createReadStream('./src/assets/mail/mail_footer.png'),
                                cid: 'footer' 
                            }];

        if (addAttachments) {
            for (const addAttachment of addAttachments) {
                attachments.push(addAttachment);                
            }
        }
        
        let message = {
            from: 'Gilda <gilda@your-org.com>',
            to: to,
            bcc: process.env.EMAIL_BCC,
            subject: subject,
            attachments: attachments,
            html: ` <html lang="en">
                        <head>  
                        <style type="text/css">    
                            .main-body {
                                background-color: #89b3d9;
                                width:517px;
                            }                                                    
                            .banner {	
                            font-family: Roboto, Helvetica, Arial, sans-serif;   
                            font-size: 24px; 
                            padding: 20px 40px 40px 40px;
                            width:520px;                                        
                            }
                            .content {	
                                font-family: Roboto, Helvetica, Arial, sans-serif; 
                                font-size: 14px;  
                                padding-right: 40px;
                                padding-left: 40px;
                                width: 520px;	                       
                            }
                            .subject {	                        
                                font-size: 24px; 
                                font-weight: bold;
                            }
                            .subject2 {	                        
                                font-size: 18px; 
                            }
                            .challenge-image {
                                text-align:center;
                                padding-top:10px;
                                padding-bottom:20px;
                            }
                        </style>
                        </head>
                        <body>
                            <table>
                                <img src="cid:banner"/>           
                                ${body}
                                <img src="cid:footer"/>
                            </table>
                        </body>
                    </html>`
        }
    
        return this.sendMail(message);
    }

    private getUser(gitlab_user_id : number)
    {
        return this.users.getUserByGitlabId(gitlab_user_id);
    }
    
}