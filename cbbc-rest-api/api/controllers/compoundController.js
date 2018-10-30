const LOGGER = require('../../utils/logger');
const compoundService = require('../hlf-api/CompoundService');

module.exports = {
    save: save,
    find: find
};

function find(req, res) {
    let query = req.body.query;
    compoundService.find(JSON.stringify(query)).then(data => {
        console.log('find', data);
        let retVal = JSON.parse(data.toString("utf8"));
        res.status(200).json(retVal);
    }).catch(err =>{
        console.log('find.err', err);
        res.status(err.statusCode).json(err);
    });
}

function save(req, res) {
    let txId = req.txId;
    console.log('CompoundController.save.txId', txId);
    let body = req.body;
    let key = body.key;
    let compound = body.compound;
    compoundService.save(txId, key, compound).then(data => {
        res.status(200).json(data);
    }).catch(err =>{
        console.log('save.err', err);
        res.status(err.statusCode).json(err);
    });
}
