"use strict";

const { FileException } = require('./FileException');

/** An exception that is thrown when we try to log into a directory that is not writable. */
class FileCreationPermissionDeniedException extends FileException {}

module.exports = { FileCreationPermissionDeniedException };