const AWS = require('aws-sdk');
const { ICloudClient } = require('./ICloudClient');
const { Logger } = require('./Logger');

/** Class that connects to the AWS servers, checks if a resource exists and logs all actions. */
class AwsCloudClientImpl extends ICloudClient {
    /**
     * Setup the default log appender
     * @constructor 
     * @param {string} cloudRegion - The AWS region to connect to.
     * @param {string} logPath - The path to the log file.
     */
    constructor(cloudRegion, logPath) {
        super();
        this.connection = new AWS.EC2({ region: cloudRegion });
        this.logPath = logPath;
    }

    /**
     * Log a message with a specified type
     * @param {string} message - The message to log.
     * @param {integer} type - The type of log message.
     */
    log(message, type = Logger.INFO) {
        switch (type) {
            case Logger.INFO:
                Logger.info(message);
                break;
            case Logger.ERROR:
                Logger.error(message);
                break;
            default:
                break;
        }
    }
}

module.exports = { AwsCloudClientImpl };