const log4js = require('log4js');
const { FileCreationPermissionDeniedException } = require('./exceptions/FileCreationPermissionDeniedException');
const { isDirectoryWritable } = require('./lib/file');

/** Class that stores log messages in files */
class Logger {
    static #_logger;
    static ERROR = 0;
    static INFO = 1;

    /**
     * Setup the default log appender
     * @param {string} path - The path of the log file
     */
    static #setupLogger(path = "logs") {
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
     * Store a log message
     * @param {string} message - The message to be logged
     * @param {integer} type - The type of the log message
     * @param {string} path - The path of the log file
     * @exception FileCreationPermissionDeniedException is thrown if the log directory is not writable
     */
    static #log(message, type, path) {
        if (path) {
            if (!isDirectoryWritable(path)) {
                throw new FileCreationPermissionDeniedException();
            }
            this.#setupLogger(path);
        }

        switch (type) {
            case this.INFO:
                this.#logger.info(message);
                break;

            case this.ERROR:
                this.#logger.error(message);
                break;

            default:
                break
        }
    }

    /**
     * Store an info level log
     * @param {string} message - The message to be logged
     * @param {string} path - The path of the log file
     */
    static info(message, path) {
        this.#log(message, this.INFO, path);
    }

    /**
     * Store an error level log
     * @param {string} message - The message to be logged
     * @param {string} path - The path of the log file
     */
    static error(message, path) {
        this.#log(message, this.ERROR, path);
    }
}

module.exports = { Logger };