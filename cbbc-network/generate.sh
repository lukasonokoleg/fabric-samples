#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
CHANNEL_NAME=cbbcchannel

# remove previous crypto material and config transactions
rm -fr config/*
rm -fr crypto-config/*

# generate crypto material
cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  exit 1
fi

# generate genesis block for orderer
configtxgen -profile CBBCGenesis -outputBlock ./config/genesis.block -channelID $CHANNEL_NAME
if [ "$?" -ne 0 ]; then
  echo "Failed to generate orderer genesis block..."
  exit 1
fi

echo "===== Generating channel configuration transaction..."
configtxgen -profile CBBCChannel -outputCreateChannelTx ./config/channel.tx -channelID $CHANNEL_NAME
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

echo "===== Generating Manufacturer anchor peer transaction..."
configtxgen -profile CBBCChannel -outputAnchorPeersUpdate ./config/ManufacturerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ManufacturerMsp
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for ManufacturerMsp..."
  exit 1
fi

echo "===== Generating Retailer anchor peer transaction..."
configtxgen -profile CBBCChannel -outputAnchorPeersUpdate ./config/RetailerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg RetailerMsp
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for RetailerMsp..."
  exit 1
fi

echo "===== Generating Expeditor anchor peer transaction..."
configtxgen -profile CBBCChannel -outputAnchorPeersUpdate ./config/AuditorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ExpeditorMsp
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for ExpeditorMsp..."
  exit 1
fi

echo "===== Generating Auditor anchor peer transaction..."
configtxgen -profile CBBCChannel -outputAnchorPeersUpdate ./config/ExpeditorMSPanchors.tx -channelID $CHANNEL_NAME -asOrg AuditorMsp
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for AuditorMsp..."
  exit 1
fi