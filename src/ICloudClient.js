"use strict";

class ICloudClient {
    static log(name, records, type) {}
    async exists(type, name) {}
    readParam(path, target) {}
}

module.exports = { ICloudClient };