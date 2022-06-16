"use strict";

const AWS = require('aws-sdk');
const { AwsCloudClientImpl } = require('../AwsCloudClientImpl');
const { Logger } = require('../Logger');
const { waitForFileToBeWritten, getLastLine } = require('../lib/file');
const { RegionNotFoundException } = require('../exceptions/RegionNotFoundException');

describe('AwsCloudClientImpl', () => {
    test('info_LogInInfoLogFile_Success', async () => {
        // Given
        const message = 'Test info message';
        const expectedLogLine = `[INFO] - ${message}`;
        const logDirectory = 'logs';
        const logName = 'INFO.log';
        const logType = Logger.INFO;
        const infoLogFile = `${logDirectory}/${logName}`;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion, logDirectory);

        // When
        client.log(message, logType);

        // Then
        await waitForFileToBeWritten();
        expect(getLastLine(infoLogFile)).toContain(expectedLogLine);
    });

    test('error_LogInErrorLogFile_Success', async () => {
        // Given
        const message = 'Test error message';
        const expectedLogLine = `[ERROR] - ${message}`;
        const logDirectory = 'logs';
        const logName = 'ERROR.log';
        const logType = Logger.ERROR;
        const errorLogFile = `${logDirectory}/${logName}`;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion, logDirectory);

        // When
        client.log(message, logType);

        // Then
        await waitForFileToBeWritten();
        expect(getLastLine(errorLogFile)).toContain(expectedLogLine);
    });

    test('connection_ConnectToExistingRegion_Success', async () => {
        // Given
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);
        const connection = new AWS.EC2({ region: awsRegion });

        // When
        const client_connection = client.connection

        // Then
        expect(client_connection.config.region).toEqual(connection.config.region);
    });

    test('connection_ConnectToNonExistingRegion_ThrowException', async () => {
        // Given
        const awsRegion = 'non-existing-region';

        // When
        await expect(AwsCloudClientImpl.initialize(awsRegion)).rejects.toThrow(RegionNotFoundException);

        // Then
        // Exception is thrown
    });

    test('exists_ExistingVpc_True', async () => {
        // Given
        const givenVpcName = 'vpc-deliver';
        const expectedResult = true;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.VPC, givenVpcName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingVpc_False', async () => {
        // Given
        const givenVpcName = 'vpc-name-which-does-not-exist';
        const expectedResult = false;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.VPC, givenVpcName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_ExistingInstance_True', async () => {
        // Given
        const givenInstanceName = 'debian';
        const expectedResult = true;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.INSTANCE, givenInstanceName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingInstance_False', async () => {
        // Given
        const givenInstanceName = 'non-existing-instance';
        const expectedResult = false;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.INSTANCE, givenInstanceName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_ExistingImage_True', async () => {
        // Given
        const givenImageName = 'team-backup-ami-jest-1';
        const expectedResult = true;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.IMAGE, givenImageName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingImage_False', async () => {
        // Given
        const givenImageName = 'non-existing-image';
        const expectedResult = false;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.IMAGE, givenImageName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test("exists_ExistingName_Success", async () => {
        // Given
        const givenKeyPairName = "test";
        const expectedResult = true;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.KEYPAIR, givenKeyPairName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test("exists_NotExistingName_Success", async () => {
        // Given
        const givenKeyPairName = "keypair-name-which-does-not-exist";
        const expectedResult = false;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.KEYPAIR, givenKeyPairName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_ExistingBudget_True', async () => {
        // Given
        const givenBudgetName = 'SaaS-CPNV';
        const accountId = '709024702237';
        const expectedResult = true;
        const logDirectory = 'logs';
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion, logDirectory, accountId);

        // When
        const result = await client.exists(AwsCloudClientImpl.BUDGET, givenBudgetName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingBudget_True', async () => {
        // Given
        const givenBudgetName = 'non-existing-budget';
        const accountId = '709024702237';
        const expectedResult = false;
        const logDirectory = 'logs';
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion, logDirectory, accountId);

        // When
        const result = await client.exists(AwsCloudClientImpl.BUDGET, givenBudgetName);

        // Then
        expect(result).toBe(expectedResult);
    })

    test('exists_ExistingSubnet_True', async () => {
        // Given
        const givenSubnetName = 'subnet-deliver-01';
        const expectedResult = true;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.SUBNET, givenSubnetName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingSubnet_False', async () => {
        // Given
        const givenSubnetName = 'non-existing-subnet';
        const expectedResult = false;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.SUBNET, givenSubnetName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_ExistingInternetGateway_True', async () => {
        // Given
        const givenInternetGatewayName = 'gty-01';
        const expectedResult = true;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.INTERNET_GATEWAY, givenInternetGatewayName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingInternetGateway_False', async () => {
        // Given
        const givenInternetGatewayName = 'non-existing-internet-gateway';
        const expectedResult = false;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.INTERNET_GATEWAY, givenInternetGatewayName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_ExistingSnapshot_True', async () => {
        // Given
        const givenSnapshotName = 'snapshot-core-01';
        const expectedResult = true;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.SNAPSHOT, givenSnapshotName);

        // Then
        expect(result).toBe(expectedResult);
    });

    test('exists_NonExistingSnapshot_True', async () => {
        // Given
        const givenSnapshotName = 'non-existing-snapshot';
        const expectedResult = false;
        const awsRegion = 'eu-west-3';
        const client = await AwsCloudClientImpl.initialize(awsRegion);

        // When
        const result = await client.exists(AwsCloudClientImpl.SNAPSHOT, givenSnapshotName);

        // Then
        expect(result).toBe(expectedResult);
    });
});
