"use script";

const { Logger } = require("../Logger");
const { waitForFileToBeWritten, getLastLine, createNotWritableDirectory, deleteDirectory } = require('../lib/file');
const { FileCreationPermissionDeniedException } = require('../exceptions/FileCreationPermissionDeniedException');

describe('Logger', () => {
    test('info_LogInInfoLogFile_Success', async () => {
        // Given
        const message = 'Test info message';
        const expectedLogLine = `[INFO] - ${message}`;
        const infoLogFile = './logs/INFO.log';

        // When
        //TODO NGY - Missing log path parameter in info message ?
        Logger.info(message);

        // Then
        await waitForFileToBeWritten();
        expect(getLastLine(infoLogFile)).toContain(expectedLogLine);
    });

    test('error_LogInErrorLogFile_Success', async () => {
        // Given
        const message = 'Test error message';
        const expectedLogLine = `[ERROR] - ${message}`;
        const errorLogFile = './logs/ERROR.log';

        // When
        //TODO NGY - Missing log path parameter in info message ?
        Logger.error(message);

        // Then
        await waitForFileToBeWritten();
        expect(getLastLine(errorLogFile)).toContain(expectedLogLine);
    });
});

describe('Logger_NotWritableDirectory', () => {
    let logDirectory;

    beforeAll(() => {
        logDirectory = 'notWritableDirectory';
        createNotWritableDirectory(logDirectory);
    });

    test('info_LogInInfoLogFile_ThrowException', () => {
        // Given
        const message = 'Test error message';

        // When
        // Reference: https://stackoverflow.com/a/60433457
        expect(() => Logger.error(message, logDirectory)).toThrow(
            FileCreationPermissionDeniedException
        );

        // Then
        // Exception is thrown
    });

    afterAll(() => {
        deleteDirectory(logDirectory);
    });
});
