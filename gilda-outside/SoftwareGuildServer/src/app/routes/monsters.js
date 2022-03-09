"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import { IMonster } from './../interfaces/IMonster';
const monsters_1 = require("../monsters");
const express = require("express");
const router = express.Router();
const monster = new monsters_1.Monsters();
router.get("/createmonsters", function (request, response, next) {
    monster.createMonsters();
    response
        .type("text/plain")
        .send("Monsters cerated");
});
router.get("/:rank", function (request, response, next) {
    monster.getMonstersByRank(request.params.rank)
        .then((monster) => response.json(monster), (err) => next(err));
});
router.get("/adopt", function (request, response, next) {
    monster.applyForAdoption(request.session.auth.user_id)
        .then((monster) => response.json(monster), (err) => next(err));
});
// TODO - verify signedinuser
router.post("/apply", function (request, response, next) {
    // POST arguments:
    // username
    // id
    monster.getMonster4Adoption()
        .then((res) => response.json(res[0]), (err) => next(err));
});
exports.default = router;
//# sourceMappingURL=monsters.js.map