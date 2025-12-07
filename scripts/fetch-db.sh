#!/usr/bin/env bash
set -euo pipefail

REPO="pel-sites/monday-activity-views"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$SCRIPT_DIR/../db"

mkdir -p "$DB_DIR"

# Skip if db already exists
if [ -f "$DB_DIR/monday.db" ]; then
  echo "Database already exists at $DB_DIR/monday.db"
  echo "Size: $(ls -lh "$DB_DIR/monday.db" | awk '{print $5}')"
  exit 0
fi

echo "Fetching monday.db from latest release of $REPO..."

# Try gh CLI first (works locally with auth)
if command -v gh &> /dev/null; then
  echo "Using gh CLI..."
  gh release download --repo "$REPO" --pattern 'monday.db' --dir "$DB_DIR" --clobber
elif [ -n "${GITHUB_TOKEN:-}" ]; then
  # Use token for private repo access
  echo "Using GITHUB_TOKEN..."

  # Get latest release info with auth
  RELEASE_INFO=$(curl -sL -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/releases/latest")

  DOWNLOAD_URL=$(echo "$RELEASE_INFO" | grep -o '"browser_download_url": *"[^"]*monday.db"' | cut -d'"' -f4)

  if [ -z "$DOWNLOAD_URL" ]; then
    echo "Error: Could not find monday.db in latest release"
    exit 1
  fi

  echo "Downloading from: $DOWNLOAD_URL"
  curl -L -H "Authorization: token $GITHUB_TOKEN" -o "$DB_DIR/monday.db" "$DOWNLOAD_URL"
else
  echo "Error: No authentication available (need gh CLI or GITHUB_TOKEN)"
  exit 1
fi

echo "Downloaded to $DB_DIR/monday.db"
echo "Size: $(ls -lh "$DB_DIR/monday.db" | awk '{print $5}')"
