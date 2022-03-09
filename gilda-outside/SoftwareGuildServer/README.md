[![pipeline status](http://gitlab/SoftwareGuildTaksforce/SoftwareGuildServer/badges/master/pipeline.svg)](http://gitlab/SoftwareGuildTaksforce/SoftwareGuildServer/commits/master)

# Gilda Web Server





NodJS-based back-end for Gilda software: http://gilda





## Description





Gilda is a professional networking and collaboration platform that encourages code reuse/sharing and holds professional meetups introducing cutting edge technologies.





### Prerequisites





You will need to download and install following prerequisites to set up your dev environment:



1. Install and configure Node.js Windows Installer 64-bit: https://nodejs.org/en/download/



2. Install Visual Studio Code: https://code.visualstudio.com/



## Building and Runnung Gilda Web Server





1. Clone SoftwareGuildServer project



```



git clone [path]/SoftwareGuildServer.git



```



2. cd into cloned directory



3. run npm install to build server modules




### Debugging Preparation

Once you your runtime environment up and running, you need to setup a few more things to be able to start and debug SoftwareGuildServer application



#### Environment Variables


#### GitLab API
This section describes usage examples for the actions and API calls to GitLab server, required for implementing Gilda application features. **GitLab** is a web-based Git-repository manager with wiki and issue-tracking features.
#### GitLab Agent
gitlab-agent.ts encapsulates GitLab related functionality and makes a use of the following env. variables:
  1. *process.env.GITLAB_API_URL*
  2. *process.env.GITLAB_PRIVATE_TOKEN*

To generate your private GitLab token:
1. open GitLab portal and to your account settings

2. Go to *Access Tokens* section, add new token and copy it to clipboard

3.Now you're ready to add two more env.variables to the .env file:
  * GITLAB_API_URL (http://gitlab/api/v4)
  
  * GITLAB_PRIVATE_TOKEN (the token you've copied in step 2)
 
3. Install ts-node npm package:
```
npm install ts-node
``` 
## Actual Debugging  
One of the key features of Visual Studio Code is its great debugging support. VS Code's built-in debugger helps accelerate your edit, compile and debug loop.
![Debugging](/uploads/28e311dee922bf7df105a89124a9e849/image.png)
### Launch Configurations
 VS Code keeps debugging configuration information in a launch.json file located in a project root folder:
 ![Launch](/uploads/0b85593610d0212347e2ab8e02a6b43b/image.png))
 Notice your server.ts file location and make sure that it's correct
   * Select debug server.ts configuration and click on **Start Debugging** button
   ![Start debugging](/uploads/645cd3db3539c81fd36419a4f4bf61f8/image.png)
