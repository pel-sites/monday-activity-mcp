#!/usr/bin/env bash
set -euo pipefail

REPO="pel-sites/monday-activity-views"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$SCRIPT_DIR/../db"

mkdir -p "$DB_DIR"

echo "Fetching monday.db from latest release of $REPO..."
gh release download --repo "$REPO" --pattern 'monday.db' --dir "$DB_DIR" --clobber

echo "Downloaded to $DB_DIR/monday.db"
echo "Size: $(ls -lh "$DB_DIR/monday.db" | awk '{print $5}')"
