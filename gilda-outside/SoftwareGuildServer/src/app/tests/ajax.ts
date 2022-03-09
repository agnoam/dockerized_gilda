// Using async and await with NODE.JS
// We used the request promise package because the async and await keyword works with promises only
import rp = require('request-promise');

export class Tester {
    constructor() {}

    async makeRequest(url: string) {
        try {
            return await rp(url)
        } catch (err) {
                return err;
        }
    }
}

