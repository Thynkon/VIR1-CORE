"use strict";

const fs = require('fs');
const { resolve } = require('path');
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

function isDirectoryWritable(path) {
    fs.access(path, fs.constants.W_OK, (err) => {
        if (err) {
            return false;
        }
        return true;
    });
}

function createNotWritableDirectory(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    fs.chmod(path, 0o400, (err) => {
        if (err) {
            throw err;
        }
    });
}

function deleteDirectory(path) {
    fs.rmSync(path, { recursive: true, force: true });
}

module.exports = { waitForFileToBeWritten, getLastLine, readFile, isDirectoryWritable, createNotWritableDirectory, deleteDirectory };
