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
    console.info('=========== Instantiated packages chaincode ===========');
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
    let packages = [];
    packages.push({
        productKey: 'product0',
        compoundKey: 'compound0',
        count: 10
    });
    for (let i = 0; i < packages.length; i++) {
      let package = packages[i];
      package.docType = 'package';
      let key = package.docType + i;
      await stub.putState(key, JSON.stringify(package));
      console.info('Added <--> ', package);
    }
    console.info('============= END : Initialize Ledger ===========');
  }

  async save(stub, args) {
    console.info('============= START : Save package ===========');
    let key = args[0];
    let package = args[1];
    await stub.putState(key, package);
    console.info('============= END : Save package ===========');
  }

  async remove(stub, args) {
      console.info('============= START : Remove package ===========');
      let key = args[0];
      await stub.deleteState(key);
      console.info('============= END : Remove package ===========');
    }

  async findById(stub, args) {
    console.info('============= START : Find package by ID ===========');
    let id = args[0];
    let packageAsBytes = await stub.getState(id);
    console.info('============= END : Find package by ID ===========');
    return packageAsBytes;
  }

  async findWithPagination(stub, args) {
    console.info('============= START : Find packages with pagination. ===========');
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
        console.info('============= END : Find packages with pagination. ===========');
        return tmpRetVal;
      }
    }
  }

};

shim.start(new Chaincode());
