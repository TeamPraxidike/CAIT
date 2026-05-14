set -euo pipefail

echo "Initiating deployment for SvelteKit App"

curl -s -X GET \
  "$COOLIFY_URL/api/v1/applications/$SVELTEKIT_UUID/start" \
  -H "Authorization: Bearer $TOKEN"

echo "Waiting for deployment to finish..."
for j in $(seq 1 60); do
  APP_STATUS=$(curl -s -X GET \
    "$COOLIFY_URL/api/v1/applications/$SVELTEKIT_UUID" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.status' || true)
  echo "  Deploy poll $j/60: $APP_STATUS"
  if echo "$APP_STATUS" | grep -q "running"; then
    echo "SvelteKit App is running."
    break
  fi
  if [ "$j" -eq 60 ]; then
    echo "ERROR: SvelteKit App did not reach running state after 5 minutes"
    exit 1
  fi
  sleep 5
done


for i in $(seq 1 36); do
  echo "--- Attempt $i/36 ---"
  PASS=true

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "$SVELTEKIT_URL/api/health" || true)
  echo "  HTTP $STATUS"
  if [ "$STATUS" -ne 200 ]; then
    PASS=false
  fi

  if [ "$PASS" = true ]; then
    echo "SvelteKit app is healthy."
    exit 0
  fi

  sleep 10
done

echo "ERROR: SvelteKit App not fully healthy after 6 minutes"
exit 1
