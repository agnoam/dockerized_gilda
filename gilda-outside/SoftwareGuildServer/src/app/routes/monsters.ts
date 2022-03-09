//import { IMonster } from './../interfaces/IMonster';
import {Monsters} from '../monsters'
import express = require("express");
import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";
import {IMonster} from '../interfaces/IMonster'
import { IMonsterModel } from '../models/monster';

const router = express.Router()

const monster= new Monsters();

router.get(
    "/createmonsters",
    function (request: Request, response: Response, next: NextFunction): void {           
        monster.createMonsters();
        response
            .type("text/plain")
            .send("Monsters cerated");

    }
);
router.get(
    "/:rank",
    function (request: Request, response: Response, next: NextFunction): void {
      
        monster.getMonstersByRank(request.params.rank)
        .then((monster:Array<any>) => response.json(monster), (err : any)=> next(err))      
    }
)

router.get(
    "/adopt",
    function (request: Request, response: Response, next: NextFunction): void {      
        monster.applyForAdoption(request.session.auth.user_id)
        .then((monster:IMonster) => response.json(monster), (err : any)=> next(err))      
    }    
)
    // TODO - verify signedinuser
router.post(
    "/apply",
    function (request: Request, response: Response, next: NextFunction): void {
        
        // POST arguments:
        // username
        // id

        monster.getMonster4Adoption()
        .then((res:IMonsterModel[]) => response.json(res[0]), (err:any)=> next(err))      
    }
)
export default router;