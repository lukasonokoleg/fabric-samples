let env = process.env.NODE_ENV || 'local';
let cfg = require('./config.' + env);

module.exports = cfg;