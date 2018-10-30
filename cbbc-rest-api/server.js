const express = require('express');
const helmet = require('helmet');
const HTTP = require('http');
const PATH = require('path');
const bodyParser = require('body-parser');
const api = require('./routes/api');
const errorHandler = require('./utils/errorHandler');
const process = require('process');
const morgan = require('morgan');
const CONFIG = require('./config');
const LOGGER = require('./utils/logger');
const FabricHelper = require('./api/hlf-api/FabricHelper');

const app = express();
var fabric_client = null;

FabricHelper.init().then(fabric_client => {
    this.fabric_client = fabric_client;
}).catch(err => {
    console.log('Cought err on fabric init. Err: ', err);
});

let env, targetUrl, targetPort, deploymentName;

if(process.env.VCAP_SERVICES){
    env = JSON.parse(process.env.VCAP_SERVICES);
}

if(!env){
    deploymentName = 'local';
    targetPort = process.env.PORT || CONFIG.default.port;
}
app.use(helmet());
app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(PATH.join(__dirname, '../static')));

app.all('/api/*',function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    req.config = {};
    req.txId = FabricHelper.createTransactionId();
    req.config.proxy = {
        protocol: req.protocol,
        host: req.hostname,
        basePath: '/',
        baseUrl: req.protocol + '://' + req.host
    };
    next();
});

app.use('/api', api);
app.use(errorHandler);

app.get('*', (req, res) => {
    res.sendFile(PATH.join(__dirname, '/static/index.html'));
});

const SERVICE_NAME = 'IBM manufacturer Service';
const TARGET_PROTOCOL = CONFIG.default.protocol;
const TARGET_HOST = CONFIG.default.host;
const TARGET_BASE_PATH = CONFIG.default.basePath;
targetUrl = TARGET_PROTOCOL + '://' + TARGET_HOST + ':'+ targetPort + TARGET_BASE_PATH;

const ON_LISTEN = function(){
    LOGGER.info('-----------------------------------------------------------------------')
    LOGGER.info('Started: ' + SERVICE_NAME);
    LOGGER.info('Deployment: ' + deploymentName);
    LOGGER.info('Environment: ' + CONFIG.env);
    LOGGER.info('Server started on: ' + targetUrl.replace('0.0.0.0', 'localhost'));
    LOGGER.info('-----------------------------------------------------------------------')
};

const ROOT_PATH = PATH.normalize(__dirname, '/');

process.on('unhandledRejection', function(reason, p){
    LOGGER.debug('Unhandled rejection: ', reason);
    LOGGER.debug('Promise: ', p);
});

const SERVER = HTTP.createServer(app);
SERVER.listen(targetPort, TARGET_HOST, () => ON_LISTEN());

module.exports = app;
