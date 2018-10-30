'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  async Init(stub) {
    console.info('Init.stub', Object.getOwnPropertyNames(stub));
    console.info('=========== Instantiated compound chaincode ===========');
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
    let compounds = [];
    compounds.push({
      title: 'Vilniaus sandelys',
      description:'Vilniaus sandelio aprasymas',
      location:{
        country:'LT',
        city:'Vilnius'
      }
    });
    compounds.push({
      title: 'Kauno sandelys',
      description:'Kauno sandelio aprasymas',
      location:{
        country:'LT',
        city:'Kaunas'
      }
    });
    compounds.push({
      title: 'Klaipedos sandelys',
      description:'Klaipedos sandelio aprasymas',
      location:{
        country:'LT',
        city:'Klaipeda'
      }
    });
    for (let i = 0; i < compounds.length; i++) {
      let compound = compounds[i];
      compound.docType = 'compound';
      let key = compound.docType + i;
      await stub.putState(key, JSON.stringify(compound));
      console.info('Added <--> ', compound);
    }
    console.info('============= END : Initialize Ledger ===========');
  }

  async save(stub, args) {
    console.info('============= START : Save compound ===========');
    let key = args[0];
    let compound = args[1];
    await stub.putState(key, compound);
    console.info('============= END : Save compound ===========');
  }

  async remove(stub, args) {
      console.info('============= START : Remove compound ===========');
      let key = args[0];
      await stub.deleteState(key);
      console.info('============= END : Remove compound ===========');
    }

  async findById(stub, args) {
    console.info('============= START : Find compound by ID ===========');
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting CarNumber ex: CAR01');
    }
    let id = args[0];
    let compoundAsBytes = await stub.getState(id);
    console.info('============= END : Find compound by ID ===========');
    return carAsBytes;
  }

  async findWithPagination(stub, args) {
    console.info('============= START : Find compounds with pagination. ===========');
    let query = args[0];
    let pageSize = parseInt(args[1]);
    let bookmark = args[2];
    let iterator = await stub.getQueryResultWithPagination(query, pageSize, bookmark);
    console.info('iterator', iterator);
    console.info('iterator', iterator.response);
    console.info('iterator', iterator.metadata);
    let retVal = [];
    while (true) {
      let res = await iterator.iterator.next();
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));
        jsonRes.Key = res.value.key;
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        retVal.push(jsonRes);
      }
      if (res.done) {
        await iterator.iterator.close();
        let tmpRetVal  =Buffer.from(JSON.stringify(retVal));
        console.info('============= END : Find compounds with pagination. ===========');
        return tmpRetVal;
      }
    }
  }

};

shim.start(new Chaincode());
