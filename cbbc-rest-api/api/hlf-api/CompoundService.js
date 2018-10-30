'use strict';
const fabricHelper = require('./FabricHelper');

module.exports ={
	find:find,
	save:save
}

function ensureDocType(compound){
    compound.docType = 'compound';
    return compound;
}

function ensureKey(key, txId){
    if(key === null || key === undefined){
        key = txId._transaction_id;
    }
    return key;
}

function find(query){
	const request = {
    	chaincodeId: 'compound',
    	fcn: 'findWithPagination',
        args: [query, '5', '']
    };
    return fabricHelper.getChannel().queryByChaincode(request);
}

function save(txId, key, compound){
    key = ensureKey(key, txId);
    compound = ensureDocType(compound);
    const request = {
        chaincodeId: 'compound',
    	fcn: 'save',
    	args:[key, JSON.stringify(compound)],
    	chainId: 'mychannel',
    	txId: txId
    };
    console.log('CompoundService.save.txId', request.txId);
    return fabricHelper.invokeAndVerifyChaincode(request);
}
