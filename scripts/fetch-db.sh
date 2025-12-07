#!/usr/bin/env bash
set -euo pipefail

REPO="pel-sites/monday-activity-views"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$SCRIPT_DIR/../db"

mkdir -p "$DB_DIR"

echo "Fetching monday.db from latest release of $REPO..."

# Get the latest release download URL via GitHub API
DOWNLOAD_URL=$(curl -sL "https://api.github.com/repos/$REPO/releases/latest" | \
  grep -o '"browser_download_url": *"[^"]*monday.db"' | \
  cut -d'"' -f4)

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Error: Could not find monday.db in latest release"
  exit 1
fi

echo "Downloading from: $DOWNLOAD_URL"
curl -L -o "$DB_DIR/monday.db" "$DOWNLOAD_URL"

echo "Downloaded to $DB_DIR/monday.db"
echo "Size: $(ls -lh "$DB_DIR/monday.db" | awk '{print $5}')"
