#!/bin/bash
# Install the Jarvis LaunchAgent, so the server starts at login.
#
#   npm run launchd:install
#
# Writes one file to ~/Library/LaunchAgents and loads it. Undo with
# `npm run launchd:uninstall` — nothing else on the system is touched.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE="$(command -v node)"
LABEL="com.markadler.jarvis"
TARGET="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ -z "$NODE" ]; then
  echo "node not found on PATH. Install node, then re-run." >&2
  exit 1
fi

echo "  node:   $NODE"
echo "  repo:   $DIR"
echo "  plist:  $TARGET"

mkdir -p "$HOME/Library/LaunchAgents"

sed -e "s|__NODE__|$NODE|g" \
    -e "s|__DIR__|$DIR|g" \
    -e "s|__HOME__|$HOME|g" \
    "$DIR/launchd/$LABEL.plist" > "$TARGET"

# Replacing an existing agent: unload first, ignore "not loaded".
launchctl unload "$TARGET" 2>/dev/null || true
launchctl load  "$TARGET"

echo
echo "  Loaded. Check it came up:"
echo "    curl -s localhost:3001/api/plans/health"
echo "  Logs:"
echo "    tail -f ~/Library/Logs/jarvis.log"
echo
echo "  Note: the server needs Full Disk Access to read the iMessage database."
echo "  System Settings → Privacy & Security → Full Disk Access → add the node"
echo "  binary above. Everything else works without it."
