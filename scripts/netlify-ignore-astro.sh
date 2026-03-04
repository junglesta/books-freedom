#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${CACHED_COMMIT_REF:-}"
HEAD_REF="${COMMIT_REF:-}"

if [[ -z "$BASE_REF" || -z "$HEAD_REF" ]]; then
  echo "Missing Netlify commit refs; do not skip astro build."
  exit 1
fi

if git diff --quiet "$BASE_REF" "$HEAD_REF" -- \
  apps/astro-site \
  packages/library-core \
  data \
  scripts \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml; then
  echo "No astro-related changes detected; skipping astro deploy."
  exit 0
fi

echo "Astro-related changes detected; running astro deploy."
exit 1
