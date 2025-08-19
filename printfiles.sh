#!/usr/bin/env bash

ROOT_DIR="."

EXCLUDES=(".gitlab" ".run" ".svelte-kit" "node_modules" "scripts" "tests" "package.json" "package-lock.json" "vite.config.ts."
"docker/dev" "docker/volumes" "tests/non-func/utility/logo." "tests/non-func/utility/pm." ".git/" "static/")

# Build the prune expression for find
PRUNE_EXPR=()
for d in "${EXCLUDES[@]}"; do
  PRUNE_EXPR+=( -path "$ROOT_DIR/$d*" -prune -o )
done

# Find all files, excluding pruned dirs
find "$ROOT_DIR" \
  \( "${PRUNE_EXPR[@]}" -type f -print \) |
while read -r file; do
  echo "===== $file ====="
  cat "$file"
  echo -e "\n"
done
