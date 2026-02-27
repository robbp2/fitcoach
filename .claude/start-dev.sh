#!/bin/zsh
export PATH="/opt/homebrew/bin:$PATH"
exec node node_modules/.bin/next dev --port 3456
