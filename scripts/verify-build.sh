#!/bin/bash
# Verification script to check if production build has correct data

echo "======================================"
echo "Build Verification Script"
echo "======================================"
echo ""

# Check environment variables
echo "1. Checking environment variables..."
if [ -z "$PUBLIC_CONVEX_URL" ]; then
  echo "❌ ERROR: PUBLIC_CONVEX_URL is not set!"
  exit 1
else
  echo "✅ PUBLIC_CONVEX_URL = $PUBLIC_CONVEX_URL"
fi

# Check if Convex is accessible
echo ""
echo "2. Testing Convex connectivity..."
RESPONSE=$(curl -s -X POST "$PUBLIC_CONVEX_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"path": "categories:getCategories", "args": {}, "format": "json"}')

if [ $? -eq 0 ]; then
  COUNT=$(echo "$RESPONSE" | jq '.value | length' 2>/dev/null)
  if [ "$COUNT" -gt 0 ]; then
    echo "✅ Successfully fetched $COUNT categories from Convex"
  else
    echo "⚠️  WARNING: Convex returned 0 categories"
    echo "Response: $RESPONSE"
  fi
else
  echo "❌ ERROR: Failed to connect to Convex"
  exit 1
fi

# Check prompts
echo ""
echo "3. Testing prompts endpoint..."
PROMPTS_RESPONSE=$(curl -s -X POST "$PUBLIC_CONVEX_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"path": "prompts:getApprovedPrompts", "args": {"limit": 12}, "format": "json"}')

PROMPTS_COUNT=$(echo "$PROMPTS_RESPONSE" | jq '.value.prompts | length' 2>/dev/null)
if [ "$PROMPTS_COUNT" -gt 0 ]; then
  FEATURED_COUNT=$(echo "$PROMPTS_RESPONSE" | jq '[.value.prompts[] | select(.featured == true)] | length' 2>/dev/null)
  echo "✅ Successfully fetched $PROMPTS_COUNT prompts ($FEATURED_COUNT featured)"
else
  echo "⚠️  WARNING: No prompts found"
fi

echo ""
echo "======================================"
echo "Verification complete!"
echo "======================================"
