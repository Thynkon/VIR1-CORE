"use strict";

const fs = require('fs');

async function waitForFileToBeWritten() {
    await new Promise(resolve => setTimeout(resolve, 100));
}

function getLastLine(filePath) {
    return fs.readFileSync(filePath, 'utf8').trim().split('\n').pop();
}

module.exports = { waitForFileToBeWritten, getLastLine };