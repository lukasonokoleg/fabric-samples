const Fabric_Client = require('fabric-client');
const Fabric_CA_Client = require('fabric-ca-client');
const path = require('path');
const util = require('util');

var store_path = {path:path.join(__dirname, 'hfc-key-store')};
var fabric_client = null;
var fabric_state_store = null;
var fabric_ca_client = null;
var admin_user = null;
var channel = null;
var peer = null;
var order = null;

module.exports = {
    init:init,
    initUser:initUser,
    createTransactionId:createTransactionId,
    getChannel:getChannel,
    invokeAndVerifyChaincode:invokeAndVerifyChaincode
}

function notifyEventHub(transaction_id_string){
    let retVal = new Promise((resolve, reject) => {
        let event_hub = channel.newChannelEventHub(peer);
        let handle = setTimeout(() => {
            event_hub.unregisterTxEvent(transaction_id_string);
            event_hub.disconnect();
            resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
        }, 3000);
        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
            // this is the callback for transaction event status
            // first some clean up of event listener
            clearTimeout(handle);
            // now let the application know what happened
            var return_status = {event_status : code, tx_id : transaction_id_string};
            if (code !== 'VALID') {
                console.error('The transaction was invalid, code = ' + code);
                reject(new Error('Problem with the tranaction, event status ::'+code));
            } else {
                console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
                resolve(return_status);
            }
        }, (err) => {
            //this is the callback if something goes wrong with the event registration or processing
            reject(new Error('There was a problem with the eventhub ::'+err));
        },{disconnect: true}); //disconnect when complete
        event_hub.connect();
    });
    return retVal;
}

function isNullOrUndefined(object){
    return object === null || object === undefined;
}

function invokeAndVerifyChaincode(request){
    let retVal = new Promise((resolve, reject) => {
        getChannel().sendTransactionProposal(request).then(results => {
            var proposalResponses = results[0];
            var proposal = results[1];
            let isProposalGood = false;
            if (proposalResponses && proposalResponses[0].response &&	proposalResponses[0].response.status === 200) {
            	isProposalGood = true;
            	console.log('===== FabricHelper.invokeAndVerifyChainCode: Transaction proposal was good');
            } else {
                reject(new Error('Transaction proposal was bad'));
            }
            if (isProposalGood) {
                console.log('===== FabricHelper.invokeAndVerifyChainCode: ' + util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',	proposalResponses[0].response.status, proposalResponses[0].response.message));
            }
            // build up the request for the orderer to have the transaction committed
            var channelRequest = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            // set the transaction listener and set a timeout of 30 sec
            // if the transaction did not get committed within the timeout period,
            // report a TIMEOUT status
            //Get the transaction ID string to be used by the event processing
            var transaction_id_string = request.txId._transaction_id;
            var promises = [];
            var sendPromise = channel.sendTransaction(channelRequest);
            //we want the send transaction first, so that we know where to check status
            promises.push(sendPromise);
            promises.push(notifyEventHub(transaction_id_string));
            Promise.all(promises).then(results => {
                console.log('===== FabricHelper.invokeAndVerifyChainCode: Send transaction promise and event listener promise have completed...');
                let respFromOrderer = results[0];
                let respFromLedger = results[1];
                if(isNullOrUndefined(respFromOrderer)){
                    reject(new Error('Response from orderer [NULL or UNDEFINED]!'));
                }
                if(isNullOrUndefined(respFromLedger)){
                    reject(new Error('Response from ledger [NULL or UNDEFINED]!'));
                }
                if(respFromOrderer.status === 'SUCCESS' && respFromLedger.event_status === 'VALID'){
                    resolve({orderer_resp:'SUCCESS', ledger_resp:'VALID'});
                }else{
                    reject(new Error('ORDERER_RESP:[' + respFromOrderer.status + '], LEDGER_RESP:['+ respFromLedger.event_status+']!'));
                }
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
    return retVal;
}

function getChannel(){
    return channel;
}

function createTransactionId(){
    return fabric_client.newTransactionID();
}


function initAdminUser(){
    let retVal = new Promise((resolve, reject) => {
        fabric_client.getUserContext('admin', true).then(user_from_store => {
            console.log('===== FabricHelper.initAdminUser.start');
            console.log('===== FabricHelper.initAdminUser Checking if admin user is enrolled...');
            if (user_from_store && user_from_store.isEnrolled()) {
                admin_user = user_from_store;
                resolve(admin_user);
                console.log('===== FabricHelper.initAdminUser Admin user loaded from persistence...');
            } else {
                var enrollmentInfo = {
                    enrollmentID: 'admin',
                    enrollmentSecret: 'adminpw'
                };
                fabric_ca_client.enroll(enrollmentInfo).then(enrollment => {
                console.log('===== FabricHelper.initAdminUser Enrolling adming user...');
                    var adminUser = {
                        username: 'admin',
                        mspid: 'ManufacturerMSP',
                        cryptoContent: {
                            privateKeyPEM: enrollment.key.toBytes(),
                            signedCertPEM: enrollment.certificate
                        }
                    };
                    return fabric_client.createUser(adminUser);
                }).then(user => {
                    admin_user = user;
                    fabric_client.setUserContext(admin_user);
                    resolve(admin_user);
                    console.log('===== FabricHelper.initAdminUser Admin user created...');
                }).catch(err => {
                    reject(err);
                });
            }
        }).catch(err => {
            reject(err);
        });
    });
    return retVal;
}

function init(){
    let retVal = new Promise((resolve, reject) => {
        Fabric_Client.newDefaultKeyValueStore(store_path).then(state_store => {
            console.log('===== FabricHelper.init.start ');
            console.log('===== FabricHelper.init Fabric client created... ');
            fabric_client = new Fabric_Client();
            fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            var crypto_store = Fabric_Client.newCryptoKeyStore(store_path);
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
            console.log('===== FabricHelper.init Fabric client got crypto suite...');
            var	tlsOptions = {
                trustedRoots: [],
                verify: false
            };
            fabric_ca_client = new Fabric_CA_Client('http://localhost:7054', tlsOptions , 'ca.manufacturer.cbbc.lt', crypto_suite);
            initAdminUser().then(data => {
                console.log('===== FabricHelper.init creating channel... ');
                channel = fabric_client.newChannel('cbbc');
                console.log('===== FabricHelper.init creating peer... ');
                peer = fabric_client.newPeer('grpc://localhost:7051');
                channel.addPeer(peer);
                console.log('===== FabricHelper.init creating orderer... ');
                order = fabric_client.newOrderer('grpc://localhost:7050')
                channel.addOrderer(order);
                console.log('===== FabricHelper.init Fabric client got crypto suite...');
                resolve(fabric_client);
                console.log('===== FabricHelper.init.end ');
            }).catch(err =>{
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
    return retVal;
}

function initUser(){
    let retVal = new Promise((resolve, reject)=> {

    });
    return retVal;
}