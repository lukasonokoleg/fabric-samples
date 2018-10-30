let config = require('./config.default.js');
let fs = require('fs');
let fileName = 'config';
let externalConfigFile = 'local-settings/' + fileName;

if(!fs.existsSync(externalConfigFile + '.js')){
    console.log(fs.realPathSync(externalConfigFile + '.js'));
    let error = 'File is not found! ' + externalConfigFile + '.js';

    console.error(error);
    throw new Error(error);
}

let externalConfig = require('../' + externalConfigFile);

config.env = 'local';
config.default.port = 4000;
config.log.level = 'debug';
config.log.handleExceptions = true;

module.exports = config;