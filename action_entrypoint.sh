#!/bin/bash
set -e

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

ARGS=""

if [[ "${INPUT_ENABLE_EMPTY_DAYS}" == "true" ]]; then
  ARGS="--enable-empty-days"
fi

npm ci --prefix "$SCRIPT_DIR"
node "$SCRIPT_DIR/dist/cli.js" $ARGS
node "$SCRIPT_DIR/dist/cli.js" --dark $ARGS
