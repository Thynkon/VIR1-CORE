const { Logger } = require('./src/Logger.js');
const { AwsCloudClientImpl } = require('./src/AwsCloudClientImpl');
const { RegionNotFoundException } = require('./src/exceptions/RegionNotFoundException');
const { FileCreationPermissionDeniedException } = require('./src/exceptions/FileCreationPermissionDeniedException');

/** Logger */
exports.Logger = Logger;

/** AwsCloudClientImpl */
exports.AwsCloudClientImpl = AwsCloudClientImpl;

/** RegionNotFoundException */
exports.RegionNotFoundException = RegionNotFoundException;

/** FileCreationPermissionDeniedException */
exports.FileCreationPermissionDeniedException = FileCreationPermissionDeniedException;
