"use strict";

/** An exception that is thrown when we try to access to a region that does not exist. */
class RegionNotFoundException extends Error {}

module.exports = { RegionNotFoundException };