#!/bin/bash
# Remove the Jarvis LaunchAgent. The server stops starting at login; nothing
# else changes and no data is touched.
#
#   npm run launchd:uninstall

set -euo pipefail

LABEL="com.markadler.jarvis"
TARGET="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ ! -f "$TARGET" ]; then
  echo "  Not installed — nothing to do."
  exit 0
fi

launchctl unload "$TARGET" 2>/dev/null || true
rm "$TARGET"
echo "  Removed $TARGET"
echo "  The server is no longer started at login. Run it by hand with: npm run dev"
