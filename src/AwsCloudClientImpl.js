const AWS = require('aws-sdk');
const { ICloudClient } = require('./ICloudClient');
const { Logger } = require('./Logger');
const { RegionNotFoundException } = require('./exceptions/RegionNotFoundException');
const REGION_NOT_FOUND = 'UnknownEndpoint';

/**
 * Class that connects to the AWS servers, checks if a resource exists and logs all actions.
 * You should not directly call the constructor because we first check if the provided region exists.
 * To do so, we make an async request. And, in javascript, async constructors can be kind of tricky to implement.
 * For this reason, we should call a method called `initialize` that will check if the region exists and return an AwsCloudClientImpl instance.
 *
 * @example
 * const client = await AwsCloudClientImpl.initialize('eu-west-3', 'logs');
*/
class AwsCloudClientImpl extends ICloudClient {
    /**
     * The connection to the AWS servers that will be used to manipulate the infrastructure.
     * @type {AWS.EC2}
     * @public
     */
    connection;

    /**
     * Directory to store log files.
     * @type {string}
     * @public
     */
    logPath;

    /**
     * Set up the default log appender
     * @constructor 
     * @param {string} cloudRegion - The AWS region to connect to.
     * @param {string} logPath - The path to the log file.
     */
    constructor(cloudRegion, logPath) {
        super();
        if (AwsCloudClientImpl.instance) {
            return AwsCloudClientImpl.instance;
        }
        AwsCloudClientImpl.instance = this;

        this.#connection = new AWS.EC2({ region: cloudRegion });
        this.logPath = logPath;
    }

    /**
     * Set up the cloud client by checking if region exists and returning a new instance.
     * @static
     * @param {string} cloudRegion - The AWS region to connect to.
     * @param {string} logPath - The path to the log file.
     * @exception RegionNotFoundException is thrown if the specified region does not exist.
     */
    static async initialize(cloudRegion, logPath) {
        const exists = await this.#regionExists(cloudRegion);

        if (!exists) {
            throw new RegionNotFoundException();
        }

        return new AwsCloudClientImpl(cloudRegion, logPath);
    }

    /**
     * Return the current connection to the AWS servers.
     * @returns {AWS.EC2}
     */
    get connection() {
        return this.connection;
    }

    /**
     * Modify the current connection to the AWS servers.
     * @param {AWS.EC2} con - The AWS region to connect to.
     */
    set #connection(con) {
        this.connection = con;
    }

    /**
     * Log a message with a specified type
     * @param {string} message - The message to log.
     * @param {integer} type - The type of log message.
     */
    log(message, type = Logger.INFO) {
        switch (type) {
            case Logger.INFO:
                //TODO NGY - as in logger test class, you call the info only with one parameter (log path missing)
                Logger.info(message);
                break;
            case Logger.ERROR:
                //TODO NGY - as in logger test class, you call the info only with one parameter (log path missing)
                Logger.error(message);
                break;
            default:
                break;
        }
    }

    /**
     * Check if region exists
     * @static
     * @async
     * @param {string} region - The aws server region.
     * @returns {Promise<boolean>} The region status.
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeRegions-property|link describeRegions}
     */

    //TODO NGY - now way to call (as for the helper) a exists method who can check if the region "resource" exists ?
    static async #regionExists(region) {
        const ec2 = new AWS.EC2({ region: region });
        const params = { Filters: [{ Name: 'region-name', Values: [region] }] };

        const handleError = err => {
            if (err.code === REGION_NOT_FOUND) {
                return false;
            }
            throw err;
        };

        const regions = await ec2.describeRegions(params)
            .promise()
            .catch(handleError);

        if (regions) {
            return regions.Regions[0].RegionName === region;
        } else {
            return false;
        }
    }
}

module.exports = { AwsCloudClientImpl };