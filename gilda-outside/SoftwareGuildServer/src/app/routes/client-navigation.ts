import express = require("express");
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";
const router = express.Router()



router.get(
    "*",
    function (req: Request, res: Response, next: NextFunction): void { 
        //req.session.baseUrl = req.baseUrl
        //req.session.save((err)=> {
            res.cookie('baseUrl', req.baseUrl )
            res.redirect('/')
        //})          
      // res.redirect(req.baseUrl)

    }
);

export default router;