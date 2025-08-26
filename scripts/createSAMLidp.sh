#!/bin/bash

source .env

export PUBLIC_SUPABASE_URL=$(echo "$PUBLIC_SUPABASE_URL" | tr -d '\r')
export SERVICE_ROLE_KEY=$(echo "$SERVICE_ROLE_KEY" | tr -d '\r')
export SAML_METADATA_IDP_URL=$(echo "$SAML_METADATA_IDP_URL" | tr -d '\r')
export PUBLIC_SAML_IDP_DOMAIN=$(echo "$PUBLIC_SAML_IDP_DOMAIN" | tr -d '\r')

echo 'Creating SAML Identity provider...'

curl -X POST "$PUBLIC_SUPABASE_URL/auth/v1/admin/sso/providers" \
  -H "APIKey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"saml\",
    \"metadata_url\": \"$SAML_METADATA_IDP_URL\",
    \"domains\": [\"$PUBLIC_SAML_IDP_DOMAIN\"],
    \"attribute_mapping\": {
          \"keys\": {
            \"firstName\": { \"name\": \"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname\" },
            \"lastName\": { \"name\": \"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname\" },
            \"fullName\": { \"name\": \"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name\" }
          }
        }
  }"
