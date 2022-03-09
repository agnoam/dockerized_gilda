"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.cacheSchema = new mongoose_1.Schema({
    contentID: String,
    data: mongoose_1.Schema.Types.Mixed
}, { strict: false });
//# sourceMappingURL=cache.js.map