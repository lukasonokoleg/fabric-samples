#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# Shut down the Docker containers that might be currently running.
docker-compose -f docker-compose.yml stop
docker-compose -f docker-compose-cli.yml stop
docker-compose -f docker-compose-ca.yml stop
