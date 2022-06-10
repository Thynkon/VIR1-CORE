const { AwsCloudClientImpl } = require("../AwsCloudClientImpl");
const { Logger } = require('../Logger');
const AWS = require('aws-sdk');
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
});
