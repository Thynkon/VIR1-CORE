"use strict";

const AWS = require('aws-sdk');
const { AwsCloudClientImpl } = require('../AwsCloudClientImpl');
const { Logger } = require('../Logger');
const { Vpc } = require('./Vpc');
const { waitForFileToBeWritten, getLastLine } = require('../lib/file');
const { RegionNotFoundException } = require('../exceptions/RegionNotFoundException');

describe('AwsCloudClientImpl_log_Logger', () => {
    let message;
    let expectedLogLine;
    let logDirectory;
    let logName;
    let logType;
    let logFile;
    let awsRegion;
    let client;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        client = await AwsCloudClientImpl.initialize(awsRegion);
        logDirectory = 'logs';
    });

    test('info_LogInInfoLogFile_Success', async () => {
        // Given
        message = 'Test info message';
        expectedLogLine = `[INFO] - ${message}`;
        logName = 'INFO.log';
        logType = Logger.INFO;
        logFile = `${logDirectory}/${logName}`;

        // When
        client.log(message, logType);

        // Then
        await waitForFileToBeWritten();
        expect(getLastLine(logFile)).toContain(expectedLogLine);
    });

    test('error_LogInErrorLogFile_Success', async () => {
        // Given
        message = 'Test error message';
        expectedLogLine = `[ERROR] - ${message}`;
        logName = 'ERROR.log';
        logType = Logger.ERROR;
        logFile = `${logDirectory}/${logName}`;

        // When
        client.log(message, logType);

        // Then
        await waitForFileToBeWritten();
        expect(getLastLine(logFile)).toContain(expectedLogLine);
    });
});

describe('AwsCloudClientImpl_initialize', () => {
    let awsRegion;

    test('connection_ConnectToExistingRegion_Success', async () => {
        // Given
        awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);
        const connection = new AWS.EC2({region: awsRegion});

        // When
        const clientConnection = client.connection

        // Then
        expect(clientConnection.config.region).toEqual(connection.config.region);
    });

    test('connection_ConnectToNonExistingRegion_ThrowException', async () => {
        // Given
        awsRegion = 'non-existing-region';

        // When
        await expect(AwsCloudClientImpl.initialize(awsRegion)).rejects.toThrow(RegionNotFoundException);

        // Then
        // Exception is thrown
    });
});

describe('AwsCloudClientImpl_exists_Vpc', () => {
    let givenVpcName;
    let awsRegion;
    let expectedResult;
    let client;
    let result;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        client = await AwsCloudClientImpl.initialize(awsRegion);
    });

    test('exists_ExistingVpc_True', async () => {
        // Given
        givenVpcName = 'vpc-deliver';
        expectedResult = true;

        // When
        result = await client.exists(AwsCloudClientImpl.VPC, givenVpcName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingVpc_False', async () => {
        // Given
        givenVpcName = 'vpc-name-which-does-not-exist';
        expectedResult = false;

        // When
        result = await client.exists(AwsCloudClientImpl.VPC, givenVpcName);

        // Then
        expect(result).toBe(expectedResult);
    });
});

describe('AwsCloudClientImpl_exists_Instance', () => {
    let givenInstanceName;
    let awsRegion;
    let expectedResult;
    let client;
    let result;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        client = await AwsCloudClientImpl.initialize(awsRegion);
    });

    test('exists_ExistingInstance_True', async () => {
        // Given
        givenInstanceName = 'debian';
        expectedResult = true;

        // When
        result = await client.exists(AwsCloudClientImpl.INSTANCE, givenInstanceName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingInstance_False', async () => {
        // Given
        givenInstanceName = 'non-existing-instance';
        expectedResult = false;

        // When
        result = await client.exists(AwsCloudClientImpl.INSTANCE, givenInstanceName);

        // Then
        expect(result).toBe(expectedResult);
    });
});

describe('AwsCloudClientImpl_exists_Image', () => {
    let givenImageName;
    let awsRegion;
    let expectedResult;
    let client;
    let result;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        client = await AwsCloudClientImpl.initialize(awsRegion);
    });

    test('exists_ExistingImage_True', async () => {
        // Given
        givenImageName = 'ami-core-01';
        expectedResult = true;

        // When
        result = await client.exists(AwsCloudClientImpl.IMAGE, givenImageName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingImage_False', async () => {
        // Given
        givenImageName = 'non-existing-image';
        expectedResult = false;

        // When
        result = await client.exists(AwsCloudClientImpl.IMAGE, givenImageName);

        // Then
        expect(result).toBe(expectedResult);
    });
});

