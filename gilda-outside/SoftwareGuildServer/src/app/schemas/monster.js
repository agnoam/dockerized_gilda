"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.monsterSchema = new mongoose_1.Schema({
    name: String,
    description: String,
    parent: Number,
    rank: String,
    monster_index: String,
    monster_adoption_criteria: [{ action: String, count: Number, completion: Number }],
    adoption_applicants: [Number]
}, { usePushEach: true });
exports.monsterSchema.pre("save", function (next) {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});
//# sourceMappingURL=monster.js.map