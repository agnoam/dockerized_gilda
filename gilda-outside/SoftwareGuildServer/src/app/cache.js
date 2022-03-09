"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const log4js_1 = require("log4js");
const logger = log4js_1.getLogger();
class Cache {
    getCache(ID) {
        return new Promise((resolve, reject) => {
            db_1.default.cache.findOne({ contentID: ID }, (err, cache) => {
                if (err) {
                    logger.error(err);
                    reject();
                }
                if (cache)
                    resolve(cache.data);
                else
                    reject();
            });
        });
    }
    saveCache(ID, data) {
        let cache = new db_1.default.cache({ contentID: ID, data: data });
        return new Promise((resolve, reject) => {
            db_1.default.cache.findOne({ contentID: ID }, (err, oldData) => {
                if (err)
                    logger.error(err);
                if (oldData) {
                    oldData.data = data;
                    oldData.markModified('data');
                    oldData.save().then(newData => resolve(newData));
                }
                else {
                    cache.save().then(newData => resolve(newData));
                }
            });
        });
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map