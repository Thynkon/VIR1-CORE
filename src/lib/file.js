"use strict";

const fs = require('fs');
const {resolve} = require('path');
const ENCODING = 'utf8';

async function waitForFileToBeWritten() {
    await new Promise(resolve => setTimeout(resolve, 100));
}

function getLastLine(filePath) {
    return fs.readFileSync(filePath, ENCODING).trim().split('\n').pop();
}

function readFile(path) {
    return fs.readFileSync(resolve(path), ENCODING);
}

module.exports = { waitForFileToBeWritten, getLastLine, readFile };