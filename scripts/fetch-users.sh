#!/usr/bin/env bash
set -euo pipefail

REPO="pel-sites/monday-activity-tracker"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$SCRIPT_DIR/../data"

mkdir -p "$DATA_DIR"

if [ -f "$DATA_DIR/users.json" ]; then
  echo "Users file already exists at $DATA_DIR/users.json"
  exit 0
fi

echo "Fetching users.json from $REPO..."

if command -v gh &> /dev/null; then
  echo "Using gh CLI..."
  gh api repos/$REPO/contents/users.json --jq '.content' | base64 -d > "$DATA_DIR/users.json"
elif [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "Using GITHUB_TOKEN..."
  curl -sL -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/contents/users.json" | \
    python3 -c "import sys,json; print(json.load(sys.stdin)['content'])" | \
    base64 -d > "$DATA_DIR/users.json"
else
  echo "Error: No authentication available (need gh CLI or GITHUB_TOKEN)"
  exit 1
fi

echo "Downloaded to $DATA_DIR/users.json"
