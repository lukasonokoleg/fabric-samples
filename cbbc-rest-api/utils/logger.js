const CONFIG = require('../config/index');
const winston = require('winston');

const LOGGER = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: CONFIG.log.level,
            handleExceptions: CONFIG.log.handleExceptions,
            json: CONFIG.log.json,
            colorize: CONFIG.log.colorize,
            label: CONFIG.log.label
        })
    ],
    exitOnError: false
});

const DEBUG = (message, data) => {
    LOGGER.debug(message, data)
}

const INFO = (message, data) => {
    LOGGER.info(message, data)
}

const ERROR = (message, data) => {
    LOGGER.error(message, data)
}

module.exports = {
    debug: DEBUG,
    info: INFO,
    error: ERROR
};