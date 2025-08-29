#!/bin/bash
set -e

ARGS=""

if [[ "${INPUT_ENABLE_EMPTY_DAYS}" == "true" ]]; then
  ARGS="--enable-empty-days"
fi

node dist/cli.js $ARGS
node dist/cli.js --dark $ARGS
