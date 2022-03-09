"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
router.get("*", function (req, res, next) {
    //req.session.baseUrl = req.baseUrl
    //req.session.save((err)=> {
    res.cookie('baseUrl', req.baseUrl);
    res.redirect('/');
    //})          
    // res.redirect(req.baseUrl)
});
exports.default = router;
//# sourceMappingURL=client-navigation.js.map