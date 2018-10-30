const fs = require('fs');

let config = module.exports = {};

config.env = 'local';

config.default = {
    protocol: 'http',
    port: 4000,
    host: '0.0.0.0',
    basePath: '/'
};

config.log = {
    level: process.env.LOG_LEVEL,
    handleExceptions: true,
    json: false,
    colorize: true,
    label: 'ibm-manufacturer-server'
}