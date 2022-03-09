"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.meetupSchema = new mongoose_1.Schema({
    email: String,
    waiting_list_gitlab_ids: [Number],
    attending_list_gitlab_ids: [Number],
    subject: String,
    description: String,
    location: String,
    date: Date,
    calendar_ics: String
}, { usePushEach: true });
//# sourceMappingURL=meetup.js.map