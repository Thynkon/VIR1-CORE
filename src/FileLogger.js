const log4js = require('log4js');

module.exports = class FileLogger {
    static #_logger;

    /**
     * @returns {Logger}
     * @see https://log4js-node.github.io/log4js-node/index.html
     */
    static get #logger() {
        if (!FileLogger.#_logger) {
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

            FileLogger.#_logger = log4js.getLogger();
        }

        return FileLogger.#_logger;
    }

    static info(message) {
        FileLogger.#logger.info(message);
    }

    static error(message) {
        FileLogger.#logger.error(message);
    }
}
