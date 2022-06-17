"use strict";

const log4js = require('log4js');

/** Class that stores log messages in files */
class Logger {
    /**
     * The logger instance.
     * @type {Logger}
     * @private
     * @static
     */
    static #_logger;
    /**
     * Error message type
     * @type {integer}
     * @public
     * @static
     */
    static ERROR = 0;
    /**
     * Info message type
     * @type {integer}
     * @private
     * @public
     */
    static INFO = 1;

    /**
     * Setup the default log appender
     * @param {string} path - The path of the log file
     */
    static #setupLogger(path = 'logs') {
        log4js.configure({
            appenders: {
                default: {
                    type: 'multiFile',
                    base: path,
                    property: 'level',
                    extension: '.log',
                    layout: { type: 'pattern', pattern: '[%d] [%p] - %m' },
                },
            },
            categories: { default: { appenders: ['default'], level: 'ALL' } },
        });
    }

    /**
     * @returns {Logger}
     * @see https://log4js-node.github.io/log4js-node/index.html
     */
    static get #logger() {
        if (!this.#_logger) {
            this.#setupLogger();
            this.#_logger = log4js.getLogger();
        }

        return this.#_logger;
    }

    /**
     * Store an info level log
     * @param {string} message - The message to be logged
     * @param {string} path - The path of the log file
     */
    static info(message, path = "logs") {
        if (path) {
            this.#setupLogger(path);
        }
        this.#logger.info(message);
    }

    /**
     * Store an error level log
     * @param {string} message - The message to be logged
     * @param {string} path - The path of the log file
     */
    static error(message, path = "logs") {
        if (path) {
            this.#setupLogger(path);
        }
        this.#logger.error(message);
    }
}

module.exports = { Logger };