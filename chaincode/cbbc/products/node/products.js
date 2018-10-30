/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  async Init(stub) {
    console.info('Init.stub', Object.getOwnPropertyNames(stub));
    console.info('=========== Instantiated products chaincode ===========');
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async initLedger(stub, args) {
    console.info('============= START : Initialize Ledger ===========');
    let products = [];
    products.push({
        name: 'Volkswagen - golf',
        type: 'VEHICLE',
        um: 'UNIT',
        description: 'Best car of 90_ies teenagers'
    });
    products.push({
        name: 'IPhone 6',
        type: 'MOBILE_PHONE',
        um: 'UNIT',
        description: 'You can get it for free in IBM'
    });
    for (let i = 0; i < products.length; i++) {
      let product = products[i];
      product.docType = 'product';
      let key = product.docType + i;
      await stub.putState(key, JSON.stringify(product));
      console.info('Added <--> ', product);
    }
    console.info('============= END : Initialize Ledger ===========');
  }

  async save(stub, args) {
    console.info('============= START : Save product ===========');
    let key = args[0];
    let product = args[1];
    await stub.putState(key, product);
    console.info('============= END : Save compound ===========');
  }

  async remove(stub, args) {
      console.info('============= START : Remove product ===========');
      let key = args[0];
      await stub.deleteState(key);
      console.info('============= END : Remove product ===========');
    }

  async findById(stub, args) {
    console.info('============= START : Find product by ID ===========');
    let id = args[0];
    let productAsBytes = await stub.getState(id);
    console.info('============= END : Find product by ID ===========');
    return productAsBytes;
  }

  async findWithPagination(stub, args) {
    console.info('============= START : Find products with pagination. ===========');
    let query = args[0];
    let pageSize = args[1];
    let bookmark = args[2];
    let iterator = await stub.getQueryResultWithPagination(query);
    let retVal = [];
    while (true) {
      let res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));
        jsonRes.Key = res.value.key;
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        retVal.push(jsonRes);
      }
      if (res.done) {
        await iterator.close();
        let tmpRetVal  =Buffer.from(JSON.stringify(retVal));
        console.info('============= END : Find products with pagination. ===========');
        return tmpRetVal;
      }
    }
  }

};

shim.start(new Chaincode());
