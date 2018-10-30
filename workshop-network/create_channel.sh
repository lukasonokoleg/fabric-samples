#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev
export MSYS_NO_PATHCONV=1

# Create the channel
docker exec -e "CORE_PEER_LOCALMSPID=ManufacturerMSP" -e "CORE_PEER_ADDRESS=peer0.manufacturer.cbbc.lt:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.cbbc.lt/users/Admin@manufacturer.cbbc.lt/msp" man_cli peer channel create -o orderer.cbbc.lt:7050 -c cbbc -f /etc/hyperledger/config/channel.tx
# Join peer0.manufacturer.cbbc.lt to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=ManufacturerMSP" -e "CORE_PEER_ADDRESS=peer0.manufacturer.cbbc.lt:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manufacturer.cbbc.lt/users/Admin@manufacturer.cbbc.lt/msp" man_cli peer channel join -b cbbc.block
# Join peer0.retailer.cbbc.lt to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=RetailerMSP" -e "CORE_PEER_ADDRESS=peer0.retailer.cbbc.lt:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/retailer.cbbc.lt/users/Admin@retailer.cbbc.lt/msp" man_cli peer channel join -b cbbc.block
# Join peer0.expeditor.cbbc.lt to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=ExpeditorMSP" -e "CORE_PEER_ADDRESS=peer0.expeditor.cbbc.lt:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/expeditor.cbbc.lt/users/Admin@expeditor.cbbc.lt/msp" man_cli peer channel join -b cbbc.block
# Join peer0.auditor.cbbc.lt to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=AuditorMSP" -e "CORE_PEER_ADDRESS=peer0.auditor.cbbc.lt:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/auditor.cbbc.lt/users/Admin@auditor.cbbc.lt/msp" man_cli peer channel join -b cbbc.block