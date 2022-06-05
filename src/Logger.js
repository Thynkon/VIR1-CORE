const log4js = require('log4js');

/** Class that stores log messages in files */
class Logger {
    static #_logger;

    /**
     * @returns {Logger}
     * @see https://log4js-node.github.io/log4js-node/index.html
     */
    static get #logger() {
        if (!Logger.#_logger) {
            log4js.configure({
                appenders: {
                    default: {
                        type: 'multiFile',
                        base: 'logs/',
                        property: 'level',
                        extension: '.log',
                        layout: { type: 'pattern', pattern: '[%d] [%p] - %m' },
                    },
                },
                categories: { default: { appenders: ['default'], level: 'ALL' } },
            });

            Logger.#_logger = log4js.getLogger();
        }

        return Logger.#_logger;
    }

    /**
     * Store an info level log
     * @param {string} message - The message to be logged
     */
    static info(message) {
        Logger.#logger.info(message);
    }

    /**
     * Store an error level log
     * @param {string} message - The message to be logged
     */
    static error(message) {
        Logger.#logger.error(message);
    }
}

module.exports = { Logger };