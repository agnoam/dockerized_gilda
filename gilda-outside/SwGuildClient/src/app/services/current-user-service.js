"use strict";

var CurrentUserServices = (function () {

    function CurrentUserServices() {
    }

    CurrentUserServices.prototype.getCurrentUser = function () {
        let wshShell = new ActiveXObject('Wscript.Shell')
        let wshEnv = wshShell.Environment('Process')
        let userName = wshEnv.Item('USERNAME')
        console.log(userName)
        return userName
    };
    return CurrentUserServices;
}());
exports.CurrentUserServices = CurrentUserServices;

