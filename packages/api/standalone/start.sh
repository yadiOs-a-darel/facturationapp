#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export NODE_ENV=production
exec "$SCRIPT_DIR/bin/node" "$SCRIPT_DIR/app/dist/index.js" "$@"
