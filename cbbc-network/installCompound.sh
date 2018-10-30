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
CORE_PEER_LOCALMSPID="CORE_PEER_LOCALMSPID=ManufacturerMsp"
CORE_PEER_MSPCONFIGPATH="CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.cbbc.lt/users/Admin@manufacturer.cbbc.lt/msp"
ORDERER_HOST=cbbc_orderer.cbbc.lt:7050
CHANNEL=cbbc_channel

docker exec -e $CORE_PEER_LOCALMSPID -e $CORE_PEER_MSPCONFIGPATH cli peer chaincode install -n $CC_NAME -v 1.0 -p $CC_SRC_PATH -l "$LANGUAGE"
docker exec -e $CORE_PEER_LOCALMSPID -e $CORE_PEER_MSPCONFIGPATH cli peer chaincode instantiate -o $ORDERER_HOST -C $CHANNEL -n $CC_NAME -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('ManufacturerMsp.member','RetailerMsp.member')"
sleep 10
docker exec -e $CORE_PEER_LOCALMSPID -e $CORE_PEER_MSPCONFIGPATH cli peer chaincode invoke -o $ORDERER_HOST -C $CHANNEL -n $CC_NAME -c '{"function":"initLedger","Args":[""]}'
