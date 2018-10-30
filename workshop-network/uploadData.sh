#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
LANGUAGE=node
CC_NAME=compound
CC_SRC_PATH=/opt/gopath/src/github.com/cbbc/compound/node

# clean the keystore
rm -rf ./hfc-key-store

# launch network; create channel and join peer to channel
cd ../basic-network

for run in {1..1000}
do
    docker exec -e "CORE_PEER_LOCALMSPID=ManufacturerMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.cbbc.lt/users/Admin@manufacturer.cbbc.lt/msp" man_cli peer chaincode invoke -o orderer.cbbc.lt:7050 -C cbbc -n compound -c '{"function":"initLedger","Args":[""]}'
done


