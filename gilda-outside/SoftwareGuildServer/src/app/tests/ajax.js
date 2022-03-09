"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Using async and await with NODE.JS
// We used the request promise package because the async and await keyword works with promises only
const rp = require("request-promise");
class Tester {
    constructor() { }
    makeRequest(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield rp(url);
            }
            catch (err) {
                return err;
            }
        });
    }
}
exports.Tester = Tester;
//# sourceMappingURL=ajax.js.map