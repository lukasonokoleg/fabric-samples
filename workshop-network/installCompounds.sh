#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
LANGUAGE=node

# clean the keystore
rm -rf ./hfc-key-store

# launch network; create channel and join peer to channel
cd ../basic-network

docker exec -e "CORE_PEER_LOCALMSPID=ManufacturerMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.cbbc.lt/users/Admin@manufacturer.cbbc.lt/msp" man_cli peer chaincode install -n compounds -v 1.0 -p /opt/gopath/src/github.com/cbbc/compounds/node -l node
docker exec -e "CORE_PEER_LOCALMSPID=ManufacturerMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.cbbc.lt/users/Admin@manufacturer.cbbc.lt/msp" man_cli peer chaincode instantiate -o orderer.cbbc.lt:7050 -C cbbc -n compounds -l node -v 1.0 -c '{"Args":[""]}'
sleep 10
docker exec -e "CORE_PEER_LOCALMSPID=ManufacturerMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.cbbc.lt/users/Admin@manufacturer.cbbc.lt/msp" man_cli peer chaincode invoke -o orderer.cbbc.lt:7050 -C cbbc -n compounds -c '{"function":"initLedger","Args":[""]}'



