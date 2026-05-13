set -euo pipefail

echo "Initiating deployment for Supabase App"

curl -s -X GET \
  "$COOLIFY_URL/api/v1/applications/$SUPABASE_UUID/start" \
  -H "Authorization: Bearer $TOKEN"

echo "Waiting for deployment to finish..."
for j in $(seq 1 60); do
  APP_STATUS=$(curl -s -X GET \
    "$COOLIFY_URL/api/v1/applications/$SUPABASE_UUID" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.status' || true)
  echo "  Deploy poll $j/60: $APP_STATUS"
  if echo "$APP_STATUS" | grep -q "running"; then
    echo "Supabase containers are running."
    break
  fi
  if [ "$j" -eq 60 ]; then
    echo "ERROR: Supabase did not reach running state after 5 minutes"
    exit 1
  fi
  sleep 5
done


for i in $(seq 1 36); do
  echo "--- Attempt $i/36 ---"
  PASS=true

  # no progress bar, discard response body, only print HTTP status
  # -s -o /dev/null -w "%{http_code}
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -u "$DASH_USER:$DASH_PASS" "$SUPABASE_URL" || true)
  echo "  Dashboard: HTTP $STATUS"
  if [ "$STATUS" -ne 307 ]; then
    PASS=false
  fi

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $ANON_KEY" "$SUPABASE_URL/auth/v1/health" || true)
  echo "  Auth: HTTP $STATUS"
  if [ "$STATUS" -ne 200 ]; then
    PASS=false
  fi

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $ANON_KEY" "$SUPABASE_URL/rest/v1/" || true)
  echo "  REST: HTTP $STATUS"
  if [ "$STATUS" -ne 200 ]; then
    PASS=false
  fi

  if [ "$PASS" = true ]; then
    echo "All Supabase services healthy."
    exit 0
  fi

  sleep 10
done

echo "ERROR: Supabase not fully healthy after 6 minutes"
exit 1
