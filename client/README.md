# Dev container
In case you want to develop and you don't have an angular environment on your host, 
you can use the 'dev-container'.

Instructions:
1. Uncomment the `gilda-client-dev` service in `docker-compsoe.yaml`
2. Run `docker compose up` (or equvilant by docker desktop)
3. Wait for the container to "compile" the angular project
4. Access it by [this link](http://localhost:4200/)

[![pipeline status]([path]/SwGuildClient/badges/master/pipeline.svg)]([path]/SwGuildClient/commits/master)

# Gilda Web Client


Angular-based front-end for Gilda software: http://gilda

## Description

Gilda is a professional networking and collaboration platform that encourages code reuse/sharing and holds professional meetups introducing cutting edge technologies.

### Prerequisites

You will need to download and install following prerequisites to set up your dev environment:
1. Install and configure Node.js Windows Installer 64-bit: https://nodejs.org/en/download/ 

2. Then install the Angular CLI globally (Angular CLI is the quickest way to get started with Angular projects)
```
npm install -g @angular/cli
```
 
3. Install Visual Studio Code

https://code.visualstudio.com/


## Building and Running Gilda Web Client

1. Clone SWGuildWebClient project 
```
git clone [path]]/SwGuildClient.git
```
2. cd into cloned directory , insatall npm packages and run 
```
npm i
ng serve --open
```
command to build and open browser with Gilda running locally on your machine
3. In order to be able to debug end-to-end Gilda functionality, you will be require to "fake" signed-in user

    Open users-service.ts file located in:  SwGuildClient\src\app\services\
    
    
    Uncomment following lines:
    
```javascript
    // USE THIS FOR DEBUG IN LOCALHOST
    
        // setTimeout(() => {
        //   console.log('setting user')
        //   this.loggedUserName='XXXXXX';
        //   this.loggedUserName$.next(this.loggedUserName)
    
        // }, 1000);
```
    Replace XXXXX with your user name  




