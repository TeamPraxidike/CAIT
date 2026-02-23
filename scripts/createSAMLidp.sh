#!/bin/bash

source .env

export PUBLIC_SUPABASE_URL=$(echo "$PUBLIC_SUPABASE_URL" | tr -d '\r')
export SERVICE_ROLE_KEY=$(echo "$SERVICE_ROLE_KEY" | tr -d '\r')
export SAML_METADATA_IDP_URL=$(echo "$SAML_METADATA_IDP_URL" | tr -d '\r')
export PUBLIC_SAML_IDP_DOMAIN=$(echo "$PUBLIC_SAML_IDP_DOMAIN" | tr -d '\r')

echo 'Creating auth0 SAML Identity provider...'

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

############
# SRAM SSO #
############

# What we need:
# (1) persistent user id
# (2) firstName
# (3) lastName
# (4) email
# (5) platform affiliation
# (6) institutional affiliation

# [SKIP MAPPING (1)] user id is either under urn:oasis:names:tc:SAML:attribute:subject-id (also present in the SRAM attr docs)
# or (fallback) somewhere in the subject section
# https://github.com/supabase/auth/blob/master/internal/api/samlassertion.go#L68
# if in subject section, subject id is derived based on the format of the section
# if fallback does not work (see if statements and transient branch check in code above)
# we cannot save the user account since it might be transient

# [SKIP MAPPING (4)] email attribute will be extracted automatically, checks are detailed enough
# https://github.com/supabase/auth/blob/master/internal/api/samlassertion.go#L92

# TODO (5) and (6) will be used for extracting the affiliation (since naming conventions might be different across orgs)
# e.g. tudelft might return student@tudelft.nl but erasmus might return something else

# ISSUES:
# 1. Seems like SRAM provides cache duration for their metadata.
# Unfortunately, our current version of Supabase cannot parse valid duration rules
# https://github.com/supabase/auth/issues/1697
# GoTrue logs {"component":"api","error":"strconv.ParseInt: parsing \"P7D\": invalid syntax","level":"error",
# "method":"POST","msg":"Unhandled server error: strconv.ParseInt: parsing \"P7D\"...

# Solution - download the xml, replace the problematic attribute, pass the xml rather than the url
# apparently we can pass xml because the code supports it
# https://github.com/supabase/auth/blob/master/internal/models/sso.go#L125

# IMPORTANT:
# you need the jq command installed.
# do so via sudo apt-get install -y jq

export PUBLIC_ENVIRONMENT=$(echo "$PUBLIC_ENVIRONMENT" | tr -d '\r')

if [ "$PUBLIC_ENVIRONMENT" = "production" ]; then
  echo -e "\nCreating SRAM SAML Identity provider..."

  export SRAM_SAML_METADATA_IDP_URL=$(echo "$SRAM_SAML_METADATA_IDP_URL" | tr -d '\r')
  export PUBLIC_SRAM_SAML_IDP_DOMAIN=$(echo "$PUBLIC_SRAM_SAML_IDP_DOMAIN" | tr -d '\r')

  # download the metadata
  curl "$SRAM_SAML_METADATA_IDP_URL" > sram_temp.xml

  # [FIX ISSUE 1.] find any line containing cacheDuration="anything" and replace with empty
  sed 's/cacheDuration="[^"]*"//g' sram_temp.xml > sram_clean.xml

  CLEAN_XML=$(cat sram_clean.xml)

  jq -n \
      --arg xml "$CLEAN_XML" \
      --arg domain "$PUBLIC_SRAM_SAML_IDP_DOMAIN" \
      '{
        type: "saml",
        metadata_xml: $xml,
        domains: [$domain],
        attribute_mapping: {
          keys: {
            firstName: { name: "urn:oid:2.5.4.42" },
            lastName: { name: "urn:oid:2.5.4.4" },
            platformId: { name: "urn:oid:1.3.6.1.4.1.5923.1.1.1.9" },
            institutionId: { name: "urn:oid:1.3.6.1.4.1.25178.4.1.11" }
          }
        }
      }' > payload.json

  # @ means 'read the data from this file'
  curl -X POST "$PUBLIC_SUPABASE_URL/auth/v1/admin/sso/providers" \
    -H "APIKey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    --data-binary @payload.json

  # cleanup since we don't need those
  rm sram_temp.xml sram_clean.xml payload.json
else
  echo -e "\nEnvironment set to $PUBLIC_ENVIRONMENT, skipping SRAM SAML Identity provider..."
fi