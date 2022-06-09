const { AwsCloudClientImpl } = require("../AwsCloudClientImpl");
const { Logger } = require('../Logger');
const { waitForFileToBeWritten, getLastLine } = require('../lib/file');

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
        const client = new AwsCloudClientImpl(awsRegion, logDirectory);

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
        const client = new AwsCloudClientImpl(awsRegion, logDirectory);

        // When
        client.log(message, logType);

        // Then
        await waitForFileToBeWritten();
        expect(getLastLine(errorLogFile)).toContain(expectedLogLine);
    });
});
