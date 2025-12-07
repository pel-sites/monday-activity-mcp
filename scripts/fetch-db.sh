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

  # Get the monday.db asset API URL (not browser URL) for proper auth
  # Look for the asset with name "monday.db" and get its API url
  ASSET_URL=$(echo "$RELEASE_INFO" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for asset in data.get('assets', []):
    if asset.get('name') == 'monday.db':
        print(asset.get('url'))
        break
")

  if [ -z "$ASSET_URL" ]; then
    echo "Error: Could not find monday.db asset in latest release"
    echo "Release info: $RELEASE_INFO"
    exit 1
  fi

  echo "Downloading from API: $ASSET_URL"
  curl -L \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/octet-stream" \
    -o "$DB_DIR/monday.db" \
    "$ASSET_URL"
else
  echo "Error: No authentication available (need gh CLI or GITHUB_TOKEN)"
  exit 1
fi

echo "Downloaded to $DB_DIR/monday.db"
echo "Size: $(ls -lh "$DB_DIR/monday.db" | awk '{print $5}')"
