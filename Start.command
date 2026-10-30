#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec "${NODE_EXE:-node}" server.mjs