describe('AwsCloudClientImpl_exists_KeyPair', () => {
    let givenKeyPairName;
    let awsRegion;
    let expectedResult;
    let client;
    let result;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        client = await AwsCloudClientImpl.initialize(awsRegion);
    });

    test("exists_ExistingName_Success", async () => {
        // Given
        givenKeyPairName = "test";
        expectedResult = true;

        // When
        result = await client.exists(AwsCloudClientImpl.KEYPAIR, givenKeyPairName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test("exists_NotExistingName_Success", async () => {
        // Given
        givenKeyPairName = "keypair-name-which-does-not-exist";
        expectedResult = false;

        // When
        result = await client.exists(AwsCloudClientImpl.KEYPAIR, givenKeyPairName);

        // Then
        expect(result).toBe(expectedResult);
    });
});

describe('AwsCloudClientImpl_exists_Budget', () => {
    let givenBudgetName;
    let awsRegion;
    let accountId;
    let expectedResult;
    let logDirectory;
    let client;
    let result;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        accountId = '709024702237';
        logDirectory = 'logs';
        client = await AwsCloudClientImpl.initialize(awsRegion, logDirectory, accountId);
    });

    test('exists_ExistingBudget_True', async () => {
        // Given
        givenBudgetName = 'SaaS-CPNV';
        expectedResult = true;

        // When
        result = await client.exists(AwsCloudClientImpl.BUDGET, givenBudgetName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingBudget_True', async () => {
        // Given
        givenBudgetName = 'non-existing-budget';
        expectedResult = false;

        // When
        result = await client.exists(AwsCloudClientImpl.BUDGET, givenBudgetName);

        // Then
        expect(result).toBe(expectedResult);
    })
});

describe('AwsCloudClientImpl_exists_Subnet', () => {
    let givenSubnetName;
    let awsRegion;
    let expectedResult;
    let client;
    let result;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        client = await AwsCloudClientImpl.initialize(awsRegion);
    });

    test('exists_ExistingSubnet_True', async () => {
        // Given
        givenSubnetName = 'subnet-deliver-01';
        expectedResult = true;

        // When
        result = await client.exists(AwsCloudClientImpl.SUBNET, givenSubnetName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingSubnet_False', async () => {
        // Given
        givenSubnetName = 'non-existing-subnet';
        expectedResult = false;

        // When
        result = await client.exists(AwsCloudClientImpl.SUBNET, givenSubnetName);

        // Then
        expect(result).toBe(expectedResult);
    });
});

describe('AwsCloudClientImpl_exists_Gateway', () => {
    let givenInternetGatewayName;
    let awsRegion;
    let expectedResult;
    let client;
    let result;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        client = await AwsCloudClientImpl.initialize(awsRegion);
    });

    test('exists_ExistingInternetGateway_True', async () => {
        // Given
        givenInternetGatewayName = 'gty-01';
        expectedResult = true;

        // When
        result = await client.exists(AwsCloudClientImpl.INTERNET_GATEWAY, givenInternetGatewayName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingInternetGateway_False', async () => {
        // Given
        givenInternetGatewayName = 'non-existing-internet-gateway';
        expectedResult = false;

        // When
        result = await client.exists(AwsCloudClientImpl.INTERNET_GATEWAY, givenInternetGatewayName);

        // Then
        expect(result).toBe(expectedResult);
    });
});

describe('AwsCloudClientImpl_exists_Snapshot', () => {
    let givenSnapshotName;
    let awsRegion;
    let expectedResult;
    let client;
    let result;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        client = await AwsCloudClientImpl.initialize(awsRegion);
    });

    test('exists_ExistingSnapshot_True', async () => {
        // Given
        givenSnapshotName = 'snapshot-core-01';
        expectedResult = true;

        // When
        result = await client.exists(AwsCloudClientImpl.SNAPSHOT, givenSnapshotName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingSnapshot_True', async () => {
        // Given
        givenSnapshotName = 'non-existing-snapshot';
        expectedResult = false;

        // When
        result = await client.exists(AwsCloudClientImpl.SNAPSHOT, givenSnapshotName);

        // Then
        expect(result).toBe(expectedResult);
    });
});

describe('AwsCloudClientImpl_readParam', () => {
    let givenInstance;
    let givenPath;
    let awsRegion;
    let expectedResult;
    let client;

    beforeAll(async () => {
        awsRegion = 'eu-west-3';
        givenPath = './src/tests/config.json';
        client = await AwsCloudClientImpl.initialize(awsRegion);
    });

    test('readParameter_ExistingInstance_Success', async () => {
        // Given
        givenInstance = new Vpc();
        const expectedName = 'vpc-vir1';
        expectedResult = true;

        // When
        const result = await client.readParam(givenPath, givenInstance);

        // Then
        expect(result.vpcName).toBe(expectedName);
        expect(result instanceof Vpc).toBe(expectedResult);
    });

    test('readParameter_NullInstance_TrowException', async () => {
        // Given
        givenInstance = null;

        // When
        expect(() => {
            client.readParam(givenPath, givenInstance);
        }).toThrow(TypeError);

        // Then
        // Exception is thrown
    });
});
