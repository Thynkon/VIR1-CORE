const Logger = require("../FileLogger");
const fs = require("fs");

describe('FileLogger', () => {
    test('info_LogInInfoLogFile_Success', async () => {
        // Given
        const message = 'Test info message';
        const expectedLogLine = `[INFO] - ${message}`;
        const infoLogFile = './logs/INFO.log';

        // When
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
        Logger.error(message);

        // Then
        await waitForFileToBeWritten();
        expect(getLastLine(errorLogFile)).toContain(expectedLogLine);
    });
});

async function waitForFileToBeWritten() {
    await new Promise(resolve => setTimeout(resolve, 100));
}

function getLastLine(filePath) {
    return fs.readFileSync(filePath, "utf8").trim().split("\n").pop();
}
