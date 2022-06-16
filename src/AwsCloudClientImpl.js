"use strict";

const AWS = require('aws-sdk');
const { ICloudClient } = require('./ICloudClient');
const { Logger } = require('./Logger');
const { RegionNotFoundException } = require('./exceptions/RegionNotFoundException');
const REGION_NOT_FOUND = 'UnknownEndpoint';
const BUDGET_NOT_FONUD = 'NotFoundException';

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
    static VPC = 0;
    static INSTANCE = 1;
    static IMAGE = 2;
    static KEYPAIR = 3;
    static BUDGET = 4;
    static SUBNET = 5;
    static INTERNET_GATEWAY = 6;

    /**
     * The AWS servers region to connect to.
     * @type {string}
     * @private
     */
    #_cloudRegion = null;

    /**
     * The connection to the AWS servers that will be used to manipulate the infrastructure.
     * @type {AWS.EC2}
     * @private
     */
    #_connection = null;

    /**
     * Directory to store log files.
     * @type {string}
     * @private
     */
    #_logPath;

    /**
     * The account id needed to fetch budget information.
     * @type {string}
     * @private
     */
    #_accountId

    /**
     * Setup the default log appender
     * @constructor 
     * @param {string} cloudRegion - The AWS region to connect to.
     * @param {string} logPath - The path to the log file.
     * @param {string} accountId - The id of the account to fetch budgets from.
     */
    constructor(cloudRegion, logPath, accountId) {
        super();

        this.#cloudRegion = cloudRegion;
        this.#_accountId = accountId;
        this.#logPath = logPath;
    }

    /**
     * Setup the cloud client by checking if region exists and returning a new instance.
     * @static
     * @param {string} cloudRegion - The AWS region to connect to.
     * @param {string} logPath - The path to the log file.
     * @param {string} accountId - The id of the account to fetch budgets from.
     * @exception RegionNotFoundException is thrown if the specified region does not exist.
     */
    static async initialize(cloudRegion, logPath, accountId) {
        const exists = await this.#regionExists(cloudRegion);

        if (!exists) {
            throw new RegionNotFoundException();
        }

        return new AwsCloudClientImpl(cloudRegion, logPath, accountId);
    }

    /**
     * Return the current connection to the AWS servers.
     * @returns {AWS.EC2}
     */
    get connection() {
        if (this.#_connection == null) {
            if (this.#accountId) {
                this.#connection = new AWS.Budgets()
            } else {
                this.#connection = new AWS.EC2({ region: this.#cloudRegion });
            }
        }
        return this.#_connection;
    }

    /**
     * Modify the current connection to the AWS servers.
     * @param {AWS.EC2} connection - The AWS region to connect to.
     */
    set #connection(connection) {
        this.#_connection = connection;
    }

    /**
     * Return the current connection to the AWS servers.
     * @returns {AWS.EC2}
     */
    get #cloudRegion() {
        return this.#_cloudRegion;
    }

    /**
     * Modify the location to store log files.
     * @param {string} path - The path to the directory that will contain the log files.
     */
    set #logPath(path) {
        this.#_logPath = path;
    }

    /**
     * Return the path of the directory that will contain the log files.
     * @returns {string}
     */
    get #logPath() {
        return this.#_logPath;
    }

    /**
     * Modify the current connection to the AWS servers.
     * @param {AWS.EC2} con - The AWS region to connect to.
     */
    set #cloudRegion(region) {
        this.#_cloudRegion = region;
    }

    /**
     * Return the current connection to the AWS servers.
     * @returns {AWS.EC2}
     */
    get #accountId() {
        return this.#_accountId;
    }

    /**
     * Modify the current connection to the AWS servers.
     * @param {AWS.EC2} con - The AWS region to connect to.
     */
    set #accountId(accountId) {
        this.#_accountId = accountId;
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

    /**
     * Check if region exists
     * @static
     * @async
     * @param {string} region - The aws server region.
     * @returns {Promise<boolean>} The region status.
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeRegions-property|link describeRegions}
     */
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

    /**
     * Check if region exists
     * @async
     * @param {integer} type - The type of resource to check its existence.
     * @param {string} name - The name of the resource to check its existence
     * @param {string} vpcName - The vpc name required by the cost team.
     * @returns {Promise<boolean>} The region status.
     */
    async exists(type, name, vpcName) {
        let result;

        switch (type) {
            case AwsCloudClientImpl.VPC:
                result = await this.#vpcExists(name);
                break;

            case AwsCloudClientImpl.INSTANCE:
                result = await this.#instanceExists(name);
                break;

            case AwsCloudClientImpl.IMAGE:
                result = await this.#imageExists(name);
                break;

            case AwsCloudClientImpl.KEYPAIR:
                result = await this.#keypairExists(name);
                break;

            case AwsCloudClientImpl.BUDGET:
                result = await this.#budgetExists(name);
                break;

            case AwsCloudClientImpl.SUBNET:
                result = await this.#subnetExists(name);
                break;

            case AwsCloudClientImpl.INTERNET_GATEWAY:
                result = await this.#internetGatewayExists(name);
                break;

            default:
                break;
        }

        return result;
    }

    /**
     * Check if a vpc with the given name exists.
     * @param name {string} name of a VPC.
     * @returns {Promise<boolean>} true if the VPC exists, false otherwise.
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeVpcs-property|link describeVpcs}
     */
    async #vpcExists(name) {
        const handleError = (err) => {
            throw err;
        };

        const result = await this.connection
            .describeVpcs({ Filters: [{ Name: 'tag:Name', Values: [name] }] })
            .promise()
            .catch(handleError);

        return result.Vpcs.length !== 0;
    }

    /**
     * Check if an instance with the given name exists.
     * @param name {string} name of an Instance.
     * @returns {boolean} true if the Instance exists, false otherwise.
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeInstances-property|link describeInstances}
     */
    async #instanceExists(name) {
        // function always return empty array even if instance does not exist
        const handleError = (err) => {
            throw err;
        };

        const result = await this.connection
            .describeInstances({
                Filters: [{ Name: 'tag:Name', Values: [name] }],
            })
            .promise()
            .catch(handleError);

        return result.Reservations.length !== 0;
    }

    /**
     * Check if an image with the given name exists.
     * @param name {string} name of an Instance.
     * @returns {boolean} true if the Instance exists, false otherwise.
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeImages-property|link describeImages}
     */
    async #imageExists(name) {
        // function always return empty array even if instance does not exist
        const handleError = (err) => {
            throw err;
        };

        const result = await this.connection
            .describeImages({
                Filters: [{ Name: 'tag:Name', Values: [name] }],
            })
            .promise()
            .catch(handleError);

        return result.Images.length !== 0;
    }

    /**
     * Check if a keypair with the given name exists.
     * @param name {string} name of a keypair
     * @returns {Promise<boolean>} true if the keypair exists, false otherwise
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeVpcs-property
     */
    async #keypairExists(name) {
        const handleError = (err) => {
            Logger.error(err.message);
            throw err;
        };

        const result = await this.connection
            .describeKeyPairs({
                Filters: [{ Name: "key-name", Values: [name] }]
            })
            .promise()
            .catch(handleError);

        return result.KeyPairs.length !== 0;
    }

    /**
     * Check if a budget with the given name exists.
     * @param name {string} name of an Instance.
     * @returns {boolean} true if the Instance exists, false otherwise.
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Budgets.html#describeBudget-property|link describeBudget}
     */
    async #budgetExists(name) {
        const handleError = (err) => {
            if (err.code === BUDGET_NOT_FONUD) {
                return false;
            }
            throw err;
        };

        const result = await this.connection
            .describeBudget({
                AccountId: this.#accountId,
                BudgetName: name,
            })
            .promise()
            .catch(handleError);

        return result ? true : false;
    }

    /**
     * Check if a subnet with the given name exists.
     * @param name {string} name of a subnet
     * @returns {Promise<boolean>} true if the subnet exists, false otherwise
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeSubnets-property|link describeSubnets}
     */
    async #subnetExists(name) {
        const handleError = (err) => {
            Logger.error(err.message);
            throw err;
        };

        const result = await this.connection
            .describeSubnets({
                Filters: [{ Name: 'tag:Name', Values: [name] }],
            })
            .promise()
            .catch(handleError);

        return result.Subnets.length !== 0;
    }

    /**
     * Check if an internet gateway with the given name exists.
     * @param name {string} name of an internet gateway
     * @returns {Promise<boolean>} true if the internet gateway exists, false otherwise
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeInternetGateways-property|link describeInternetGateways}
     */
    async #internetGatewayExists(name) {
        const handleError = (err) => {
            Logger.error(err.message);
            throw err;
        };

        const result = await this.connection
            .describeInternetGateways({
                Filters: [{ Name: 'tag:Name', Values: [name] }],
            })
            .promise()
            .catch(handleError);

        return result.InternetGateways.length !== 0;
    }
}

module.exports = { AwsCloudClientImpl };