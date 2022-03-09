#!/bin/bash
cd /gilda/gilda/SwGuildClient/
/usr/local/bin/ng build
cp -r dist /gilda/gilda/SoftwareGuildServer/src/app
cd /gilda/gilda/SoftwareGuildServer/
/usr/local/bin/tsc
node ./src/app/server.js
