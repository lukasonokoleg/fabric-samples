#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}

CORE_PEER_LOCALMSPID="CORE_PEER_LOCALMSPID=ManufacturerMsp"
CORE_PEER_MSPCONFIGPATH="CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.cbbc.lt/users/Admin@manufacturer.cbbc.lt/msp"
export ORDERER=orderer.cbbc.lt:7050
export CHANNEL_TX=/etc/hyperledger/configtx/channel.tx
export CA_FILE=/etc/hyperledger/crypto/ordererOrganizations/cbbc.lt/orderers/orderer.cbbc.lt/msp/tlscacerts/tlsca.cbbc.lt-cert.pem


# Create the channel

docker exec peer0.manufacturer.cbbc.lt  peer channel create -o orderer.cbbc.lt:7050 -c cbbcchannel -f /etc/hyperledger/configtx/channel.tx

