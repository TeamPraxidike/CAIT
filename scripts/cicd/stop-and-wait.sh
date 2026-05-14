#!/usr/bin/env bash
set -euo pipefail

stop_and_wait() {
  local APP_NAME="$1"
  local APP_UUID="$2"

  echo "=== $APP_NAME ==="

  STATUS=$(curl -s -X GET \
    "$COOLIFY_URL/api/v1/applications/$APP_UUID" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.status')
  echo "Current status: $STATUS"

  if echo "$STATUS" | grep -q "exited"; then
    echo "$APP_NAME is already stopped."
    return 0
  fi

  echo "Sending stop request..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
    "$COOLIFY_URL/api/v1/applications/$APP_UUID/stop" \
    -H "Authorization: Bearer $TOKEN")

  if [ "$HTTP_CODE" -ne 200 ]; then
    echo "ERROR: Stop request returned HTTP $HTTP_CODE"
    return 1
  fi

  echo "Stop request accepted. Polling status..."
  for i in $(seq 1 30); do
    sleep 5
    STATUS=$(curl -s -X GET \
      "$COOLIFY_URL/api/v1/applications/$APP_UUID" \
      -H "Authorization: Bearer $TOKEN" | jq -r '.status')
    echo "  Attempt $i/30: $STATUS"

    if echo "$STATUS" | grep -q "exited"; then
      echo "$APP_NAME is stopped."
      return 0
    fi
  done

  echo "ERROR: $APP_NAME did not stop after 150s"
  return 1
}

stop_and_wait "Supabase" "$SUPABASE_UUID"
stop_and_wait "SvelteKit" "$SVELTEKIT_UUID"

echo "Both applications stopped."
