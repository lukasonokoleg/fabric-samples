#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
./stop.sh
./teardown.sh
./start.sh
./create_channel.sh
./installCompound.sh
