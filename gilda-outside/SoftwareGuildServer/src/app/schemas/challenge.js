"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.challengeSchema = new mongoose_1.Schema({
    challenge_id: String,
    challenge: String,
    title: String,
    solution: [String],
    info: String,
    score: Number,
    hint: { text: String, price: Number },
    users_challenged: [String],
    users_solved: [String],
    users_hinted: [String],
    users_solved_ids: [Number],
    users_hinted_ids: [Number],
    keyboard: [[String]],
    image: String,
    author: String,
    year: Number,
    week: Number
}, { usePushEach: true });
exports.challengeSchema.pre("save", function (next) {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});
//# sourceMappingURL=challenge.js.map