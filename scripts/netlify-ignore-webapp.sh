#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${CACHED_COMMIT_REF:-}"
HEAD_REF="${COMMIT_REF:-}"

if [[ -z "$BASE_REF" || -z "$HEAD_REF" ]]; then
  echo "Missing Netlify commit refs; do not skip webapp build."
  exit 1
fi

if git diff --quiet "$BASE_REF" "$HEAD_REF" -- \
  apps/webapp \
  packages/library-core \
  data \
  scripts \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  netlify.toml; then
  echo "No webapp-related changes detected; skipping webapp deploy."
  exit 0
fi

echo "Webapp-related changes detected; running webapp deploy."
exit 1
