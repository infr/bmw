#!/bin/bash
# BMW API Test - Manual cURL Example
# This shows the exact headers needed for BMW API requests
#
# Usage:
#   1. Get an access token first (use: bmw login)
#   2. Set TOKEN variable below
#   3. Run: bash test-api-curl.sh

# ============================================================================
# CONFIGURATION
# ============================================================================

# Set your region: "na" or "row"
REGION="${BMW_GEO:-na}"

# You need a valid Bearer token - get this from bmw login
# The token is cached in ~/.bmwapi/token
TOKEN="${BMW_TOKEN:-YOUR_TOKEN_HERE}"

# Region-specific configuration
if [ "$REGION" = "na" ]; then
    HOST="cocoapi.bmwgroup.us"
    OCP_KEY="31e102f5-6f7e-7ef3-9044-ddce63891362"
elif [ "$REGION" = "row" ]; then
    HOST="cocoapi.bmwgroup.com"
    OCP_KEY="4f1c85a3-758f-a37d-bbb6-f8704494acfa"
else
    echo "Invalid region: $REGION (must be 'na' or 'row')"
    exit 1
fi

# Generate correlation ID
CORRELATION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# ============================================================================
# TEST 1: OAuth Config (doesn't require token)
# ============================================================================

echo "============================================================"
echo "Test 1: OAuth Config (no auth required)"
echo "============================================================"
echo "GET https://$HOST/eadrax-ucs/v1/presentation/oauth/config"
echo ""

curl -s -X GET "https://$HOST/eadrax-ucs/v1/presentation/oauth/config" \
  -H "accept: application/json" \
  -H "accept-language: en" \
  -H "x-raw-locale: en-US" \
  -H "user-agent: Dart/3.3 (dart:io)" \
  -H "x-user-agent: android(SP1A.210812.016.C1);bmw;4.9.2(36892);$REGION" \
  -H "ocp-apim-subscription-key: $OCP_KEY" \
  -H "bmw-session-id: $SESSION_ID" \
  -H "x-identity-provider: gcdm" \
  -H "x-correlation-id: $CORRELATION_ID" \
  -H "bmw-correlation-id: $CORRELATION_ID" \
  -w "\nHTTP Status: %{http_code}\n" | jq . || cat

echo ""
echo "Expected: 200 OK with clientId, tokenEndpoint, etc."
echo ""

# ============================================================================
# TEST 2: Vehicle List (requires Bearer token)
# ============================================================================

if [ "$TOKEN" = "YOUR_TOKEN_HERE" ]; then
    echo "============================================================"
    echo "⚠️  Skipping authenticated tests - set TOKEN variable first"
    echo "============================================================"
    echo ""
    echo "To get a token, run: bmw login"
    echo "Then check ~/.bmwapi/token or use:"
    echo ""
    echo "  TOKEN=\"your_token_here\" bash $0"
    echo ""
    exit 0
fi

echo "============================================================"
echo "Test 2: Vehicle List (with auth)"
echo "============================================================"
echo "GET https://$HOST/eadrax-vcs/v5/vehicle-list"
echo ""

curl -s -X GET "https://$HOST/eadrax-vcs/v5/vehicle-list" \
  -H "accept: application/json" \
  -H "accept-language: en" \
  -H "x-raw-locale: en-US" \
  -H "user-agent: Dart/3.3 (dart:io)" \
  -H "x-user-agent: android(SP1A.210812.016.C1);bmw;4.9.2(36892);$REGION" \
  -H "ocp-apim-subscription-key: $OCP_KEY" \
  -H "authorization: Bearer $TOKEN" \
  -H "bmw-session-id: $SESSION_ID" \
  -H "bmw-units-preferences: d=KM;v=L;p=B;ec=KWH100KM;fc=L100KM;em=GKM;" \
  -H "24-hour-format: true" \
  -H "x-identity-provider: gcdm" \
  -H "x-correlation-id: $CORRELATION_ID" \
  -H "bmw-correlation-id: $CORRELATION_ID" \
  -H "bmw-current-date: $(date -u +%Y-%m-%dT%H:%M:%S.000Z)" \
  -w "\nHTTP Status: %{http_code}\n" | jq . || cat

echo ""
echo "Expected responses:"
echo "  200 OK       - Success, vehicle list returned"
echo "  401          - Token expired (need to refresh)"
echo "  403          - Rate limited / quota exceeded"
echo "  489 Blocked  - Missing headers (SHOULD NOT HAPPEN!)"
echo ""

# ============================================================================
# Summary
# ============================================================================

echo "============================================================"
echo "Test Complete"
echo "============================================================"
echo ""
echo "Required headers for ALL authenticated requests:"
echo "  ✓ accept: application/json"
echo "  ✓ accept-language: en"
echo "  ✓ user-agent: Dart/3.3 (dart:io)"
echo "  ✓ x-user-agent: android(...);bmw;4.9.2(36892);$REGION"
echo "  ✓ ocp-apim-subscription-key: $OCP_KEY"
echo "  ✓ authorization: Bearer <token>"
echo "  ✓ bmw-session-id: <uuid>"
echo "  ✓ x-correlation-id: <uuid>"
echo ""
echo "If you see 489 Blocked, verify all headers are present!"
echo "============================================================"
