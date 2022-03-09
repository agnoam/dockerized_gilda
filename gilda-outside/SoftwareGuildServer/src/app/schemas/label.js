"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.labelSchema = new mongoose_1.Schema({
    name: String,
    description: String,
    count: Number
}, { usePushEach: true });
exports.labelSchema.pre("save", function (next) {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});
//# sourceMappingURL=label.js.map