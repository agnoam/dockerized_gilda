"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.gigSchema = new mongoose_1.Schema({
    project_id: Number,
    issue_id: Number,
    publisher: Number,
    level: Number,
    time_estimate: Number,
}, { usePushEach: true });
//# sourceMappingURL=gig.js.map